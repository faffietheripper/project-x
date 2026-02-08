"use client";

import { useFormState } from "react-dom";
import { markCollectedAction } from "@/app/home/carrier-hub/waste-carriers/assigned-carrier-jobs/actions";

const initialState = {
  success: false,
  message: "",
};

export default function CollectedForm({ itemId }: { itemId: number }) {
  const [state, formAction] = useFormState(markCollectedAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="itemId" value={itemId} />

      <input
        type="text"
        name="verificationCode"
        placeholder="Enter 6-digit code"
        maxLength={6}
        required
        className="border rounded-md px-3 py-2"
      />

      <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
        Mark as Collected
      </button>

      {/* 🔔 Feedback messages */}
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
