"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { updatePassword } from "@/app/home/me/account/actions";
import { z } from "zod";

const PasswordSchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .superRefine(({ newPassword, confirmPassword }, ctx) => {
    if (newPassword !== confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

type PasswordFormInputs = z.infer<typeof PasswordSchema>;

export default function UpdatePasswordForm() {
  const { data: session } = useSession();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormInputs>({
    resolver: zodResolver(PasswordSchema),
  });

  async function onSubmit(data: PasswordFormInputs) {
    if (!session?.user?.id) return;

    const result = await updatePassword({
      userId: session.user.id,
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });

    if (result.success) {
      alert("Password updated successfully!");
      router.push("/profile"); // Redirect to a profile or success page
    } else {
      alert(result.message);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Update Your Password</h2>
      <div className="mb-4">
        <label htmlFor="currentPassword" className="block text-sm font-medium">
          Current Password
        </label>
        <input
          id="currentPassword"
          type="password"
          {...register("currentPassword")}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
        {errors.currentPassword && (
          <p className="text-red-600 text-sm mt-1">
            {errors.currentPassword.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="newPassword" className="block text-sm font-medium">
          New Password
        </label>
        <input
          id="newPassword"
          type="password"
          {...register("newPassword")}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
        {errors.newPassword && (
          <p className="text-red-600 text-sm mt-1">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="confirmPassword" className="block text-sm font-medium">
          Confirm New Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          {...register("confirmPassword")}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
        {errors.confirmPassword && (
          <p className="text-red-600 text-sm mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white py-2 px-4 rounded-md"
      >
        Update Password
      </button>
    </form>
  );
}
