"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Hero background slideshow — Korea-only imagery, cross-fading every 3s.
 *
 * Layering (z-index): images z-0 < single overlay z-[5] < dots z-[15].
 * HeroContent (z-10) is a sibling rendered above this in app/page.tsx.
 *
 * Accessibility: honours `prefers-reduced-motion` — no auto-rotation and the
 * first slide stays fixed. Dots remain operable (no transition).
 */

interface Slide {
  src: string;
  alt: string;
}

// Live-verified Korea landscapes only. Slide 0 is the LCP image (eager).
const SLIDES: Slide[] = [
  {
    src: "https://images.unsplash.com/photo-1653632445006-0ed9bbe32672?auto=format&fit=crop&w=2000&q=75",
    alt: "Woljeonggyo Bridge illuminated at night in Gyeongju, Korea",
  },
  {
    src: "https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=2000&q=75",
    alt: "",
  },
  {
    src: "https://images.unsplash.com/photo-1562680802-9cf8b15f419d?auto=format&fit=crop&w=2000&q=75",
    alt: "",
  },
  {
    src: "https://images.unsplash.com/photo-1672671187899-a10f547341f1?auto=format&fit=crop&w=2000&q=75",
    alt: "",
  },
  {
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=75",
    alt: "",
  },
  {
    src: "https://images.unsplash.com/photo-1700061036086-414b47f08913?auto=format&fit=crop&w=2000&q=75",
    alt: "",
  },
];

const ROTATE_MS = 3000;

export default function HeroSlideshow() {
  const [index, setIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  // Auto-rotate, unless reduced motion is requested. `index` in the deps so a
  // manual dot click resets the timer (effect re-runs → fresh interval).
  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [reducedMotion, index]);

  // With reduced motion we always show the first slide.
  const activeIndex = reducedMotion ? 0 : index;

  return (
    <>
      {/* Image stack — z-0 */}
      {SLIDES.map((slide, i) => {
        const isActive = i === activeIndex;
        return (
          <div
            key={slide.src}
            aria-hidden={!isActive}
            className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.src}
              alt={slide.alt}
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : undefined}
              className="h-full w-full object-cover object-[center_35%]"
            />
          </div>
        );
      })}

      {/* Single readability overlay above the whole stack — z-[5].
          Cinematic curve: clearer middle so the photo breathes, deeper bottom
          anchoring the hero into the page (design v2). */}
      <div className="absolute inset-0 z-[5] bg-gradient-to-b from-slate-950/60 via-slate-950/25 to-slate-950/90" />

      {/* Dots — z-[15] */}
      <div className="absolute bottom-4 left-1/2 z-[15] flex -translate-x-1/2 gap-2.5 sm:bottom-6">
        {SLIDES.map((_, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={isActive ? "true" : undefined}
              className="-m-2 p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span
                className={`block rounded-full bg-white transition-all duration-300 ${
                  isActive ? "h-2 w-6" : "h-2 w-2 bg-white/40"
                }`}
              />
            </button>
          );
        })}
      </div>
    </>
  );
}
