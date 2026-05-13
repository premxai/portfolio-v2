import Link from "next/link";
import { site } from "@/data/site";

const links = [
  { href: "/", label: "Index" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[color:var(--color-bg)]/70 border-b border-[color:var(--color-border)]">
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
        </nav>
      </div>
    </header>
  );
}
