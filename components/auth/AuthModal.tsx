"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/data/supabaseClient";
import { isInAppBrowser } from "@/lib/browserEnv";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const supabase = getSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(false);
      setError(null);
      setLinkCopied(false);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const signInWithGoogle = async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      // return to the exact page the user was on, so the
      // pending save can complete right where they left off
      options: { redirectTo: window.location.href },
    });
    if (error) {
      setError("Sign-in failed. Please try again.");
      setLoading(false);
    }
    // on success the browser navigates to Google — nothing more runs here
  };

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-500">
          <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21C12 21 3 15.5 3 9.5C3 6.4 5.4 4 8.4 4C10 4 11.3 4.8 12 6C12.7 4.8 14 4 15.6 4C18.6 4 21 6.4 21 9.5C21 15.5 12 21 12 21Z" />
          </svg>
        </div>

        <h2 className="mt-4 text-lg font-extrabold text-slate-900">
          Save this route for your trip!
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
          Sign in to keep your favorite drives.
        </p>

        {/* Google blocks OAuth inside in-app webviews (disallowed_useragent)
            — guide the user out instead of letting the button fail */}
        {isInAppBrowser() ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left">
            <p className="text-xs font-bold text-amber-700">
              Google sign-in doesn&apos;t work in in-app browsers
            </p>
            <p className="mt-1 text-xs leading-relaxed text-amber-700/80">
              Tap the ⋯ menu and choose &quot;Open in browser&quot;, or copy
              this page link into Safari/Chrome — your save will pick up right
              where you left off.
            </p>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.href);
                  setLinkCopied(true);
                  setTimeout(() => setLinkCopied(false), 2000);
                } catch {
                  /* clipboard blocked — silently ignore */
                }
              }}
              className="mt-2 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-200"
            >
              {linkCopied ? "Link copied ✓" : "Copy page link"}
            </button>
          </div>
        ) : (
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:shadow active:scale-[0.99] disabled:opacity-70"
        >
          {/* Google "G" */}
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          {loading ? "Opening Google…" : "Continue with Google"}
        </button>
        )}

        {error && (
          <p className="mt-2 text-xs font-semibold text-amber-600">{error}</p>
        )}

        <button
          onClick={onClose}
          className="mt-3 w-full py-1.5 text-sm font-semibold text-slate-400 hover:text-slate-600"
        >
          Maybe later
        </button>

        <p className="mt-2 text-[11px] text-slate-400">
          Free forever · We only store your saved drives.
        </p>
      </div>
    </div>
  );
}
