"use client";

import { useMediaQuery } from "./useMediaQuery";

/**
 * True when the user has requested reduced motion at the OS level.
 * SSR-safe (server snapshot = false → animations assumed on, then corrected on
 * the client). Reacts to live preference changes via useMediaQuery.
 *
 * Use to gate non-essential transitions/animations (slide, scale). Color/opacity
 * fades are generally fine to keep even under reduced motion.
 */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
