"use client";

import { useEffect, useRef } from "react";

/**
 * Attaches an IntersectionObserver to a <video> element and plays it
 * when at least `threshold` (0–1) of the element is in the viewport,
 * then pauses when it scrolls out. Works around mobile autoplay policy
 * by requiring muted + playsInline on the video element.
 */
export function useVideoAutoplay(threshold = 0.35) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {
            // Autoplay blocked by browser — silently ignore.
            // The poster frame acts as the static fallback.
          });
        } else {
          el.pause();
        }
      },
      { threshold }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return ref;
}
