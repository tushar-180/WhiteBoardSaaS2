import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background py-12">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5 font-bold text-sm tracking-tight text-muted-foreground">
          <Image
            src="/logo.png"
            alt="Zentrox Logo"
            width={20}
            height={20}
            className="object-contain rounded"
            style={{ height: "auto" }}
          />
          <span>Zentrox</span>
        </div>

        {/* Copy */}
        <p className="text-xs text-muted-foreground/80 sm:order-first">
          &copy; {currentYear} Zentrox Inc. All rights reserved.
        </p>

        {/* Links */}
        <div className="flex gap-6 text-xs text-muted-foreground/80 font-medium">
          <Link href="#" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
