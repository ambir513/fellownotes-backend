import z from "zod";

export const updateAccountDetailsSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters long")
    .max(30, "Name must be at most 30 characters long")
    .optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(30, "Username must be at most 30 characters long")
    .lowercase()
    .optional(),
  bio: z
    .string()
    .max(160, "Bio must be at most 160 characters long")
    .optional(),
  age: z
    .number()
    .min(13, "Age must be at least 13")
    .max(100, "Age must be at most 100")
    .optional(),
  location: z
    .string()
    .max(100, "Location must be at most 100 characters long")
    .optional(),
  course: z
    .string()
    .max(100, "Course must be at most 100 characters long")
    .optional(),
  avatar: z
    .string()
    .max(500, "Avatar URL must be at most 500 characters long")
    .optional(),
});
