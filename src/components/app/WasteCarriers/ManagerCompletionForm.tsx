"use client";

import { useFormState } from "react-dom";
import { markCompletedByManagerAction } from "@/app/home/carrier-hub/carrier-manager/job-assignments/actions";

const initialState = {
  success: false,
  message: "",
};

export default function ManagerCompletionForm({ itemId }: { itemId: number }) {
  const [state, formAction] = useFormState(
    markCompletedByManagerAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2 mt-3">
      <input type="hidden" name="itemId" value={itemId} />

      <input
        type="text"
        name="verificationCode"
        placeholder="Enter 6-digit code"
        maxLength={6}
        required
        className="border rounded-md px-3 py-2 w-56"
      />

      <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-56">
        Complete Transfer
      </button>

      {/* 🔔 Feedback */}
      {state.message && (
        <p
          className={`text-sm font-medium ${
            state.success ? "text-green-600" : "text-red-600"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
