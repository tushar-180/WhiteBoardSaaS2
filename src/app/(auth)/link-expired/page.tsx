import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Meteors } from "@/components/ui/meteors";
import { AuthDecorations } from "@/components/auth/auth-decorations";
import { ROUTES, ASSETS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Link Expired",
  description: "The link you clicked has expired or is invalid.",
};

export default function LinkExpiredPage() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-background">
      <AuthDecorations />

      {/* Subtle background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-destructive/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

      <Link
        href={ROUTES.HOME}
        className="hover:opacity-95 transition-all mb-6 select-none animate-fade-in hover:scale-[1.03] duration-200"
      >
        <Image
          src={ASSETS.LOGO}
          alt="Zentrox Logo"
          width={96}
          height={96}
          className="object-contain w-auto h-auto"
          style={{ width: "auto", height: "auto" }}
          priority
        />
      </Link>

      <div className="relative w-full max-w-md">
        <Meteors number={15} />
        <div className="w-full bg-card/65 border border-border/80 p-8 rounded-2xl shadow-xl backdrop-blur-md relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-destructive/30 to-transparent" />

          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-destructive/20 to-destructive/5 flex items-center justify-center text-destructive mb-4 ring-1 ring-destructive/10 shadow-xs">
              <AlertCircle className="h-8 w-8" />
            </div>
            
            <h1 className="text-2xl font-black tracking-tight text-foreground mb-2">
              Link Expired
            </h1>
            
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              The link you clicked is invalid or has expired. For security reasons, email links can only be used once and expire after a short period of time.
            </p>

            <div className="w-full space-y-3">
              <Button asChild className="w-full h-11 rounded-xl shadow-md font-semibold bg-primary text-primary-foreground hover:opacity-95 group relative overflow-hidden active:scale-[0.98] transition-all">
                <Link href={ROUTES.FORGOT_PASSWORD}>
                  {/* Shimmer overlay */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <div className="flex items-center justify-center gap-1.5 relative z-10">
                    <span>Request New Link</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full h-11 rounded-xl font-semibold border-border/60 hover:bg-muted/50 active:scale-[0.98] transition-all">
                <Link href={ROUTES.LOGIN}>
                  Return to Login
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
