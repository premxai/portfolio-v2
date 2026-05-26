import Link from "next/link";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { ProjectThumb } from "@/components/project-thumb";
import { projects } from "@/data/projects";

export function CaseStudyHeader({
  label,
  title,
  tagline,
  period,
  role,
  repo,
  demo,
  slug,
}: {
  label: string;
  title: string;
  tagline: string;
  period: string;
  role: string;
  repo?: string;
  demo?: string;
  /** Project slug — when provided, renders a hero placeholder/image above the meta. */
  slug?: string;
}) {
  const project = slug ? projects.find((p) => p.slug === slug) : undefined;

  return (
    <header className="container-page pt-16 pb-12">
      <Link
        href="/work"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-accent)] transition-colors mb-10"
      >
        <ArrowLeft className="size-3.5" /> back to work
      </Link>
      <p className="section-label mb-4">{label}</p>
      <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-balance max-w-4xl">
        {title}
      </h1>
      <p className="mt-6 text-lg md:text-xl text-[color:var(--color-fg-muted)] max-w-3xl text-pretty">
        {tagline}
      </p>
      {project && (
        <div className="mt-10 group">
          <ProjectThumb project={project} size="hero" />
        </div>
      )}
      <dl className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
        <Meta term="Period" value={period} />
        <Meta term="Role" value={role} />
        {demo && (
          <Meta
            term="Demo"
            value={
              <a
                href={demo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[color:var(--color-accent)] hover:underline"
              >
                Open <ExternalLink className="size-3.5" />
              </a>
            }
          />
        )}
        {repo && (
          <Meta
            term="Repo"
            value={
              <a
                href={repo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[color:var(--color-accent)] hover:underline"
              >
                GitHub <Github className="size-3.5" />
              </a>
            }
          />
        )}
      </dl>
    </header>
  );
}

function Meta({ term, value }: { term: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-fg-subtle)] mb-1">
        {term}
      </dt>
      <dd className="text-[color:var(--color-fg)]">{value}</dd>
    </div>
  );
}
