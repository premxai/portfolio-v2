import Image from "next/image";
import type { Project } from "@/data/projects";
import { cn } from "@/lib/cn";

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function initials(title: string) {
  const words = title.replace(/[^a-zA-Z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

type Size = "card" | "hero";

export function ProjectThumb({
  project,
  size = "card",
  className,
}: {
  project: Project;
  size?: Size;
  className?: string;
}) {
  const src = size === "hero" ? project.hero ?? project.image : project.image;

  const fit = size === "hero" ? project.heroFit ?? "cover" : "cover";
  const objectFitClass = fit === "contain" ? "object-contain" : "object-cover";

  const wrapperBase =
    size === "hero"
      ? cn(
          "relative w-full aspect-[16/9] overflow-hidden border border-[color:var(--color-border)] group-hover:border-[color:var(--color-border-strong)] transition-colors",
          fit === "contain" && "bg-[color:var(--color-bg-elev)]",
        )
      : "relative shrink-0 size-28 md:size-40 overflow-hidden border border-[color:var(--color-border)] group-hover:border-[color:var(--color-accent)] transition-colors";

  if (size === "hero" && project.heroVideo) {
    return (
      <div className={cn(wrapperBase, className)}>
        <video
          src={project.heroVideo}
          poster={project.hero ?? project.image}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-label={project.title}
          className={cn("absolute inset-0 size-full", objectFitClass)}
        />
      </div>
    );
  }

  if (src) {
    return (
      <div className={cn(wrapperBase, className)}>
        <Image
          src={src}
          alt={project.title}
          fill
          sizes={size === "hero" ? "(min-width: 1024px) 1024px, 100vw" : "180px"}
          className={objectFitClass}
        />
      </div>
    );
  }

  const h = hash(project.slug);
  const hue1 = h % 360;
  const hue2 = (hue1 + 35) % 360;
  const bg = `linear-gradient(135deg, hsl(${hue1} 22% 14%) 0%, hsl(${hue2} 16% 8%) 100%)`;

  return (
    <div
      className={cn(wrapperBase, className)}
      style={{ backgroundImage: bg }}
      aria-hidden
    >
      {/* faint diagonal striping for texture */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, currentColor 0 1px, transparent 1px 8px)",
          color: "var(--color-fg)",
        }}
      />

      {/* initials */}
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center font-mono font-medium",
          size === "hero"
            ? "text-6xl md:text-8xl tracking-tight"
            : "text-2xl md:text-3xl tracking-tight",
        )}
        style={{ color: "color-mix(in oklab, var(--color-fg) 55%, transparent)" }}
      >
        {initials(project.title)}
      </span>

      {/* corner accent tag */}
      <span
        className={cn(
          "absolute top-1 left-1 font-mono text-[9px] uppercase tracking-widest",
          size === "hero" && "top-3 left-3 text-xs",
        )}
        style={{ color: "color-mix(in oklab, var(--color-fg) 40%, transparent)" }}
      >
        {project.category.slice(0, 3).toLowerCase()}
      </span>

      {/* corner dot in accent for hero */}
      {size === "hero" && (
        <span
          className="absolute bottom-3 right-3 size-1.5 rounded-full"
          style={{ backgroundColor: "var(--color-accent)" }}
        />
      )}
    </div>
  );
}
