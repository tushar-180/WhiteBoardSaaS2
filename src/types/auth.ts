import { z } from "zod";

export const authSchema = z.object({
  name: z.string().optional(),

  email: z.email({
    message: "Please enter a valid email",
  }),

  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
});

export type AuthFormData = z.infer<typeof authSchema>;
