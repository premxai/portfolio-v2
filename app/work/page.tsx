import type { Metadata } from "next";
import { ProjectCard } from "@/components/project-card";
import { projects, type Project } from "@/data/projects";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected projects, research, and production systems.",
};

const categoryOrder: Project["category"][] = [
  "Research",
  "Production",
  "Tooling",
  "Mobile",
  "Learning",
];

export default function WorkPage() {
  const byCategory = categoryOrder
    .map((category) => ({
      category,
      items: projects.filter((p) => p.category === category),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="container-page pt-16 md:pt-24 pb-12">
      <header className="mb-16 max-w-3xl space-y-4">
        <p className="section-label">// work</p>
        <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-balance">
          Things I&apos;ve built, broken, and shipped.
        </h1>
        <p className="text-lg text-[color:var(--color-fg-muted)] text-pretty">
          A working log of projects across production inference systems,
          multi-agent research, and developer tooling. Some have case studies;
          others link straight to the repo.
        </p>
      </header>

      <div className="space-y-20">
        {byCategory.map(({ category, items }) => (
          <section key={category}>
            <h2 className="section-label mb-6">/ {category.toLowerCase()}</h2>
            <div className="flex flex-col">
              {items.map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
