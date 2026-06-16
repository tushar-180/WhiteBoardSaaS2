import { z } from "zod";

export const authSchema = z.object({
  name: z.string().max(50, "Name must be less than 50 characters").optional(),

  email: z.email({
    message: "Please enter a valid email",
  }).max(100, "Email must be less than 100 characters"),

  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }).max(72, "Password must be less than 72 characters"),
});

export type AuthFormData = z.infer<typeof authSchema>;
