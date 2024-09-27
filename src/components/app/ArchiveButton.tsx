import React from "react";

export default function ArchiveButton({
  handleArchive,
}: {
  handleArchive: () => void;
}) {
  return (
    <button
      className="bg-gray-600 py-2 px-4 rounded-md w-full text-white"
      onClick={handleArchive}
    >
      Archive
    </button>
  );
}
