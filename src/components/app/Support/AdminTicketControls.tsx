"use client";

import { useState } from "react";
import {
  assignTicketAction,
  updateTicketStatusAction,
} from "@/app/admin/support/action";

export default function AdminTicketControls({ ticket }: { ticket: any }) {
  const [status, setStatus] = useState(ticket.status);
  const [assignedTo, setAssignedTo] = useState(ticket.assignedToUserId ?? "");

  return (
    <div className="flex gap-6 items-center mt-4 text-sm">
      {/* STATUS UPDATE */}
      <form action={updateTicketStatusAction}>
        <input type="hidden" name="ticketId" value={ticket.id} />
        <select
          name="status"
          defaultValue={status}
          className="border rounded-md px-3 py-1"
        >
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="waiting_on_user">Waiting On User</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <button
          type="submit"
          className="ml-2 bg-blue-600 text-white px-3 py-1 rounded-md"
        >
          Update
        </button>
      </form>

      {/* ASSIGN */}
      <form action={assignTicketAction}>
        <input type="hidden" name="ticketId" value={ticket.id} />
        <button
          type="submit"
          className="bg-gray-700 text-white px-3 py-1 rounded-md"
        >
          Assign to Me
        </button>
      </form>
    </div>
  );
}
