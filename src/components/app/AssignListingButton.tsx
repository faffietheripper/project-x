"use client"; // Ensures the component works on the client-side

import { useToast } from "@/components/ui/use-toast"; // Ensure the correct path
import { useState } from "react";

interface AssignListingButtonProps {
  itemId: number;
  bidId: number;
  handleAssignWinningBid: (
    formData: FormData
  ) => Promise<{ success: boolean; message: string }>; // Passing in the action directly
}

export default function AssignListingButton({
  itemId,
  bidId,
  handleAssignWinningBid,
}: AssignListingButtonProps) {
  const { toast } = useToast(); // Use the toast hook
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAssign = async () => {
    setIsSubmitting(true);

    // Prepare the form data for submission
    const formData = new FormData();
    formData.append("itemId", itemId.toString());
    formData.append("bidId", bidId.toString());

    try {
      // Directly call the action
      const result = await handleAssignWinningBid(formData);

      // Display the message based on the result
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      // Handle any errors
      toast({
        title: "Error",
        description: "An error occurred while assigning the listing.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      onClick={handleAssign}
      disabled={isSubmitting}
      className="bg-blue-600 text-white py-2 px-4 rounded-md"
    >
      {isSubmitting ? "Assigning..." : "Assign Listing"}
    </button>
  );
}
