import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/utils/supabase/client";
import { authSchema, type AuthFormData } from "@/types/auth";
import { useWorkspaceStore } from "@/store/use-workspace-store";

export function useAuthForm() {
  const router = useRouter();
  const [emailLoading, setEmailLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Clear Zustand store on login page mount to prevent state leaks between session changes
    useWorkspaceStore.setState({
      workspaces: [],
      user: null,
    });
  }, []);

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
    setGithubLoading(true);
    form.clearErrors();
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const next = searchParams.get("next") || "/workspaces";
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
        setGithubLoading(false);
      }
    } catch {
      form.setError("root", {
        message: "Failed to connect with GitHub. Please try again.",
      });
      setGithubLoading(false);
    }
  };

  const handleAuth = async (data: AuthFormData) => {
    setEmailLoading(true);
    form.clearErrors();

    try {
      const supabase = createClient();

      if (isSignUp) {
        if (!data.name || data.name.trim().length < 2) {
          form.setError("name", {
            message: "Please enter your full name (minimum 2 characters)",
          });
          setEmailLoading(false);
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
      const next = searchParams.get("next") || (isSignUp ? "/" : "/workspaces");
      router.push(next);
    } catch {
      form.setError("root", {
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setEmailLoading(false);
    }
  };

  return {
    form,
    emailLoading,
    githubLoading,
    isSignUp,
    setIsSignUp,
    showPassword,
    setShowPassword,
    isPasswordValid,
    handleGithubAuth,
    handleAuth,
  };
}
