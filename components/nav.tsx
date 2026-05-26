"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { site } from "@/data/site";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/cn";

const links = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/writing", label: "Writing" },
  { href: "/about", label: "About" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-[background-color,backdrop-filter,border-color] duration-200",
        scrolled
          ? "bg-[color:var(--color-bg)]/70 backdrop-blur-md border-b border-[color:var(--color-border)]"
          : "bg-transparent border-b border-transparent",
      )}
    >
      <div className="container-page flex items-center justify-between h-14">
        <Link
          href="/"
          className="font-mono text-sm tracking-tight hover:text-[color:var(--color-accent)] transition-colors"
        >
          prem<span className="text-[color:var(--color-accent)]">.</span>kanaparthi
        </Link>
        <nav className="flex items-center gap-1 text-sm font-mono">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-fg)] transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <a
            href={site.resumeHref}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 px-3 py-1.5 border border-[color:var(--color-border-strong)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] transition-colors"
          >
            Résumé
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
