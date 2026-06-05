import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background relative overflow-hidden px-6 text-center">
      {/* Decorative gradient backgrounds matching global dashboard aesthetic */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl -z-10" />

      <div className="space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-7xl font-extrabold tracking-tight text-primary">
            404
          </h1>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Page not found
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            The page you are looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div>
          <Button asChild className="rounded-xl font-semibold shadow-xs transition-all cursor-pointer">
            <Link href="/workspaces">
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
