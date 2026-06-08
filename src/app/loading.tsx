export default function RootLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background relative overflow-hidden">
      {/* Decorative gradient backgrounds matching global dashboard aesthetic */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl -z-10" />

      <div className="flex flex-col items-center gap-3.5 text-center">
        {/* Sleek, minimalistic spinner */}
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        
        <p className="text-xs text-muted-foreground font-medium tracking-wide animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
