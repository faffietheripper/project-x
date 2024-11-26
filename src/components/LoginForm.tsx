"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/app/login/actions";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@/util/authSchema";

type LoginFormInputs = z.infer<typeof LoginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const errorContainerRef = useRef<HTMLDivElement | null>(null);

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
      setServerError("You have entered an incorrect email or password.");
      console.error("Login failed:", res.message);

      // Move focus to error container
      if (errorContainerRef.current) {
        errorContainerRef.current.focus();
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-8 grid grid-cols-6 gap-6"
    >
      {/* General error message */}
      {serverError && (
        <div
          ref={errorContainerRef}
          tabIndex={-1}
          className="col-span-6 bg-red-100 border border-red-400 text-red-700 p-4 rounded relative"
          role="alert"
          aria-live="polite"
        >
          {serverError}
        </div>
      )}

      <div className="col-span-6">
        <label
          htmlFor="Email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          type="email"
          id="Email"
          {...register("email")}
          className="mt-1 w-full h-12 border p-3 rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
          aria-invalid={!!errors.email}
          aria-describedby="email-error"
        />
        {errors.email && (
          <p
            id="email-error"
            className="text-red-500 text-sm mt-1"
            role="alert"
          >
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="col-span-6">
        <label
          htmlFor="Password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          type="password"
          id="Password"
          {...register("password")}
          className="mt-1 w-full rounded-md h-12 border p-3 border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
          aria-invalid={!!errors.password}
          aria-describedby="password-error"
        />
        {errors.password && (
          <p
            id="password-error"
            className="text-red-500 text-sm mt-1"
            role="alert"
          >
            {errors.password.message}
          </p>
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
