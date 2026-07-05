"use client";

import { useEffect, useState } from "react";

/**
 * Fixed left-rail "altitude" annotation (desktop only) that makes the site's
 * gradient-descent metaphor explicit without impeding reading. As you scroll,
 * it names where you are on the descent: high loss at the top, descending
 * through the work, a flagged local minimum, and the global minimum at
 * Contact. A scrollspy driven by an IntersectionObserver over section ids.
 *
 * Mounted via <HomeOnly> in the layout, so it only appears on the home route.
 */

type Stop = { id: string; state: string; note: string; mark: string };

// Ordered by their appearance down the page (see app/page.tsx section ids).
const STOPS: Stop[] = [
  { id: "hero", state: "loss: high", note: "step 0 · initialized", mark: "◦" },
  { id: "work", state: "descending", note: "following the gradient", mark: "↓" },
  { id: "finding", state: "descending", note: "a steep drop", mark: "↓" },
  {
    id: "experience",
    state: "descending",
    note: "still stepping down",
    mark: "↓",
  },
  {
    id: "local-minimum",
    state: "local minimum",
    note: "good, but not global",
    mark: "⚠",
  },
  {
    id: "contact",
    state: "global minimum",
    note: "converged",
    mark: "●",
  },
];

export function DescentAnnotations() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    // Active section = the last one whose top has scrolled above a line at
    // ~45% of the viewport. Deterministic and robust to section heights.
    // Cheap enough (a handful of getBoundingClientRect) to run inline on the
    // browser-throttled scroll event without an extra rAF debounce.
    const compute = () => {
      const line = window.innerHeight * 0.45;
      let idx = 0;
      for (let i = 0; i < STOPS.length; i++) {
        const el = document.getElementById(STOPS[i].id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= line) idx = i;
      }
      setActiveIdx(idx);
    };
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute, { passive: true });
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, []);

  const active = STOPS[activeIdx];
  const isConverged = active.id === "contact";
  const isLocalMin = active.id === "local-minimum";

  const labelColor = isConverged
    ? "rgb(168,132,255)"
    : isLocalMin
      ? "rgb(251,191,36)"
      : "var(--color-accent)";

  return (
    <div
      aria-hidden
      className="hidden lg:flex fixed left-3 2xl:left-6 top-1/2 -translate-y-1/2 z-30 pointer-events-none items-center gap-3"
    >
      {/* Vertical progress ticks. Hug the left edge, never overlap content. */}
      <div className="flex flex-col items-center gap-1.5">
        {STOPS.map((s, i) => (
          <span
            key={s.id}
            className="block w-px transition-all duration-500"
            style={{
              height: i === activeIdx ? "20px" : "10px",
              backgroundColor:
                i <= activeIdx ? labelColor : "var(--color-border-strong)",
              opacity: i <= activeIdx ? 1 : 0.6,
            }}
          />
        ))}
      </div>

      {/*
        Text label only on 2xl+, where the centered content leaves enough
        gutter that the label can't overlap it. On lg/xl only the slim tick
        column shows.
      */}
      <div className="hidden 2xl:block font-mono text-[10px] leading-tight tracking-tight max-w-[9rem]">
        <div className="flex items-center gap-1.5" style={{ color: labelColor }}>
          <span>{active.mark}</span>
          <span className="uppercase">{active.state}</span>
        </div>
        <p className="mt-1 text-[color:var(--color-fg-subtle)]">{active.note}</p>
      </div>
    </div>
  );
}
