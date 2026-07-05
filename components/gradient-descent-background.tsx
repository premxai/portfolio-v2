"use client";

import { useEffect, useRef } from "react";
import {
  grad2D,
  lossRange2D,
  sampleGrid2D,
  GLOBAL_MIN_2D,
  stepAdam2D,
  type AdamState2D,
} from "@/lib/loss-landscape";

/**
 * Home page background: a live contour map of a real 2-D loss surface, with
 * a single ball descending it as you scroll.
 *
 * The descent path is not hand-drawn: it's the actual trajectory of Adam
 * (Kingma & Ba) run once, at mount, from a fixed starting point down to the
 * real global minimum (see PATH_START below; verified separately to sweep
 * across the canvas and genuinely converge, not just fall straight down).
 * Scroll position (0 → 1 down the page) maps directly onto that trajectory,
 * the same way the very first version of this background worked. The ball
 * only moves when you scroll it there; nothing here runs on its own or
 * jumps around independently, which is the whole point.
 *
 * The surface's contours are sampled on a grid once at mount and extracted
 * via marching squares (see `marchingSquares` below); the polylines are
 * cached, so that cost never repeats. Every frame only redraws the cached
 * contour strokes, the trail so far, and the ball.
 *
 * This layer is `pointer-events-none` and stays that way.
 *
 * Respects `prefers-reduced-motion`: the sonar-ring pulse at the minimum
 * stops animating, but the ball still updates its position on scroll (that
 * one-to-one link to a user's own scroll action isn't the kind of motion
 * the preference is meant to suppress; only the autoplaying pulse is).
 */

// Fixed starting point for the descent path (verified via a standalone
// check: Adam from here at lr = 0.03 sweeps ~60% of the canvas past a
// local basin before genuinely converging to the true global minimum in
// ~140 steps, not just falling straight into the nearest well).
const PATH_START = { x: 0.05, y: 0.5 };
const PATH_LR = 0.03;
const PATH_MAX_STEPS = 400;
const PATH_SETTLE_GRAD_EPS = 0.008;

function buildDescentPath(): { x: number; y: number }[] {
  let state: AdamState2D = {
    x: PATH_START.x,
    y: PATH_START.y,
    mx: 0,
    my: 0,
    vx: 0,
    vy: 0,
    t: 0,
  };
  const path: { x: number; y: number }[] = [{ x: state.x, y: state.y }];
  for (let i = 0; i < PATH_MAX_STEPS; i++) {
    state = stepAdam2D(state, { lr: PATH_LR });
    path.push({ x: state.x, y: state.y });
    const [gx, gy] = grad2D(state.x, state.y);
    if (Math.hypot(gx, gy) < PATH_SETTLE_GRAD_EPS) break;
  }
  return path;
}

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

    // --- The descent path: one real Adam trajectory, computed once -----
    const path = buildDescentPath();

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
        accent: readVar("--accent", "#fb923c"),
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

    // --- Scroll progress -------------------------------------------------
    let scrollProgress = 0;
    function updateScroll() {
      const max =
        (document.documentElement.scrollHeight ||
          document.body.scrollHeight) - window.innerHeight;
      scrollProgress =
        max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
    }
    updateScroll();

    // --- Trail + ball along the precomputed path ------------------------
    function drawPathAndBall(accent: string) {
      const idxFloat = scrollProgress * (path.length - 1);
      const idx = Math.floor(idxFloat);
      const frac = idxFloat - idx;
      const trailLen = Math.min(path.length, idx + 1);

      if (trailLen > 1) {
        for (let i = 0; i < trailLen - 1; i++) {
          const [x0, y0] = toScreen(path[i].x, path[i].y);
          const [x1, y1] = toScreen(path[i + 1].x, path[i + 1].y);
          const fade = i / Math.max(1, trailLen - 1);
          ctx!.lineWidth = 1 + 0.6 * fade;
          ctx!.strokeStyle = hexA(accent, 0.2 + 0.55 * fade);
          ctx!.beginPath();
          ctx!.moveTo(x0, y0);
          ctx!.lineTo(x1, y1);
          ctx!.stroke();
        }

        const stride = Math.max(4, Math.floor(path.length / 32));
        for (let i = 0; i < trailLen; i += stride) {
          const [x, y] = toScreen(path[i].x, path[i].y);
          const fade = i / Math.max(1, trailLen - 1);
          ctx!.beginPath();
          ctx!.arc(x, y, 1.8 + 1.2 * fade, 0, Math.PI * 2);
          ctx!.fillStyle = hexA(accent, 0.4 + 0.55 * fade);
          ctx!.fill();
        }
      }

      const headIdx = Math.min(path.length - 1, idx);
      const nextIdx = Math.min(path.length - 1, idx + 1);
      const pHead = path[headIdx];
      const pNext = path[nextIdx];
      const headX = pHead.x + (pNext.x - pHead.x) * frac;
      const headY = pHead.y + (pNext.y - pHead.y) * frac;
      const [bx, by] = toScreen(headX, headY);

      const halo = ctx!.createRadialGradient(bx, by, 0, bx, by, 26);
      halo.addColorStop(0, hexA(accent, 0.55));
      halo.addColorStop(1, hexA(accent, 0));
      ctx!.fillStyle = halo;
      ctx!.beginPath();
      ctx!.arc(bx, by, 26, 0, Math.PI * 2);
      ctx!.fill();

      ctx!.beginPath();
      ctx!.arc(bx, by, 4, 0, Math.PI * 2);
      ctx!.fillStyle = hexA(accent, 1);
      ctx!.fill();
    }

    // The orb is the descent's destination: hidden until the user has
    // scrolled most of the way there, then revealed over the last stretch
    // so it reads as a "you've arrived" moment.
    const REVEAL_START = 0.85;
    function drawMinimumOrb(t: number) {
      const reveal = Math.min(
        1,
        Math.max(0, (scrollProgress - REVEAL_START) / (1 - REVEAL_START)),
      );
      if (reveal <= 0) return;
      const eased = reveal * reveal * reveal;

      const [gx, gy] = toScreen(GLOBAL_MIN_2D.x, GLOBAL_MIN_2D.y);
      const pulse = reduced ? 1 : 0.85 + 0.15 * Math.sin(t * 1.6);

      if (!reduced) {
        const RING_PERIOD = 2.8;
        const RING_MAX_R = 130;
        for (let r = 0; r < 3; r++) {
          const phase = (t / RING_PERIOD + r / 3) % 1;
          const radius = phase * RING_MAX_R;
          const ringAlpha = (1 - phase) * 0.55 * eased;
          ctx!.lineWidth = 1.4 * (1 - phase * 0.6);
          ctx!.strokeStyle = `rgba(168, 132, 255, ${ringAlpha})`;
          ctx!.beginPath();
          ctx!.arc(gx, gy, radius, 0, Math.PI * 2);
          ctx!.stroke();
        }
      }

      const haloR = 80 * pulse;
      const grad = ctx!.createRadialGradient(gx, gy, 0, gx, gy, haloR);
      grad.addColorStop(0, `rgba(168, 132, 255, ${0.55 * pulse * eased})`);
      grad.addColorStop(0.4, `rgba(168, 132, 255, ${0.18 * pulse * eased})`);
      grad.addColorStop(1, "rgba(168, 132, 255, 0)");
      ctx!.fillStyle = grad;
      ctx!.beginPath();
      ctx!.arc(gx, gy, haloR, 0, Math.PI * 2);
      ctx!.fill();

      ctx!.fillStyle = `rgba(220, 200, 255, ${0.95 * pulse * eased})`;
      ctx!.beginPath();
      ctx!.arc(gx, gy, 5.5, 0, Math.PI * 2);
      ctx!.fill();
    }

    function draw(now: number) {
      const c = colors();
      ctx!.clearRect(0, 0, width, height);
      drawContours(c.contour);
      drawPathAndBall(c.accent);
      drawMinimumOrb(now / 1000);
    }

    // --- Loop: rAF only drives the sonar-ring pulse; ball position is a
    // pure function of scrollProgress. `onScroll` always redraws immediately
    // so the ball stays responsive to actual scrolling even if the pulse
    // loop is paused (tab hidden) or never got a chance to run at all (some
    // environments report the tab hidden from the very first frame).
    let rafId = 0;
    function loop(now: number) {
      if (document.hidden) return;
      draw(now);
      rafId = window.requestAnimationFrame(loop);
    }
    function onScroll() {
      updateScroll();
      draw(performance.now());
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    function onVisibility() {
      if (!document.hidden && !reduced) {
        window.cancelAnimationFrame(rafId);
        loop(performance.now());
      }
    }
    document.addEventListener("visibilitychange", onVisibility);

    // Always paint at least one frame regardless of visibility, so the
    // canvas is never left blank; only the *ongoing* pulse animation is
    // gated behind "not reduced and not hidden".
    draw(performance.now());
    if (!reduced && !document.hidden) {
      loop(performance.now());
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
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
