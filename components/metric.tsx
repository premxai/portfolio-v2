export function Metric({
  value,
  label,
  hint,
}: {
  value: string;
  label: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1 py-4">
      <p className="font-mono text-[color:var(--color-accent)] text-2xl md:text-3xl tracking-tight">
        {value}
      </p>
      <p className="text-sm text-[color:var(--color-fg)]">{label}</p>
      {hint && (
        <p className="font-mono text-xs text-[color:var(--color-fg-subtle)]">
          {hint}
        </p>
      )}
    </div>
  );
}

export function MetricRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 border-y border-[color:var(--color-border)] py-2 my-8">
      {children}
    </div>
  );
}
