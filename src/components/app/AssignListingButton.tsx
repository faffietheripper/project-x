"use client"; // Ensures the component works on the client-side

import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";

interface AssignListingButtonProps {
  itemId: number;
  bidId: number;
  item?: {
    assigned: boolean;
  };
  bid?: {
    declinedOffer: boolean;
    cancelledJob: boolean;
    cancellationReason?: string;
  };
  handleAssignWinningBid: (
    formData: FormData
  ) => Promise<{ success: boolean; message: string }>;
}

export default function AssignListingButton({
  itemId,
  bidId,
  item,
  bid,
  handleAssignWinningBid,
}: AssignListingButtonProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Log item and bid to inspect the data
  useEffect(() => {
    console.log("Bid:", bid);
    console.log("Item:", item);
  }, [bid, item]);

  const handleAssign = async () => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("itemId", itemId.toString());
    formData.append("bidId", bidId.toString());

    try {
      const result = await handleAssignWinningBid(formData);
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while assigning the listing.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Log the data at this point to check values before making any decisions
  console.log("Bid after action:", bid);
  console.log("Item after action:", item);

  // If bid and item are undefined, prevent any further logic.
  if (!bid || !item) {
    console.log("Data is not yet available or missing");
    return <div>Loading...</div>; // Or render any fallback UI
  }

  // Determine if the button should be disabled
  const disableAssign =
    bid?.declinedOffer || bid?.cancelledJob || item?.assigned;

  return (
    <div>
      {/* Conditionally render the button */}
      {disableAssign ? (
        <button
          className="bg-gray-400 text-white py-2 px-4 rounded-md"
          disabled
        >
          {bid?.declinedOffer
            ? "Offer Declined"
            : bid?.cancelledJob
            ? "Job Canceled"
            : item?.assigned
            ? "Already Assigned"
            : "Error"}
        </button>
      ) : (
        <button
          onClick={handleAssign}
          disabled={isSubmitting}
          className="bg-blue-600 text-white py-2 px-4 rounded-md"
        >
          {isSubmitting ? "Assigning..." : "Assign Listing"}
        </button>
      )}
    </div>
  );
}
