import type { Metadata } from "next";
import { CaseStudyHeader } from "@/components/case-study-header";
import { Prose } from "@/components/prose";
import { Metric, MetricRow } from "@/components/metric";

export const metadata: Metadata = {
  title: "PackAI",
  description:
    "VS Code extension that orchestrates Claude, Copilot, and Codex in parallel via DAG planning and capability scoring.",
};

export default function PackAIPage() {
  return (
    <article>
      <CaseStudyHeader
        label="// case study · tooling"
        title="Three coding agents, one DAG, zero rate-limit cliffs."
        tagline="A VS Code extension that decomposes natural-language project requests into a typed DAG, scores each task against agent capabilities, and runs Claude, Copilot, and Codex in parallel."
        period="Apr 2025 – Jun 2025"
        role="Designer & sole engineer"
        repo="https://github.com/premxai/packai"
      />

      <Prose>
        <p>
          Any single AI coding agent is bottlenecked by two things:
          rate-limits and capability mismatch. Ask the wrong model for the
          wrong task and you burn quota for a worse answer. <strong>PackAI</strong>{" "}
          treats the three big assistants — Claude, Copilot, and Codex — as
          interchangeable workers behind a planner, and routes each unit of
          work to whichever one looks best for it.
        </p>

        <h2>How it works</h2>
        <ol>
          <li>
            <strong>Intent analysis.</strong> The user describes a project in
            natural language. An NLP layer extracts project type, target
            stack, feature list, and a complexity estimate.
          </li>
          <li>
            <strong>DAG planning.</strong> The planner expands the intent into
            a phased task graph (&ldquo;scaffold → schema → routes → tests →
            review&rdquo;), with explicit dependencies so independent tasks
            can run concurrently.
          </li>
          <li>
            <strong>Capability scoring.</strong> Each task is scored against
            each agent on signals like task type, language, complexity, and
            recent benchmark behavior. The highest score wins.
          </li>
          <li>
            <strong>Parallel execution.</strong> Independent tasks dispatch
            simultaneously. A rate-limit queue catches throttled agents and
            re-routes their work to a peer.
          </li>
          <li>
            <strong>Conflict resolution.</strong> When two agents touch the
            same file, the orchestrator stages outputs, runs validation
            gates, and merges with deterministic precedence rules.
          </li>
          <li>
            <strong>Validation gates.</strong> Every output passes through
            syntax, import-resolution, basic security, and style checks
            before it lands on disk.
          </li>
        </ol>

        <h2>Why a DAG, not a chain</h2>
        <p>
          Most multi-agent systems either run agents sequentially (slow) or
          fully in parallel without coordination (chaotic). A typed DAG was
          the sweet spot: explicit about what depends on what, parallel by
          default for everything else, and trivial to visualize in the
          extension&apos;s live dashboard.
        </p>
      </Prose>

      <div className="container-page">
        <MetricRow>
          <Metric
            value="3"
            label="Agents orchestrated"
            hint="Claude · Copilot · Codex"
          />
          <Metric
            value="741+"
            label="Vitest tests"
            hint="across orchestrator + plan layers"
          />
          <Metric
            value="5"
            label="Workflow templates"
            hint="e-commerce, landing, dashboard, blog, generic"
          />
          <Metric
            value="0"
            label="Hard rate-limit failures"
            hint="thanks to fallback queueing"
          />
        </MetricRow>
      </div>

      <Prose>
        <h2>Engineering decisions worth flagging</h2>
        <ul>
          <li>
            <strong>State machine over framework.</strong> No LangGraph, no
            external agent library — the orchestrator is a plain TypeScript
            state machine. Easier to reason about, easier to test, and the
            741+ tests reflect that.
          </li>
          <li>
            <strong>Capability scores are configurable.</strong> Each user
            can override default weights, so an iOS engineer can bias toward
            the agent that knows Swift best without forking the extension.
          </li>
          <li>
            <strong>Pause / resume / cancel at any node.</strong> Long-running
            sessions failed too often without granular control. The DAG made
            this almost free.
          </li>
        </ul>

        <h2>What surprised me</h2>
        <p>
          The capability-scoring layer mattered less than the conflict
          resolution layer. The agents were &ldquo;good enough&rdquo; that
          most routing decisions barely moved quality — but two agents
          editing the same file concurrently broke things constantly until
          the staging-and-merge layer was in place. The reliability win was
          in coordination, not selection.
        </p>
      </Prose>
    </article>
  );
}
