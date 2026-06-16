import { Metadata } from "next";
import { getCurrentUser } from "@/utils/supabase/server";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { PointerHighlight } from "@/components/ui/pointer-highlight";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, MapPin, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | Zentrox",
  description: "Get in touch with the Zentrox team for support, sales, or feedback.",
};

export default async function ContactPage() {
  const { user } = await getCurrentUser();
  const isLoggedIn = !!user;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground scroll-smooth">
      <Navbar isLoggedIn={isLoggedIn} />
      <main className="flex-1 pt-24 pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Left side: Info */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
                  Get in <PointerHighlight containerClassName="inline-block"><span className="text-indigo-400">Touch</span></PointerHighlight>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                  Have a question about Zentrox? Need help with your workspace? 
                  We&apos;re here to help you do your best work.
                </p>
              </div>

              <div className="space-y-6 pt-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Email us</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-1">Our friendly team is here to help.</p>
                    <a href="mailto:hello@zentrox.com" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                      hello@zentrox.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Office</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-1">Come say hello at our HQ.</p>
                    <p className="text-sm font-medium text-foreground">
                      100 Innovation Drive<br/>
                      San Francisco, CA 94103
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Phone</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-1">Mon-Fri from 8am to 5pm PST.</p>
                    <a href="tel:+15550000000" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                      +1 (555) 000-0000
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Form */}
            <div className="bg-card/40 border border-border/50 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm">
              <form className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label htmlFor="first-name" className="text-sm font-medium text-foreground">First name</label>
                    <Input id="first-name" placeholder="Jane" className="bg-background/50 h-11" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="last-name" className="text-sm font-medium text-foreground">Last name</label>
                    <Input id="last-name" placeholder="Doe" className="bg-background/50 h-11" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
                  <Input id="email" type="email" placeholder="you@company.com" className="bg-background/50 h-11" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium text-foreground">Subject</label>
                  <Input id="subject" placeholder="How can we help?" className="bg-background/50 h-11" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-foreground">Message</label>
                  <textarea 
                    id="message" 
                    rows={4}
                    placeholder="Leave us a message..." 
                    className="flex w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  />
                </div>

                <Button type="button" className="w-full h-11 font-semibold rounded-xl text-sm mt-2">
                  Send Message
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  By submitting this form, you agree to our <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>.
                </p>
              </form>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
