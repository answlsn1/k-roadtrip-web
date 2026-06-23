"use client";

import { create } from "zustand";

/**
 * Shared open/close state for the My Trip drawer. Lifting it out of the panel
 * lets multiple triggers (desktop nav + mobile hamburger) control one drawer
 * that lives outside the hamburger — so closing the hamburger can't unmount it.
 */
interface MyTripUI {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useMyTripStore = create<MyTripUI>()((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
