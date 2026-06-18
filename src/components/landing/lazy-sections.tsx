"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const LazyHeroMockup = dynamic(() => import("./hero-mockup"), {
  ssr: false,
});

const LazyFeatures = dynamic(() => import("./features"), {
  ssr: false,
});

export function LazyHeroMockupSection() {
  return (
    <Suspense fallback={<div className="h-[600px] bg-background" />}>
      <LazyHeroMockup />
    </Suspense>
  );
}

export function LazyFeaturesSection() {
  return (
    <Suspense fallback={<div className="h-[400px] bg-background" />}>
      <LazyFeatures />
    </Suspense>
  );
}
