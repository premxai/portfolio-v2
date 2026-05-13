import { site } from "@/data/site";

const links = [
  { href: site.social.github, label: "GitHub" },
  { href: site.social.linkedin, label: "LinkedIn" },
  { href: site.social.scholar, label: "Scholar" },
  { href: site.social.medium, label: "Medium" },
  { href: `mailto:${site.email}`, label: "Email" },
];

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--color-border)] mt-32">
      <div className="container-page py-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="font-mono text-xs section-label">/ ethos</p>
          <p className="text-lg text-balance max-w-md">{site.ethos}</p>
        </div>
        <div className="flex flex-col gap-3 md:items-end">
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
          <p className="text-xs font-mono text-[color:var(--color-fg-subtle)]">
            © {new Date().getFullYear()} {site.name} · {site.domain}
          </p>
        </div>
      </div>
    </footer>
  );
}
