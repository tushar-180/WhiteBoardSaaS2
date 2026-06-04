"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { AuthDecorations } from "./auth-decorations";
import { GithubIcon } from "./github-icon";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createClient } from "@/utils/supabase/client";
import { authSchema, type AuthFormData } from "@/types/auth";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const passwordValue = form.watch("password") || "";
  const isPasswordValid = passwordValue.length >= 6;
  const handleGithubAuth = async () => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      console.log(window.location.origin,"window.location.origin")
      console.log(window.location.search,"window.location.search")
      console.log(searchParams,"searchParams")
      const next = searchParams.get("next") || "/";
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", next);

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });

      if (error) {
        form.setError("root", {
          message: error.message,
        });
      }
    } catch {
      form.setError("root", {
        message: "Failed to connect with GitHub. Please try again.",
      });
    }
  };

  const handleAuth = async (data: AuthFormData) => {
    setLoading(true);
    form.clearErrors();

    try {
      const supabase = createClient();

      if (isSignUp) {
        if (!data.name || data.name.trim().length < 2) {
          form.setError("name", {
            message: "Please enter your full name (minimum 2 characters)",
          });
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.name.trim(),
            },
          },
        });

        if (error) {
          form.setError("root", {
            message: error.message,
          });
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (error) {
          form.setError("root", {
            message: error.message,
          });
          return;
        }
      }

      const searchParams = new URLSearchParams(window.location.search);
      const next = searchParams.get("next") || "/workspaces";
      router.push(next);
    } catch {
      form.setError("root", {
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

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
        <div className="relative flex p-1 bg-muted/60 rounded-xl border border-border/40 mb-6 select-none">
          <div
            className="absolute top-1 bottom-1 rounded-lg bg-background shadow-xs transition-all duration-300 ease-out"
            style={{
              width: "calc(50% - 4px)",
              left: isSignUp ? "calc(50% + 2px)" : "4px",
            }}
          />
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              form.clearErrors();
            }}
            className={`relative z-10 w-1/2 py-2 text-xs font-bold rounded-lg transition-colors duration-200 text-center ${
              !isSignUp
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              form.clearErrors();
            }}
            className={`relative z-10 w-1/2 py-2 text-xs font-bold rounded-lg transition-colors duration-200 text-center ${
              isSignUp
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Register
          </button>
        </div>

        {/* OAuth Button */}
        <div className="space-y-3 mb-5">
          <Button
            variant="outline"
            className="w-full h-10 gap-2 border-border/80 hover:bg-muted font-semibold transition-colors active:scale-[0.99]"
            type="button"
            onClick={handleGithubAuth}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GithubIcon className="h-4 w-4" />
            )}
            Continue with GitHub
          </Button>
        </div>

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
        <form onSubmit={form.handleSubmit(handleAuth)} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1.5 animate-fade-in">
              <Label className="text-xs font-semibold text-muted-foreground px-1">
                Full Name
              </Label>
              <div className="relative group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
                  <User className="h-4 w-4" />
                </span>
                <Input
                  type="text"
                  placeholder="John Doe"
                  className="h-10 rounded-xl border-border/80 pl-10 pr-3 transition-all duration-200 bg-background/50 hover:bg-background/80 focus:bg-background"
                  {...form.register("name")}
                />
              </div>
              {form.formState.errors.name && (
                <div className="flex items-center gap-1.5 mt-1 px-1 text-xs text-destructive font-medium animate-fade-in">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{form.formState.errors.name.message}</span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground px-1">
              Email Address
            </Label>
            <div className="relative group">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
                <Mail className="h-4 w-4" />
              </span>
              <Input
                type="email"
                placeholder="name@example.com"
                className="h-10 rounded-xl border-border/80 pl-10 pr-3 transition-all duration-200 bg-background/50 hover:bg-background/80 focus:bg-background"
                {...form.register("email")}
              />
            </div>
            {form.formState.errors.email && (
              <div className="flex items-center gap-1.5 mt-1 px-1 text-xs text-destructive font-medium animate-fade-in">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{form.formState.errors.email.message}</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground px-1">
              Password
            </Label>
            <div className="relative group">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
                <Lock className="h-4 w-4" />
              </span>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="h-10 rounded-xl border-border/80 pl-10 pr-10 transition-all duration-200 bg-background/50 hover:bg-background/80 focus:bg-background"
                {...form.register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors rounded-lg"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Password strength checklist / helper */}
            {isSignUp && (
              <div className="flex items-center gap-1.5 mt-1.5 px-1 transition-all duration-200">
                <div
                  className={`h-1.5 w-1.5 rounded-full transition-colors duration-200 ${isPasswordValid ? "bg-emerald-500" : "bg-muted-foreground/30"}`}
                />
                <span
                  className={`text-[10px] font-medium transition-colors duration-200 ${isPasswordValid ? "text-emerald-500" : "text-muted-foreground"}`}
                >
                  At least 6 characters
                </span>
              </div>
            )}

            {form.formState.errors.password && (
              <div className="flex items-center gap-1.5 mt-1 px-1 text-xs text-destructive font-medium animate-fade-in">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{form.formState.errors.password.message}</span>
              </div>
            )}
          </div>

          {form.formState.errors.root && (
            <div className="flex items-start gap-2 text-xs text-destructive font-medium bg-destructive/10 p-3 rounded-xl border border-destructive/20 mt-2 animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{form.formState.errors.root.message}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11 rounded-xl shadow-md font-semibold active:scale-[0.99] transition-all duration-200 bg-primary text-primary-foreground hover:opacity-95 mt-4 group"
            disabled={loading}
          >
            {loading ? (
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
