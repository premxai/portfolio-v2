export type ProjectStatus = "live" | "research" | "shipped" | "archived";

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  year: string;
  period: string;
  status: ProjectStatus;
  category: "Research" | "Production" | "Tooling" | "Mobile" | "Learning";
  stack: string[];
  outcome?: string;
  href?: string;
  repo?: string;
  demo?: string;
  featured?: boolean;
  hasCaseStudy?: boolean;
  /** Square thumbnail (recommend 320×320). If absent, a placeholder is rendered. */
  image?: string;
  /** Wide hero banner for case study pages (recommend 1600×900). */
  hero?: string;
  /**
   * Optional autoplaying video to use in place of the hero image on the
   * case study page (autoplay + loop + muted + playsInline). When set, the
   * `hero` image acts as the poster while the video loads.
   */
  heroVideo?: string;
  /**
   * How to fit the hero image/video inside the 16:9 container.
   * - `cover` (default): fills the box, may crop the image.
   * - `contain`: shows the whole image with letterboxing — use this for UI
   *   screenshots that shouldn't be cropped.
   */
  heroFit?: "cover" | "contain";
};

export const projects: Project[] = [
  {
    slug: "emotion-engine",
    title: "Emotion Engine",
    tagline:
      "A 72-feature LSTM rediscovers fear, grief, and suspicion from zero hardcoded rules.",
    year: "2026",
    period: "Feb 2026 – Apr 2026",
    status: "research",
    category: "Research",
    stack: ["PyTorch", "Python", "Django", "Custom sim engine"],
    outcome: "p = 3.3e-113 across 205,940 agent-step records",
    repo: "https://github.com/premxai/emotion_engine",
    demo: "https://github.com/premxai/emotion-engine-web",
    featured: true,
    hasCaseStudy: true,
    image: "/projects/emotion-engine.png",
    hero: "/projects/emotion-engine-hero.png",
    heroVideo: "/projects/emotion-engine-hero.mp4",
  },
  {
    slug: "llm-routing",
    title: "Multi-Model LLM Routing",
    tagline:
      "Production routing across 3+ foundation models at 1.5s end-to-end latency.",
    year: "2024",
    period: "Feb 2024 – Jul 2024",
    status: "shipped",
    category: "Production",
    stack: ["LiteLLM", "AWS Bedrock", "SageMaker", "CloudWatch", "Python"],
    outcome: "18% inference cost ↓ · 42% incidents ↓ · 35% MTTD ↑",
    featured: true,
    hasCaseStudy: true,
    image: "/projects/llm-routing.png",
    hero: "/projects/llm-routing-hero.png",
  },
  {
    slug: "packai",
    title: "PackAI",
    tagline:
      "VS Code extension that orchestrates Claude, Copilot, and Codex in parallel via DAG planning.",
    year: "2025",
    period: "Apr 2025 – Jun 2025",
    status: "shipped",
    category: "Tooling",
    stack: ["TypeScript", "VS Code API", "Vitest", "Node 20"],
    outcome: "741+ tests · capability-scored agent selection",
    repo: "https://github.com/premxai/PackAI",
    hasCaseStudy: true,
    image: "/projects/packai.png",
    hero: "/projects/packai-hero.png",
    heroFit: "contain",
  },
  {
    slug: "sushi",
    title: "Sushi",
    tagline: "Premium EDA platform — automated data quality, stats, and visualizations.",
    year: "2025",
    period: "Feb 2025 – Apr 2025",
    status: "live",
    category: "Tooling",
    stack: ["FastAPI", "Next.js 14", "Plotly", "Clerk", "Vercel"],
    outcome: "95% faster analysis · A–F quality grading · 6+ formats",
    repo: "https://github.com/premxai/sushi-eda",
    demo: "https://sushi-ochre-nine.vercel.app",
    featured: true,
    image: "/projects/sushi.png",
  },
  {
    slug: "papermind",
    title: "PaperMind",
    tagline: "Autonomous arXiv research assistant orchestrating 5 specialized agents.",
    year: "2026",
    period: "Jan 2026 – May 2026",
    status: "shipped",
    category: "Tooling",
    stack: ["FastAPI", "Streamlit", "FAISS", "PyPDF", "OpenAI"],
    outcome: "Literature, methods, results, critique, and gap synthesis agents",
    repo: "https://github.com/premxai/papermind",
    hasCaseStudy: true,
    image: "/projects/papermind.png",
    hero: "/projects/papermind-hero.png",
  },
  {
    slug: "jobclaw",
    title: "JobClaw",
    tagline:
      "Autonomous scraper aggregating 30,000+ company ATS feeds, broadcasting to Discord every hour.",
    year: "2026",
    period: "Feb 2026 – present",
    status: "shipped",
    category: "Tooling",
    stack: ["Python", "SQLite WAL", "Discord.py", "Task Scheduler"],
    outcome: "Atomic hash dedup · decoupled micro-scrapers",
    repo: "https://github.com/premxai/jobclaw",
    hasCaseStudy: true,
    image: "/projects/jobclaw.png",
    hero: "/projects/jobclaw-hero.png",
    heroFit: "contain",
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
