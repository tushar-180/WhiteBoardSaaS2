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
        size="lg"
        disabled={isPending}
        className="cursor-pointer"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-muted-foreground" />
            Logging out...
          </>
        ) : (
          "Logout"
        )}
      </Button>
    </form>
  );
};

export default Logout;
