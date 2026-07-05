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
 * "several valleys, one true bottom" shape the whole site leans on: peaks
 * read as high loss, valleys as minima.
 */

export type Well = { c: number; depth: number; s: number };

/**
 * Wells across x ∈ [0, 1]. `c` = center, `depth` = how far it pulls the curve
 * down, `s` = width (std-dev of the Gaussian). The well at c = 0.52 is by far
 * the deepest: the global minimum, roughly under where the orb already sits.
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

/** Analytic derivative dL/dx: the gradient the optimizer descends. */
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

/* -------------------------------------------------------------------------- */
/*  2-D loss surface + a race between three real optimizers.                  */
/*                                                                            */
/*  Powers the home page background: a static contour map (rendered via      */
/*  marching squares in components/gradient-descent-background.tsx) with     */
/*  three balls descending it, each stepping its own textbook update rule     */
/*  (SGD, Polyak heavy-ball momentum, Adam) against the shared analytic       */
/*  gradient. The 1-D surface above is unrelated and keeps powering the       */
/*  hands-on overlay lab in components/playable-descent.tsx.                 */
/* -------------------------------------------------------------------------- */

export type Well2D = {
  cx: number;
  cy: number;
  depth: number;
  sx: number;
  sy: number;
};

/**
 * Five wells across the unit square, mirroring the shape of the 1-D
 * landscape: four local minima at varying depth and one clearly deepest
 * global minimum. Isotropic (sx = sy) so each basin reads as a round bowl
 * in the rendered contours.
 */
export const WELLS_2D: readonly Well2D[] = [
  { cx: 0.18, cy: 0.72, depth: 0.42, sx: 0.09, sy: 0.09 }, // shallow local min
  { cx: 0.3, cy: 0.3, depth: 0.62, sx: 0.1, sy: 0.09 }, // medium local min
  { cx: 0.68, cy: 0.62, depth: 1.0, sx: 0.11, sy: 0.1 }, // GLOBAL minimum
  { cx: 0.82, cy: 0.28, depth: 0.5, sx: 0.09, sy: 0.08 }, // local min
  { cx: 0.5, cy: 0.87, depth: 0.34, sx: 0.08, sy: 0.07 }, // shallow local min
];

type Saddle2D = {
  cx: number;
  cy: number;
  h: number;
  sx: number;
  sy: number;
  s0: number;
};

/**
 * A single genuine saddle point sitting on the path between the medium
 * local minimum and the global minimum. Constructed as a hyperbolic
 * (positive-along-x, negative-along-y) bump inside a Gaussian envelope: at
 * the center, the envelope's own gradient vanishes, so the Hessian of the
 * product reduces to the Hessian of the hyperbolic term alone,
 * diag(+2h/sx², −2h/sy²). Mixed-sign eigenvalues are the definition of a
 * saddle; this is verified numerically alongside the gradient check.
 *
 * Plain SGD slows to a crawl in the near-zero-gradient flat direction here;
 * momentum's accumulated velocity and Adam's per-axis adaptive step both
 * carry through it far faster. That's the textbook difference the race is
 * built to show, not a scripted animation.
 */
const SADDLE_2D: Saddle2D = {
  cx: 0.49,
  cy: 0.46,
  h: 0.35,
  sx: 0.14,
  sy: 0.11,
  s0: 0.16,
};

const BASE_2D = 1.3;
const BOWL_2D = 0.2;

function gaussian2D(
  x: number,
  y: number,
  cx: number,
  cy: number,
  sx: number,
  sy: number,
): number {
  const dx = (x - cx) / sx;
  const dy = (y - cy) / sy;
  return Math.exp(-0.5 * (dx * dx + dy * dy));
}

/** The loss at (x, y). Lower is better. Domain is nominally [0, 1] × [0, 1]. */
export function loss2D(x: number, y: number): number {
  let L = BASE_2D + BOWL_2D * ((x - 0.5) ** 2 + (y - 0.5) ** 2);
  for (const w of WELLS_2D) L -= w.depth * gaussian2D(x, y, w.cx, w.cy, w.sx, w.sy);

  const s = SADDLE_2D;
  const f = s.h * (((x - s.cx) / s.sx) ** 2 - ((y - s.cy) / s.sy) ** 2);
  const g = gaussian2D(x, y, s.cx, s.cy, s.s0, s.s0);
  L += f * g;

  return L;
}

/** Analytic gradient [∂L/∂x, ∂L/∂y], verified against numeric differences. */
export function grad2D(x: number, y: number): [number, number] {
  let gx = 2 * BOWL_2D * (x - 0.5);
  let gy = 2 * BOWL_2D * (y - 0.5);

  for (const w of WELLS_2D) {
    const gauss = gaussian2D(x, y, w.cx, w.cy, w.sx, w.sy);
    // d/dx[-depth * gauss] = depth * gauss * (x - cx) / sx^2 (and similarly y).
    gx += (w.depth * gauss * (x - w.cx)) / (w.sx * w.sx);
    gy += (w.depth * gauss * (y - w.cy)) / (w.sy * w.sy);
  }

  const s = SADDLE_2D;
  const dx = x - s.cx;
  const dy = y - s.cy;
  const f = s.h * ((dx / s.sx) ** 2 - (dy / s.sy) ** 2);
  const g = gaussian2D(x, y, s.cx, s.cy, s.s0, s.s0);
  // Product rule on f(x,y)*g(x,y): d/dx = f_x*g + f*g_x, d/dy = f_y*g + f*g_y.
  const fx = (2 * s.h * dx) / (s.sx * s.sx);
  const fy = (-2 * s.h * dy) / (s.sy * s.sy);
  const gx_ = g * (-dx / (s.s0 * s.s0));
  const gy_ = g * (-dy / (s.s0 * s.s0));
  gx += fx * g + f * gx_;
  gy += fy * g + f * gy_;

  return [gx, gy];
}

/** Min/max loss over the unit square, for normalizing contour levels. */
export function lossRange2D(samplesPerAxis = 90): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < samplesPerAxis; i++) {
    const x = i / (samplesPerAxis - 1);
    for (let j = 0; j < samplesPerAxis; j++) {
      const y = j / (samplesPerAxis - 1);
      const L = loss2D(x, y);
      if (L < min) min = L;
      if (L > max) max = L;
    }
  }
  return { min, max };
}

/** Sample loss2D on an `nx` × `ny` regular grid over [0, 1] × [0, 1]. */
export function sampleGrid2D(nx: number, ny: number): Float64Array {
  const grid = new Float64Array(nx * ny);
  for (let j = 0; j < ny; j++) {
    const y = j / (ny - 1);
    for (let i = 0; i < nx; i++) {
      const x = i / (nx - 1);
      grid[j * nx + i] = loss2D(x, y);
    }
  }
  return grid;
}

/** The (x, y) of the global (deepest) minimum, found by a dense scan. */
export const GLOBAL_MIN_2D: { x: number; y: number } = (() => {
  const samples = 400;
  let bx = 0.5;
  let by = 0.5;
  let bl = Infinity;
  for (let i = 0; i <= samples; i++) {
    const x = i / samples;
    for (let j = 0; j <= samples; j++) {
      const y = j / samples;
      const L = loss2D(x, y);
      if (L < bl) {
        bl = L;
        bx = x;
        by = y;
      }
    }
  }
  return { x: bx, y: by };
})();

export function converged2D(
  p: { x: number; y: number },
  tol = 0.05,
): boolean {
  const dx = p.x - GLOBAL_MIN_2D.x;
  const dy = p.y - GLOBAL_MIN_2D.y;
  return Math.sqrt(dx * dx + dy * dy) < tol;
}

/* ---- Optimizer states + exact update rules -------------------------------- */

export type Point2D = { x: number; y: number };
export type SGDState2D = Point2D;
export type MomentumState2D = Point2D & { vx: number; vy: number };
export type AdamState2D = Point2D & {
  mx: number;
  my: number;
  vx: number;
  vy: number;
  t: number;
};

/** Box-Muller standard normal sample, used only for SGD's optional noise. */
function randn(rng: () => number = Math.random): number {
  const u1 = Math.max(rng(), 1e-12);
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Plain (optionally stochastic) gradient descent: θ ← θ − lr·∇L(θ).
 * `noise` (std-dev of injected Gaussian gradient noise) defaults to 0, so
 * the function is deterministic unless a caller opts into the "S" in SGD.
 */
export function stepSGD2D(
  state: SGDState2D,
  opts: { lr: number; noise?: number; rng?: () => number },
): SGDState2D {
  const [gx, gy] = grad2D(state.x, state.y);
  const n = opts.noise ?? 0;
  const rng = opts.rng ?? Math.random;
  const nx = n > 0 ? randn(rng) * n : 0;
  const ny = n > 0 ? randn(rng) * n : 0;
  return {
    x: state.x - opts.lr * gx + nx,
    y: state.y - opts.lr * gy + ny,
  };
}

/**
 * Polyak heavy-ball momentum: v ← β·v − lr·∇L(θ); θ ← θ + v.
 */
export function stepMomentum2D(
  state: MomentumState2D,
  opts: { lr: number; beta: number },
): MomentumState2D {
  const [gx, gy] = grad2D(state.x, state.y);
  const vx = opts.beta * state.vx - opts.lr * gx;
  const vy = opts.beta * state.vy - opts.lr * gy;
  return { x: state.x + vx, y: state.y + vy, vx, vy };
}

/**
 * Adam (Kingma & Ba, 2014): bias-corrected first/second moment estimates,
 * per-axis adaptive step. Defaults (β1 = 0.9, β2 = 0.999, ε = 1e-8) match
 * the paper.
 */
export function stepAdam2D(
  state: AdamState2D,
  opts: { lr: number; b1?: number; b2?: number; eps?: number },
): AdamState2D {
  const b1 = opts.b1 ?? 0.9;
  const b2 = opts.b2 ?? 0.999;
  const eps = opts.eps ?? 1e-8;
  const [gx, gy] = grad2D(state.x, state.y);

  const t = state.t + 1;
  const mx = b1 * state.mx + (1 - b1) * gx;
  const my = b1 * state.my + (1 - b1) * gy;
  const vx = b2 * state.vx + (1 - b2) * gx * gx;
  const vy = b2 * state.vy + (1 - b2) * gy * gy;

  const mxHat = mx / (1 - b1 ** t);
  const myHat = my / (1 - b1 ** t);
  const vxHat = vx / (1 - b2 ** t);
  const vyHat = vy / (1 - b2 ** t);

  return {
    x: state.x - (opts.lr * mxHat) / (Math.sqrt(vxHat) + eps),
    y: state.y - (opts.lr * myHat) / (Math.sqrt(vyHat) + eps),
    mx,
    my,
    vx,
    vy,
    t,
  };
}
