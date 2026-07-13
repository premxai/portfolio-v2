import type { Metadata } from "next";
import { Prose } from "@/components/prose";
import { site } from "@/data/site";
import { education, experience } from "@/data/experience";
import { publications } from "@/data/publications";
import { certifications } from "@/data/certifications";

export const metadata: Metadata = {
  title: "About",
  description: `${site.role} based in ${site.location}.`,
};

const skills = {
  "Backend & Programming": [
    "Python",
    "TypeScript",
    "SQL",
    "FastAPI",
    "REST APIs",
    "PostgreSQL",
    "Redis",
  ],
  "LLM & Retrieval Systems": [
    "LLM APIs",
    "AI agents",
    "RAG",
    "MCP",
    "FAISS",
    "BM25",
    "Qdrant",
  ],
  "Cloud & Infrastructure": [
    "AWS Bedrock",
    "SageMaker",
    "Docker",
    "Kubernetes",
    "CI/CD",
    "MLflow",
    "CloudWatch",
  ],
  "Machine Learning": [
    "PyTorch",
    "Scikit-learn",
    "XGBoost",
    "Model evaluation",
    "Statistical analysis",
    "Feature engineering",
    "Drift monitoring",
  ],
};

export default function AboutPage() {
  return (
    <div className="container-page pt-16 md:pt-24">
      <header className="mb-12 max-w-3xl space-y-4">
        <p className="section-label">// about</p>
        <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-balance">
          {site.role} based in {site.location}.
        </h1>
      </header>

      <Prose className="container-prose px-0">
        <p>
          I&apos;m Prem, an AI/ML engineer focused on reliable LLM systems,
          agent workflows, retrieval, evaluation, and applied machine
          learning. I care about systems that can be measured, explained,
          and operated under real latency, cost, and quality constraints.
        </p>
        <p>
          I completed an M.S. in Artificial Intelligence at Rochester
          Institute of Technology in May 2026 after an official Graduate
          Researcher appointment on <a href="/work/emotion-engine">Emotion
          Engine</a>. Before RIT, I owned a production LLM routing layer at{" "}
          <a href="/work/llm-routing">Concentrix + Webhelp</a> serving 50K
          daily requests across 3 foundation models, cutting p95 latency
          from 4s to 1.5s and monthly inference spend from $45K to $37K.
        </p>
        <p>
          The throughline of everything on this site:{" "}
          <em>&ldquo;{site.ethos}&rdquo;</em>
        </p>

        <h2>Education</h2>
        <ul>
          {education.map((e) => (
            <li key={e.school}>
              <strong>{e.degree}</strong> · {e.school},{" "}
              <span className="text-[color:var(--color-fg-muted)]">
                {e.start} – {e.end}
              </span>
            </li>
          ))}
        </ul>

        <h2>Experience</h2>
        <ul>
          {experience.map((e) => (
            <li key={e.company}>
              <strong>{e.role}</strong>, {e.company} ·{" "}
              <span className="text-[color:var(--color-fg-muted)]">
                {e.start} – {e.end}
              </span>
            </li>
          ))}
        </ul>

        <h2>Publications</h2>
        <ul>
          {publications.map((p) => (
            <li key={p.title}>
              {p.href ? (
                <a href={p.href} target="_blank" rel="noopener noreferrer">
                  <strong>{p.title}</strong>
                </a>
              ) : (
                <strong>{p.title}</strong>
              )}
              {" · "}
              {p.abstract}
            </li>
          ))}
        </ul>

        <h2>Certifications</h2>
        <ul>
          {certifications.map((c) => (
            <li key={c.title}>
              {c.href ? (
                <a href={c.href} target="_blank" rel="noopener noreferrer">
                  <strong>{c.title}</strong>
                </a>
              ) : (
                <strong>{c.title}</strong>
              )}
              {" · "}
              <span className="text-[color:var(--color-fg-muted)]">
                {c.issuer}
              </span>
            </li>
          ))}
        </ul>
      </Prose>

      <section className="container-prose px-0 py-12">
        <h2 className="section-label mb-6">/ stack</h2>
        <dl className="space-y-6">
          {Object.entries(skills).map(([group, items]) => (
            <div
              key={group}
              className="grid grid-cols-1 md:grid-cols-[14rem_1fr] gap-3 md:gap-6 pb-4"
            >
              <dt className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-fg-subtle)] md:pt-1">
                {group}
              </dt>
              <dd className="flex flex-wrap gap-x-3 gap-y-1.5 text-sm">
                {items.map((s, i) => (
                  <span key={s} className="text-[color:var(--color-fg)]">
                    {s}
                    {i < items.length - 1 && (
                      <span className="text-[color:var(--color-fg-subtle)]">
                        {" "}
                        ·
                      </span>
                    )}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="container-prose px-0 pb-16">
        <h2 className="section-label mb-6">/ elsewhere</h2>
        <ul className="space-y-3 font-mono text-sm">
          <li>
            <a
              href={site.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[color:var(--color-accent)] transition-colors"
            >
              github.com/premxai →
            </a>
          </li>
          <li>
            <a
              href={site.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[color:var(--color-accent)] transition-colors"
            >
              linkedin.com/in/premxai →
            </a>
          </li>
          <li>
            <a
              href={site.social.x}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[color:var(--color-accent)] transition-colors"
            >
              x.com/premxai →
            </a>
          </li>
          <li>
            <a
              href={site.social.huggingface}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[color:var(--color-accent)] transition-colors"
            >
              huggingface.co/premxai →
            </a>
          </li>
          <li>
            <a
              href={`mailto:${site.email}`}
              className="hover:text-[color:var(--color-accent)] transition-colors"
            >
              {site.email} →
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
