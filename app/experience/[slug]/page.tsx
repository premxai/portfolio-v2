import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Prose } from "@/components/prose";
import { experience } from "@/data/experience";

type ExperiencePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return experience.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ExperiencePageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = experience.find((entry) => entry.slug === slug);

  if (!item) return {};

  return {
    title: `${item.role} at ${item.company}`,
    description: item.blurb,
  };
}

export default async function ExperiencePage({ params }: ExperiencePageProps) {
  const { slug } = await params;
  const item = experience.find((entry) => entry.slug === slug);

  if (!item) notFound();

  return (
    <article>
      <header className="container-page pt-16 pb-8 md:pt-24">
        <Link
          href="/#experience"
          className="mb-10 inline-flex items-center gap-1.5 font-mono text-xs text-[color:var(--color-fg-muted)] transition-colors hover:text-[color:var(--color-accent)]"
        >
          <ArrowLeft className="size-3.5" aria-hidden /> back to experience
        </Link>

        <p className="section-label mb-4">// experience · {item.company}</p>
        <h1 className="max-w-4xl text-4xl font-medium tracking-tight text-balance md:text-6xl">
          {item.role}
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-pretty text-[color:var(--color-fg-muted)] md:text-xl">
          {item.blurb}
        </p>

        <dl className="mt-10 grid grid-cols-1 gap-6 text-sm sm:grid-cols-3">
          <Meta term="Organization" value={item.company} />
          <Meta term="Period" value={`${item.start} – ${item.end}`} />
          <Meta term="Location" value={item.location} />
        </dl>
      </header>

      <Prose>
        <h2>What I worked on</h2>
        <ul>
          {item.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>

        <h2>Technical context</h2>
        <p className="font-mono text-sm text-[color:var(--color-fg-muted)]">
          {item.stack.join(" · ")}
        </p>

        {item.relatedHref && item.relatedLabel && (
          <p>
            <Link href={item.relatedHref} className="inline-flex items-center gap-1.5">
              {item.relatedLabel} <ArrowRight className="size-4" aria-hidden />
            </Link>
          </p>
        )}
      </Prose>
    </article>
  );
}

function Meta({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="mb-1 font-mono text-xs uppercase tracking-wider text-[color:var(--color-fg-subtle)]">
        {term}
      </dt>
      <dd>{value}</dd>
    </div>
  );
}
