import Image from "next/image";
import Link from "next/link";

export function NoAccess() {
  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Role Assignment Form</h1>
      <p className="text-gray-700 mb-6">
        You have no access to this feature yet. Please join a team or create a
        new team if you are your organisation's Waste X administrator. Select
        your role below and then proceed to the Team Dashboard. If you need any
        help, please contact our support team.
      </p>
      <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
        Go to Team Dashboard
      </button>
    </div>
  );
}
