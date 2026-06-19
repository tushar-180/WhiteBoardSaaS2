import { z } from "zod";

export const getAuthSchema = (isSignUp: boolean) => {
  return z.object({
    name: z.string().max(50, "Name must be less than 50 characters").optional(),
    
    email: z.email({
      message: "Please enter a valid email",
    }).max(100, "Email must be less than 100 characters"),
    
    password: z.string().max(72, "Password must be less than 72 characters"),
  }).superRefine((data, ctx) => {
    if (isSignUp) {
      if (!data.name || data.name.trim().length < 2) {
        ctx.addIssue({
          code: "custom",
          message: "Please enter your full name (minimum 2 characters)",
          path: ["name"],
        });
      }
      if (data.password.length < 6) {
        ctx.addIssue({
          code: "custom",
          message: "Password must be at least 6 characters",
          path: ["password"],
        });
      }
    } else {
      if (!data.password || data.password.length < 1) {
        ctx.addIssue({
          code: "custom",
          message: "Password is required",
          path: ["password"],
        });
      }
    }
  });
};

export type AuthFormData = {
  name?: string;
  email: string;
  password: string;
};

export const forgotPasswordSchema = z.object({
  email: z.email({
    message: "Please enter a valid email",
  }),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters").max(72, "Password must be less than 72 characters"),
  confirmPassword: z.string(),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: "custom",
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
  }
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
