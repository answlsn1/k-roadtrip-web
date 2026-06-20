"use client";

import { useEffect, useRef } from "react";

/**
 * Modal accessibility helper for dialog-style overlays.
 * While `open`, locks body scroll (no background scroll-bleed on mobile) and
 * moves focus to the first focusable element inside the returned container.
 * Attach the returned ref to the modal's content container.
 */
export function useModalA11y<T extends HTMLElement = HTMLDivElement>(open: boolean) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const first = ref.current?.querySelector<HTMLElement>(
      'button:not([disabled]),a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
    );
    first?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return ref;
}
