"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupAlert({
  user,
}: {
  user: { role?: string | null; profileCompleted?: boolean };
}) {
  const [showAlert, setShowAlert] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user?.role || !user?.profileCompleted) {
      setShowAlert(true);
    }
  }, [user]);

  if (!showAlert) return null;

  const handleGoToSettings = () => {
    setShowAlert(false);
    router.push("/home/me");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-yellow-100 border-l-8 border-yellow-600 text-yellow-900 p-6 rounded-2xl shadow-2xl max-w-md w-[90%] text-center animate-fadeIn relative">
        <button
          onClick={() => setShowAlert(false)}
          className="absolute top-3 right-3 text-yellow-800 hover:text-yellow-600"
        >
          ✕
        </button>

        <h2 className="font-bold text-lg mb-2">⚠️ Action Required</h2>
        <p className="text-sm mb-4">
          Your account isn’t fully set up yet. You’ll have limited access until
          your <strong>role</strong> is updated by a company administrator and
          your <strong>profile</strong> is completed.
        </p>

        <button
          onClick={handleGoToSettings}
          className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md font-medium transition"
        >
          Go to Settings →
        </button>
      </div>
    </div>
  );
}
