import Link from "next/link";
import { ArrowRight, ExternalLink, Github } from "lucide-react";
import { ProjectThumb } from "@/components/project-thumb";
import type { Project } from "@/data/projects";

export function ProjectGridCard({ project }: { project: Project }) {
  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden border border-[color:var(--color-border)] bg-[color:var(--color-bg)] transition-colors hover:border-[color:var(--color-border-strong)]">
      <ProjectThumb
        project={project}
        size="hero"
        className="aspect-[16/10] border-0 border-b border-[color:var(--color-border)]"
      />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3 font-mono text-xs text-[color:var(--color-fg-subtle)]">
          <span>{project.year}</span>
          <span className="text-[color:var(--color-accent)]">{project.status}</span>
        </div>

        <h2 className="mt-4 text-2xl font-medium tracking-tight">
          {project.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-fg-muted)] text-pretty">
          {project.tagline}
        </p>
        {project.outcome && (
          <p className="mt-4 font-mono text-xs leading-relaxed text-[color:var(--color-accent)]">
            {project.outcome}
          </p>
        )}
        <p className="mt-3 font-mono text-xs leading-relaxed text-[color:var(--color-fg-subtle)]">
          {project.stack.slice(0, 4).join(" · ")}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-[color:var(--color-border)] pt-5 font-mono text-sm">
          <Link
            href={`/work/${project.slug}`}
            className="inline-flex items-center gap-1.5 text-[color:var(--color-fg)] hover:text-[color:var(--color-accent)] transition-colors"
          >
            Read <ArrowRight className="size-4" aria-hidden />
          </Link>
          <a
            href={project.demo!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-accent)] transition-colors"
          >
            Live <ExternalLink className="size-3.5" aria-hidden />
          </a>
          <a
            href={project.repo!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-accent)] transition-colors"
          >
            GitHub <Github className="size-3.5" aria-hidden />
          </a>
        </div>
      </div>
    </article>
  );
}
