import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Captioned image used inside case-study pages. Sits between <Prose> blocks
 * (or anywhere in the article) and renders centered on `container-prose`
 * with the same border treatment used by case-study heroes.
 *
 * Aspect ratio defaults to 16/9. Pass `aspect` if your image is a different
 * shape and you want the frame to match (avoids letterboxing).
 *
 * Use `fit="contain"` for UI screenshots that shouldn't be cropped.
 */
export function Figure({
  src,
  alt,
  caption,
  aspect = "16/9",
  fit = "cover",
  className,
}: {
  src: string;
  alt: string;
  caption?: React.ReactNode;
  aspect?: string;
  fit?: "cover" | "contain";
  className?: string;
}) {
  return (
    <figure
      className={cn("container-prose px-0 py-8 space-y-3", className)}
      style={{ ["--figure-aspect" as string]: aspect }}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden border border-[color:var(--color-border)]",
          fit === "contain" && "bg-[color:var(--color-bg-elev)]",
        )}
        style={{ aspectRatio: "var(--figure-aspect)" }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 768px, 100vw"
          className={fit === "contain" ? "object-contain" : "object-cover"}
        />
      </div>
      {caption && (
        <figcaption className="font-mono text-xs text-[color:var(--color-fg-subtle)] text-pretty">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
