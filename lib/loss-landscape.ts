/**
 * A tiny 1-D loss landscape and gradient-descent optimizer.
 *
 * Pure and framework-free so it can be reasoned about (and unit-tested) in
 * isolation. `components/playable-descent.tsx` owns all rendering and screen
 * mapping; this module only knows about the abstract coordinate `x ∈ [0, 1]`
 * and the scalar loss `L(x)`.
 *
 * The landscape is a base bowl minus a set of Gaussian wells. Each well is a
 * local minimum; the deepest one is the global minimum. This gives the
 * "several valleys, one true bottom" shape the whole site leans on — and it's
 * shaped so the rendered curve reads like the mountains' ridge line (peaks =
 * high loss, valleys = minima).
 */

export type Well = { c: number; depth: number; s: number };

/**
 * Wells across x ∈ [0, 1]. `c` = center, `depth` = how far it pulls the curve
 * down, `s` = width (std-dev of the Gaussian). The well at c = 0.52 is by far
 * the deepest — the global minimum, roughly under where the orb already sits.
 */
export const WELLS: readonly Well[] = [
  { c: 0.13, depth: 0.42, s: 0.055 }, // shallow local min (far left)
  { c: 0.33, depth: 0.62, s: 0.07 }, // medium local min
  { c: 0.52, depth: 1.0, s: 0.075 }, // GLOBAL minimum
  { c: 0.71, depth: 0.5, s: 0.06 }, // local min
  { c: 0.88, depth: 0.34, s: 0.05 }, // shallow local min (far right)
];

/** Lifts the whole curve so loss stays comfortably positive. */
const BASE = 1.15;
/** Strength of the gentle bowl that raises the two edges. */
const BOWL = 0.25;

function gaussian(x: number, c: number, s: number): number {
  const d = (x - c) / s;
  return Math.exp(-0.5 * d * d);
}

/** The loss at position `x`. Lower is better. */
export function loss(x: number): number {
  let L = BASE + BOWL * (2 * x - 1) * (2 * x - 1);
  for (const w of WELLS) L -= w.depth * gaussian(x, w.c, w.s);
  return L;
}

/** Analytic derivative dL/dx — the gradient the optimizer descends. */
export function grad(x: number): number {
  // d/dx of the bowl: BOWL * 2(2x-1) * 2 = 4*BOWL*(2x-1)
  let g = 4 * BOWL * (2 * x - 1);
  for (const w of WELLS) {
    const gauss = gaussian(x, w.c, w.s);
    // d/dx[ -depth * gauss ] = depth * gauss * (x - c) / s^2
    g += (w.depth * gauss * (x - w.c)) / (w.s * w.s);
  }
  return g;
}

export type DescentState = { x: number; v: number };
export type DescentOpts = { lr: number; momentum: number };

/**
 * One step of gradient descent with (heavy-ball) momentum:
 *   v ← β·v − lr·∇L(x)
 *   x ← x + v
 * Deliberately unclamped: a large `lr` lets `x` overshoot past [0, 1] so the
 * UI can show genuine divergence.
 */
export function stepSGD(state: DescentState, opts: DescentOpts): DescentState {
  const g = grad(state.x);
  const v = opts.momentum * state.v - opts.lr * g;
  return { x: state.x + v, v };
}

/** Sample the curve at `n` evenly spaced points across [0, 1]. */
export function sampleCurve(n: number): { x: number; L: number }[] {
  const pts: { x: number; L: number }[] = [];
  for (let i = 0; i < n; i++) {
    const x = i / (n - 1);
    pts.push({ x, L: loss(x) });
  }
  return pts;
}

/** Min/max loss over [0, 1], for normalizing the vertical draw range. */
export function lossRange(samples = 400): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < samples; i++) {
    const L = loss(i / (samples - 1));
    if (L < min) min = L;
    if (L > max) max = L;
  }
  return { min, max };
}

/** The x of the global (deepest) minimum, found by a dense scan. */
export const GLOBAL_MIN_X: number = (() => {
  let bx = 0.5;
  let bl = Infinity;
  for (let i = 0; i <= 2000; i++) {
    const x = i / 2000;
    const L = loss(x);
    if (L < bl) {
      bl = L;
      bx = x;
    }
  }
  return bx;
})();

/** Center of the well nearest to `x` (approximate resting minimum). */
export function nearestMinimumX(x: number): number {
  let best = WELLS[0].c;
  let bestD = Infinity;
  for (const w of WELLS) {
    const d = Math.abs(w.c - x);
    if (d < bestD) {
      bestD = d;
      best = w.c;
    }
  }
  return best;
}

export type Verdict = "descending" | "converged" | "local-minimum" | "diverging";

/**
 * Classify the current state for the live readout.
 * - out of bounds → diverging
 * - still moving / steep → descending
 * - settled near the global min → converged
 * - settled elsewhere → stuck in a local minimum
 */
export function classify(
  state: DescentState,
  opts: { gradEps?: number; velEps?: number; globalTol?: number } = {},
): Verdict {
  const { x, v } = state;
  const gradEps = opts.gradEps ?? 0.04;
  const velEps = opts.velEps ?? 0.0015;
  const globalTol = opts.globalTol ?? 0.05;

  if (x < -0.05 || x > 1.05) return "diverging";

  const settled = Math.abs(grad(x)) < gradEps && Math.abs(v) < velEps;
  if (!settled) return "descending";

  return Math.abs(x - GLOBAL_MIN_X) < globalTol ? "converged" : "local-minimum";
}
