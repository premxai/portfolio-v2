import type { Metadata } from "next";
import { CaseStudyHeader } from "@/components/case-study-header";
import { Prose } from "@/components/prose";
import { Metric, MetricRow } from "@/components/metric";

export const metadata: Metadata = {
  title: "Nori",
  description:
    "AI job discovery and ranking backed by a registry covering 31,000+ companies, bounded ATS adapters, queues, and duplicate filtering.",
};

export default function NoriPage() {
  return (
    <article>
      <CaseStudyHeader
        slug="jobclaw"
        label="// case study · product"
        title="A large ATS registry is useful only if the pipeline stays quiet."
        tagline="Nori turns direct company and ATS feeds into fresh, ranked job notes through bounded ingestion, source-specific adapters, duplicate filtering, and scheduled delivery."
        period="2026 - present"
        role="Designer and engineer"
        repo="https://github.com/premxai/jobclaw"
        demo="https://www.norinote.xyz/"
      />

      <Prose>
        <p>
          Job aggregators make freshness hard to reason about. One opening can
          appear through several mirrors, lose its original posting context,
          and remain visible after the source closes. <strong>Nori</strong>{" "}
          starts from company career pages and ATS endpoints instead, then
          normalizes each result before it reaches the user.
        </p>

        <h2>A registry, not an inflated monitoring claim</h2>
        <p>
          Nori has a registry covering 31,000+ companies. That registry is the
          address book for the ingestion system; it does not mean every record
          is actively polled in every run. Validation jobs classify healthy,
          stale, and failing targets so bounded workers can spend time on due
          sources without overwhelming upstream systems.
        </p>
        <p>
          Source-specific adapters handle the differences between Greenhouse,
          Lever, Ashby, Workday, SmartRecruiters, BambooHR, and direct company
          APIs. Backoff, circuit breaking, and target quarantine isolate a bad
          endpoint instead of allowing one provider to stall the full run.
        </p>

        <h2>The pipeline</h2>
        <ol>
          <li>
            <strong>Ingest.</strong> Bounded asynchronous workers fetch only
            eligible targets and place normalized records into the processing
            path.
          </li>
          <li>
            <strong>Normalize.</strong> ATS-specific payloads become one job
            schema with canonical company, title, location, timestamp, and
            direct-apply fields.
          </li>
          <li>
            <strong>Deduplicate.</strong> Stable hashes and database uniqueness
            constraints reject repeated listings without a race-prone read
            before write.
          </li>
          <li>
            <strong>Rank.</strong> Sentence-transformer similarity and product
            filters prioritize relevant roles before delivery.
          </li>
          <li>
            <strong>Serve.</strong> FastAPI exposes the data layer while the
            Next.js product supports discovery, saving, and application
            tracking.
          </li>
        </ol>
      </Prose>

      <div className="container-page">
        <MetricRow>
          <Metric
            value="31K+"
            label="Company registry"
            hint="ATS and career-page coverage"
          />
          <Metric
            value="120+"
            label="Matches per day"
            hint="surfaced by the discovery pipeline"
          />
          <Metric
            value="95%"
            label="Duplicate filtering"
            hint="before ranked delivery"
          />
        </MetricRow>
      </div>

      <Prose>
        <h2>Why the architecture matters</h2>
        <p>
          Crawling is the visible part, but reliability lives in scheduling,
          normalization, and state. PostgreSQL provides the production source
          of truth, Redis supports queued work, and a local SQLite mode keeps
          development reproducible. The adapters remain independent, so a
          provider change can be fixed without rewriting the rest of the
          ingestion system.
        </p>
        <p>
          The result is intentionally less dramatic than a feed of raw scrape
          logs: a small set of fresh roles with direct source links and enough
          context to make a decision quickly. Quiet output is the product.
        </p>
      </Prose>
    </article>
  );
}
