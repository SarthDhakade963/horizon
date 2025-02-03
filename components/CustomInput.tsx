import React, { ReactNode, useState } from "react";
import { FormControl, FormField, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Control, FieldPath } from "react-hook-form";
import { z } from "zod";
import { authFormSchema } from "@/lib/utils";

const formSchema = authFormSchema("sign-up");

const autocompleteMap: Record<string, string> = {
  email: "email",
  password: "new-password",
  username: "username",
  name: "name",
};
interface CustomInputProps {
  control: Control<z.infer<typeof formSchema>>;
  name: FieldPath<z.infer<typeof formSchema>>;
  label: string;
  placeholder: string;
  type: string;
  icon?: ReactNode;
}

const CustomInput = ({
  control,
  name,
  label,
  placeholder,
  type,
  icon,
}: CustomInputProps) => {
  return (
    <div>
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <div className="form-item">
            <FormLabel htmlFor={name} className="form-label">
              {label}
            </FormLabel>
            <div className="flex w-full flex-col relative">
              <FormControl>
                <div className="relative w-full">
                <Input
                  id={name}
                  placeholder={placeholder}
                  className="input-class"
                  {...field}
                  type={type}
                />
                {icon && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer">
                    {icon}
                  </span>
                )}
                </div>
              </FormControl>
              <FormMessage className="form-message mt-2" />
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default CustomInput;
