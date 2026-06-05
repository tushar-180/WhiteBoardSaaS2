import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "./github-icon";

interface GithubButtonProps {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
}

export function GithubButton({ onClick, disabled, loading }: GithubButtonProps) {
  return (
    <div className="space-y-3 mb-5">
      <Button
        variant="outline"
        className="w-full h-10 gap-2 border-border/80 hover:bg-muted font-semibold transition-colors active:scale-[0.99] cursor-pointer"
        type="button"
        onClick={onClick}
        disabled={disabled}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <GithubIcon className="h-4 w-4" />
        )}
        Continue with GitHub
      </Button>
    </div>
  );
}
