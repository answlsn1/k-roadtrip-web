import type { ReactNode } from "react";

interface CategoryRowProps {
  title: string;
  /** Small pill shown next to the title (e.g. "Partner Picks") */
  badge?: string;
  badgeClass?: string;
  children: ReactNode;
}

/** Server component — pure layout, no client state needed. */
export default function CategoryRow({
  title,
  badge,
  badgeClass = "bg-slate-100 text-slate-500",
  children,
}: CategoryRowProps) {
  return (
    <div className="mb-10">
      {/* Row heading */}
      <div className="mb-4 flex items-center gap-3 px-5 sm:px-0">
        <h2 className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
          {title}
        </h2>
        {badge && (
          <span
            className={`rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider ${badgeClass}`}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Horizontal scroll strip — snap-x so cards land cleanly on swipe */}
      <div className="flex gap-4 overflow-x-auto pb-3 pl-5 pr-5 sm:pl-0 sm:pr-0 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </div>
  );
}
