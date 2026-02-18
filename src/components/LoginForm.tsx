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
  const [loading, setLoading] = useState(false);
  const errorContainerRef = useRef<HTMLDivElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setServerError(null);
    setLoading(true);

    const res = await login(data);

    setLoading(false);

    if (!res.success) {
      setServerError(res.message || "Invalid email or password.");

      if (errorContainerRef.current) {
        errorContainerRef.current.focus();
      }

      return;
    }

    // 🔐 Role-based routing
    if (res.role === "platform_admin") {
      router.push("/admin");
    } else {
      router.push("/home");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-8 grid grid-cols-6 gap-6"
    >
      {/* Server Error */}
      {serverError && (
        <div
          ref={errorContainerRef}
          tabIndex={-1}
          className="col-span-6 bg-red-100 border border-red-400 text-red-700 p-4 rounded"
          role="alert"
          aria-live="polite"
        >
          {serverError}
        </div>
      )}

      {/* Email */}
      <div className="col-span-6">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
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

      {/* Password */}
      <div className="col-span-6">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          type="password"
          id="password"
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

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="col-span-6 rounded-md border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white transition disabled:opacity-50"
      >
        {loading ? "Logging in..." : "Log In"}
      </button>
    </form>
  );
}
