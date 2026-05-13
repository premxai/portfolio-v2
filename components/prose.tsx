import { cn } from "@/lib/cn";

export function Prose({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "container-prose py-12 space-y-6 text-[color:var(--color-fg)]/90 leading-relaxed",
        "[&_h2]:text-2xl [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:mt-12 [&_h2]:mb-2 [&_h2]:text-[color:var(--color-fg)]",
        "[&_h3]:text-lg [&_h3]:font-medium [&_h3]:mt-8 [&_h3]:mb-1 [&_h3]:text-[color:var(--color-fg)]",
        "[&_p]:text-pretty",
        "[&_a]:text-[color:var(--color-accent)] [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-[color:var(--color-accent)]/40 hover:[&_a]:decoration-[color:var(--color-accent)]",
        "[&_code]:font-mono [&_code]:text-sm [&_code]:bg-[color:var(--color-bg-elev)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:border [&_code]:border-[color:var(--color-border)]",
        "[&_ul]:space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:marker:text-[color:var(--color-fg-subtle)]",
        "[&_ol]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:marker:text-[color:var(--color-fg-subtle)]",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-[color:var(--color-accent)] [&_blockquote]:pl-4 [&_blockquote]:text-[color:var(--color-fg-muted)] [&_blockquote]:italic",
        className,
      )}
    >
      {children}
    </div>
  );
}
