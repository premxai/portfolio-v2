"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Sets `data-page="home" | "section"` on <body> based on the current route.
 * Drives the inner-page background swap (`--bg` vs `--bg-section`) defined
 * in `app/globals.css`. Renders nothing.
 *
 * Mount once in the root layout, before <Nav>.
 */
export function PageBackground() {
  const pathname = usePathname();

  useEffect(() => {
    document.body.dataset.page = pathname === "/" ? "home" : "section";
  }, [pathname]);

  return null;
}
