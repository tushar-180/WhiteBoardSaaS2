import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export function UnauthorizedAccess() {
  return (
    <div className="flex h-full min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
        <ShieldAlert className="h-10 w-10 text-red-600 dark:text-red-500" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Access Denied</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        You do not have permission to view this page. Please make sure you are logged in with the correct account or request access from the workspace owner.
      </p>
      <Button asChild>
        <Link href={ROUTES.WORKSPACES}>
          Return to Workspaces
        </Link>
      </Button>
    </div>
  );
}
