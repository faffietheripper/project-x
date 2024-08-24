"use client";

import React from "react";

import { useRouter } from "next/navigation";
import { login } from "@/app/login/actions";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@/util/authSchema";

type LoginFormInputs = z.infer<typeof LoginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    const res = await login(data);

    if (res.success) {
      router.push("/home");
    } else {
      // Handle login error
      console.error("Login failed:", res.message);
    }
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-8 grid grid-cols-6 gap-6"
    >
      <div className="col-span-6">
        Email
        <input
          type="email"
          id="Email"
          {...register("email")}
          className="mt-1 w-full h-12 border p-3 rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="col-span-6">
        Password
        <input
          type="password"
          id="Password"
          {...register("password")}
          className="mt-1 w-full rounded-md h-12 border p-3 border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="col-span-6 rounded-md border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white transition hover:bg-transparent hover:text-blue-600 focus:outline-none focus:ring active:text-blue-500"
      >
        Log In
      </button>
    </form>
  );
}
