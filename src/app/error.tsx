"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global App Error:", error);
  }, [error]);

  return (
    <html>
      <body className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">Something went wrong.</h2>

          <p className="text-gray-500">Please try again or refresh the page.</p>

          <button
            onClick={() => reset()}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
