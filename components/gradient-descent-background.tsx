"use client";

import { useEffect, useRef } from "react";

/**
 * Mountains background + descent overlay.
 *
 * Bottom layer  — a fixed full-viewport image at `/mountains.jpg`. In dark
 *                mode the image shows as-is. In light mode the
 *                `mountains-image` class flips it via CSS filter so the
 *                mountains read as dark contours on a light field.
 *
 * Top layer    — a transparent canvas overlay that draws a precomputed
 *                gradient-descent path (with momentum) plus a scroll-driven
 *                head ball and a steady glowing orb at the minimum. The
 *                heightfield is procedural, independent of the image, but
 *                its peaks/min are placed to roughly track the image's
 *                visual ridges.
 *
 * Theme-aware: reads `data-theme` and the `--accent` CSS variable every
 * frame so a theme toggle re-colors the descent overlay live.
 *
 * Respects `prefers-reduced-motion`: draws a single static frame and stops.
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

    // --- Descent path -------------------------------------------------
    // Hand-tuned anchors that track the visible terrain of mountains.png:
    // start at the apex of the dominant central peak, oscillate slightly
    // through the upper-ridge saddles (a visual nod to momentum), then
    // descend cleanly to a basin at the bottom-center where the orb sits.
    const anchors: { x: number; y: number }[] = [
      { x: 0.52, y: 0.09 }, // 0 — apex of the central peak (highest)
      { x: 0.58, y: 0.18 }, // 1 — first overshoot down-right
      { x: 0.46, y: 0.27 }, // 2 — bounce left along the ridge
      { x: 0.55, y: 0.37 }, // 3 — small right swing
      { x: 0.49, y: 0.48 }, // 4 — settling near the midline
      { x: 0.51, y: 0.60 }, // 5 — over the foreground saddle
      { x: 0.48, y: 0.72 }, // 6 — descent through the foreground
      { x: 0.50, y: 0.83 }, // 7 — approaching the basin
      { x: 0.50, y: 0.93 }, // 8 — minimum (lowest), orb sits here
    ];

    // Catmull-Rom interpolation between successive anchors gives a smooth
    // curve through every anchor with c1-continuity.
    const path: { x: number; y: number }[] = [];
    const SAMPLES_PER_SEGMENT = 220;
    for (let i = 0; i < anchors.length - 1; i++) {
      const p0 = anchors[Math.max(0, i - 1)];
      const p1 = anchors[i];
      const p2 = anchors[i + 1];
      const p3 = anchors[Math.min(anchors.length - 1, i + 2)];
      for (let s = 0; s < SAMPLES_PER_SEGMENT; s++) {
        const t = s / SAMPLES_PER_SEGMENT;
        const t2 = t * t;
        const t3 = t2 * t;
        const x =
          0.5 *
          (2 * p1.x +
            (-p0.x + p2.x) * t +
            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
            (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
        const y =
          0.5 *
          (2 * p1.y +
            (-p0.y + p2.y) * t +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
            (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);
        path.push({ x, y });
      }
    }
    path.push(anchors[anchors.length - 1]);

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

    // --- Scroll progress ----------------------------------------------
    let scrollProgress = 0;
    function updateScroll() {
      const max =
        (document.documentElement.scrollHeight || document.body.scrollHeight) -
        window.innerHeight;
      scrollProgress = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
    }
    updateScroll();

    window.addEventListener("resize", resize);
    window.addEventListener("scroll", updateScroll, { passive: true });

    // --- Colors --------------------------------------------------------
    function hexToRgb(hex: string): [number, number, number] {
      const h = hex.replace("#", "");
      const n = parseInt(
        h.length === 3
          ? h
              .split("")
              .map((c) => c + c)
              .join("")
          : h,
        16,
      );
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }

    function colors() {
      const isDark =
        document.documentElement.getAttribute("data-theme") !== "light";
      const accent =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--accent")
          .trim() || "#fb923c";
      const [aR, aG, aB] = hexToRgb(accent);
      return { isDark, aR, aG, aB };
    }

    // --- Project field coords to screen --------------------------------
    function toScreen(fx: number, fy: number): [number, number] {
      // Map field x,y in [0,1] to viewport coordinates.
      return [fx * width, fy * height];
    }

    function drawPathAndBall(c: ReturnType<typeof colors>) {
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
          ctx!.strokeStyle = `rgba(${c.aR}, ${c.aG}, ${c.aB}, ${0.2 + 0.55 * fade})`;
          ctx!.beginPath();
          ctx!.moveTo(x0, y0);
          ctx!.lineTo(x1, y1);
          ctx!.stroke();
        }

        const stride = Math.max(8, Math.floor(path.length / 32));
        for (let i = 0; i < trailLen; i += stride) {
          const [x, y] = toScreen(path[i].x, path[i].y);
          const fade = i / Math.max(1, trailLen - 1);
          ctx!.fillStyle = `rgba(${c.aR}, ${c.aG}, ${c.aB}, ${0.4 + 0.55 * fade})`;
          ctx!.beginPath();
          ctx!.arc(x, y, 1.8 + 1.2 * fade, 0, Math.PI * 2);
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

      const halo = ctx!.createRadialGradient(bx, by, 0, bx, by, 32);
      halo.addColorStop(0, `rgba(${c.aR}, ${c.aG}, ${c.aB}, 0.6)`);
      halo.addColorStop(1, `rgba(${c.aR}, ${c.aG}, ${c.aB}, 0)`);
      ctx!.fillStyle = halo;
      ctx!.beginPath();
      ctx!.arc(bx, by, 32, 0, Math.PI * 2);
      ctx!.fill();

      ctx!.fillStyle = `rgba(${c.aR}, ${c.aG}, ${c.aB}, 1)`;
      ctx!.beginPath();
      ctx!.arc(bx, by, 4, 0, Math.PI * 2);
      ctx!.fill();
    }

    function drawMinimumOrb() {
      // The orb is the descent's destination — hide it until the user has
      // scrolled most of the way there, then fade it in over the last
      // stretch so it reads as a "you've arrived" moment.
      const REVEAL_START = 0.85;
      if (scrollProgress < REVEAL_START) return;
      const reveal = Math.min(
        1,
        (scrollProgress - REVEAL_START) / (1 - REVEAL_START),
      );
      // Cubic ease-in — soft start, snappy finish.
      const eased = reveal * reveal * reveal;

      const last = path[path.length - 1];
      const [bx, by] = toScreen(last.x, last.y);
      const t = performance.now() / 1000;
      const pulse = 0.85 + 0.15 * Math.sin(t * 1.6);

      // Sonar / radar rings — three concentric rings expanding outward
      // with staggered phases so one is always near the orb.
      const RING_PERIOD = 2.8; // seconds for a ring to traverse max radius
      const RING_MAX_R = 130;
      const RING_COUNT = 3;
      for (let r = 0; r < RING_COUNT; r++) {
        const phase =
          ((t / RING_PERIOD) + r / RING_COUNT) % 1;
        const radius = phase * RING_MAX_R;
        // Bright when new, fading as it expands outward.
        const ringAlpha = (1 - phase) * 0.55 * eased;
        ctx!.lineWidth = 1.4 * (1 - phase * 0.6);
        ctx!.strokeStyle = `rgba(168, 132, 255, ${ringAlpha})`;
        ctx!.beginPath();
        ctx!.arc(bx, by, radius, 0, Math.PI * 2);
        ctx!.stroke();
      }

      // Soft outer halo
      const haloR = 80 * pulse;
      const grad = ctx!.createRadialGradient(bx, by, 0, bx, by, haloR);
      grad.addColorStop(0, `rgba(168, 132, 255, ${0.55 * pulse * eased})`);
      grad.addColorStop(0.4, `rgba(168, 132, 255, ${0.18 * pulse * eased})`);
      grad.addColorStop(1, `rgba(168, 132, 255, 0)`);
      ctx!.fillStyle = grad;
      ctx!.beginPath();
      ctx!.arc(bx, by, haloR, 0, Math.PI * 2);
      ctx!.fill();

      // Bright core
      ctx!.fillStyle = `rgba(220, 200, 255, ${0.95 * pulse * eased})`;
      ctx!.beginPath();
      ctx!.arc(bx, by, 5.5, 0, Math.PI * 2);
      ctx!.fill();
    }

    function step() {
      const c = colors();
      ctx!.clearRect(0, 0, width, height);
      drawPathAndBall(c);
      drawMinimumOrb();
    }

    let rafId = 0;
    function loop() {
      step();
      rafId = window.requestAnimationFrame(loop);
    }

    if (reduced) {
      step();
    } else {
      loop();
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", updateScroll);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
    >
      <div className="absolute inset-0 mountains-image" />
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
