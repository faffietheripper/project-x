"use client";

import React, { useState } from "react";
import { assignRoleAction } from "@/app/home/me/actions";

export default function RoleAssignmentForm() {
  const [role, setRole] = useState("wasteManager");
  const [message, setMessage] = useState("");

  const handleRoleChange = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await assignRoleAction({ role });
      setMessage("Role updated successfully.");
    } catch (err: any) {
      setMessage(err.message || "An error occurred while updating the role.");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Role Assignment</h1>
      <p className="text-gray-700 mb-6">
        Select your role below. Please note that you will need to login again
        after updating your role. If you need to change roles later, please
        contact our support team.
      </p>
      <form onSubmit={handleRoleChange}>
        <label htmlFor="role" className="block mb-2 text-gray-700">
          Select Role:
        </label>
        <select
          id="role"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        >
          <option value="wasteManager">Waste Manager</option>
          <option value="wasteGenerator">Waste Generator</option>
        </select>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Update Role
        </button>
      </form>
      {message && (
        <p
          className={`text-sm ${
            message.includes("success") ? "text-green-500" : "text-red-500"
          } mt-4`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
