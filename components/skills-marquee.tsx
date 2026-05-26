import { skills } from "@/data/skills";

/**
 * Fixed bottom marquee of skill chips. The track contains the skill list
 * twice so a single `translateX(0 → -50%)` cycle loops seamlessly. The
 * `marquee-track` keyframes live in globals.css and respect
 * `prefers-reduced-motion`.
 */
export function SkillsMarquee() {
  return (
    <div
      aria-label="Skills"
      className="
        fixed bottom-0 left-0 right-0 z-30
        bg-[color:var(--color-bg)] border-t border-[color:var(--color-border)]
      "
    >
      {/* Edge fade masks so chips dissolve into bg at both sides */}
      <div
        className="overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%)",
        }}
      >
        <div className="marquee-track flex w-max items-center gap-10 py-3">
          {[...skills, ...skills].map((s, i) => (
            <span
              key={`${s.name}-${i}`}
              className="
                flex shrink-0 items-center gap-2
                font-mono text-xs tracking-tight
                text-[color:var(--color-fg-muted)]
                hover:text-[color:var(--color-accent)]
                transition-colors
              "
            >
              <s.Icon className="size-[14px]" aria-hidden />
              <span>{s.name}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
