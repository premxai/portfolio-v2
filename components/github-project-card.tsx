import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink, Github } from "lucide-react";
import type { GithubProject } from "@/data/projects";

export function GithubProjectCard({ project }: { project: GithubProject }) {
  return (
    <article className="flex min-h-64 flex-col overflow-hidden border border-[color:var(--color-border)] transition-colors hover:border-[color:var(--color-border-strong)]">
      <div className="relative aspect-[16/8] w-full border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-elev)]">
        {project.image ? (
          <Image
            src={project.image}
            alt={`${project.title} project preview`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className={project.imageFit === "contain" ? "object-contain" : "object-cover"}
          />
        ) : (
          <span className="flex size-full items-center justify-center text-[color:var(--color-fg-muted)]">
            <Github className="size-8" aria-hidden />
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-[10px] uppercase text-[color:var(--color-fg-subtle)]">
            project
          </span>
        <span className="font-mono text-[10px] uppercase text-[color:var(--color-fg-subtle)]">
          {project.status ?? "public repo"}
        </span>
        </div>

      <h3 className="mt-5 text-xl font-medium tracking-tight">
        {project.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-pretty text-[color:var(--color-fg-muted)]">
        {project.description}
      </p>
      <p className="mt-4 font-mono text-xs leading-relaxed text-[color:var(--color-fg-subtle)]">
        {project.stack.join(" · ")}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-[color:var(--color-border)] pt-5 font-mono text-sm">
        {project.href && (
          <Link
            href={project.href}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-[color:var(--color-accent)]"
          >
            Read <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
        {project.demo && (
          <a
            href={project.demo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[color:var(--color-fg-muted)] transition-colors hover:text-[color:var(--color-accent)]"
          >
            Live <ExternalLink className="size-3.5" aria-hidden />
          </a>
        )}
        <a
          href={project.repo}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[color:var(--color-fg-muted)] transition-colors hover:text-[color:var(--color-accent)]"
        >
          GitHub <Github className="size-3.5" aria-hidden />
        </a>
      </div>
      </div>
    </article>
  );
}
