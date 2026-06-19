"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import posthog from "posthog-js";

import { Button } from "@/components/ui/button";
import { AuthInput } from "./auth-input";
import { AuthDecorations } from "./auth-decorations";
import { createClient } from "@/utils/supabase/client";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/types/auth";
import { ROUTES, ASSETS, DEFAULT_REDIRECTS } from "@/lib/constants";

export default function ResetPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setLoading(true);
    try {
      const supabase = createClient();

      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        posthog.captureException(error);
        setError("root", { message: error.message });
      } else {
        setSuccess(true);
        posthog.capture("password_reset_completed");
        
        // Automatically redirect to the app after a short delay
        setTimeout(() => {
          window.location.href = DEFAULT_REDIRECTS.AFTER_LOGIN;
        }, 2000);
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
            Create New Password
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 h-5">
            {success ? "Password updated successfully" : "Enter a new strong password"}
          </p>
        </div>

        {success ? (
          <div className="flex flex-col items-center animate-fade-in space-y-4">
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 mb-2">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Your password has been changed. Redirecting to your dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <AuthInput
              label="New Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4" />}
              register={register("password")}
              error={errors.password}
              disabled={loading}
              maxLength={72}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded-lg cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            <AuthInput
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4" />}
              register={register("confirmPassword")}
              error={errors.confirmPassword}
              disabled={loading}
              maxLength={72}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded-lg cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
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
                  <span>Updating password...</span>
                </div>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
