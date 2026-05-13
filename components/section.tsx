import { cn } from "@/lib/cn";

export function Section({
  label,
  title,
  children,
  className,
  id,
}: {
  label?: string;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("container-page py-20 md:py-28", className)}>
      {(label || title) && (
        <header className="mb-12 flex flex-col gap-3">
          {label && <span className="section-label">{label}</span>}
          {title && (
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-balance">
              {title}
            </h2>
          )}
        </header>
      )}
      {children}
    </section>
  );
}
