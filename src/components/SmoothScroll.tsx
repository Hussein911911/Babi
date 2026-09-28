"use client";

import { useEffect } from "react";

export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.innerWidth < 768) return; // keep native scroll on mobile

    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;
    let raf = 0;

    import("lenis").then(({ default: Lenis }) => {
      lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 0.9 });
      const loop = (time: number) => {
        lenis?.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    });

    return () => {
      cancelAnimationFrame(raf);
      lenis?.destroy();
    };
  }, []);

  return null;
}
