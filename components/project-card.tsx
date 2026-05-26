import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/data/projects";
import { ProjectThumb } from "@/components/project-thumb";

const statusLabel: Record<Project["status"], string> = {
  live: "live",
  research: "research",
  shipped: "shipped",
  archived: "archived",
};

export function ProjectCard({ project }: { project: Project }) {
  const href = project.hasCaseStudy
    ? `/work/${project.slug}`
    : project.demo || project.repo || "#";
  const external = !project.hasCaseStudy && href.startsWith("http");

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    external ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        {children}
      </a>
    ) : (
      <Link href={href} className="group block">
        {children}
      </Link>
    );

  return (
    <Wrapper>
      <article className="relative py-8 transition-colors">
        <div className="flex gap-5 md:gap-8">
          <ProjectThumb project={project} />

          <div className="flex-1 min-w-0 flex flex-col gap-4 md:flex-row md:items-baseline md:justify-between">
            <div className="space-y-2 md:max-w-2xl min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-[color:var(--color-fg-subtle)]">
                <span>{project.year}</span>
                <span aria-hidden>·</span>
                <span>{project.category}</span>
                <span aria-hidden>·</span>
                <span className="text-[color:var(--color-accent)]">
                  {statusLabel[project.status]}
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-medium tracking-tight group-hover:text-[color:var(--color-accent)] transition-colors">
                {project.title}
                <ArrowUpRight
                  className="inline-block ml-2 -mt-1 size-5 text-[color:var(--color-fg-subtle)] group-hover:text-[color:var(--color-accent)] transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden
                />
              </h3>
              <p className="text-base md:text-lg text-[color:var(--color-fg-muted)] text-pretty">
                {project.tagline}
              </p>
            </div>
            <div className="md:text-right space-y-2 md:min-w-[14rem] md:shrink-0">
              {project.outcome && (
                <p className="font-mono text-sm text-[color:var(--color-accent)]">
                  {project.outcome}
                </p>
              )}
              <p className="font-mono text-sm text-[color:var(--color-fg-subtle)]">
                {project.stack.slice(0, 4).join(" · ")}
              </p>
            </div>
          </div>
        </div>
      </article>
    </Wrapper>
  );
}
