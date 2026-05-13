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
    featured: true,
    hasCaseStudy: true,
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
  },
  {
    slug: "jobclaw",
    title: "JobClaw",
    tagline:
      "Autonomous scraper aggregating 5,000+ company ATS feeds, broadcasting to Discord every 15 min.",
    year: "2026",
    period: "Feb 2026 – present",
    status: "shipped",
    category: "Tooling",
    stack: ["Python", "SQLite WAL", "Discord.py", "Task Scheduler"],
    outcome: "Atomic hash dedup · decoupled micro-scrapers",
    repo: "https://github.com/premxai/jobclaw",
  },
  {
    slug: "data-whisperer",
    title: "Data Whisperer",
    tagline: "Local-first auto-EDA with 4 LangGraph agents — Detective, Statistician, Visualizer, Storyteller.",
    year: "2026",
    period: "Feb 2026",
    status: "shipped",
    category: "Tooling",
    stack: ["FastAPI", "Polars", "DuckDB", "LangGraph", "Ollama", "ChromaDB"],
    outcome: "Local-first by design — your data never leaves your machine",
    repo: "https://github.com/premxai/data-whisperer",
  },
  {
    slug: "sneakerdex",
    title: "SneakerDex",
    tagline: "Pokédex for sneakers — camera ID + portfolio valuation.",
    year: "2026",
    period: "Mar 2026",
    status: "shipped",
    category: "Mobile",
    stack: ["React Native", "Expo SDK 55", "Supabase", "Claude Sonnet 4.6 vision"],
    outcome: "AI vision identification across three rarity tiers",
    repo: "https://github.com/premxai/sneakerDex",
  },
  {
    slug: "transformer-from-scratch",
    title: "Transformer from Scratch",
    tagline: '"Attention Is All You Need" reimplemented in raw PyTorch — for the love of it.',
    year: "2025",
    period: "Apr 2025",
    status: "shipped",
    category: "Learning",
    stack: ["PyTorch", "Python"],
    outcome: "Multi-head attention, positional encodings, encoder + decoder",
    repo: "https://github.com/premxai/transformer-from-scratch",
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
