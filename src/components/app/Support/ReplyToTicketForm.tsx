"use client";

import { useState } from "react";
import { replyToTicketAction } from "@/app/admin/support/action";
import { useToast } from "@/components/ui/use-toast";

export default function ReplyToTicketForm({
  ticketId,
  isPlatformAdmin,
}: {
  ticketId: string;
  isPlatformAdmin: boolean;
}) {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!message.trim()) return;

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("ticketId", ticketId);
    formData.append("message", message);
    formData.append(
      "isInternalNote",
      isPlatformAdmin && isInternalNote ? "true" : "false",
    );

    const result = await replyToTicketAction(null, formData);

    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      });
      setMessage("");
      setIsInternalNote(false);
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-2xl shadow border space-y-4"
    >
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write your reply..."
        className="w-full border rounded-lg p-3 text-sm resize-none"
        rows={4}
      />

      {isPlatformAdmin && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isInternalNote}
            onChange={(e) => setIsInternalNote(e.target.checked)}
          />
          Add as internal note (hidden from organisation)
        </label>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          {isSubmitting ? "Sending..." : "Send Reply"}
        </button>
      </div>
    </form>
  );
}
