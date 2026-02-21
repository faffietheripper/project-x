"use client";

import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

interface AssignListingButtonProps {
  listingId: number;
  bidId: number;
  listing?: {
    offerAccepted: boolean;
    assignedCarrierOrganisationId: string | null;
  };
  bid?: {
    declinedOffer: boolean;
    cancelledJob: boolean;
  };
  handleAssignWinningBid: (
    formData: FormData,
  ) => Promise<{ success: boolean; message: string }>;
}

export default function AssignListingButton({
  listingId,
  bidId,
  listing,
  bid,
  handleAssignWinningBid,
}: AssignListingButtonProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!bid || !listing) {
    return null;
  }

  const handleAssign = async () => {
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("listingId", listingId.toString());
    formData.append("bidId", bidId.toString());

    try {
      const result = await handleAssignWinningBid(formData);

      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    } catch {
      toast({
        title: "Error",
        description: "An error occurred while assigning the listing.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔥 Correct disable logic
  const disableAssign =
    bid.declinedOffer ||
    bid.cancelledJob ||
    listing.offerAccepted ||
    listing.assignedCarrierOrganisationId !== null;

  return (
    <div>
      {disableAssign ? (
        <button
          disabled
          className="bg-gray-400 text-white py-2 px-4 rounded-md"
        >
          {bid.declinedOffer
            ? "Offer Declined"
            : bid.cancelledJob
              ? "Job Cancelled"
              : listing.offerAccepted
                ? "Offer Accepted"
                : listing.assignedCarrierOrganisationId
                  ? "Carrier Assigned"
                  : "Unavailable"}
        </button>
      ) : (
        <button
          onClick={handleAssign}
          disabled={isSubmitting}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
        >
          {isSubmitting ? "Assigning..." : "Assign Listing"}
        </button>
      )}
    </div>
  );
}
