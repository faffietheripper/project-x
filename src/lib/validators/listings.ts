import { z } from "zod";

export const createListingSchema = z.object({
  name: z.string().min(3),
  startingPrice: z.number().min(0),
  templateId: z.string(),
});
