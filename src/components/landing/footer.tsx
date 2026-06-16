import Link from "next/link";
import Image from "next/image";
import { ASSETS } from "@/lib/constants";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

export default function Footer() {
  const currentYear = 2024; // Hardcoded to prevent hydration mismatch

  return (
    <footer className="border-t border-white/10 bg-[#09090b] pt-16 relative overflow-hidden flex flex-col">
      {/* Decorative gradient */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[800px] h-[300px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand & Description */}
          <div className="md:col-span-1 lg:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-white mb-4"
            >
              <Image
                src={ASSETS.LOGO}
                alt="Zentrox Logo"
                width={28}
                height={28}
                className="object-contain w-auto h-auto rounded-md"
                style={{ width: "auto", height: "auto" }}
              />
              <span>Zentrox</span>
            </Link>
            <p className="text-white/70 text-sm max-w-xs leading-relaxed mb-6 font-light">
              The ultimate collaborative canvas for modern teams. Draw, think,
              and build together in real-time.
            </p>
            {/* Socials */}
            <div className="flex items-center gap-4 text-white/40">
              <Link
                href="https://github.com/tushar-180/WhiteBoardSaaS2"
                target="_blank"
                className="hover:text-white transition-colors"
              >
                <GithubIcon className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                <TwitterIcon className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Product</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <Link
                  href="/features"
                  className="hover:text-white transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-white transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 pb-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/70">
            &copy; {currentYear} Zentrox Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-white/70 font-medium tracking-wide">
            <span>Empowering visual collaboration for modern teams.</span>
          </div>
        </div>
      </div>

      {/* Big Text At Bottom */}
      <div className="w-full flex justify-center items-end overflow-hidden mt-8">
        <h1 className="text-[20vw] font-bold text-white/[0.03] leading-[0.75] tracking-tighter whitespace-nowrap">
          Zentrox
        </h1>
      </div>
    </footer>
  );
}
