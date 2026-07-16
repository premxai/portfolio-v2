import type { Metadata } from "next";
import { CaseStudyHeader } from "@/components/case-study-header";
import { Prose } from "@/components/prose";
import { Metric, MetricRow } from "@/components/metric";

export const metadata: Metadata = {
  title: "Cryo",
  description:
    "A provenance-first search system over a frozen pre-2022 web corpus.",
};

export default function CryoPage() {
  return (
    <article>
      <CaseStudyHeader
        slug="cryo"
        label="// case study · search infrastructure"
        title="Search the web before the AI web changed it."
        tagline="Cryo searches a frozen pre-2022 corpus with lexical retrieval, semantic reranking, provenance, and agent-ready interfaces."
        period="2026"
        role="Designer and engineer"
        repo="https://github.com/premxai/cryo"
        demo="https://www.cryoweb.xyz/"
      />

      <Prose>
        <p>
          The public web is increasingly mixed with synthetic material.
          <strong> Cryo</strong> explores a narrower question: what if an
          agent could search a source-bounded snapshot from before that shift,
          while still using modern retrieval interfaces?
        </p>

        <h2>Retrieval pipeline</h2>
        <ol>
          <li>Meilisearch produces fast BM25-style lexical candidates.</li>
          <li>Qdrant stores embeddings used for semantic retrieval and reranking.</li>
          <li>Results retain source provenance and capture timestamps rather than flattening pages into anonymous chunks.</li>
          <li>An authenticity score surfaces how well each result fits the corpus boundary.</li>
        </ol>
      </Prose>

      <div className="container-page">
        <MetricRow>
          <Metric value="pre-2022" label="Corpus boundary" hint="source-bounded frozen snapshot" />
          <Metric value="2" label="Retrieval modes" hint="lexical and semantic" />
          <Metric value="4" label="MCP tools" hint="agent-ready search access" />
        </MetricRow>
      </div>

      <Prose>
        <h2>Interfaces, not a closed demo</h2>
        <p>
          The same retrieval path is available through a FastAPI service, a
          typed Python SDK, LangChain and LlamaIndex integrations, and four MCP
          tools. That lets a person inspect results in the web interface while
          an agent uses the corpus through a structured tool contract.
        </p>

        <h2>What Cryo does not claim</h2>
        <p>
          Cryo is a research-grade retrieval system, not a web-scale archive
          or a claim that older sources are automatically correct. The useful
          property is the explicit temporal boundary and provenance: users can
          see where a result came from and decide how much weight to give it.
        </p>
      </Prose>
    </article>
  );
}
