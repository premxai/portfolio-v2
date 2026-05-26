import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { SkillsMarquee } from "@/components/skills-marquee";
import { GradientDescentBackground } from "@/components/gradient-descent-background";
import { HomeOnly } from "@/components/home-only";
import { PageBackground } from "@/components/page-background";
import { site } from "@/data/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(`https://${site.domain}`),
  title: {
    default: `${site.shortName} — ${site.role}`,
    template: `%s — ${site.shortName}`,
  },
  description: site.tagline,
  openGraph: {
    title: `${site.shortName} — ${site.role}`,
    description: site.tagline,
    url: `https://${site.domain}`,
    siteName: site.shortName,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.shortName} — ${site.role}`,
    description: site.tagline,
    creator: "@premxai",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col pb-12">
        <ThemeProvider>
          <PageBackground />
          <HomeOnly>
            <GradientDescentBackground />
          </HomeOnly>
          <div className="relative z-10 flex flex-col flex-1">
            <Nav />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <HomeOnly>
            <SkillsMarquee />
          </HomeOnly>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
