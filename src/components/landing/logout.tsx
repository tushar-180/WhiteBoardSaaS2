"use client";

import { useTransition } from "react";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { signOutAction } from "@/actions/auth";
import posthog from "posthog-js";

const Logout = () => {
  const [isPending, startTransition] = useTransition();

  const handleSignOut = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      posthog.reset();
      await signOutAction();
    });
  };

  return (
    <form onSubmit={handleSignOut}>
      <Button
        type="submit"
        variant="ghost"
        disabled={isPending}
        className="h-9 px-3 text-xs sm:text-sm sm:h-11 sm:px-8 sm:text-base cursor-pointer rounded-xl font-semibold"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-muted-foreground" />
            <span className="hidden sm:inline">Logging out...</span>
            <span className="sm:hidden">Wait...</span>
          </>
        ) : (
          "Logout"
        )}
      </Button>
    </form>
  );
};

export default Logout;
