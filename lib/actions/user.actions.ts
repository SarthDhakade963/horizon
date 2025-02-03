'use server';

import { ID } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { authFormSchema, parseStringify } from "../utils";
import { cookies } from "next/headers";

export const signIn = async ({email, password} : signInProps) => {

    try {
        // Mutation / Database ? Make Fetch
        const { account } = await createAdminClient();

        // Allow the user to login into their account by providing a valid email and password combination. This route will create a new session for the user.
        const response = await account.createEmailPasswordSession(email, password);
        
        return parseStringify(response);
    } catch (error) {
        console.log(error);
    }
}

export const signUp = async (userData : SignUpParams) => {
    const {email, password, firstName, lastName} = userData;
    try {
        // Create a User Account
        const { account } = await createAdminClient();

        const newUserAccount = await account.create(ID.unique(), email, password, `${firstName} ${lastName}`);
        const session = await account.createEmailPasswordSession(email, password);
      
        (await cookies()).set("appwrite-session", session.secret, {
          path: "/",
          httpOnly: true,
          sameSite: "strict",
          secure: true,
        });
      
        return parseStringify(newUserAccount);
    } catch (AppwriteException) {
        console.log("Account already exist");
    }
}


export async function getLoggedInUser() {
    try {
      const { account } = await createSessionClient();
      const user =  await account.get();
      return parseStringify(user);
    } catch (error) {
      return null;
    }
}

export const loggedAccount = async () => {
  try {
    const {account} = await createSessionClient();

    (await cookies()).delete('appwrite-session')

    await account.deleteSession('current')
  } catch (error) {
    return null;
  }
}