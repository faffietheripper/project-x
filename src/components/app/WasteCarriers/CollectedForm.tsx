"use client";

import { useFormState } from "react-dom";
import { markCollectedAction } from "@/app/home/carrier-hub/waste-carriers/assigned-carrier-jobs/actions";

const initialState = {
  success: false,
  message: "",
};

export default function CollectedForm({ listingId }: { listingId: number }) {
  const [state, formAction] = useFormState(markCollectedAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2 mt-2">
      <input type="hidden" name="listingId" value={listingId} />

      <input
        type="text"
        name="verificationCode"
        placeholder="Enter 6-digit code"
        maxLength={6}
        required
        pattern="\d{6}"
        inputMode="numeric"
        className="border rounded-md px-3 py-2"
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
      >
        Mark as Collected
      </button>

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
