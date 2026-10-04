import type { Metadata } from "next";
import { CaseStudyHeader } from "@/components/case-study-header";
import { Prose } from "@/components/prose";
import { Metric, MetricRow } from "@/components/metric";
import {
  BarChart,
  BeforeAfter,
  PairedBars,
  ResultsTable,
  TrapStreetFlow,
} from "@/components/agloe-charts";
import { agloe } from "@/data/agloe-results";

export const metadata: Metadata = {
  title: "Agloe",
  description:
    "Trap streets for AI agent swarms: a way to trace a copied mistake back to the exact copy it came from. Tested on 7,265 agent runs across 8 model families.",
};

const n = (x: number) => x.toLocaleString("en-US");
const bench = agloe.benchmark;
const ours = bench[bench.length - 1];
const earliest = bench[2];
const mid = agloe.recheckMid.rows;
const midAfter = mid[1];
const midTrace = mid[3];

export default function AgloePage() {
  return (
    <article>
      <CaseStudyHeader
        slug="agloe"
        label="// case study · research & tooling"
        title="When an AI swarm makes a mistake, who passed it on?"
        tagline="Agloe hides a unique “trap street” in every link an AI agent is shown, so a copied mistake can be traced back to the exact copy it came from. Tested on 7,265 agent runs across 8 model families."
        period="Oct 2026 · hackathon weekend"
        role="Team Paper Towns · AI Swarm Dynamics Hackathon"
        repo="https://github.com/premxai/agloe"
      />

      <aside className="container-prose pb-2">
        <div className="border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-elev)] p-6">
          <p className="section-label mb-4">// in 30 seconds</p>
          <ul className="space-y-3 text-[color:var(--color-fg)]/90 leading-relaxed">
            <li>
              <strong>The problem.</strong> When AI agents copy each
              other&apos;s mistakes, ordinary logs cannot say who passed what.
              In a real incident a perfect investigator could trace at most{" "}
              {agloe.incident.bestTop1}% of the copying.
            </li>
            <li>
              <strong>The fix.</strong> Give every link an agent is shown its
              own secret token, so a copied link names the exact copy it came
              from. It names the right source for {ours.top1}% of copying
              agents, against {earliest.top1}% for the best simple rule.
            </li>
            <li>
              <strong>The catch, and the payoff.</strong> It works best for
              models that copy links as written. Making the token the only way
              in lifts traceability from 25–50% to 100%, and following the
              trace after a bad tip cuts re-checking from {midAfter.share}% of
              outputs to {midTrace.share}%.
            </li>
          </ul>
        </div>
      </aside>

      <Prose className="py-6">
        <h2>The problem, in plain words</h2>
        <p>
          AI agents increasingly work in teams. They share a wiki, a chat, a
          page of notes. When one agent picks up a wrong fact or a bad
          shortcut, others copy it, and the mistake spreads. Afterwards you
          need two answers: <strong>where did it start, and who else did it
          reach?</strong>
        </p>
        <p>
          In the real incident I studied, the logs could not say. They recorded
          what each agent <em>wrote</em>, not what it <em>read</em>, and
          copying happens at the reading step. The trail was missing.
        </p>
      </Prose>

      <div className="container-page">
        <MetricRow>
          <Metric
            value={`${agloe.incident.bestTop1}%`}
            label="of the copying a perfect investigator could trace"
            hint="real incident, edit logs only"
          />
          <Metric
            value={`${n(agloe.incident.naiveCalls)} → ${agloe.incident.trustedCalls}`}
            label="“same text means copied” accusations that survive a fair check"
            hint="shared habits look like copying"
          />
          <Metric
            value={`${agloe.incident.crossNaive} → ${agloe.incident.crossVerified}`}
            label="suspected collusion cases that were real"
            hint="the rest were coincidence"
          />
          <Metric
            value={n(agloe.runs)}
            label="agent runs in the lab study"
            hint={`${agloe.families} model families · offline`}
          />
        </MetricRow>
      </div>

      <BarChart
        title="// how much copying can you trace from the log?"
        summary="Share of copy events whose source is visible in the log, for three logs"
        rows={agloe.visibility.map((v) => ({ label: v.label, value: v.value, note: v.note, highlight: v.ours }))}
        caption="Whether you can trace a mistake depends on what you logged. The incident logged edits but not reads. AI Village is a chat everyone reads, so its log shows the source of almost every copy."
      />

      <Prose className="py-6">
        <h2>The idea: a trap street</h2>
        <p>
          Mapmakers hide a fake street on their maps (Agloe, New York was one).
          If it shows up on a rival&apos;s map, they know it was copied. Agloe
          does the same for AI swarms. Every time an agent is shown a link, it
          gets its <strong>own</strong> secret token. If another agent copies
          the link, the token comes along and points to the exact copy that
          agent was shown.
        </p>
      </Prose>

      <TrapStreetFlow />

      <Prose className="py-6">
        <p>Four pieces, all open source:</p>
        <ul>
          <li>
            <strong>Report card.</strong> Drop in a swarm&apos;s log and it
            grades how traceable the swarm is, and separates real copying from
            coincidence. It runs in your browser; nothing is uploaded.{" "}
            <a href="/agloe/card/index.html">Try it on your own swarm&apos;s log.</a>
          </li>
          <li>
            <strong>Canary gateway.</strong> The three-call kit that stamps
            each served copy with its own token, requires it, and looks it up
            later.
          </li>
          <li>
            <strong>Agloe-Bench.</strong> Lab swarms with a hidden answer key
            and a scorer, so any tracing method can be graded fairly.
          </li>
          <li>
            <strong>Colony viewer.</strong> Plays any log as an ant colony; click
            an ant to trace it back to what it read and forward to everyone
            downstream.{" "}
            <a href="/agloe/colony/index.html">Open the viewer.</a>
          </li>
        </ul>

        <h2>Does it work? Head to head</h2>
        <p>
          On {agloe.benchmarkRuns} tagged lab runs, I gave each tracer the same
          thing a real investigator would have: the edit log. The simple rules
          name a source whenever any earlier agent posted the same link, so
          they blame almost every agent that worked alone. Trap streets name
          the right source for <strong>{ours.top1}%</strong> of copying agents,
          against {earliest.top1}% for the best simple rule, with far fewer
          false accusations. The animation at the top is one such run, and the
          best case (a model that copies links exactly); the pooled numbers
          below are the honest picture.
        </p>
      </Prose>

      <BarChart
        title="// copying agents whose source is named correctly"
        summary="Share of copying agents whose immediate source is named correctly, by method"
        rows={bench.map((b) => ({ label: b.method, value: b.top1, highlight: b.ours }))}
        caption={`${agloe.benchmarkRuns} tagged lab runs. Intervals are in the table below.`}
      />

      <ResultsTable
        caption="Benchmark: source named correctly and innocent agents wrongly accused, by method"
        head={["Method", "Source named correctly", "Innocent agents accused"]}
        rows={bench.map((b) => ({
          highlight: b.ours,
          cells: [
            b.method,
            <span key="a">
              {b.top1}% <span className="text-[color:var(--color-fg-subtle)]">[{b.top1Ci[0].toFixed(1)}–{b.top1Ci[1].toFixed(1)}]</span>
            </span>,
            <span key="b">
              {b.falseAccusation}% <span className="text-[color:var(--color-fg-subtle)]">[{b.falseAccusationCi[0].toFixed(1)}–{b.falseAccusationCi[1].toFixed(1)}]</span>
            </span>,
          ],
        }))}
        note="Brackets are 95% bootstrap intervals over runs. “Accused” means an agent that worked alone was blamed on someone. The first three rules accuse by construction: they name a source whenever one exists."
      />

      <Prose className="py-6">
        <h2>It depends on the model</h2>
        <p>
          This is the most useful finding, and not the one I expected. Models
          that copy a link word for word (Qwen, Hermes) carry the token along,
          and tracing jumps by 57–68 points. Models that go and fetch their own
          access (GLM, Kimi, DeepSeek, MiniMax) skip the token, so the gain
          shrinks to almost nothing. A trace is only as good as the agent&apos;s
          habit of copying.
        </p>
      </Prose>

      <PairedBars
        title="// source named correctly, by model"
        summary="For each model, the share of copying agents whose source is named correctly by the best simple rule and by trap streets"
        baselineLabel="Best simple edit-log rule"
        resultLabel="With trap streets"
        rows={agloe.models.map((m) => ({
          label: m.name,
          baseline: m.rule,
          result: m.tokens,
          gain: `${m.lift > 0 ? "+" : "−"}${Math.abs(m.lift)} pts`,
          note: `token survived in ${m.tokenKept}% of ${n(m.copies)} copies`,
        }))}
        caption="Models with at least 20 copying agents. The gain tracks how often the token survives being copied."
      />

      <Prose className="py-6">
        <h2>Closing the other door</h2>
        <p>
          If a model can get its own access, it will. So in a controlled
          experiment I made the token the <strong>only way in</strong>: the
          shared mirror hands out nothing except through links the wiki served.
          For the four models that had been bypassing the token, traceable
          outputs went from 25–50% to <strong>100%</strong>, and every agent
          still finished the task.
        </p>
      </Prose>

      <BeforeAfter
        title="// outputs that carry a traceable token"
        summary="Per model, the share of outputs carrying a traceable token when access is open and when it is gated"
        fromLabel="Open: the mirror hands a session to anyone"
        toLabel="Gated: the only way in is a served link"
        rows={agloe.gated.map((g) => ({
          label: g.name,
          from: g.open,
          to: g.gated,
          note: `agents finished the task: ${g.doneOpen}% → ${g.doneGated}%`,
        }))}
        caption="Two runs of 30 agents per model per world. This follows from how access is designed, so it shows the fix is feasible and cheap, not a surprise. A gate traces access, not ideas an agent learns and uses another way."
      />

      <Prose className="py-6">
        <h2>After a bad tip: what do you re-check?</h2>
        <p>
          Say a bad tip appears mid-run. Re-check everything submitted after
          it and you redo <strong>{midAfter.share}%</strong> of the outputs.
          Follow the trace back to the tip and you re-check{" "}
          <strong>{midTrace.share}%</strong>, while still catching{" "}
          {midTrace.found}% of the outputs it actually reached. A tip that is
          there from the very start reaches about 80% of outputs whatever you
          do, so the saving is in catching it early.
        </p>
      </Prose>

      <BarChart
        title="// share of outputs to re-check after a bad tip (lower is less work)"
        summary="Share of outputs an operator would re-check after a mid-run bad tip, by how the list is made"
        rows={mid.map((r, i) => ({ label: r.label, value: r.share, highlight: i >= 2, note: i >= 2 ? `finds ${r.found}% of the outputs the tip reached` : undefined }))}
        caption={`${agloe.recheckMid.runs} tagged runs, ${n(agloe.recheckMid.outputs)} outputs; the tip reached ${agloe.recheckMid.reached}.`}
      />

      <Prose>
        <h2>What went wrong, and the limits</h2>
        <p>I would rather you hear these from me:</p>
        <ul>
          <li>
            <strong>Three of my first experiment designs were wrong.</strong>{" "}
            In one, the planted tip stated the answer, so agents never needed to
            fetch anything. I set them aside and kept the records.
          </li>
          <li>
            <strong>One hypothesis I wrote down in advance failed.</strong>{" "}
            Harmless “decoration” tags also survive copying for some models, so
            decoration versus token is not a clean split.
          </li>
          <li>
            <strong>I first showed a cherry-picked week.</strong> Re-running the
            whole AI Village dataset turned a claimed step change into a short
            dip.
          </li>
          <li>
            <strong>It is a lab.</strong> Offline sandbox, one narrow task, open
            models, and “copied” means <em>exposed to</em>, not intent. An
            agent that deliberately strips tokens defeats the scheme.
          </li>
        </ul>

        <h2>How it was tested</h2>
        <p>
          Every run is offline against fake domains. Agents are asked to find
          one number through four mirror sites; the lab records what each agent
          was served (the hidden answer key) separately from the logs a real
          investigator would see. {n(agloe.cells)} swarms, {n(agloe.runs)} agent
          runs, {agloe.families} model families, about ${agloe.costUsd} of
          inference. Rates are pooled over runs, with bootstrap intervals,
          because agents in one swarm are not independent.
        </p>
        <p>
          Code, benchmark and the report card are at{" "}
          <a href="https://github.com/premxai/agloe" target="_blank" rel="noopener noreferrer">
            github.com/premxai/agloe
          </a>
          . <em>Read the past honestly, make the future traceable.</em>
        </p>
      </Prose>
    </article>
  );
}
