import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logout from "./logout";
import { ASSETS, ROUTES } from "@/lib/constants";

interface NavbarProps {
  isLoggedIn: boolean;
}

export default function Navbar({ isLoggedIn }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 font-bold text-2xl tracking-tight hover:opacity-90 transition-opacity"
        >
          <Image
            src={ASSETS.LOGO}
            alt="Zentrox Logo"
            width={42}
            height={42}
            className="object-contain rounded-xl shadow-sm"
            style={{ height: "auto" }}
          />
          <span className="font-black tracking-tight text-foreground">
            Zentrox
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link
            href="#features"
            className="hover:text-foreground transition-colors"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="hover:text-foreground transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="https://github.com/tushar-180/WhiteBoardSaaS2"
            target="_blank"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </Link>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <Logout />
              <Button asChild size="lg">
                <Link href={ROUTES.WORKSPACES}>
                  Go to App
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="hidden sm:inline-flex"
              >
                <Link href={ROUTES.LOGIN}>Sign In</Link>
              </Button>
              <Button asChild size="lg">
                <Link href={ROUTES.WORKSPACES}>
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
