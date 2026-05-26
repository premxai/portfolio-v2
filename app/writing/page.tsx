import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { articles, type ArticleTopic } from "@/data/articles";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Notes and long-form articles on ML fundamentals, inference, agents, and evaluation.",
};

const topicOrder: ArticleTopic[] = [
  "ML Fundamentals",
  "Inference",
  "Agents",
  "Evaluation",
  "Notes",
];

function formatDate(d: string) {
  const date = new Date(d);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

export default function WritingPage() {
  const byTopic = topicOrder
    .map((topic) => ({
      topic,
      items: articles
        .filter((a) => a.topic === topic)
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="container-page pt-16 md:pt-24 pb-12">
      <header className="mb-16 max-w-3xl space-y-4">
        <p className="section-label">// writing</p>
        <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-balance">
          Things I&apos;ve learned, written down.
        </h1>
        <p className="text-lg text-[color:var(--color-fg-muted)] text-pretty">
          Long-form notes on the papers, systems, and ideas I&apos;ve been
          working through. Less &ldquo;tutorial&rdquo; than &ldquo;here&apos;s
          what finally clicked.&rdquo;
        </p>
      </header>

      <div className="space-y-20">
        {byTopic.map(({ topic, items }) => (
          <section key={topic}>
            <h2 className="section-label mb-6">/ {topic.toLowerCase()}</h2>
            <ol className="flex flex-col">
              {items.map((article) => {
                const isExternal = !!article.href;
                const href = article.href ?? `/writing/${article.slug}`;

                const Inner = (
                  <article className="grid grid-cols-1 md:grid-cols-[10rem_1fr] gap-3 md:gap-10 py-8">
                    <div className="font-mono text-xs text-[color:var(--color-fg-subtle)] md:pt-1">
                      <p>{formatDate(article.date)}</p>
                      <p className="text-[color:var(--color-fg-muted)] mt-1">
                        {article.readMinutes} min read
                      </p>
                    </div>
                    <div className="space-y-2 min-w-0">
                      <h3 className="text-2xl md:text-3xl font-medium tracking-tight group-hover:text-[color:var(--color-accent)] transition-colors">
                        {article.title}
                        <ArrowUpRight
                          className="inline-block ml-2 -mt-1 size-5 text-[color:var(--color-fg-subtle)] group-hover:text-[color:var(--color-accent)] transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          aria-hidden
                        />
                      </h3>
                      <p className="text-[color:var(--color-fg-muted)] text-pretty">
                        {article.tagline}
                      </p>
                    </div>
                  </article>
                );

                return (
                  <li key={article.slug}>
                    {isExternal ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block"
                      >
                        {Inner}
                      </a>
                    ) : (
                      <Link href={href} className="group block">
                        {Inner}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
