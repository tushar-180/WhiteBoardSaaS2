"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { AuthDecorations } from "./auth-decorations";
import { AuthInput } from "./auth-input";
import { AuthTabToggle } from "./auth-tab-toggle";
import { GithubButton } from "./github-button";
import { useAuthForm } from "@/hooks/auth/use-auth-form";

export default function LoginPage() {
  const {
    form: {
      register,
      handleSubmit,
      formState: { errors },
    },
    emailLoading,
    githubLoading,
    isSignUp,
    setIsSignUp,
    showPassword,
    setShowPassword,
    isPasswordValid,
    handleGithubAuth,
    handleAuth,
  } = useAuthForm();

  const isFormDisabled = emailLoading || githubLoading;

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-background">
      <AuthDecorations />

      {/* Brand Logo Link */}
      <Link
        href="/"
        className="hover:opacity-95 transition-all mb-6 select-none animate-fade-in hover:scale-[1.03] duration-200"
      >
        <Image
          src="/logo.png"
          alt="Zentrox Logo"
          width={96}
          height={96}
          className="object-contain"
          style={{ height: "auto" }}
          priority
        />
      </Link>

      {/* Form Card */}
      <div className="w-full max-w-md bg-card/65 border border-border/80 p-8 rounded-2xl shadow-xl backdrop-blur-md relative overflow-hidden transition-all duration-300 hover:shadow-2xl">
        {/* Subtle top border light beam */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="text-center mb-6">
          <h1 className="text-2xl font-black tracking-tight text-foreground transition-all duration-300">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 h-5">
            {isSignUp
              ? "Start wireframing and sketching today"
              : "Access your collaborative canvases"}
          </p>
        </div>

        {/* Tab Toggle (Segmented Slide Control) */}
        <AuthTabToggle isSignUp={isSignUp} onToggle={setIsSignUp} />

        {/* OAuth Button */}
        <GithubButton
          onClick={handleGithubAuth}
          disabled={isFormDisabled}
          loading={githubLoading}
        />

        {/* Separator Divider */}
        <div className="relative mb-5 flex items-center justify-center select-none">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/60" />
          </div>
          <span className="relative bg-card/90 px-3 text-[10px] uppercase font-bold text-muted-foreground tracking-wider rounded-full py-0.5 border border-border/30">
            or email
          </span>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit(handleAuth)} className="space-y-4">
          {isSignUp && (
            <AuthInput
              label="Full Name"
              type="text"
              placeholder="John Doe"
              icon={<User className="h-4 w-4" />}
              register={register("name")}
              error={errors.name}
              disabled={isFormDisabled}
            />
          )}

          <AuthInput
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            icon={<Mail className="h-4 w-4" />}
            register={register("email")}
            error={errors.email}
            disabled={isFormDisabled}
          />

          <AuthInput
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            icon={<Lock className="h-4 w-4" />}
            register={register("password")}
            error={errors.password}
            disabled={isFormDisabled}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded-lg cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
          />

          {/* Password strength checklist / helper */}
          {isSignUp && (
            <div className="flex items-center gap-1.5 mt-1.5 px-1 transition-all duration-200">
              <div
                className={`h-1.5 w-1.5 rounded-full transition-colors duration-200 ${
                  isPasswordValid ? "bg-emerald-500" : "bg-muted-foreground/30"
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-colors duration-200 ${
                  isPasswordValid ? "text-emerald-500" : "text-muted-foreground"
                }`}
              >
                At least 6 characters
              </span>
            </div>
          )}

          {errors.root && (
            <div className="flex items-start gap-2 text-xs text-destructive font-medium bg-destructive/10 p-3 rounded-xl border border-destructive/20 mt-2 animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errors.root.message}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11 rounded-xl shadow-md font-semibold active:scale-[0.99] transition-all duration-200 bg-primary text-primary-foreground hover:opacity-95 mt-4 group cursor-pointer"
            disabled={isFormDisabled}
          >
            {emailLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>
                  {isSignUp ? "Creating account..." : "Signing in..."}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1.5">
                <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
