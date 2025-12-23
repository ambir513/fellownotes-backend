import z from "zod";

export const loginInputSchema = z.object({
  email: z
    .string()
    .email()
    .min(10, "Email must be at least 10 characters long")
    .max(100, "Email must be at most 100 characters long"),
});

export const verifyEmailQuerySchema = z.object({
  token: z
    .string()
    .min(10, "Token must be at least 10 characters long")
    .max(500, "Token must be at most 500 characters long"),
});
