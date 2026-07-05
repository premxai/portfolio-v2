"use client";

import { useEffect, useRef } from "react";
import {
  grad2D,
  lossRange2D,
  sampleGrid2D,
  GLOBAL_MIN_2D,
  WELLS_2D,
  stepAdam2D,
  type AdamState2D,
} from "@/lib/loss-landscape";

/**
 * Home page background: an annotated contour plot of a real 2-D loss
 * surface, with a single ball descending it as you scroll.
 *
 * The descent path is not hand-drawn: it's the actual trajectory of Adam
 * (Kingma & Ba) run once, at mount, from a fixed starting point down to the
 * real global minimum (see PATH_START below). Scroll position (0 to 1 down
 * the page) maps directly onto that trajectory. The ball only moves when
 * you scroll it there; nothing runs on its own or jumps around.
 *
 * Rendering is split into two layers for both quality and speed:
 *
 *   Static layer (offscreen canvas, rendered once per resize/theme change):
 *     minor + major contour lines via marching squares, inline loss-value
 *     labels on the major contours (matplotlib clabel style), a warm tint
 *     on the contours closest to the minima, small × markers on the local
 *     minima, a target marker on the global minimum, a θ₀ marker at the
 *     initialization point, and a faint dashed preview of the full
 *     trajectory so the route reads at a glance before you scroll.
 *
 *   Dynamic layer (every frame): the cached static image, the comet-style
 *     traveled trail with per-iterate step dots, the ball, and the
 *     destination orb reveal near the end of the scroll.
 *
 * Scroll input is smoothed with a tight, fast-settling exponential ease
 * (about a quarter second) so the ball rolls rather than teleporting on
 * fast scrolls; it remains a pure function of the scroll target and stops
 * the moment it reaches it.
 *
 * This layer is `pointer-events-none` and stays that way.
 *
 * Respects `prefers-reduced-motion`: the pulse and the easing are disabled
 * (position snaps directly to the scroll target), and nothing autoplays.
 */

// Fixed starting point for the descent path. Chosen by a grid search over
// candidate starts (run standalone against the real engine): from here,
// Adam at lr = 0.035 stays fully inside the visible domain, sweeps down
// through the valley, overshoots the global minimum in classic Adam
// fashion, and swings back to converge on it. The convergence-jitter tail
// is trimmed (see buildDescentPath) so the trajectory ends the moment it
// truly arrives.
const PATH_START = { x: 0.3, y: 0.55 };
const PATH_LR = 0.035;
const PATH_MAX_STEPS = 400;
const PATH_SETTLE_GRAD_EPS = 0.008;
// First point closer to the endpoint than this is where the tail is cut.
const PATH_TAIL_TRIM_RADIUS = 0.015;

// Canvas-safe monospace stack. Canvas font strings can't resolve CSS
// variables like var(--font-mono), so this mirrors the site's mono stack.
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

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

  // Trim the convergence tail: once the iterates are jittering within a
  // hair of the final point, the remaining steps add arc length without
  // adding motion, which (under arc-length scroll mapping) would park the
  // ball for a large fraction of the page. Cut at the first pass through
  // the trim radius and pin the exact endpoint.
  const end = path[path.length - 1];
  let cut = path.length - 1;
  for (let i = 0; i < path.length; i++) {
    if (
      Math.hypot(path[i].x - end.x, path[i].y - end.y) < PATH_TAIL_TRIM_RADIUS
    ) {
      cut = i;
      break;
    }
  }
  const trimmed = path.slice(0, cut + 1);
  trimmed.push(end);
  return trimmed;
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

    // Offscreen canvas holding everything that doesn't change per frame.
    const staticCanvas = document.createElement("canvas");
    const sctx = staticCanvas.getContext("2d")!;

    // --- Canvas sizing -------------------------------------------------
    let width = 0;
    let height = 0;
    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      for (const [cv, c2] of [
        [canvas!, ctx!],
        [staticCanvas, sctx],
      ] as const) {
        cv.width = Math.floor(width * dpr);
        cv.height = Math.floor(height * dpr);
        c2.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      renderStatic();
    }

    const toScreen = (x: number, y: number): [number, number] => [
      x * width,
      y * height,
    ];

    // --- Contours: sample once, extract once, cache per level ----------
    const gridN = isSmallScreen ? { nx: 48, ny: 32 } : { nx: 96, ny: 60 };
    const grid = sampleGrid2D(gridN.nx, gridN.ny);
    const range = lossRange2D(80);
    const levelCount = isSmallScreen ? 6 : 12;
    const levels = Array.from(
      { length: levelCount },
      (_, i) =>
        range.min + ((i + 1) / (levelCount + 1)) * (range.max - range.min),
    );
    // Kept per level (not flattened) so majors, heat tint, and labels can
    // treat each iso-line differently.
    const levelSegs = levels.map((level) => ({
      level,
      segs: marchingSquares(grid, gridN.nx, gridN.ny, level),
    }));
    // Every 3rd level is a "major" contour: stroked darker and labeled,
    // the way topographic maps emphasize index contours.
    const isMajor = (i: number) => i % 3 === 2;

    // --- The descent path: one real Adam trajectory, computed once -----
    const path = buildDescentPath();

    // Arc-length table over the trajectory. Scroll maps to distance along
    // the curve rather than to raw step index: Adam's early strides are
    // huge and its converging steps are tiny, so a by-index mapping parks
    // the ball near the minimum less than halfway down the page. With
    // arc-length parametrization the ball is visibly rolling for the whole
    // scroll and lands exactly at the bottom. The per-iterate step dots
    // still come from the raw path, so the true step-size physics stays
    // readable in their spacing.
    const cumLen: number[] = [0];
    for (let i = 1; i < path.length; i++) {
      cumLen.push(
        cumLen[i - 1] +
          Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y),
      );
    }
    const totalLen = cumLen[cumLen.length - 1];

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
        subtle: readVar("--fg-subtle", "#6b6b6b"),
      };
    }

    /* ---- Static layer --------------------------------------------------- */

    function strokeSegs(
      c2: CanvasRenderingContext2D,
      segs: [number, number, number, number][],
      style: string,
      lineWidth: number,
    ) {
      c2.lineWidth = lineWidth;
      c2.strokeStyle = style;
      c2.beginPath();
      for (const [x0, y0, x1, y1] of segs) {
        const [sx0, sy0] = toScreen(x0, y0);
        const [sx1, sy1] = toScreen(x1, y1);
        c2.moveTo(sx0, sy0);
        c2.lineTo(sx1, sy1);
      }
      c2.stroke();
    }

    // Inline loss-value labels on major contours, matplotlib clabel style:
    // find a segment near a preset anchor, clear a small gap in the line,
    // and draw the value rotated to the contour's local direction.
    const LABEL_ANCHORS: [number, number][] = [
      [0.2, 0.32],
      [0.8, 0.7],
      [0.32, 0.8],
      [0.7, 0.22],
    ];
    function drawContourLabels(c: ReturnType<typeof colors>) {
      let majorIdx = 0;
      for (let i = 0; i < levelSegs.length; i++) {
        if (!isMajor(i)) continue;
        const { level, segs } = levelSegs[i];
        const anchor = LABEL_ANCHORS[majorIdx % LABEL_ANCHORS.length];
        majorIdx++;
        if (segs.length === 0) continue;

        let best = segs[0];
        let bestD = Infinity;
        for (const s of segs) {
          const mx = (s[0] + s[2]) / 2;
          const my = (s[1] + s[3]) / 2;
          const d = Math.hypot(mx - anchor[0], my - anchor[1]);
          if (d < bestD) {
            bestD = d;
            best = s;
          }
        }

        const [sx0, sy0] = toScreen(best[0], best[1]);
        const [sx1, sy1] = toScreen(best[2], best[3]);
        const mx = (sx0 + sx1) / 2;
        const my = (sy0 + sy1) / 2;
        let ang = Math.atan2(sy1 - sy0, sx1 - sx0);
        if (ang > Math.PI / 2) ang -= Math.PI;
        if (ang < -Math.PI / 2) ang += Math.PI;

        const text = level.toFixed(2);
        sctx.save();
        sctx.translate(mx, my);
        sctx.rotate(ang);
        sctx.font = `9px ${MONO}`;
        const w = sctx.measureText(text).width;
        // Knock a gap out of the contour line so the label sits inline.
        sctx.clearRect(-w / 2 - 3, -6, w + 6, 12);
        sctx.textAlign = "center";
        sctx.textBaseline = "middle";
        sctx.fillStyle = hexA(c.subtle, 0.75);
        sctx.fillText(text, 0, 0);
        sctx.restore();
      }
    }

    function drawMinimaMarkers(c: ReturnType<typeof colors>) {
      const label = (text: string, x: number, y: number, color: string) => {
        if (isSmallScreen) return;
        sctx.font = `9px ${MONO}`;
        sctx.textAlign = "left";
        sctx.textBaseline = "middle";
        sctx.fillStyle = color;
        sctx.fillText(text, x, y);
      };

      // Local minima: small × marks. One gets a teaching label.
      let labeled = false;
      for (const w of WELLS_2D) {
        const isGlobal =
          Math.hypot(w.cx - GLOBAL_MIN_2D.x, w.cy - GLOBAL_MIN_2D.y) < 0.06;
        if (isGlobal) continue;
        const [mx, my] = toScreen(w.cx, w.cy);
        sctx.lineWidth = 1;
        sctx.strokeStyle = hexA(c.subtle, 0.55);
        sctx.beginPath();
        sctx.moveTo(mx - 4, my - 4);
        sctx.lineTo(mx + 4, my + 4);
        sctx.moveTo(mx + 4, my - 4);
        sctx.lineTo(mx - 4, my + 4);
        sctx.stroke();
        // Label the deepest local well so the pattern reads once, everywhere.
        if (!labeled && Math.abs(w.depth - 0.62) < 0.01) {
          label("local min", mx + 9, my - 8, hexA(c.subtle, 0.6));
          labeled = true;
        }
      }

      // Global minimum: a quiet target marker, present even before the
      // orb reveal so the destination is legible from the first glance.
      {
        const [gx, gy] = toScreen(GLOBAL_MIN_2D.x, GLOBAL_MIN_2D.y);
        sctx.lineWidth = 1;
        sctx.strokeStyle = "rgba(168, 132, 255, 0.5)";
        for (const r of [3.5, 8.5]) {
          sctx.beginPath();
          sctx.arc(gx, gy, r, 0, Math.PI * 2);
          sctx.stroke();
        }
        sctx.fillStyle = "rgba(168, 132, 255, 0.7)";
        sctx.beginPath();
        sctx.arc(gx, gy, 1.5, 0, Math.PI * 2);
        sctx.fill();
        label("global min", gx + 13, gy - 10, "rgba(168, 132, 255, 0.65)");
      }

      // θ₀: the initialization point the descent starts from.
      {
        const [px, py] = toScreen(PATH_START.x, PATH_START.y);
        sctx.lineWidth = 1;
        sctx.strokeStyle = hexA(c.accent, 0.6);
        sctx.beginPath();
        sctx.arc(px, py, 5, 0, Math.PI * 2);
        sctx.stroke();
        label("θ₀", px + 10, py + 1, hexA(c.subtle, 0.75));
      }
    }

    // Faint dashed preview of the full trajectory: the route the ball will
    // take is visible before any scrolling, which is what makes the whole
    // interaction legible at a glance.
    function drawPathPreview(c: ReturnType<typeof colors>) {
      sctx.setLineDash([2, 6]);
      sctx.lineWidth = 1;
      sctx.strokeStyle = hexA(c.accent, 0.16);
      sctx.beginPath();
      const [x0, y0] = toScreen(path[0].x, path[0].y);
      sctx.moveTo(x0, y0);
      for (let i = 1; i < path.length; i++) {
        const [x, y] = toScreen(path[i].x, path[i].y);
        sctx.lineTo(x, y);
      }
      sctx.stroke();
      sctx.setLineDash([]);
    }

    function renderStatic() {
      const c = colors();
      sctx.clearRect(0, 0, width, height);

      for (let i = 0; i < levelSegs.length; i++) {
        const { segs } = levelSegs[i];
        strokeSegs(sctx, segs, c.contour, 1);
        // Second pass on majors compounds the alpha: an index contour.
        if (isMajor(i)) strokeSegs(sctx, segs, c.contour, 1);
        // Warm tint on the contours closest to the minima, so "downhill"
        // reads as approaching heat.
        if (i < 3) strokeSegs(sctx, segs, hexA(c.accent, 0.14 - i * 0.04), 1);
      }

      if (!isSmallScreen) drawContourLabels(c);
      drawPathPreview(c);
      drawMinimaMarkers(c);
    }

    resize();
    window.addEventListener("resize", resize);

    // Re-render the static layer when the theme flips (next-themes swaps
    // the data-theme attribute on <html>).
    const themeObserver = new MutationObserver(() => {
      renderStatic();
      draw(performance.now());
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    /* ---- Scroll progress, with a tight ease ----------------------------- */

    let targetProgress = 0;
    let shownProgress = 0;
    function updateScroll() {
      const max =
        (document.documentElement.scrollHeight ||
          document.body.scrollHeight) - window.innerHeight;
      targetProgress =
        max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
    }
    updateScroll();
    shownProgress = targetProgress;

    /* ---- Dynamic layer --------------------------------------------------- */

    function drawPathAndBall(accent: string) {
      // Locate the point at `shownProgress` of the way along the curve's
      // arc length (binary search over the cumulative-length table).
      const s = shownProgress * totalLen;
      let lo = 0;
      let hi = cumLen.length - 1;
      while (lo < hi - 1) {
        const mid = (lo + hi) >> 1;
        if (cumLen[mid] <= s) lo = mid;
        else hi = mid;
      }
      const idx = lo;
      const segLen = cumLen[idx + 1] - cumLen[idx];
      const frac = segLen > 0 ? (s - cumLen[idx]) / segLen : 0;
      const trailLen = Math.min(path.length, idx + 1);

      if (trailLen > 1) {
        // Comet body: the traveled polyline, brightening and thickening
        // toward the head, round joins so corners in the trajectory keep
        // their energy without looking jagged.
        ctx!.lineCap = "round";
        ctx!.lineJoin = "round";
        for (let i = 0; i < trailLen - 1; i++) {
          const [x0, y0] = toScreen(path[i].x, path[i].y);
          const [x1, y1] = toScreen(path[i + 1].x, path[i + 1].y);
          const fade = i / Math.max(1, trailLen - 1);
          ctx!.lineWidth = 1 + 1.4 * fade;
          ctx!.strokeStyle = hexA(accent, 0.16 + 0.6 * fade);
          ctx!.beginPath();
          ctx!.moveTo(x0, y0);
          ctx!.lineTo(x1, y1);
          ctx!.stroke();
        }

        // Step dots: one per Adam iterate, the way optimizer trajectories
        // are drawn in papers. The spacing is the physics: long strides
        // early, tightening as the gradient flattens near the minimum.
        const stride = isSmallScreen ? 2 : 1;
        for (let i = 0; i < trailLen; i += stride) {
          const [x, y] = toScreen(path[i].x, path[i].y);
          const fade = i / Math.max(1, trailLen - 1);
          ctx!.beginPath();
          ctx!.arc(x, y, 1.2 + 0.8 * fade, 0, Math.PI * 2);
          ctx!.fillStyle = hexA(accent, 0.25 + 0.5 * fade);
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

      const halo = ctx!.createRadialGradient(bx, by, 0, bx, by, 28);
      halo.addColorStop(0, hexA(accent, 0.55));
      halo.addColorStop(1, hexA(accent, 0));
      ctx!.fillStyle = halo;
      ctx!.beginPath();
      ctx!.arc(bx, by, 28, 0, Math.PI * 2);
      ctx!.fill();

      ctx!.beginPath();
      ctx!.arc(bx, by, 4.5, 0, Math.PI * 2);
      ctx!.fillStyle = hexA(accent, 1);
      ctx!.fill();
      // Specular center so the ball reads as a body, not a dot.
      ctx!.beginPath();
      ctx!.arc(bx - 1, by - 1, 1.6, 0, Math.PI * 2);
      ctx!.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx!.fill();
    }

    // The orb is the descent's destination: hidden until the user has
    // scrolled most of the way there, then revealed over the last stretch
    // so it reads as a "you've arrived" moment.
    const REVEAL_START = 0.85;
    function drawMinimumOrb(t: number) {
      const reveal = Math.min(
        1,
        Math.max(0, (shownProgress - REVEAL_START) / (1 - REVEAL_START)),
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
      // The whole static annotated terrain in one blit.
      ctx!.drawImage(staticCanvas, 0, 0, width, height);
      drawPathAndBall(c.accent);
      drawMinimumOrb(now / 1000);
    }

    /* ---- Loop ------------------------------------------------------------ */

    // rAF drives two things: the sonar-ring pulse and the short ease of
    // shownProgress toward targetProgress. The ease settles in roughly a
    // quarter second and then shownProgress equals the target exactly, so
    // the ball is always a function of scroll, never autonomous. `onScroll`
    // also redraws immediately (with a snap when the loop can't run) so the
    // ball stays responsive even when the tab reports itself hidden.
    let rafId = 0;
    let lastNow = 0;
    function loop(now: number) {
      if (document.hidden) return;
      const dt = Math.min(0.05, Math.max(0, (now - lastNow) / 1000));
      lastNow = now;
      const diff = targetProgress - shownProgress;
      if (Math.abs(diff) < 0.0004) {
        shownProgress = targetProgress;
      } else {
        shownProgress += diff * (1 - Math.exp(-dt * 16));
      }
      draw(now);
      rafId = window.requestAnimationFrame(loop);
    }
    function onScroll() {
      updateScroll();
      if (reduced || document.hidden) {
        shownProgress = targetProgress;
      }
      draw(performance.now());
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    function onVisibility() {
      if (!document.hidden && !reduced) {
        window.cancelAnimationFrame(rafId);
        lastNow = performance.now();
        loop(lastNow);
      }
    }
    document.addEventListener("visibilitychange", onVisibility);

    // Always paint at least one frame regardless of visibility, so the
    // canvas is never left blank; only the ongoing pulse/ease animation is
    // gated behind "not reduced and not hidden".
    draw(performance.now());
    if (!reduced && !document.hidden) {
      lastNow = performance.now();
      loop(lastNow);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      themeObserver.disconnect();
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
            "radial-gradient(ellipse 62% 52% at 50% 36%, var(--bg) 0%, transparent 70%)",
          opacity: 0.5,
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
