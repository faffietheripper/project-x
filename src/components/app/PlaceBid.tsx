"use client";

import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { createBidAction } from "@/app/home/create-waste-listings/[wasteListingId]/actions";
import { motion, AnimatePresence } from "framer-motion";

interface PlaceBidProps {
  listingId: number;
  currentBid: number;
}

export default function PlaceBid({ listingId, currentBid }: PlaceBidProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-medium py-2 rounded-lg"
      >
        Place Bid
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <BidForm
              listingId={listingId}
              currentBid={currentBid}
              close={() => setOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BidForm({
  listingId,
  currentBid,
  close,
}: {
  listingId: number;
  currentBid: number;
  close: () => void;
}) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= currentBid) {
      toast({
        title: "Invalid Bid",
        description: `Bid must be higher than £${currentBid}`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const result = await createBidAction({
      listingId,
      amount: numericAmount,
    });

    setLoading(false);

    if (!result.success) {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Bid placed",
      description: "Your bid has been submitted.",
    });

    setAmount("");
    close();
  };

  return (
    <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="text-sm text-gray-500 mb-3">
        Current bid: <span className="font-semibold">£{currentBid}</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`Minimum £${currentBid + 1}`}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-medium py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Bid"}
        </button>
      </form>
    </div>
  );
}
