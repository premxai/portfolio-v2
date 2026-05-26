import type { Metadata } from "next";
import { CaseStudyHeader } from "@/components/case-study-header";
import { Prose } from "@/components/prose";
import { Figure } from "@/components/figure";

export const metadata: Metadata = {
  title: "JobClaw",
  description:
    "Autonomous scraper aggregating 30,000+ company ATS feeds and broadcasting fresh listings to Discord every hour — five sequential workers, atomic hash dedup, decoupled micro-scrapers.",
};

export default function JobClawPage() {
  return (
    <article>
      <CaseStudyHeader
        slug="jobclaw"
        label="// case study · tooling"
        title="Thirty thousand ATS feeds, one Discord channel, hourly heartbeat."
        tagline="An autonomous job-listing scraper that quietly stalks 30,000+ company ATS endpoints, dedups across runs with atomic hashes, and broadcasts fresh roles to Discord without ever posting the same job twice."
        period="Feb 2026 – present"
        role="Sole engineer"
        repo="https://github.com/premxai/jobclaw"
      />

      <Prose>
        <p>
          Job boards lie about freshness. The same listing surfaces on three
          aggregators, two cross-posts, and a recruiter&apos;s feed —
          frequently after it&apos;s already closed. <strong>JobClaw</strong>{" "}
          skips the middlemen and pulls directly from each company&apos;s
          applicant tracking system (Greenhouse, Lever, Ashby, Workday,
          SmartRecruiters, Rippling), hashes every role atomically, and only
          posts what&apos;s genuinely new.
        </p>

        <h2>Five workers, one hour, every hour</h2>
        <p>
          Different ATS feeds change at different speeds and have very
          different rate-limit profiles. Hammering every endpoint constantly
          is wasteful and gets you banned. The fix is five workers chained{" "}
          <em>one after the other</em>, running through the entire 30,000-
          company catalogue exactly once an hour — so every listing is at
          most ~60 minutes stale, and a single ATS outage can&apos;t take
          down the rest of the chain:
        </p>
        <ol>
          <li>
            <strong>Worker 1 — Fast Tier.</strong> RSS + GitHub feeds +
            Greenhouse / Lever / Ashby. The cheapest, fastest-moving sources
            — fetched first so the rest of the run already has a hot cache.
          </li>
          <li>
            <strong>Worker 2 — Medium Tier.</strong> Workday / Rippling /
            SmartRecruiters. Heavier endpoints, deeper rate limits, polled
            with backoff.
          </li>
          <li>
            <strong>Worker 3 — Deep Push.</strong> A wide crawl across the
            full 30,000-company catalogue. Catches everything the tier
            scrapers don&apos;t cover and bounds long-tail staleness.
          </li>
          <li>
            <strong>Worker 4 — Discord Push.</strong> Atomic broadcast of
            every newly-hashed listing from this hour. Nothing posted unless
            it cleared the dedup gate.
          </li>
          <li>
            <strong>Worker 5 — Registry Expander.</strong> Discovers new ATS
            endpoints and feeds them back into the catalogue so it grows
            without me babysitting it.
          </li>
        </ol>
        <p>
          Each worker writes only its own slice of the SQLite table and
          triggers the next worker in line. The chain itself is the
          schedule.
        </p>
      </Prose>

      <Figure
        src="/projects/jobclaw-hero.png"
        alt="JobClaw GitHub Actions workflows page showing the five sequential workers"
        aspect="2509/1157"
        fit="contain"
        caption="The five workers as GitHub Actions workflows — each completes before the next starts, and the chain runs every hour on the hour."
      />

      <Prose>
        <h2>Atomic dedup is the whole game</h2>
        <p>
          The interesting part isn&apos;t scraping — it&apos;s the dedup. Each
          listing gets a stable hash computed from{" "}
          <code>(company, title, location, source_url)</code>. Inserts go
          through a SQLite WAL-mode table with a uniqueness constraint on the
          hash. If the insert succeeds, the listing is genuinely new and gets
          broadcast. If it conflicts, it&apos;s silently dropped. No race
          windows, no &ldquo;was this posted yet?&rdquo; lookups before the
          insert.
        </p>
        <p>
          The decoupling matters too: each micro-scraper writes only its
          slice of the table and never reads another scraper&apos;s state.
          That lets me kill a single ATS poller without bringing down the
          rest of the fleet — and it makes the GitHub Actions concurrency
          model match the data model exactly.
        </p>

        <h2>Discord as the read path</h2>
        <p>
          Discord ended up being the right read path. It gives me free
          per-role channel routing (frontend, ML, infra, research), threading
          for follow-ups, rich embed cards with company + location + posted
          time, and a chat surface where I can drop &ldquo;applied&rdquo; /
          &ldquo;skipping&rdquo; reactions on each listing. A web dashboard
          would have been more polish for less signal.
        </p>
      </Prose>

      <Figure
        src="/projects/jobclaw-discord.png"
        alt="Discord #general channel showing JobClaw broadcasting Software Engineer Frontend roles at Ramp and Suno with company, location, posted time, and source"
        aspect="1945/1026"
        fit="contain"
        caption="The output side — JobClaw posting fresh frontend roles. Each card carries source, company, location, and posted-time so triage takes seconds, not minutes."
      />

      <Prose>
        <h2>What I&apos;d do next</h2>
        <ul>
          <li>
            <strong>Score listings before broadcasting.</strong> Right now
            every match for my role filter goes through. A small ranker on
            top of the hash table would let me push only the top 20% to the
            main channel and dump the rest to an archive.
          </li>
          <li>
            <strong>Auto-extract apply links.</strong> Some ATSes hide the
            direct apply URL behind a redirect that breaks copy-paste. A tiny
            unwrap step would close the loop from Discord card to apply
            screen.
          </li>
          <li>
            <strong>Promote the Registry Expander.</strong> Right now it only
            discovers Greenhouse/Lever endpoints because they have public
            company lists. Adding Workday subdomain enumeration would
            roughly double the catalogue.
          </li>
        </ul>
      </Prose>
    </article>
  );
}
