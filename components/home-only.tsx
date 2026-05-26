"use client";

import { usePathname } from "next/navigation";

/**
 * Renders children only when the current route is the home page (`/`).
 * Used in the root layout so that components like the descent background
 * and the skills marquee only appear on the home page without forcing
 * the home page itself to mount them.
 */
export function HomeOnly({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname !== "/") return null;
  return <>{children}</>;
}
