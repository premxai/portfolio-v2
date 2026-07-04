import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/**
 * Full-bleed "scroll-stopper" moment. Pulls the single most arresting line
 * from the Emotion Engine case study — a statistically absurd p-value for an
 * emergent-emotions result — onto the home page as one oversized statement.
 *
 * The whole block is a link into /work/emotion-engine. Set apart from the
 * neighbouring sections with a slightly elevated band + hairline borders.
 */
export function KillerStat() {
  return (
    <section
      id="finding"
      className="relative border-y border-[color:var(--color-border)] bg-[color:var(--color-bg-elev)]/40 py-24 md:py-36"
    >
      <div className="container-page">
        <p className="section-label mb-8">// the finding that still surprises me</p>

        <Link href="/work/emotion-engine" className="group block max-w-4xl">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-medium tracking-tight text-balance leading-[1.03]">
            Can emotions emerge from prediction alone?
          </h2>

          <div className="mt-10 flex flex-wrap items-baseline gap-x-6 gap-y-3">
            <span className="font-mono text-3xl md:text-5xl text-[color:var(--color-accent)] tracking-tight">
              p = 3.3e-113
            </span>
            <span className="font-mono text-xs md:text-sm text-[color:var(--color-fg-subtle)]">
              across 205,940 agent-step records · zero hardcoded rules
            </span>
          </div>

          <span className="mt-10 inline-flex items-center gap-1.5 font-mono text-sm text-[color:var(--color-fg-muted)] group-hover:text-[color:var(--color-accent)] transition-colors">
            Read how a 72-feature LSTM rediscovered fear, grief, and suspicion
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </Link>
      </div>
    </section>
  );
}
