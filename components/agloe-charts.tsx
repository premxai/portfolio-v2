import { cn } from "@/lib/cn";

/**
 * Small, dependency-free charts for the Agloe case study.
 * Plain HTML/CSS bars that use the site's design tokens: grey = the baseline,
 * accent = the thing being shown. Every value is printed next to its bar, and
 * each chart carries a screen-reader summary, so nothing relies on colour alone.
 */

const track = "bg-[color:var(--color-bg-elev)] border border-[color:var(--color-border)]";
const GREY = "bg-[color:var(--color-fg-subtle)]";
const ACCENT = "bg-[color:var(--color-accent)]";

function Frame({
  title,
  caption,
  summary,
  children,
}: {
  title?: string;
  caption?: React.ReactNode;
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="container-prose px-0 py-8" role="group" aria-label={summary}>
      {title && <p className="section-label mb-6">{title}</p>}
      {children}
      {caption && (
        <figcaption className="mt-6 font-mono text-xs leading-relaxed text-[color:var(--color-fg-subtle)] text-pretty">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function Legend({ items }: { items: { label: string; accent?: boolean }[] }) {
  return (
    <ul className="mb-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[color:var(--color-fg-muted)]">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-2">
          <span className={cn("inline-block h-2.5 w-5", i.accent ? ACCENT : GREY)} aria-hidden />
          {i.label}
        </li>
      ))}
    </ul>
  );
}

/** One horizontal bar per row, value printed at the end of the label line. */
export function BarChart({
  rows,
  title,
  caption,
  summary,
  max = 100,
  suffix = "%",
}: {
  rows: { label: string; value: number; note?: string; highlight?: boolean }[];
  title?: string;
  caption?: React.ReactNode;
  summary: string;
  max?: number;
  suffix?: string;
}) {
  return (
    <Frame title={title} caption={caption} summary={summary}>
      <ul className="space-y-5">
        {rows.map((r) => (
          <li key={r.label} title={`${r.label}: ${r.value}${suffix}`}>
            <div className="flex items-baseline justify-between gap-4">
              <span
                className={cn(
                  "text-sm",
                  r.highlight ? "text-[color:var(--color-fg)] font-medium" : "text-[color:var(--color-fg-muted)]",
                )}
              >
                {r.label}
              </span>
              <span
                className={cn(
                  "font-mono text-sm tabular-nums",
                  r.highlight ? "text-[color:var(--color-accent)]" : "text-[color:var(--color-fg-muted)]",
                )}
              >
                {r.value}
                {suffix}
              </span>
            </div>
            <div className={cn("mt-2 h-2.5 w-full", track)}>
              <div className={cn("h-full", r.highlight ? ACCENT : GREY)} style={{ width: `${(r.value / max) * 100}%` }} />
            </div>
            {r.note && <p className="mt-1.5 font-mono text-xs text-[color:var(--color-fg-subtle)]">{r.note}</p>}
          </li>
        ))}
      </ul>
    </Frame>
  );
}

/** Two bars per row: a baseline (grey) and the result (accent), with the gain printed on the right. */
export function PairedBars({
  rows,
  title,
  caption,
  summary,
  baselineLabel,
  resultLabel,
}: {
  rows: { label: string; baseline: number; result: number; gain: string; note?: string }[];
  title?: string;
  caption?: React.ReactNode;
  summary: string;
  baselineLabel: string;
  resultLabel: string;
}) {
  return (
    <Frame title={title} caption={caption} summary={summary}>
      <Legend items={[{ label: baselineLabel }, { label: resultLabel, accent: true }]} />
      <ul className="space-y-6">
        {rows.map((r) => (
          <li key={r.label} title={`${r.label}: ${r.baseline}% → ${r.result}%`}>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm text-[color:var(--color-fg)]">{r.label}</span>
              <span className="font-mono text-sm tabular-nums text-[color:var(--color-accent)]">{r.gain}</span>
            </div>
            <div className="mt-2 space-y-1">
              {[
                { v: r.baseline, c: GREY, t: "text-[color:var(--color-fg-muted)]" },
                { v: r.result, c: ACCENT, t: "text-[color:var(--color-fg)]" },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={cn("h-2 flex-1", track)}>
                    <div className={cn("h-full", b.c)} style={{ width: `${b.v}%` }} />
                  </div>
                  <span className={cn("w-10 text-right font-mono text-xs tabular-nums", b.t)}>{b.v}%</span>
                </div>
              ))}
            </div>
            {r.note && <p className="mt-1.5 font-mono text-xs text-[color:var(--color-fg-subtle)]">{r.note}</p>}
          </li>
        ))}
      </ul>
    </Frame>
  );
}

/** Before and after on one line: a grey dot, an accent dot, and the line between them. */
export function BeforeAfter({
  rows,
  title,
  caption,
  summary,
  fromLabel,
  toLabel,
}: {
  rows: { label: string; from: number; to: number; note?: string }[];
  title?: string;
  caption?: React.ReactNode;
  summary: string;
  fromLabel: string;
  toLabel: string;
}) {
  return (
    <Frame title={title} caption={caption} summary={summary}>
      <Legend items={[{ label: fromLabel }, { label: toLabel, accent: true }]} />
      <ul className="space-y-5">
        {rows.map((r) => (
          <li key={r.label} title={`${r.label}: ${r.from}% → ${r.to}%`}>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm text-[color:var(--color-fg)]">{r.label}</span>
              <span className="font-mono text-sm tabular-nums text-[color:var(--color-fg-muted)]">
                {r.from}% <span aria-hidden>→</span>
                <span className="sr-only">to</span> <span className="text-[color:var(--color-accent)]">{r.to}%</span>
              </span>
            </div>
            <div className={cn("relative mt-3 h-2.5 w-full", track)}>
              <div
                className="absolute top-1/2 h-px -translate-y-1/2 bg-[color:var(--color-fg-subtle)]"
                style={{ left: `${Math.min(r.from, r.to)}%`, width: `${Math.abs(r.to - r.from)}%` }}
              />
              <span
                className={cn("absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full", GREY)}
                style={{ left: `${r.from}%` }}
              />
              <span
                className={cn("absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-[color:var(--color-bg)]", ACCENT)}
                style={{ left: `${r.to}%` }}
              />
            </div>
            {r.note && <p className="mt-1.5 font-mono text-xs text-[color:var(--color-fg-subtle)]">{r.note}</p>}
          </li>
        ))}
      </ul>
    </Frame>
  );
}

/** A plain results table in the site's style. Right-aligns numeric columns; the highlighted row is ours. */
export function ResultsTable({
  caption,
  head,
  rows,
  note,
}: {
  caption: string;
  head: string[];
  rows: { cells: React.ReactNode[]; highlight?: boolean }[];
  note?: React.ReactNode;
}) {
  return (
    <figure className="container-prose px-0 py-8">
      <div className="overflow-x-auto border border-[color:var(--color-border)]">
        <table className="w-full min-w-[32rem] border-collapse text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-elev)]">
              {head.map((h, i) => (
                <th
                  key={h}
                  scope="col"
                  className={cn(
                    "px-4 py-3 font-mono text-xs font-normal uppercase tracking-wider text-[color:var(--color-fg-subtle)]",
                    i === 0 ? "text-left" : "text-right",
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr
                key={ri}
                className={cn(
                  "border-b border-[color:var(--color-border)] last:border-b-0",
                  r.highlight && "bg-[color:var(--color-accent-soft)]",
                )}
              >
                {r.cells.map((c, i) => (
                  <td
                    key={i}
                    className={cn(
                      "px-4 py-3 align-top",
                      i === 0 ? "text-left text-[color:var(--color-fg)]" : "whitespace-nowrap text-right font-mono tabular-nums text-[color:var(--color-fg-muted)]",
                      r.highlight && i > 0 && "text-[color:var(--color-fg)]",
                    )}
                  >
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note && <figcaption className="mt-3 font-mono text-xs leading-relaxed text-[color:var(--color-fg-subtle)] text-pretty">{note}</figcaption>}
    </figure>
  );
}

/** The whole idea in four steps. Reads left to right on wide screens, top to bottom on a phone. */
export function TrapStreetFlow() {
  const steps = [
    { n: "1", title: "A writes a page", body: "It holds a working link." },
    { n: "2", title: "The gateway serves B", body: "B gets the link with its own secret token, and a registry notes who got what." },
    { n: "3", title: "C copies B's link", body: "Token and all, because the link needs it to work." },
    { n: "4", title: "Look up the token", body: "It names the exact copy C saw: B's, and so A's. Exact, not guessed." },
  ];
  return (
    <figure className="container-prose px-0 py-8" role="group" aria-label="How a trap street works, in four steps">
      <ol className="grid gap-px border border-[color:var(--color-border)] bg-[color:var(--color-border)] sm:grid-cols-2">
        {steps.map((s) => (
          <li key={s.n} className="bg-[color:var(--color-bg)] p-5">
            <p className="font-mono text-xs text-[color:var(--color-accent)]">step {s.n}</p>
            <p className="mt-2 font-medium text-[color:var(--color-fg)]">{s.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-[color:var(--color-fg-muted)]">{s.body}</p>
          </li>
        ))}
      </ol>
      <figcaption className="mt-3 font-mono text-xs text-[color:var(--color-fg-subtle)]">
        The token must be needed for the link to work. If it is only decoration, a copier can drop it.
      </figcaption>
    </figure>
  );
}
