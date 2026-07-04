"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Play, X, Shuffle, RotateCcw } from "lucide-react";
import {
  loss,
  grad,
  stepSGD,
  sampleCurve,
  lossRange,
  WELLS,
  GLOBAL_MIN_X,
  classify,
  type Verdict,
  type DescentState,
} from "@/lib/loss-landscape";

/**
 * The flagship "play the descent" experience.
 *
 * Renders a small trigger button (styled to match the hero CTAs). Clicking it
 * opens a focused, full-screen overlay containing a live 1-D loss landscape you
 * can *play* with: drag the ball to any starting point, tune the learning rate
 * and momentum, and watch gradient descent converge to the global minimum,
 * oscillate, diverge, or get stuck in a local minimum.
 *
 * The ambient page background is untouched — this is a deliberate, opt-in
 * sandbox so default browsing stays clean. Esc or the scrim closes it.
 */

const VERDICT_LABEL: Record<Verdict, string> = {
  descending: "descending…",
  converged: "converged · global minimum",
  "local-minimum": "stuck in a local minimum",
  diverging: "diverging — lr too high",
};

export function PlayableDescent() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 font-mono text-sm border border-[color:var(--color-border-strong)] text-[color:var(--color-fg-muted)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] transition-colors"
      >
        <Play className="size-3.5 fill-current" /> Play the descent
      </button>
      {open && <DescentLab onClose={() => setOpen(false)} />}
    </>
  );
}

/* -------------------------------------------------------------------------- */

function DescentLab({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Control state (also mirrored into refs so the rAF loop reads live values).
  const [lr, setLr] = useState(0.006);
  const [momentum, setMomentum] = useState(0.8);
  const lrRef = useRef(lr);
  const momRef = useRef(momentum);
  lrRef.current = lr;
  momRef.current = momentum;

  // Simulation state lives in refs — the loop mutates these every frame
  // without triggering React re-renders.
  const stateRef = useRef<DescentState>({ x: 0.04, v: 0 });
  const runningRef = useRef(true);
  const draggingRef = useRef(false);
  const stepsRef = useRef(0);
  const trailRef = useRef<number[]>([]);

  // Readout DOM refs (updated directly in the loop for perf).
  const lossOut = useRef<HTMLSpanElement | null>(null);
  const stepOut = useRef<HTMLSpanElement | null>(null);
  const gradOut = useRef<HTMLSpanElement | null>(null);
  const verdictOut = useRef<HTMLSpanElement | null>(null);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => setMounted(true), []);

  // Esc to close + lock body scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const resetTo = useCallback((x: number) => {
    stateRef.current = { x, v: 0 };
    stepsRef.current = 0;
    trailRef.current = [];
    runningRef.current = true;
  }, []);

  // ---- Canvas render + physics loop -------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const range = lossRange();
    const curve = sampleCurve(240);

    // Padding around the plot, in CSS px.
    const PAD = { l: 28, r: 28, t: 28, b: 28 };
    let W = 0;
    let H = 0;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas!.width = Math.floor(W * dpr);
      canvas!.height = Math.floor(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const plotW = () => W - PAD.l - PAD.r;
    const plotH = () => H - PAD.t - PAD.b;
    const sx = (x: number) => PAD.l + x * plotW();
    const sy = (L: number) =>
      PAD.t + (1 - (L - range.min) / (range.max - range.min)) * plotH();
    // Invert screen x back to landscape x (for dragging).
    const invX = (px: number) =>
      Math.max(-0.05, Math.min(1.05, (px - PAD.l) / plotW()));

    function readColors() {
      const cs = getComputedStyle(document.documentElement);
      const accent = cs.getPropertyValue("--accent").trim() || "#fb923c";
      const fg = cs.getPropertyValue("--fg").trim() || "#fafafa";
      const subtle = cs.getPropertyValue("--fg-subtle").trim() || "#6b6b6b";
      return { accent, fg, subtle };
    }

    function draw() {
      const c = readColors();
      ctx!.clearRect(0, 0, W, H);

      // Curve fill
      ctx!.beginPath();
      ctx!.moveTo(sx(0), sy(curve[0].L));
      for (const p of curve) ctx!.lineTo(sx(p.x), sy(p.L));
      ctx!.lineTo(sx(1), H - PAD.b);
      ctx!.lineTo(sx(0), H - PAD.b);
      ctx!.closePath();
      ctx!.fillStyle = "rgba(120,120,140,0.06)";
      ctx!.fill();

      // Curve stroke
      ctx!.beginPath();
      ctx!.moveTo(sx(curve[0].x), sy(curve[0].L));
      for (const p of curve) ctx!.lineTo(sx(p.x), sy(p.L));
      ctx!.lineWidth = 1.5;
      ctx!.strokeStyle = c.subtle;
      ctx!.globalAlpha = 0.9;
      ctx!.stroke();
      ctx!.globalAlpha = 1;

      // Local-minima ticks
      for (const w of WELLS) {
        const isGlobal = Math.abs(w.c - GLOBAL_MIN_X) < 0.02;
        const px = sx(w.c);
        const py = sy(loss(w.c));
        ctx!.beginPath();
        ctx!.arc(px, py, isGlobal ? 3 : 2, 0, Math.PI * 2);
        ctx!.fillStyle = isGlobal ? "rgba(168,132,255,0.9)" : c.subtle;
        ctx!.fill();
      }

      // Global-minimum orb (sonar rings), skipped under reduced motion.
      {
        const gx = sx(GLOBAL_MIN_X);
        const gy = sy(loss(GLOBAL_MIN_X));
        const t = performance.now() / 1000;
        if (!reduced) {
          for (let r = 0; r < 3; r++) {
            const phase = ((t / 2.6) + r / 3) % 1;
            const radius = phase * 46;
            ctx!.beginPath();
            ctx!.arc(gx, gy, radius, 0, Math.PI * 2);
            ctx!.lineWidth = 1.2 * (1 - phase * 0.6);
            ctx!.strokeStyle = `rgba(168,132,255,${(1 - phase) * 0.4})`;
            ctx!.stroke();
          }
        }
        const halo = ctx!.createRadialGradient(gx, gy, 0, gx, gy, 26);
        halo.addColorStop(0, "rgba(168,132,255,0.4)");
        halo.addColorStop(1, "rgba(168,132,255,0)");
        ctx!.fillStyle = halo;
        ctx!.beginPath();
        ctx!.arc(gx, gy, 26, 0, Math.PI * 2);
        ctx!.fill();
      }

      // Trail (fading dots showing recent path)
      const trail = trailRef.current;
      for (let i = 0; i < trail.length; i++) {
        const fade = i / Math.max(1, trail.length - 1);
        const tx = sx(trail[i]);
        const ty = sy(loss(trail[i]));
        ctx!.beginPath();
        ctx!.arc(tx, ty, 1.5, 0, Math.PI * 2);
        ctx!.fillStyle = hexA(c.accent, 0.12 + 0.3 * fade);
        ctx!.fill();
      }

      // The ball
      const s = stateRef.current;
      const bx = sx(Math.max(0, Math.min(1, s.x)));
      const by = sy(loss(Math.max(0, Math.min(1, s.x))));
      const verdict = classify(s);
      const converged = verdict === "converged";
      const ballColor = converged ? "rgba(168,132,255,1)" : c.accent;

      const glow = ctx!.createRadialGradient(bx, by, 0, bx, by, 22);
      glow.addColorStop(0, hexA(ballColor, converged ? 0.6 : 0.5));
      glow.addColorStop(1, hexA(ballColor, 0));
      ctx!.fillStyle = glow;
      ctx!.beginPath();
      ctx!.arc(bx, by, 22, 0, Math.PI * 2);
      ctx!.fill();

      ctx!.beginPath();
      ctx!.arc(bx, by, draggingRef.current ? 7 : 5.5, 0, Math.PI * 2);
      ctx!.fillStyle = ballColorSolid(ballColor);
      ctx!.fill();
      ctx!.lineWidth = 1.5;
      ctx!.strokeStyle = "rgba(255,255,255,0.5)";
      ctx!.stroke();
    }

    let frame = 0;
    let raf = 0;
    function loop() {
      const s = stateRef.current;
      if (runningRef.current && !draggingRef.current) {
        const next = stepSGD(s, {
          lr: lrRef.current,
          momentum: momRef.current,
        });
        stateRef.current = next;
        stepsRef.current += 1;
        const trail = trailRef.current;
        trail.push(next.x);
        if (trail.length > 60) trail.shift();

        const v = classify(next);
        // Stop stepping once settled or clearly diverged (keep drawing).
        if (
          v === "converged" ||
          v === "local-minimum" ||
          (v === "diverging" && (next.x < -0.2 || next.x > 1.2))
        ) {
          runningRef.current = false;
        }
      }

      // Update readout ~every 3rd frame.
      if (frame % 3 === 0) {
        const s2 = stateRef.current;
        const inb = Math.max(0, Math.min(1, s2.x));
        if (lossOut.current) lossOut.current.textContent = loss(inb).toFixed(3);
        if (stepOut.current)
          stepOut.current.textContent = String(stepsRef.current);
        if (gradOut.current)
          gradOut.current.textContent = Math.abs(grad(inb)).toFixed(3);
        if (verdictOut.current) {
          const v = classify(s2);
          verdictOut.current.textContent = VERDICT_LABEL[v];
          verdictOut.current.dataset.verdict = v;
        }
      }
      frame++;
      draw();
      raf = requestAnimationFrame(loop);
    }
    loop();

    // ---- Pointer dragging ----
    function pointerToX(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      return invX(e.clientX - rect.left);
    }
    function onDown(e: PointerEvent) {
      draggingRef.current = true;
      runningRef.current = false;
      trailRef.current = [];
      stepsRef.current = 0;
      const x = pointerToX(e);
      stateRef.current = { x, v: 0 };
      canvas!.setPointerCapture(e.pointerId);
    }
    function onMove(e: PointerEvent) {
      if (!draggingRef.current) return;
      stateRef.current = { x: pointerToX(e), v: 0 };
    }
    function onUp(e: PointerEvent) {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      runningRef.current = true; // release → let it descend
      try {
        canvas!.releasePointerCapture(e.pointerId);
      } catch {}
    }
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
    // `mounted` is a dep because the canvas only enters the DOM once mounted
    // flips true; the effect must re-run then to attach the loop/pointer logic.
  }, [reduced, mounted]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Play the gradient descent"
    >
      {/* Scrim */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-[color:var(--color-bg)]/80 backdrop-blur-md"
      />

      {/* Panel */}
      <div className="relative w-full max-w-3xl border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg)] shadow-2xl">
        <div className="flex items-start justify-between gap-4 p-5 border-b border-[color:var(--color-border)]">
          <div>
            <p className="section-label mb-1">// gradient descent · playground</p>
            <h2 className="text-lg font-medium tracking-tight">
              Drag the ball. Watch it find a minimum.
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 inline-flex items-center justify-center size-9 rounded-full border border-[color:var(--color-border-strong)] text-[color:var(--color-fg-muted)] hover:text-[color:var(--color-accent)] hover:border-[color:var(--color-accent)] transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <canvas
            ref={canvasRef}
            className="w-full h-[42vh] max-h-[360px] min-h-[220px] touch-none cursor-grab active:cursor-grabbing border border-[color:var(--color-border)] bg-[color:var(--color-bg-elev)]/30"
          />

          {/* Readout */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs">
            <span className="text-[color:var(--color-fg-subtle)]">
              loss{" "}
              <span ref={lossOut} className="text-[color:var(--color-fg)]">
                —
              </span>
            </span>
            <span className="text-[color:var(--color-fg-subtle)]">
              step{" "}
              <span ref={stepOut} className="text-[color:var(--color-fg)]">
                0
              </span>
            </span>
            <span className="text-[color:var(--color-fg-subtle)]">
              |∇|{" "}
              <span ref={gradOut} className="text-[color:var(--color-fg)]">
                —
              </span>
            </span>
            <span
              ref={verdictOut}
              data-verdict="descending"
              className="ml-auto font-medium [&[data-verdict=converged]]:text-[color:var(--color-accent)] [&[data-verdict=local-minimum]]:text-amber-400 [&[data-verdict=diverging]]:text-red-400 text-[color:var(--color-fg-muted)]"
            >
              descending…
            </span>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <label className="flex flex-col gap-1.5">
              <span className="flex items-center justify-between font-mono text-xs text-[color:var(--color-fg-subtle)]">
                <span>learning rate</span>
                <span className="text-[color:var(--color-fg)]">
                  {lr.toFixed(4)}
                </span>
              </span>
              <input
                type="range"
                min={0.001}
                max={0.05}
                step={0.001}
                value={lr}
                onChange={(e) => setLr(parseFloat(e.target.value))}
                className="accent-[color:var(--color-accent)]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="flex items-center justify-between font-mono text-xs text-[color:var(--color-fg-subtle)]">
                <span>momentum (β)</span>
                <span className="text-[color:var(--color-fg)]">
                  {momentum.toFixed(2)}
                </span>
              </span>
              <input
                type="range"
                min={0}
                max={0.95}
                step={0.01}
                value={momentum}
                onChange={(e) => setMomentum(parseFloat(e.target.value))}
                className="accent-[color:var(--color-accent)]"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => resetTo(0.02 + Math.random() * 0.96)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs border border-[color:var(--color-border-strong)] text-[color:var(--color-fg-muted)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] transition-colors"
            >
              <Shuffle className="size-3.5" /> Drop somewhere random
            </button>
            <button
              type="button"
              onClick={() => resetTo(0.04)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs border border-[color:var(--color-border-strong)] text-[color:var(--color-fg-muted)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] transition-colors"
            >
              <RotateCcw className="size-3.5" /> Reset
            </button>
            <p className="font-mono text-xs text-[color:var(--color-fg-subtle)] text-pretty">
              Low lr crawls into the nearest valley. Momentum can escape it.
              Too high, and it diverges.
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* -------------------------------------------------------------------------- */

/** Convert a hex color to an rgba() string at the given alpha. */
function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/** Return a solid color string; passes rgba()/rgb() through, hex → opaque. */
function ballColorSolid(color: string): string {
  return color.startsWith("#") ? hexA(color, 1) : color;
}
