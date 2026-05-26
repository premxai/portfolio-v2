import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Github, Linkedin, Mail } from "lucide-react";
import { SiHuggingface, SiX } from "react-icons/si";
import { Section } from "@/components/section";
import { ProjectCard } from "@/components/project-card";
import { site } from "@/data/site";
import { featuredProjects } from "@/data/projects";
import { experience } from "@/data/experience";
import { publications } from "@/data/publications";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedWork />
      <Experience />
      <Publications />
      <Contact />
    </>
  );
}

function Hero() {
  return (
    <section className="container-page pt-24 md:pt-32 pb-20 md:pb-28">
      <div className="flex flex-col gap-6 max-w-4xl">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-[color:var(--color-fg-subtle)]">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block size-1.5 rounded-full bg-[color:var(--color-accent)] animate-pulse" />
            Currently in {site.location}
          </span>
          <span aria-hidden>·</span>
          <span className="text-[color:var(--color-accent)]">
            Open to relocation
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight text-balance leading-[1.05]">
          {site.name.split(" ")[0]}{" "}
          <span className="text-[color:var(--color-fg-muted)]">
            {site.name.split(" ").slice(1).join(" ")}
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-[color:var(--color-fg)] text-pretty max-w-3xl leading-snug">
          AI/ML Engineer building reliable, scalable AI systems across LLMs,
          inference, agents, and applied ML.
        </p>
        <p className="font-mono text-sm text-[color:var(--color-fg-subtle)] text-pretty max-w-3xl">
          <span className="text-[color:var(--color-accent)]">
            Currently building:
          </span>{" "}
          reliable AI agents, inference systems, and evaluation tools for
          production LLM workflows.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-4 font-mono text-sm">
          <Link
            href="/work"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[color:var(--color-accent)] text-[color:var(--color-bg)] hover:opacity-90 transition-opacity"
          >
            See selected work <ArrowUpRight className="size-4" />
          </Link>
          <a
            href={site.resumeHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-[color:var(--color-border-strong)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] transition-colors"
          >
            Résumé
          </a>
          <div className="flex flex-wrap items-center gap-2 md:ml-1">
            <a
              href={site.social.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              title="GitHub"
              className="inline-flex items-center justify-center size-10 border border-[color:var(--color-border-strong)] text-[color:var(--color-fg-muted)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] transition-colors"
            >
              <Github className="size-4" />
            </a>
            <a
              href={site.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
              className="inline-flex items-center justify-center size-10 border border-[color:var(--color-border-strong)] text-[color:var(--color-fg-muted)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] transition-colors"
            >
              <Linkedin className="size-4" />
            </a>
            <a
              href={site.social.x}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              title="X (Twitter)"
              className="inline-flex items-center justify-center size-10 border border-[color:var(--color-border-strong)] text-[color:var(--color-fg-muted)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] transition-colors"
            >
              <SiX className="size-4" />
            </a>
            <a
              href={site.social.huggingface}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Hugging Face"
              title="Hugging Face"
              className="inline-flex items-center justify-center size-10 border border-[color:var(--color-border-strong)] text-[color:var(--color-fg-muted)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] transition-colors"
            >
              <SiHuggingface className="size-4" />
            </a>
            <a
              href={`mailto:${site.email}`}
              aria-label="Email"
              title={site.email}
              className="inline-flex items-center justify-center size-10 border border-[color:var(--color-border-strong)] text-[color:var(--color-fg-muted)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] transition-colors"
            >
              <Mail className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedWork() {
  return (
    <Section
      label="// selected work"
      title="Selected systems I've built across inference, agents, and ML evaluation."
    >
      <div className="flex flex-col">
        {featuredProjects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
      <div className="mt-10">
        <Link
          href="/work"
          className="inline-flex items-center gap-1.5 font-mono text-sm text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-accent)] transition-colors"
        >
          See every project <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </Section>
  );
}

function Experience() {
  return (
    <Section label="// experience" title="Where I've shipped.">
      <ol className="flex flex-col">
        {experience.map((e) => (
          <li
            key={e.company}
            className="grid grid-cols-1 md:grid-cols-[12rem_1fr] gap-4 md:gap-10 py-8"
          >
            <div className="font-mono text-xs text-[color:var(--color-fg-subtle)] md:pt-1">
              <p>
                {e.start} — {e.end}
              </p>
              <p className="text-[color:var(--color-fg-muted)] mt-1">
                {e.location}
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-medium tracking-tight">
                  {e.role}{" "}
                  <span className="text-[color:var(--color-fg-muted)]">
                    @ {e.company}
                  </span>
                </h3>
                <p className="mt-1 text-[color:var(--color-fg-muted)] text-pretty">
                  {e.blurb}
                </p>
              </div>
              <ul className="space-y-1.5 text-sm text-[color:var(--color-fg)]/85 list-disc pl-5 marker:text-[color:var(--color-fg-subtle)]">
                {e.bullets.map((b) => (
                  <li key={b} className="text-pretty">
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function Publications() {
  return (
    <Section label="// publications" title="Published research.">
      <ol className="flex flex-col">
        {publications.map((p) => (
          <li
            key={p.title}
            className="grid grid-cols-1 md:grid-cols-[12rem_1fr] gap-4 md:gap-10 py-8"
          >
            <div className="font-mono text-xs text-[color:var(--color-fg-subtle)] md:pt-1">
              <p>{p.year}</p>
              {p.venue && (
                <p className="text-[color:var(--color-fg-muted)] mt-1">
                  {p.venue}
                </p>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-medium tracking-tight">
                  {p.href ? (
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[color:var(--color-accent)] transition-colors inline-flex items-baseline gap-2"
                    >
                      {p.title}
                      <ArrowUpRight
                        className="size-4 self-center text-[color:var(--color-fg-subtle)]"
                        aria-hidden
                      />
                    </a>
                  ) : (
                    p.title
                  )}
                </h3>
                <p className="mt-1 text-sm font-mono text-[color:var(--color-fg-subtle)]">
                  {p.authors}
                </p>
              </div>
              <p className="text-sm text-[color:var(--color-fg)]/85 text-pretty">
                {p.abstract}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function Contact() {
  return (
    <Section label="// contact" title="Building something interesting?">
      <div className="max-w-2xl space-y-6">
        <p className="text-lg md:text-xl text-[color:var(--color-fg-muted)] text-pretty">
          Open to AI and ML Engineer roles, research collaborations, and the
          occasional weird side project. The fastest way to reach me is email.
        </p>
        <div className="flex flex-wrap gap-3 font-mono text-sm">
          <a
            href={`mailto:${site.email}`}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 max-w-full break-all bg-[color:var(--color-accent)] text-[color:var(--color-bg)] hover:opacity-90 transition-opacity"
          >
            {site.email}
          </a>
          <a
            href={site.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-[color:var(--color-border-strong)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] transition-colors"
          >
            LinkedIn
          </a>
          <a
            href={site.social.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-[color:var(--color-border-strong)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </Section>
  );
}
