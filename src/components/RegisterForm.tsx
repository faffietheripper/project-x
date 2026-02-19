"use client";

import React, { useState, useRef } from "react";
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
  const [serverError, setServerError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(RegisterSchema),
  });

  async function onSubmit(data: RegisterFormInputs) {
    setServerError(null);

    const result = await registerUser(data);

    if (result.success) {
      router.push("/login");
    } else {
      setServerError(result.message || "Registration failed.");

      if (errorRef.current) {
        errorRef.current.focus();
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-8 grid grid-cols-6 gap-6"
    >
      {serverError && (
        <div
          ref={errorRef}
          tabIndex={-1}
          className="col-span-6 bg-red-100 border border-red-400 text-red-700 p-4 rounded"
        >
          {serverError}
        </div>
      )}

      <div className="col-span-6">
        <label className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          type="text"
          {...register("name")}
          className="mt-1 w-full rounded-md h-12 border p-3 border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}
      </div>

      <div className="col-span-6">
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          {...register("email")}
          className="mt-1 w-full h-12 border p-3 rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      <div className="col-span-6">
        <label className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          {...register("password")}
          className="mt-1 w-full rounded-md h-12 border p-3 border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>

      <div className="col-span-6">
        <label className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          type="password"
          {...register("confirmPassword")}
          className="mt-1 w-full rounded-md h-12 border p-3 border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="col-span-6 rounded-md border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white transition disabled:opacity-50"
      >
        {isSubmitting ? "Creating account..." : "Create an account"}
      </button>
    </form>
  );
}
