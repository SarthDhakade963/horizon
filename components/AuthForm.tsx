"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import CustomInput from "./CustomInput";
import { authFormSchema } from "@/lib/utils";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { getLoggedInUser, signIn, signUp } from "@/lib/actions/user.actions";

// Zod is straight forward form validation tools allowing the fields to choose in our schema allowing the freedom to choose the type, minimun and maximum of the particular field.
// export const formSchema = ({type}) => z.object({
//   email: z.string().email(),
//   password: z.string(),
//   // sign-up
//   firstName: z.string().min(3),
//   lastName: z.string().min(3),
//   address : z.string().min(3),
//   state : z.string().min(3),
//   postalCode : z.string().min(6),
//   dob : z.string().min(3),
//   SSN : z.string().min(3),
// });

const AuthForm = ({ type }: { type: string }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // const loggedInUser = await getLoggedInUser();
  const formSchema = authFormSchema(type);

  // Define the form for sign-in
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      address1: "",
      city: "",
      state: "",
      postalCode: "",
      dateOfBirth: "",
      ssn: "",
    },
  });

  // 2. Define a submit handler.
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log("Form is Submitting...");
    setIsLoading(true);

    try {
      // sign up with Appwrite & create plaid token
      if (type === "sign-up") {
        const newUser = await signUp(data);
        setUser(newUser);
      }

      if (type === "sign-in") {
        //
        const response = await signIn({
          email: data.email,
          password: data.password,
        });

        if (response?.$id) {
          // Check if response contains user ID
          router.push("/");
        } else {
          console.error("Sign-in failed:", response);
          router.push("/sign-up");
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      console.log("Form Submitted");
      setIsLoading(false);
    }
  };

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null; // or a loading state
  }

  return (
    <section className="auth-form ">
      <header className="flex flex-col gap-5 md:gap-8">
        {/* Horizon logo */}
        <Link href="/" className=" flex items-center gap-3">
          <Image src="/icons/logo.svg" alt="logo" width={30} height={30} />

          <h1 className="text-26 font-ibm-plex-serif font-bold text-black-1">
            Horizon
          </h1>
        </Link>

        <div className="flex flex-col gap-1 md:gap-3">
          <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
            {/* if user then link account else if (type === 'sign in' the Sign In else Sign Up) */}
            {isHydrated && user ? "Link Account" : type === "sign-in" ? "Sign In" : "Sign Up"}

            <p className="text-16 font-normal text-gray-600 ">
              {user
                ? "Link your Account to get started"
                : "Please enter your details"}
            </p>
          </h1>
        </div>
      </header>

      {user ? (
        <div className="flex flex-col gap-4">{/* PlaidLink */}</div>
      ) : (
        <>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {type === "sign-up" && (
                <>
                  <div className="grid grid-rows-5 grid-cols-2 gap-3">
                    <div className="grid-rows-1 grid-cols-1">
                      <CustomInput
                        control={form.control}
                        name="firstName"
                        label="First Name"
                        placeholder="Enter your First Name"
                        type="text"
                        value={form.watch("firstName") || ""}
                      />
                    </div>

                    <div className="grid-rows-1 grid-cols-2">
                      <CustomInput
                        control={form.control}
                        name="lastName"
                        label="Last Name"
                        placeholder="Enter your Last Name"
                        type="text"
                        value={form.watch("lastName") || ""}
                      />
                    </div>

                    <div className="grid-rows-2 col-start-1 col-end-3 ">
                      <CustomInput
                        control={form.control}
                        name="address1"
                        label="Address"
                        placeholder="Enter your Permanent Address"
                        type="text"
                        value={form.watch("address1") || ""}
                      />
                    </div>

                    <div className="grid-rows-3 col-start-1 col-end-3">
                      <CustomInput
                        control={form.control}
                        name="city"
                        label="City"
                        placeholder="Enter your City Name"
                        type="text"
                        value={form.watch("city") || ""}
                      />
                    </div>

                    <div className="grid-rows-4 grid-cols-3">
                      <CustomInput
                        control={form.control}
                        name="state"
                        label="State"
                        placeholder="MH"
                        type="text"
                        value={form.watch("state") || ""}
                      />
                    </div>

                    <div className="grid-rows-4 grid-cols-2">
                      <CustomInput
                        control={form.control}
                        name="postalCode"
                        label="Postal Code"
                        placeholder="400001"
                        type="text"
                        value={form.watch("postalCode") || ""}
                      />
                    </div>

                    <div className="grid-rows-5 grid-cols-1">
                      <CustomInput
                        control={form.control}
                        name="dateOfBirth"
                        label="Date of Birth"
                        placeholder="yyyy-mm-dd"
                        type="text"
                        value={form.watch("dateOfBirth") || ""}
                      />
                    </div>

                    <div className="grid-rows-5 grid-cols-2">
                      <CustomInput
                        control={form.control}
                        name="ssn"
                        label="SSN"
                        placeholder="1234"
                        type="text"
                        value={form.watch("ssn") || ""}
                      />
                    </div>
                  </div>
                </>
              )}

              <CustomInput
                control={form.control}
                name="email"
                label="Email"
                placeholder="Enter your Email"
                type="text"
                value={form.watch("email") || ""}
              />

              <CustomInput
                control={form.control}
                name="password"
                label="Password"
                placeholder="Enter your Password"
                type={showPassword ? "text" : "password"}
                icon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                }
                value={form.watch("password") || ""}
              />

              <Button type="submit" className="form-btn" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" /> &nbsp;
                    Loading...
                  </>
                ) : type === "sign-in" ? (
                  "Sign In"
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>
          </Form>

          <footer className="flex justify-center gap-1">
            <p className="text-14 font-normal text-gray-600">
              {type === "sign-in"
                ? "Don't have an Account?"
                : "Already have an Account?"}
            </p>

            <Link
              href={type === "sign-in" ? "/sign-up" : "/sign-in"}
              className="form-link hover:underline"
            >
              {type === "sign-in" ? "Sign Up" : "Sign In"}
            </Link>
          </footer>
        </>
      )}
    </section>
  );
};

export default AuthForm;
