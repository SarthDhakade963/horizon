"use server";

import { ID } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import {
  authFormSchema,
  encryptId,
  extractCustomerIdFromUrl,
  parseStringify,
} from "../utils";
import { cookies } from "next/headers";
import {
  CountryCode,
  ProcessorTokenCreateRequest,
  ProcessorTokenCreateRequestProcessorEnum,
  Products,
} from "plaid/dist/api";
import { plaidClient } from "../plaid";
import { revalidatePath } from "next/cache";
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";
import { parse } from "path";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
  APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
} = process.env;

export const signIn = async ({ email, password }: signInProps) => {
  try {
    // Mutation / Database ? Make Fetch
    const { account } = await createAdminClient();

    // Allow the user to login into their account by providing a valid email and password combination. This route will create a new session for the user.
    const response = await account.createEmailPasswordSession(email, password);

    console.log("Login Success", response);

    return parseStringify(response);
  } catch (error) {
    console.log("Login failed");
    console.log(error);
  }
};

export const signUp = async ({ password, ...userData }: SignUpParams) => {
  const { email, firstName, lastName } = userData;

  let newUserAccount;

  try {
    const birthDate = new Date(userData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 18) throw new Error("User must be at least 18 years old");

    // Create a User Account
    const { account, database } = await createAdminClient(); // extracting the account and database from appwrite

    newUserAccount = await account.create(
      ID.unique(),
      email,
      password,
      `${firstName} ${lastName}`
    );

    if (!newUserAccount) throw new Error("Error creating user");

    const dwollaCustomerUrl = await createDwollaCustomer({
      ...userData,
      type: "personal",
    });

    if (!dwollaCustomerUrl) throw new Error("Error creating Dwolla Customer");

    const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);

    const newUser = await database.createDocument(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      ID.unique(),
      {
        ...userData,
        userid : newUserAccount.$id,
        dwollaCustomerId,
        dwollaCustomerUrl
      }
    );

    if (!newUser) throw new Error("Error creating new user");

    const session = await account.createEmailPasswordSession(email, password);
    {
      session ? console.log(`Session created`) : console.log(`Session failed`);
    }
    const isCookieSet = (await cookies()).set(
      "appwrite-session",
      session.secret,
      {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: true,
      }
    );

    console.log(isCookieSet ? "Cookie set Successfully" : "Cookie set Failed");

    return parseStringify(newUser);
  } catch (error) {
    console.log("Account already exist");
    console.log(error);
  }
};

export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();

    const session = await account.getSession("current");
    console.log("Session Details : ", session);

    const user = await account.get();
    {
      user
        ? console.log(`${user.name} is looged`)
        : console.log(`Not logged in`);
    }
    return parseStringify(user);
  } catch (error) {
    return null;
  }
}

export const loggedAccount = async () => {
  try {
    const { account } = await createSessionClient();

    (await cookies()).delete("appwrite-session");

    await account.deleteSession("current");
  } catch (error) {
    return null;
  }
};

export const createLinkToken = async (user: User) => {
  try {
    const tokenParams = {
      user: {
        client_user_id: user.$id,
      },
      client_name: `${user.firstName} ${user.lastName}`,
      products: ["auth"] as Products[],
      language: "en",
      country_codes: ["US"] as CountryCode[],
    };

    const response = await plaidClient.linkTokenCreate(tokenParams);

    return parseStringify({ linkToken: response.data.link_token });
  } catch (error) {
    console.log(error);
  }
};

export const exchangePublicToken = async ({
  publicToken,
  user,
}: exchangePublicTokenProps) => {
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    // Get account information from Plaid using the Access Token
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const accountData = accountsResponse.data.accounts[0];

    // Create the processor token for dwolla using the access token and account ID
    const request: ProcessorTokenCreateRequest = {
      access_token: accessToken,
      account_id: accountData.account_id,
      processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
    };

    const ProcessorTokenResponse = await plaidClient.processorTokenCreate(
      request
    );

    const processorToken = ProcessorTokenResponse.data.processor_token;

    // create a funding source URL for the account using the Dwolla customer ID, processor token, and bank name
    // function for making and receive payment from our bank
    const fundingSourceURL = await addFundingSource({
      dwollaCustomerId: user.dwollaCustomerId,
      processorToken,
      bankName: accountData.name,
    });

    // if the funding source URL is not created, throw an error
    if (!fundingSourceURL) throw Error;

    await createBankAccount({
      userId: user.$id,
      bankId: itemId,
      accountId: accountData.account_id,
      accessToken,
      fundingSourceURL,
      sharableId: encryptId(accountData.account_id),
    });

    // revalidate the path to reflect the changes
    revalidatePath("/");

    // Return a success message
    return parseStringify({
      publicTokenExchange: "complete",
    });
  } catch (error) {
    console.error("Error occured while creating an exchange token");
  }
};

const createBankAccount = async ({
  userId,
  bankId,
  accountId,
  accessToken,
  fundingSourceURL,
  sharableId,
}: createBankAccountProps) => {
  // creating bank accound for our database (appwrite)
  try {
    // appwrite client allowing us to create the documents
    const { database } = await createAdminClient();

    const bankAccount = await database.createDocument(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      ID.unique()!,
      {
        userId,
        bankId,
        accountId,
        accessToken,
        fundingSourceURL,
        sharableId,
      }
    );

    return parseStringify(bankAccount);
  } catch (error) {
    console.log(error);
  }
};
