import type { Metadata } from "next";
import { CaseStudyHeader } from "@/components/case-study-header";
import { Prose } from "@/components/prose";

export const metadata: Metadata = {
  title: "PaperMind",
  description:
    "Autonomous arXiv research assistant orchestrating 5 specialized agents — Literature, Methods, Results, Critique, and Synthesis — over a FAISS-backed RAG stack.",
};

export default function PaperMindPage() {
  return (
    <article>
      <CaseStudyHeader
        slug="papermind"
        label="// case study · tooling"
        title="Five agents that read the paper so you don't have to."
        tagline="An autonomous arXiv research assistant — fetches papers, builds a FAISS index, and orchestrates five specialist agents to produce a literature review, methods comparison, results analysis, critique, and gap synthesis in one report."
        period="Jan 2026 – May 2026"
        role="Sole engineer"
        repo="https://github.com/premxai/papermind"
      />

      <Prose>
        <p>
          Keeping up with a moving field means reading the same kinds of
          questions out of every new paper: <em>what&apos;s the contribution,
          how does it compare to prior work, what are the results, where does
          it fall short, and what&apos;s the open question?</em>{" "}
          <strong>PaperMind</strong> automates that loop. You point it at an
          arXiv ID (or drop in a PDF), and it produces a single research
          report by routing the work across five specialist agents — each
          with its own retrieval window and prompt shape.
        </p>

        <h2>The pipeline</h2>
        <ol>
          <li>
            <strong>Ingestion.</strong> arXiv API or local PDFs →{" "}
            <code>PyPDF</code> structural parse → clean text extraction →
            semantic chunking with overlap.
          </li>
          <li>
            <strong>Embedding.</strong> OpenAI <code>text-embedding-3-large</code>{" "}
            by default, with a local <code>all-MiniLM-L6-v2</code>{" "}
            <code>SentenceTransformer</code> as a fallback so the system
            keeps working offline.
          </li>
          <li>
            <strong>Vector store.</strong> FAISS index for similarity search,
            paired with a metadata store for paper sections, citations, and
            chunk lineage.
          </li>
          <li>
            <strong>Orchestration.</strong> An MCP-style controller routes a
            user query to the agents and aggregates their outputs into a
            unified report.
          </li>
          <li>
            <strong>Access.</strong> CLI for scripts, FastAPI for programmatic
            integrations, Streamlit for the interactive web view.
          </li>
        </ol>

        <h2>The five agents</h2>
        <ul>
          <li>
            <strong>Literature Agent</strong> — finds and summarises related
            work the paper cites or competes with.
          </li>
          <li>
            <strong>Methods Agent</strong> — extracts the technique, ablation
            structure, and where it differs from prior approaches.
          </li>
          <li>
            <strong>Results Agent</strong> — pulls numbers, benchmark tables,
            and headline claims out of the experiments section.
          </li>
          <li>
            <strong>Critique Agent</strong> — evaluates strengths,
            limitations, and likely failure modes that aren&apos;t explicit
            in the paper.
          </li>
          <li>
            <strong>Synthesis Agent</strong> — turns the four upstream outputs
            into a coherent narrative with a research-gap section and
            suggested next questions.
          </li>
        </ul>

        <h2>Why split it into agents</h2>
        <p>
          One big prompt that tries to do all five jobs at once gives mediocre
          everything. Splitting them lets each agent retrieve a different
          slice of the paper, use a different prompt shape, and be evaluated
          independently. The Critique Agent in particular needs a wider
          retrieval window (it has to look at both the paper and its
          neighbours) than the Methods Agent (which usually only needs the
          method section).
        </p>

        <h2>Output</h2>
        <p>
          Reports export to Markdown, PDF, HTML, JSON, or DOCX. The JSON
          export is structured so a downstream pipeline can pick up specific
          fields — e.g. for a literature-review aggregator or a paper-of-the-
          week digest.
        </p>

        <h2>What I&apos;d do next</h2>
        <ul>
          <li>
            Add a citation-graph retrieval step so the Literature Agent can
            walk the cite tree rather than only operating on chunks of the
            current paper.
          </li>
          <li>
            Run an eval set comparing PaperMind reports to human-written
            summaries on a few well-known papers — pick a small benchmark
            and grade each agent independently.
          </li>
          <li>
            Streamline the Streamlit UI into a single view per paper instead
            of the current tabbed layout.
          </li>
        </ul>
      </Prose>
    </article>
  );
}
