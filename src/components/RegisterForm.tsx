"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { RegisterSchema } from "@/util/authSchema";
import { registerUser } from "@/app/register/actions";
import { useRouter } from "next/navigation";

type RegisterFormInputs = z.infer<typeof RegisterSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(RegisterSchema),
  });

  async function onSubmit(data: RegisterFormInputs) {
    try {
      const result = await registerUser(data);

      if (result.success) {
        console.log("User created successfully:", result.data);
        router.push("/login");
      } else {
        console.error("User creation failed:", result.message);
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
    }
  }
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-8 grid grid-cols-6 gap-6"
    >
      <div className="col-span-6">
        Company Name
        <input
          required
          id="name"
          type="string"
          {...register("name")}
          className="mt-1 w-full rounded-md h-12 border p-3  border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
        />
        {errors.name && <p>{errors.name.message}</p>}
      </div>
      <div className="col-span-6">
        {" "}
        Email{" "}
        <input
          required
          type="email"
          id="email"
          {...register("email")}
          className="mt-1 w-full h-12 border p-3 rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
        />
        {errors.email && <p>{errors.email.message}</p>}
      </div>
      <div className="col-span-6">
        {" "}
        Password{" "}
        <input
          required
          type="password"
          id="password"
          {...register("password")}
          className="mt-1 w-full rounded-md h-12 border p-3  border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
        />
        {errors.password && <p>{errors.password.message}</p>}
      </div>
      <div className="col-span-6">
        Confirm Password
        <input
          required
          type="password"
          id="confirmPassword"
          {...register("confirmPassword")}
          className="mt-1 w-full rounded-md h-12 border p-3  border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
        />
        {errors.confirmPassword && <p>{errors.confirmPassword.message}</p>}
      </div>
      <div className="col-span-6">
        <p className="text-sm text-gray-500">
          By creating an account, you agree to our
          <a href="#" className="text-gray-700 underline">
            {" "}
            terms and conditions{" "}
          </a>
          and
          <a href="#" className="text-gray-700 underline">
            privacy policy
          </a>
          .
        </p>
      </div>{" "}
      <button
        type="submit"
        className="col-span-6 rounded-md border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white transition hover:bg-transparent hover:text-blue-600 focus:outline-none focus:ring active:text-blue-500"
      >
        Create an account
      </button>
    </form>
  );
}
