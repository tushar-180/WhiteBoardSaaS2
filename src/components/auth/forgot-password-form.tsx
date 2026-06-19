"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import posthog from "posthog-js";

import { Button } from "@/components/ui/button";
import { AuthInput } from "./auth-input";
import { AuthDecorations } from "./auth-decorations";
import { createClient } from "@/utils/supabase/client";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/types/auth";
import { ROUTES, ASSETS } from "@/lib/constants";

export default function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const callbackUrl = new URL(ROUTES.AUTH_CALLBACK, window.location.origin);
      callbackUrl.searchParams.set("next", ROUTES.RESET_PASSWORD);

      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: callbackUrl.toString(),
      });

      if (error) {
        posthog.captureException(error);
        setError("root", { message: "Something went wrong. Please try again." });
      } else {
        setSuccess(true);
        posthog.capture("password_reset_requested", { email: data.email });
      }
    } catch (err) {
      posthog.captureException(err);
      setError("root", { message: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-background">
      <AuthDecorations />

      <Link
        href={ROUTES.HOME}
        className="hover:opacity-95 transition-all mb-6 select-none animate-fade-in hover:scale-[1.03] duration-200"
      >
        <Image
          src={ASSETS.LOGO}
          alt="Zentrox Logo"
          width={96}
          height={96}
          className="object-contain w-auto h-auto"
          style={{ width: "auto", height: "auto" }}
          priority
        />
      </Link>

      <div className="w-full max-w-md bg-card/65 border border-border/80 p-8 rounded-2xl shadow-xl backdrop-blur-md relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="text-center mb-6">
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Reset Password
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 h-5">
            {success ? "Check your inbox" : "Enter your email to get a reset link"}
          </p>
        </div>

        {success ? (
          <div className="flex flex-col items-center animate-fade-in space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-2">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-sm text-center text-muted-foreground">
              We&apos;ve sent a password reset link to your email address. Please check your inbox and spam folder.
            </p>
            <Button asChild className="w-full mt-4 h-11 rounded-xl shadow-md font-semibold">
              <Link href={ROUTES.LOGIN}>Return to Login</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <AuthInput
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              icon={<Mail className="h-4 w-4" />}
              register={register("email")}
              error={errors.email}
              disabled={loading}
              maxLength={100}
            />

            {errors.root && (
              <div className="flex items-start gap-2 text-xs text-destructive font-medium bg-destructive/10 p-3 rounded-xl border border-destructive/20 mt-2 animate-fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errors.root.message}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 rounded-xl shadow-md font-semibold active:scale-[0.99] transition-all duration-200 bg-primary text-primary-foreground hover:opacity-95 mt-4"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending link...</span>
                </div>
              ) : (
                "Send Reset Link"
              )}
            </Button>

            <div className="mt-6 flex items-center justify-center">
              <Link
                href={ROUTES.LOGIN}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
