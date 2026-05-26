import { site } from "@/data/site";

const links = [
  { href: site.social.github, label: "GitHub" },
  { href: site.social.linkedin, label: "LinkedIn" },
  { href: site.social.x, label: "X" },
  { href: site.social.scholar, label: "Scholar" },
  { href: `mailto:${site.email}`, label: "Email" },
];

export function Footer() {
  return (
    <footer className="mt-32">
      <div className="container-page py-12 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-xs font-mono text-[color:var(--color-fg-subtle)]">
          © {new Date().getFullYear()} {site.name} · {site.domain}
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-mono">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-accent)] transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
