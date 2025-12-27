import z from "zod";

export const createPostInputSchema = z.object({
  text: z
    .string()
    .min(1, "caption is required")
    .max(1000, "caption is too long"),
  image: z.string().optional(),
});
