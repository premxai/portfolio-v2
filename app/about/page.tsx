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
    "SQL",
    "FastAPI",
    "REST APIs",
    "PostgreSQL",
    "MongoDB",
    "PySpark",
  ],
  "Distributed Systems & Data": [
    "Kafka",
    "Streaming pipelines",
    "Feature stores",
    "Data pipelines",
    "Vector DBs",
    "System design",
  ],
  "Cloud & Infrastructure": [
    "GCP",
    "AWS (EC2, S3, Bedrock, SageMaker)",
    "Docker",
    "Kubernetes",
    "Terraform",
    "CI/CD",
    "MLflow",
  ],
  "Machine Learning": [
    "PyTorch",
    "TensorFlow",
    "Scikit-learn",
    "LLMs",
    "RAG",
    "NLP",
    "Computer Vision",
    "MCP",
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
          I&apos;m Prem — an inference engineer focused on{" "}
          <strong>low-latency LLM serving</strong>, multi-model routing, and
          cost-efficient production AI infrastructure. I&apos;ve deployed
          scalable AI systems on GCP and AWS with a hard bias toward latency,
          reliability, and the cost-latency-accuracy tradeoff — not whichever
          framework is trending this quarter.
        </p>
        <p>
          Right now I&apos;m finishing my M.S. in Artificial Intelligence at
          the Rochester Institute of Technology and shipping{" "}
          <a href="/work/emotion-engine">Emotion Engine</a> — a research
          project showing that emotion-like internal states (fear, grief,
          suspicion) emerge from a 72-feature predictive LSTM with no
          hardcoded rules (p = 3.3e-113 across 205K agent-step records).
          Before RIT, I built a production LLM routing layer at{" "}
          <a href="/work/llm-routing">Concentrix + Webhelp</a> — 3+ foundation
          models, 1.5s end-to-end, 18% cost reduction, 42% fewer incidents.
        </p>
        <p>
          The throughline of everything on this site:{" "}
          <em>&ldquo;{site.ethos}&rdquo;</em>
        </p>

        <h2>Education</h2>
        <ul>
          {education.map((e) => (
            <li key={e.school}>
              <strong>{e.degree}</strong> — {e.school},{" "}
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
              <strong>{e.role}</strong>, {e.company} —{" "}
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
              {" — "}
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
              {" — "}
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
