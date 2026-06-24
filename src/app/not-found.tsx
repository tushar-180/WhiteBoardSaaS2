"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { ArrowRight, Compass } from "lucide-react";
import { WavyBackground } from "@/components/ui/wavy-background";

export default function NotFound() {
  const [isClient, setIsClient] = useState(false);
  
  // Smooth mouse tracking for parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 50, stiffness: 400 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const textX = useTransform(smoothMouseX, [-500, 500], [-30, 30]);
  const textY = useTransform(smoothMouseY, [-500, 500], [-30, 30]);
  const wireframeX = useTransform(smoothMouseX, [-500, 500], [-45, 45]);
  const wireframeY = useTransform(smoothMouseY, [-500, 500], [-45, 45]);

  useEffect(() => {
    setIsClient(true);
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = e.clientX - innerWidth / 2;
      const y = e.clientY - innerHeight / 2;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <WavyBackground 
      containerClassName="relative overflow-hidden min-h-screen flex items-center justify-center selection:bg-primary/30"
      className="w-full mx-auto"
      backgroundFill="var(--background)"
    >
      {/* Floating Abstract Canvas Elements */}
      <motion.div 
        animate={{ y: [0, -30, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[15%] left-[15%] w-32 h-32 border border-foreground/5 rounded-full opacity-50 pointer-events-none blur-[1px] md:w-64 md:h-64 z-0"
      />
      <motion.div 
        animate={{ y: [0, 40, 0], x: [0, 20, 0], rotate: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[15%] right-[15%] w-24 h-24 border border-amber-500/30 rounded-2xl opacity-50 pointer-events-none rotate-12 blur-[1px] md:w-48 md:h-48 z-0"
      />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10 flex flex-col items-center">
        


        {/* Massive Interactive 404 Text */}
        {isClient && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative group cursor-default w-full flex justify-center"
          >
            <motion.h1 
              style={{ x: textX, y: textY }}
              className="text-[10rem] sm:text-[14rem] md:text-[20rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/10 select-none drop-shadow-2xl z-10"
            >
              404
            </motion.h1>

            {/* Wireframe Outline Effect mapped to theme colors */}
            <motion.h1 
              style={{ x: wireframeX, y: wireframeY, WebkitTextStroke: '3px rgba(245, 158, 11, 0.3)' }}
              className="absolute top-0 text-[10rem] sm:text-[14rem] md:text-[20rem] font-black leading-none tracking-tighter text-transparent select-none z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out"
            >
              404
            </motion.h1>
          </motion.div>
        )}

        {/* Fallback for SSR to prevent hydration mismatch */}
        {!isClient && (
          <div className="relative group cursor-default w-full flex justify-center">
            <h1 className="text-[10rem] sm:text-[14rem] md:text-[20rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/10 select-none drop-shadow-2xl z-10">
              404
            </h1>
          </div>
        )}

        {/* Content Section */}
        {isClient && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8 max-w-lg mt-[-1rem] md:mt-[-3rem] relative z-20"
          >
            <div className="space-y-3">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-500 pb-1">
                Drifted off the canvas
              </h2>
              <p className="text-base md:text-lg text-foreground/60 font-medium leading-relaxed max-w-md mx-auto tracking-wide">
                The idea you are looking for has been erased, moved, or never existed in this workspace.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="pt-6 flex justify-center"
            >
              <Button 
                asChild 
                size="lg" 
                className="h-12 px-8 text-sm font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_40px_-10px_color-mix(in_srgb,var(--primary)_50%,transparent)] transition-all group"
              >
                <Link href={ROUTES.WORKSPACES} className="flex items-center gap-2">
                  <Compass className="w-4 h-4 transition-transform group-hover:-rotate-45" />
                  Return to Dashboard
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </WavyBackground>
  );
}
