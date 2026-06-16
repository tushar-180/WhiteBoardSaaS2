import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Menu } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
            className="object-contain w-auto h-auto rounded-xl shadow-sm"
            style={{ width: "auto", height: "auto" }}
          />
          <span className="font-black tracking-tight text-foreground hidden sm:inline">
            Zentrox
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link
            href="/features"
            className="hover:text-foreground transition-colors"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="hover:text-foreground transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/about"
            className="hover:text-foreground transition-colors"
          >
            About
          </Link>
          <Link
            href="https://github.com/tushar-180/WhiteBoardSaaS2"
            target="_self"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </Link>
        </nav>

        {/* CTA Buttons & Mobile Menu */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile Menu */}
          <div className="md:hidden">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon", className: "h-9 w-9 rounded-xl" })}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-md rounded-xl border-border/50">
                <DropdownMenuItem asChild>
                  <Link href="/features" className="w-full cursor-pointer">Features</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/pricing" className="w-full cursor-pointer">Pricing</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/about" className="w-full cursor-pointer">About</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/contact" className="w-full cursor-pointer">Contact Us</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="https://github.com/tushar-180/WhiteBoardSaaS2" target="_self" className="w-full cursor-pointer">GitHub</Link>
                </DropdownMenuItem>
                {!isLoggedIn && (
                  <DropdownMenuItem asChild>
                    <Link href={ROUTES.LOGIN} className="w-full cursor-pointer font-bold text-primary">Sign In</Link>
                  </DropdownMenuItem>
                )}
                {isLoggedIn && (
                  <DropdownMenuItem asChild>
                    <Link href={ROUTES.WORKSPACES} className="w-full cursor-pointer font-bold text-primary">Go to App</Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {isLoggedIn ? (
            <>
              <Logout />
              <Link href={ROUTES.WORKSPACES} className="hidden sm:inline-flex rounded-xl">
                <HoverBorderGradient
                  containerClassName="h-11 min-h-[44px] w-full"
                  className="flex items-center justify-center w-full h-full px-4 sm:px-8 sm:text-base font-semibold bg-background text-foreground cursor-pointer"
                  as="div"
                >
                  Go to App
                  <ArrowRight className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </HoverBorderGradient>
              </Link>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className="hidden sm:inline-flex h-9 px-4 sm:h-11 sm:px-8 rounded-xl font-semibold"
              >
                <Link href={ROUTES.LOGIN}>Sign In</Link>
              </Button>
              <Button
                asChild
                className="hidden sm:inline-flex h-9 px-4 sm:h-11 sm:px-8 sm:text-base rounded-xl font-semibold shadow-xs"
              >
                <Link href={ROUTES.WORKSPACES}>
                  Get Started
                  <ArrowRight className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
