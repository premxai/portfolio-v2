import type { Metadata } from "next";
import { GithubProjectCard } from "@/components/github-project-card";
import { flagshipProjects, githubProjects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected projects, research, and production systems.",
};

const workProjects = [
  ...flagshipProjects.map((project) => ({
    title: project.title,
    description: project.tagline,
    stack: project.stack,
    repo: project.repo!,
    href: `/work/${project.slug}`,
    demo: project.demo,
    status: project.status,
    image: project.image,
    imageFit: project.heroFit,
  })),
  ...githubProjects,
];

export default function WorkPage() {
  return (
    <div className="container-page pt-16 md:pt-24 pb-12">
      <header className="mb-14 grid gap-6 lg:grid-cols-[1fr_0.65fr] lg:items-end">
        <div className="space-y-4">
        <p className="section-label">// work</p>
        <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-balance">
          Things I&apos;ve built, broken, and shipped.
        </h1>
        </div>
        <p className="text-lg text-[color:var(--color-fg-muted)] text-pretty">
          Twelve products, research systems, and public repositories across
          agent infrastructure, search, data, and applied machine learning.
        </p>
      </header>

      <section id="project-archive" className="scroll-mt-24">
        <h2 className="section-label mb-6">/ project archive</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {workProjects.map((project) => (
            <GithubProjectCard key={project.repo} project={project} />
          ))}
        </div>
      </section>
    </div>
  );
}
