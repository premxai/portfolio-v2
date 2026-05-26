"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { flushSync } from "react-dom";

type DocWithVT = Document & {
  startViewTransition?: (cb: () => void) => { finished: Promise<void> };
};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  const onClick = async () => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    const btn = btnRef.current;
    const doc = document as DocWithVT;

    if (!btn || !doc.startViewTransition) {
      setTheme(next);
      return;
    }

    const rect = btn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const maxR = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const root = document.documentElement;
    root.style.setProperty("--theme-wipe-x", `${x}px`);
    root.style.setProperty("--theme-wipe-y", `${y}px`);
    root.style.setProperty("--theme-wipe-r", `${maxR}px`);
    root.classList.add("theme-wiping");

    const transition = doc.startViewTransition(() => {
      flushSync(() => setTheme(next));
    });

    try {
      await transition.finished;
    } finally {
      root.classList.remove("theme-wiping");
      root.style.removeProperty("--theme-wipe-x");
      root.style.removeProperty("--theme-wipe-y");
      root.style.removeProperty("--theme-wipe-r");
    }
  };

  const isDark = resolvedTheme === "dark";
  const label = mounted
    ? `Switch to ${isDark ? "light" : "dark"} mode`
    : "Toggle theme";

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      suppressHydrationWarning
      className="
        group relative inline-flex items-center justify-center
        size-8 ml-1
        rounded-full
        border border-[color:var(--color-border-strong)]
        text-[color:var(--color-fg-muted)]
        hover:text-[color:var(--color-accent)]
        hover:border-[color:var(--color-accent)]
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]
        focus-visible:ring-offset-2
        focus-visible:ring-offset-[color:var(--color-bg)]
        transition-colors duration-200
      "
    >
      <span
        aria-hidden
        className="
          font-mono text-base leading-none
          inline-block
          transition-transform duration-500
          [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]
          group-hover:scale-110
        "
        style={{
          transform: mounted && isDark ? "rotate(0deg)" : "rotate(180deg)",
        }}
      >
        ◐
      </span>
      <span
        aria-hidden
        className="
          pointer-events-none absolute inset-0 rounded-full
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          [box-shadow:0_0_0_0_var(--color-accent-soft)]
          group-hover:[box-shadow:0_0_0_4px_var(--color-accent-soft)]
        "
      />
    </button>
  );
}
