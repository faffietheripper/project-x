"use client";

import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { createBidAction } from "@/app/home/create-waste-listings/[wasteListingId]/actions";
import { Input } from "../ui/input";
import { AnimatePresence, motion } from "framer-motion";

const PlaceBid = ({ itemId, currentBid }) => {
  return (
    <div className="flex justify-center bg-blue-600 px-5 py-3 rounded-md">
      <FlyoutLink
        href="#"
        FlyoutContent={({ closeFlyout }) => (
          <BidForm
            itemId={itemId}
            currentBid={currentBid}
            closeFlyout={closeFlyout}
          />
        )}
      >
        Place Bid
      </FlyoutLink>
    </div>
  );
};

const FlyoutLink = ({ children, href, FlyoutContent }) => {
  const [open, setOpen] = useState(false);
  const flyoutRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (flyoutRef.current && !flyoutRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const showFlyout = FlyoutContent && open;

  return (
    <div
      onMouseEnter={() => setOpen(true)}
      className="relative w-fit h-fit"
      ref={flyoutRef}
    >
      <a href={href} className="relative text-white">
        {children}
      </a>
      <AnimatePresence>
        {showFlyout && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            style={{ translateX: "-50%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute left-1/2 top-12 bg-white text-black"
          >
            <div className="absolute -top-6 left-0 right-0 h-6 bg-transparent" />
            <div className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white" />
            <FlyoutContent closeFlyout={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const BidForm = ({ itemId, currentBid, closeFlyout }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const validateBidAmount = (amount) => {
    if (amount <= currentBid) {
      setError(
        `Bid amount must be higher than the current bid of $${currentBid}`,
      );
      return false;
    }
    setError("");
    return true;
  };

  return (
    <div className="w-96 bg-white p-6 shadow-xl rounded-md">
      <h1 className="text-md pb-6 font-semibold text-center">Place Your Bid</h1>
      <form
        className="space-y-8"
        onSubmit={async (e) => {
          e.preventDefault();

          const form = e.currentTarget;
          const formData = new FormData(form);

          const companyName = formData.get("companyName");
          const emailAddress = formData.get("emailAddress");
          const amount = parseFloat(formData.get("amount"));

          if (!validateBidAmount(amount)) {
            return;
          }

          setIsSubmitting(true);

          const result = await createBidAction({
            itemId,
            companyName,
            amount,
            emailAddress,
          });

          setIsSubmitting(false);

          if (result.error) {
            toast({
              title: "Error",
              description: result.error,
              action: (
                <button
                  altText="Update Profile"
                  className="bg-blue-600 text-xs rounded-md p-2 text-white"
                >
                  <Link href="/home/me">Update Profile</Link>
                </button>
              ),
            });
            return;
          }

          toast({
            title: "Bid placed successfully",
            description: "Your bid has been placed.",
          });

          closeFlyout(); // Close the flyout after submitting the bid
        }}
      >
        <Input
          required
          name="companyName"
          className="w-full text-black"
          placeholder="Name of Organisation"
        />
        <Input
          required
          name="emailAddress"
          className="w-full text-black"
          placeholder="Email Address"
        />
        <Input
          required
          name="amount"
          type="number"
          className="w-full text-black"
          step="0.01"
          placeholder="What's your bid?"
        />
        {error && <p className="text-red-600">{error}</p>}
        <button
          type="submit"
          className="bg-blue-600 hover:opacity-90 transition-opacity text-white font-semibold w-full py-2 rounded"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Bid"}
        </button>
      </form>
    </div>
  );
};

export default PlaceBid;
