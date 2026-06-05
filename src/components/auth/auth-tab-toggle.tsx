interface AuthTabToggleProps {
  isSignUp: boolean;
  onToggle: (isSignUp: boolean) => void;
}

export function AuthTabToggle({ isSignUp, onToggle }: AuthTabToggleProps) {
  return (
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
        onClick={() => onToggle(false)}
        className={`relative z-10 w-1/2 py-2 text-xs font-bold rounded-lg transition-colors duration-200 text-center cursor-pointer ${
          !isSignUp
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Sign In
      </button>
      <button
        type="button"
        onClick={() => onToggle(true)}
        className={`relative z-10 w-1/2 py-2 text-xs font-bold rounded-lg transition-colors duration-200 text-center cursor-pointer ${
          isSignUp
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Register
      </button>
    </div>
  );
}
