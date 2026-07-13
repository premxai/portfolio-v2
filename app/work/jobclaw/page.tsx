import type { Metadata } from "next";
import { CaseStudyHeader } from "@/components/case-study-header";
import { Prose } from "@/components/prose";
import { Figure } from "@/components/figure";

export const metadata: Metadata = {
  title: "Nori",
  description:
    "AI job discovery and ranking backed by a registry covering 31,000+ companies, bounded ATS adapters, Redis queues, and duplicate filtering.",
};

export default function NoriPage() {
  return (
    <article>
      <CaseStudyHeader
        slug="jobclaw"
        label="// case study · tooling"
        title="A registry of 31,000+ companies, one ranked discovery pipeline."
        tagline="An AI job-discovery platform with bounded ATS adapters, queued processing, sentence-transformer ranking, and duplicate filtering across scheduled collection workflows."
        period="Feb 2026 – present"
        role="Sole engineer"
        repo="https://github.com/premxai/jobclaw"
        demo="https://www.norinote.xyz/"
      />

      <Prose>
        <p>
          Job boards lie about freshness. The same listing surfaces on three
          aggregators, two cross-posts, and a recruiter&apos;s feed,
          frequently after it&apos;s already closed. <strong>Nori</strong>{" "}
          skips the middlemen and pulls directly from each company&apos;s
          applicant tracking system (Greenhouse, Lever, Ashby, Workday,
          SmartRecruiters, Rippling), hashes every role atomically, and only
          posts what&apos;s genuinely new.
        </p>

        <h2>Bounded workers over a large registry</h2>
        <p>
          Different ATS feeds change at different speeds and have different
          rate-limit profiles. Nori keeps a registry covering 31,000+
          companies, then runs source-specific adapters in bounded scheduled
          batches. The registry describes available coverage; it is not a
          claim that every company is actively polled in every run. Separate
          workers keep one ATS outage from taking down the rest of the flow:
        </p>
        <ol>
          <li>
            <strong>Worker 1: Fast Tier.</strong> RSS + GitHub feeds +
            Greenhouse / Lever / Ashby, the cheapest, fastest-moving sources,
            fetched first so the rest of the run already has a hot cache.
          </li>
          <li>
            <strong>Worker 2: Medium Tier.</strong> Workday / Rippling /
            SmartRecruiters. Heavier endpoints, deeper rate limits, polled
            with backoff.
          </li>
          <li>
            <strong>Worker 3: Bounded Registry Batches.</strong> Processes
            eligible registry records in controlled batches to extend
            coverage without overwhelming source systems.
          </li>
          <li>
            <strong>Worker 4: Discord Push.</strong> Atomic broadcast of
            every newly-hashed listing from this hour. Nothing posted unless
            it cleared the dedup gate.
          </li>
          <li>
            <strong>Worker 5: Registry Expander.</strong> Discovers new ATS
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
        alt="Nori GitHub Actions workflows page showing the scheduled workers"
        aspect="2509/1157"
        fit="contain"
        caption="The five workers as GitHub Actions workflows. Each completes before the next starts, and the chain runs every hour on the hour."
      />

      <Prose>
        <h2>Atomic dedup is the whole game</h2>
        <p>
          The interesting part isn&apos;t scraping. It&apos;s the dedup. Each
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
          rest of the fleet, and it makes the GitHub Actions concurrency
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
        alt="Discord channel showing Nori broadcasting software engineering roles with company, location, posted time, and source"
        aspect="1945/1026"
        fit="contain"
        caption="The output side: Nori posting fresh roles. Each card carries source, company, location, and posted-time for fast triage."
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
