import type { Metadata } from "next";
import { CaseStudyHeader } from "@/components/case-study-header";
import { Prose } from "@/components/prose";

export const metadata: Metadata = {
  title: "Kerna",
  description:
    "A local-first trust layer for controlling, approving, and auditing AI-agent tool use.",
};

export default function KernaPage() {
  return (
    <article>
      <CaseStudyHeader
        slug="kerna"
        label="// case study · agent infrastructure"
        title="Give agents work without giving them the keys."
        tagline="Kerna puts policy, budgets, approvals, isolation, and durable receipts around AI-agent tool use."
        period="2026"
        role="Designer and engineer"
        repo="https://github.com/premxai/kerna"
        demo="https://kerna.run/"
      />

      <Prose>
        <p>
          Agent frameworks make it easy to call tools. They make it much
          harder to answer the operational questions that follow: was the
          action allowed, who approved it, what budget did it consume, and
          what exactly happened? <strong>Kerna</strong> treats those questions
          as part of the execution path rather than an after-the-fact log.
        </p>

        <h2>The control loop</h2>
        <ol>
          <li><strong>Ask.</strong> An agent proposes a tool call with explicit arguments and context.</li>
          <li><strong>Check.</strong> Kerna evaluates policy, execution budget, and isolation requirements.</li>
          <li><strong>Decide.</strong> The call is allowed, denied, or routed into a human approval queue.</li>
          <li><strong>Receipt.</strong> The decision and execution result are persisted as an inspectable trace.</li>
        </ol>

        <h2>Why fail closed</h2>
        <p>
          Missing policy, malformed context, and unavailable approval state
          all resolve to denial. That is less convenient during setup, but it
          prevents an integration bug from silently becoming permission to
          act. Risk cards make the decision visible before a user approves it.
        </p>

        <h2>Architecture</h2>
        <ul>
          <li>A Rust runtime and CLI own policy checks and execution control.</li>
          <li>SQLite stores local policy state, approvals, and persistent receipts.</li>
          <li>An MCP gateway places the same controls in front of compatible agent clients.</li>
          <li>Plugin processes are isolated so a tool failure does not take down the control plane.</li>
          <li>Python and TypeScript surfaces keep the runtime usable from common agent stacks.</li>
        </ul>

        <h2>The design boundary</h2>
        <p>
          Kerna is not an agent planner and does not claim to make models
          smarter. It is the narrow control layer between a model&apos;s intent
          and a side effect, designed to make that boundary explicit,
          reviewable, and recoverable.
        </p>
      </Prose>
    </article>
  );
}
