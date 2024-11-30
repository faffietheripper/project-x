"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPassword({ submitResetPassword }: any) {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setMessage("Invalid or missing reset token");
      return;
    }

    const result = await submitResetPassword(token, newPassword);
    setMessage(result.message);

    if (result.success) {
      setTimeout(() => router.push("/login"), 3000);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Reset Password</h1>
      <input
        type="password"
        placeholder="Enter new password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />
      <button type="submit">Reset Password</button>
      {message && <p>{message}</p>}
    </form>
  );
}
