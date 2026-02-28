"use client";

import { useState } from "react";
import {
  updateField,
  deleteField,
} from "@/app/home/team-dashboard/template-library/actions";

export default function FieldSettingsPanel({
  field,
  onClose,
}: {
  field: any;
  onClose: () => void;
}) {
  const [label, setLabel] = useState(field.label);
  const [required, setRequired] = useState(field.required);

  async function handleSave() {
    await updateField(field.id, {
      label,
      required,
    });

    onClose();
  }

  async function handleDelete() {
    await deleteField(field.id);
    onClose();
  }

  return (
    <div className="w-80 border-l p-6 bg-gray-50">
      <h2 className="text-lg font-semibold mb-4">Field Settings</h2>

      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="w-full border p-3 mb-4"
      />

      <label className="flex items-center gap-2 mb-6">
        <input
          type="checkbox"
          checked={required}
          onChange={(e) => setRequired(e.target.checked)}
        />
        Required
      </label>

      <div className="flex justify-between">
        <button onClick={handleDelete} className="text-red-600">
          Delete
        </button>

        <button onClick={handleSave} className="bg-black text-white px-4 py-2">
          Save
        </button>
      </div>
    </div>
  );
}
