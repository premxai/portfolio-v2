"use client";

import { useEffect, useRef } from "react";
import {
  loss2D,
  grad2D,
  lossRange2D,
  sampleGrid2D,
  GLOBAL_MIN_2D,
  stepSGD2D,
  stepMomentum2D,
  stepAdam2D,
  converged2D,
  type SGDState2D,
  type MomentumState2D,
  type AdamState2D,
} from "@/lib/loss-landscape";

/**
 * Home page background: a live contour map of a real 2-D loss surface with
 * three optimizers racing across it.
 *
 * The surface is sampled on a grid once at mount and its iso-contours are
 * extracted via marching squares (see `marchingSquares` below); the extracted
 * polylines are cached, so that one-time cost never repeats. Every animation
 * frame only redraws the cached contour strokes plus three moving balls, one
 * per optimizer, each stepping its own exact textbook update rule (SGD,
 * Polyak heavy-ball momentum, Adam) against the shared analytic gradient
 * from lib/loss-landscape.ts. When all three settle, diverge, or a step cap
 * is hit, a new race starts from a fresh random point.
 *
 * This layer is `pointer-events-none` and stays that way: the race always
 * auto-runs, and the only cursor interaction is a passive proximity check
 * (mousemove on `window`) that brightens a ball's label when you happen to
 * hover near it. Nothing here can ever intercept a click.
 *
 * Respects `prefers-reduced-motion`: draws one static frame (contours + all
 * three balls parked at the global minimum) and stops.
 */
export function GradientDescentBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const isSmallScreen = window.innerWidth < 640;

    // --- Canvas sizing -------------------------------------------------
    let width = 0;
    let height = 0;
    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const toScreen = (x: number, y: number): [number, number] => [
      x * width,
      y * height,
    ];

    // --- Contours: sample once, extract once, cache the polylines ------
    const gridN = isSmallScreen ? { nx: 42, ny: 28 } : { nx: 64, ny: 42 };
    const grid = sampleGrid2D(gridN.nx, gridN.ny);
    const range = lossRange2D(60);
    const levelCount = isSmallScreen ? 5 : 7;
    const levels = Array.from(
      { length: levelCount },
      (_, i) => range.min + ((i + 1) / (levelCount + 1)) * (range.max - range.min),
    );
    const contourSegments = levels.flatMap((level) =>
      marchingSquares(grid, gridN.nx, gridN.ny, level),
    );

    // --- Colors ----------------------------------------------------------
    function readVar(name: string, fallback: string): string {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
      return v || fallback;
    }
    function colors() {
      return {
        contour: readVar("--contour", "rgba(255,255,255,0.09)"),
        sgd: readVar("--opt-sgd", "#fb923c"),
        momentum: readVar("--opt-momentum", "#a884ff"),
        adam: readVar("--opt-adam", "#22d3ee"),
      };
    }

    function drawContours(strokeColor: string) {
      ctx!.lineWidth = 1;
      ctx!.strokeStyle = strokeColor;
      ctx!.beginPath();
      for (const [x0, y0, x1, y1] of contourSegments) {
        const [sx0, sy0] = toScreen(x0, y0);
        const [sx1, sy1] = toScreen(x1, y1);
        ctx!.moveTo(sx0, sy0);
        ctx!.lineTo(sx1, sy1);
      }
      ctx!.stroke();
    }

    function drawGlobalMinOrb(t: number, intensity = 1) {
      const [gx, gy] = toScreen(GLOBAL_MIN_2D.x, GLOBAL_MIN_2D.y);
      if (!reduced) {
        for (let r = 0; r < 3; r++) {
          const phase = (t / 2.8 + r / 3) % 1;
          const radius = phase * 90;
          ctx!.beginPath();
          ctx!.arc(gx, gy, radius, 0, Math.PI * 2);
          ctx!.lineWidth = 1.2 * (1 - phase * 0.6);
          ctx!.strokeStyle = `rgba(168,132,255,${(1 - phase) * 0.35 * intensity})`;
          ctx!.stroke();
        }
      }
      const haloR = 56;
      const grad = ctx!.createRadialGradient(gx, gy, 0, gx, gy, haloR);
      grad.addColorStop(0, `rgba(168,132,255,${0.32 * intensity})`);
      grad.addColorStop(1, "rgba(168,132,255,0)");
      ctx!.fillStyle = grad;
      ctx!.beginPath();
      ctx!.arc(gx, gy, haloR, 0, Math.PI * 2);
      ctx!.fill();
    }

    // --- The race: SGD vs momentum vs Adam ------------------------------
    type Racer = {
      name: string;
      color: () => string;
      x: number;
      y: number;
      trail: [number, number][];
      settledSince: number | null;
      pulseUntil: number;
      wasConverged: boolean;
    };

    function randomStart(): { x: number; y: number } {
      return {
        x: 0.08 + Math.random() * 0.84,
        y: 0.08 + Math.random() * 0.84,
      };
    }

    let sgdState: SGDState2D = { x: 0.5, y: 0.5 };
    let momState: MomentumState2D = { x: 0.5, y: 0.5, vx: 0, vy: 0 };
    let adamState: AdamState2D = {
      x: 0.5,
      y: 0.5,
      mx: 0,
      my: 0,
      vx: 0,
      vy: 0,
      t: 0,
    };
    let racers: Racer[] = [];
    let raceStep = 0;
    let respawnAt = 0;

    function spawnRace(now: number) {
      // Each optimizer gets its own small jitter around a shared anchor, the
      // way separate training runs get their own initialization, so the
      // three occasionally land in different basins of the same landscape.
      const anchor = randomStart();
      const jitter = () => (Math.random() - 0.5) * 0.03;
      sgdState = { x: anchor.x + jitter(), y: anchor.y + jitter() };
      momState = {
        x: anchor.x + jitter(),
        y: anchor.y + jitter(),
        vx: 0,
        vy: 0,
      };
      adamState = {
        x: anchor.x + jitter(),
        y: anchor.y + jitter(),
        mx: 0,
        my: 0,
        vx: 0,
        vy: 0,
        t: 0,
      };
      racers = [
        {
          name: "SGD",
          color: () => colors().sgd,
          x: sgdState.x,
          y: sgdState.y,
          trail: [],
          settledSince: null,
          pulseUntil: 0,
          wasConverged: false,
        },
        {
          name: "momentum",
          color: () => colors().momentum,
          x: momState.x,
          y: momState.y,
          trail: [],
          settledSince: null,
          pulseUntil: 0,
          wasConverged: false,
        },
        {
          name: "Adam",
          color: () => colors().adam,
          x: adamState.x,
          y: adamState.y,
          trail: [],
          settledSince: null,
          pulseUntil: 0,
          wasConverged: false,
        },
      ];
      raceStep = 0;
      respawnAt = 0;
    }
    spawnRace(0);

    const SGD_OPTS = { lr: 0.006 };
    const MOM_OPTS = { lr: 0.006, beta: 0.85 };
    const ADAM_OPTS = { lr: 0.02 };
    const MAX_STEPS = 420;
    const SETTLE_GRAD_EPS = 0.012;
    const PAUSE_MS = 1400;

    function outOfBounds(x: number, y: number) {
      return x < -0.3 || x > 1.3 || y < -0.3 || y > 1.3;
    }

    function stepRace(now: number) {
      if (respawnAt) {
        if (now >= respawnAt) spawnRace(now);
        return;
      }

      sgdState = stepSGD2D(sgdState, SGD_OPTS);
      momState = stepMomentum2D(momState, MOM_OPTS);
      adamState = stepAdam2D(adamState, ADAM_OPTS);
      raceStep++;

      const live: [Racer, { x: number; y: number }][] = [
        [racers[0], sgdState],
        [racers[1], momState],
        [racers[2], adamState],
      ];

      let allSettledOrDone = true;
      for (const [racer, state] of live) {
        racer.x = state.x;
        racer.y = state.y;
        racer.trail.push([state.x, state.y]);
        if (racer.trail.length > 50) racer.trail.shift();

        const [gx, gy] = grad2D(state.x, state.y);
        const gnorm = Math.hypot(gx, gy);
        const settled = gnorm < SETTLE_GRAD_EPS || outOfBounds(state.x, state.y);
        if (settled && racer.settledSince === null) racer.settledSince = raceStep;
        if (!settled) allSettledOrDone = false;

        const nowConverged = converged2D(state);
        if (nowConverged && !racer.wasConverged) {
          racer.pulseUntil = now + 900;
        }
        racer.wasConverged = nowConverged;
      }

      if (allSettledOrDone || raceStep >= MAX_STEPS) {
        respawnAt = now + PAUSE_MS;
      }
    }

    // --- Passive hover (never captures clicks; canvas stays pointer-events-none) ---
    let mouseX = -9999;
    let mouseY = -9999;
    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }
    if (!reduced) window.addEventListener("mousemove", onMouseMove, { passive: true });

    // Optimizers this close together (or, often, converged to the same
    // basin) would otherwise stack exactly on top of one another, and
    // whichever is drawn last would fully hide the others. This tiny
    // constant per-racer screen offset (applied only to the rendered dot,
    // never to the underlying state used for physics or the hover readout)
    // keeps all three visible as a small fan instead of one hiding the rest.
    const RENDER_OFFSET: [number, number][] = [
      [-4, -4],
      [0, 5],
      [4, -4],
    ];

    function drawRacer(racer: Racer, now: number, idx: number) {
      const color = racer.color();
      const [rawX, rawY] = toScreen(racer.x, racer.y);
      const [ox, oy] = RENDER_OFFSET[idx];
      const bx = rawX + ox;
      const by = rawY + oy;

      // Trail (drawn at true, unoffset positions so it reads as this ball's
      // actual path; only the current-position marker gets nudged).
      const trail = racer.trail;
      for (let i = 0; i < trail.length; i++) {
        const fade = i / Math.max(1, trail.length - 1);
        const [tx, ty] = toScreen(trail[i][0], trail[i][1]);
        ctx!.beginPath();
        ctx!.arc(tx, ty, 1.3, 0, Math.PI * 2);
        ctx!.fillStyle = hexA(color, 0.05 + 0.22 * fade);
        ctx!.fill();
      }

      // Convergence pulse
      if (now < racer.pulseUntil) {
        const life = 1 - (racer.pulseUntil - now) / 900;
        ctx!.beginPath();
        ctx!.arc(bx, by, 6 + life * 26, 0, Math.PI * 2);
        ctx!.lineWidth = 1.5 * (1 - life);
        ctx!.strokeStyle = hexA(color, 0.5 * (1 - life));
        ctx!.stroke();
      }

      // Glow + ball
      const glow = ctx!.createRadialGradient(bx, by, 0, bx, by, 16);
      glow.addColorStop(0, hexA(color, 0.45));
      glow.addColorStop(1, hexA(color, 0));
      ctx!.fillStyle = glow;
      ctx!.beginPath();
      ctx!.arc(bx, by, 16, 0, Math.PI * 2);
      ctx!.fill();

      ctx!.beginPath();
      ctx!.arc(bx, by, 3.5, 0, Math.PI * 2);
      ctx!.fillStyle = hexA(color, 1);
      ctx!.fill();

      // Label: faint always, brighter within hover radius of the ball.
      const dist = Math.hypot(mouseX - bx, mouseY - by);
      const hovered = dist < 26;
      ctx!.font = "10px var(--font-mono), monospace";
      ctx!.fillStyle = hexA(color, hovered ? 0.95 : 0.4);
      const label = hovered
        ? `${racer.name} · L=${loss2D(racer.x, racer.y).toFixed(2)}`
        : racer.name;
      ctx!.fillText(label, bx + 8, by - 8);
    }

    function draw(now: number) {
      const c = colors();
      ctx!.clearRect(0, 0, width, height);
      drawContours(c.contour);
      drawGlobalMinOrb(now / 1000);

      // Draw still-moving racers first, settled (parked) ones last, so a
      // racer that's actively crossing the canvas can never paint over one
      // that has already come to rest nearby. Each racer keeps its own
      // fixed RENDER_OFFSET (looked up by original index) regardless of
      // this draw-order reshuffle, so its nudge direction stays consistent.
      const drawOrder = racers
        .map((racer, idx) => ({ racer, idx }))
        .sort((a, b) => {
          const aSettled = a.racer.settledSince !== null ? 1 : 0;
          const bSettled = b.racer.settledSince !== null ? 1 : 0;
          return aSettled - bSettled;
        });
      for (const { racer, idx } of drawOrder) drawRacer(racer, now, idx);
    }

    // --- Loop, paused (not skipped) while the tab is hidden -------------
    // The very first frame always paints regardless of visibility, so the
    // canvas is never left blank; only the *ongoing* rAF scheduling pauses
    // while backgrounded, resuming on the next visibilitychange.
    let rafId = 0;
    let loopRunning = false;

    function loop(now: number) {
      if (document.hidden) {
        loopRunning = false;
        return;
      }
      stepRace(now);
      draw(now);
      rafId = window.requestAnimationFrame(loop);
    }

    function onVisibility() {
      if (!document.hidden && !loopRunning && !reduced) {
        loopRunning = true;
        loop(performance.now());
      }
    }
    document.addEventListener("visibilitychange", onVisibility);

    if (reduced) {
      // Static frame: contours + all three balls parked at the minimum.
      for (const r of racers) {
        r.x = GLOBAL_MIN_2D.x;
        r.y = GLOBAL_MIN_2D.y;
      }
      draw(0);
    } else {
      // Paint immediately (covers the hidden-at-mount case too), then start
      // the animation loop only if the tab is actually visible.
      draw(performance.now());
      if (!document.hidden) {
        loopRunning = true;
        loop(performance.now());
      }
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
      {/* Soft vignette so hero/body text stays legible over the contours. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 50% 38%, var(--bg) 0%, transparent 70%)",
          opacity: 0.55,
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Marching squares: extract iso-contour line segments from a scalar grid.   */
/* -------------------------------------------------------------------------- */

/**
 * Standard 16-case marching squares. Corners of each cell are labeled
 * a (top-left), b (top-right), c (bottom-right), d (bottom-left); edges are
 * TOP (a-b), RIGHT (b-c), BOTTOM (d-c), LEFT (a-d). The case index packs
 * "is this corner above `level`" as bits a=8, b=4, c=2, d=1. Ambiguous
 * cases 5 and 10 (diagonal corners above) are resolved by treating the two
 * high corners as separate islands, a standard, if arbitrary, choice that
 * doesn't matter for a decorative topographic line.
 *
 * Returns flat segments `[x0, y0, x1, y1]` in the grid's normalized
 * [0, 1] × [0, 1] domain; the caller maps them to screen space.
 */
function marchingSquares(
  grid: Float64Array,
  nx: number,
  ny: number,
  level: number,
): [number, number, number, number][] {
  const segments: [number, number, number, number][] = [];

  const TOP = 0,
    RIGHT = 1,
    BOTTOM = 2,
    LEFT = 3;

  // clang-format-ish: case -> pairs of edges to connect (one or two segments).
  const CASES: Record<number, number[][]> = {
    1: [[LEFT, BOTTOM]],
    2: [[RIGHT, BOTTOM]],
    3: [[LEFT, RIGHT]],
    4: [[TOP, RIGHT]],
    5: [
      [TOP, RIGHT],
      [LEFT, BOTTOM],
    ],
    6: [[TOP, BOTTOM]],
    7: [[TOP, LEFT]],
    8: [[TOP, LEFT]],
    9: [[TOP, BOTTOM]],
    10: [
      [TOP, LEFT],
      [RIGHT, BOTTOM],
    ],
    11: [[TOP, RIGHT]],
    12: [[LEFT, RIGHT]],
    13: [[RIGHT, BOTTOM]],
    14: [[LEFT, BOTTOM]],
  };

  for (let j = 0; j < ny - 1; j++) {
    const y0 = j / (ny - 1);
    const y1 = (j + 1) / (ny - 1);
    for (let i = 0; i < nx - 1; i++) {
      const x0 = i / (nx - 1);
      const x1 = (i + 1) / (nx - 1);

      const a = grid[j * nx + i];
      const b = grid[j * nx + i + 1];
      const c = grid[(j + 1) * nx + i + 1];
      const d = grid[(j + 1) * nx + i];

      const idx =
        (a > level ? 8 : 0) |
        (b > level ? 4 : 0) |
        (c > level ? 2 : 0) |
        (d > level ? 1 : 0);
      const pairs = CASES[idx];
      if (!pairs) continue; // 0 or 15: cell entirely above or below level

      // Interpolated crossing point on each of the 4 edges, computed lazily.
      const pt = (edge: number): [number, number] => {
        if (edge === TOP) {
          const t = (level - a) / (b - a);
          return [x0 + t * (x1 - x0), y0];
        }
        if (edge === RIGHT) {
          const t = (level - b) / (c - b);
          return [x1, y0 + t * (y1 - y0)];
        }
        if (edge === BOTTOM) {
          const t = (level - d) / (c - d);
          return [x0 + t * (x1 - x0), y1];
        }
        // LEFT
        const t = (level - a) / (d - a);
        return [x0, y0 + t * (y1 - y0)];
      };

      for (const [e0, e1] of pairs) {
        const [px0, py0] = pt(e0);
        const [px1, py1] = pt(e1);
        segments.push([px0, py0, px1, py1]);
      }
    }
  }

  return segments;
}

/** Convert a `#rrggbb` hex color (or pass through rgb/rgba) to rgba(a). */
function hexA(color: string, a: number): string {
  if (!color.startsWith("#")) return color;
  const h = color.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : h;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}
