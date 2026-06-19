import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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

      <div className="w-full max-w-md bg-card/65 border border-border/80 p-8 rounded-2xl shadow-xl backdrop-blur-md relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-destructive/30 to-transparent" />

        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4">
            <AlertCircle className="h-8 w-8" />
          </div>
          
          <h1 className="text-2xl font-black tracking-tight text-foreground mb-2">
            Link Expired
          </h1>
          
          <p className="text-sm text-muted-foreground mb-8">
            The link you clicked is invalid or has expired. For security reasons, email links can only be used once and expire after a short period of time.
          </p>

          <div className="w-full space-y-3">
            <Button asChild className="w-full h-11 rounded-xl shadow-md font-semibold bg-primary text-primary-foreground hover:opacity-95 group">
              <Link href={ROUTES.FORGOT_PASSWORD}>
                <div className="flex items-center justify-center gap-1.5">
                  <span>Request New Link</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full h-11 rounded-xl font-semibold border-border/60 hover:bg-muted/50">
              <Link href={ROUTES.LOGIN}>
                Return to Login
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
