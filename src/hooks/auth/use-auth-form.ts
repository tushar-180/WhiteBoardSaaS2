import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/utils/supabase/client";
import { authSchema, type AuthFormData } from "@/types/auth";
import { useWorkspaceStore } from "@/store/use-workspace-store";
import { ROUTES, DEFAULT_REDIRECTS } from "@/lib/constants";
import posthog from "posthog-js";

export function useAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  const errorParam = searchParams?.get("error");

  useEffect(() => {
    if (errorParam === "oauth-failed") {
      form.setError("root", {
        type: "manual",
        message: "GitHub authentication failed. Please try again.",
      });
    } else if (errorParam) {
      form.setError("root", {
        type: "manual",
        message: decodeURIComponent(errorParam),
      });
    }
  }, [errorParam, form]);

  const passwordValue = useWatch({ control: form.control, name: "password" }) as string || "";
  const isPasswordValid = passwordValue.length >= 6;

  const handleGithubAuth = async () => {
    setGithubLoading(true);
    form.clearErrors();
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const next = searchParams.get("next") || DEFAULT_REDIRECTS.AFTER_LOGIN;
      const callbackUrl = new URL(ROUTES.AUTH_CALLBACK, window.location.origin);
      callbackUrl.searchParams.set("next", next);

      posthog.capture("github_auth_started");

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });

      if (error) {
        posthog.captureException(error);
        form.setError("root", {
          message: error.message,
        });
        setGithubLoading(false);
      }
    } catch (err) {
      posthog.captureException(err);
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
          posthog.captureException(error);
          form.setError("root", {
            message: error.message,
          });
          return;
        }

        posthog.identify(data.email, { email: data.email, name: data.name.trim() });
        posthog.capture("user_signed_up", { email: data.email, method: "email" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (error) {
          posthog.captureException(error);
          form.setError("root", {
            message: error.message,
          });
          return;
        }

        posthog.identify(data.email, { email: data.email });
        posthog.capture("user_signed_in", { email: data.email, method: "email" });
      }

      const searchParams = new URLSearchParams(window.location.search);
      const next = searchParams.get("next") || (isSignUp ? DEFAULT_REDIRECTS.AFTER_SIGNUP : DEFAULT_REDIRECTS.AFTER_LOGIN);
      router.push(next);
    } catch (err) {
      posthog.captureException(err);
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
