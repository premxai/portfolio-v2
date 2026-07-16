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
  /** Optional motion preview used only by selected-work cards. */
  featuredVideo?: string;
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
   * - `contain`: shows the whole image with letterboxing. Use for UI
   *   screenshots that shouldn't be cropped.
   */
  heroFit?: "cover" | "contain";
};

export const projects: Project[] = [
  {
    slug: "kerna",
    title: "Kerna",
    tagline:
      "A trust layer that puts policy, budgets, approvals, isolation, and receipts around AI-agent tool use.",
    year: "2026",
    period: "2026",
    status: "live",
    category: "Tooling",
    stack: ["Rust", "MCP", "SQLite", "Python", "TypeScript"],
    outcome: "Fail-closed policy | approval queue | persistent receipts",
    repo: "https://github.com/premxai/kerna",
    demo: "https://kerna.run/",
    featured: true,
    featuredVideo: "/projects/kerna-home.mp4",
    hasCaseStudy: true,
    image: "/projects/kerna-work.webp",
    hero: "/projects/kerna-hero.png",
    heroFit: "contain",
  },
  {
    slug: "jobclaw",
    title: "Nori",
    tagline:
      "AI job discovery platform backed by a registry covering 31,000+ companies.",
    year: "2026",
    period: "2026 - present",
    status: "live",
    category: "Tooling",
    stack: ["Python", "FastAPI", "Next.js", "Redis", "PostgreSQL", "Docker"],
    outcome: "120+ matches/day | 95% duplicate filtering",
    repo: "https://github.com/premxai/jobclaw",
    demo: "https://www.norinote.xyz/",
    featured: true,
    featuredVideo: "/projects/nori-home.mp4",
    hasCaseStudy: true,
    image: "/projects/nori-work.webp",
    hero: "/projects/jobclaw-hero.png",
    heroFit: "contain",
  },
  {
    slug: "cryo",
    title: "Cryo",
    tagline:
      "Search a frozen pre-2022 corpus with BM25, semantic reranking, provenance, and agent-ready MCP tools.",
    year: "2026",
    period: "2026",
    status: "live",
    category: "Tooling",
    stack: ["Python", "FastAPI", "Meilisearch", "Qdrant", "MCP"],
    outcome: "REST API | Python SDK | 4 MCP tools",
    repo: "https://github.com/premxai/cryo",
    demo: "https://www.cryoweb.xyz/",
    featured: true,
    featuredVideo: "/projects/cryo-home.mp4",
    hasCaseStudy: true,
    image: "/projects/cryo-work.webp",
    hero: "/projects/cryo-hero.jpg",
    heroFit: "contain",
  },
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
    demo: "https://web-production-91496.up.railway.app/",
    featured: false,
    hasCaseStudy: true,
    image: "/projects/emotion-engine.png",
    hero: "/projects/emotion-engine-hero.png",
    heroVideo: "/projects/emotion-engine-hero.mp4",
  },
  {
    slug: "llm-routing",
    title: "Multi-Model LLM Routing",
    tagline:
      "Production routing across 3 foundation models, cutting p95 latency from 4s to 1.5s.",
    year: "2024",
    period: "Feb 2024 – Jul 2024",
    status: "shipped",
    category: "Production",
    stack: ["LiteLLM", "AWS Bedrock", "SageMaker", "CloudWatch", "Python"],
    outcome: "$45K to $37K monthly spend | 42% fewer incidents | 35% lower MTTD",
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
    year: "2026",
    period: "2026",
    status: "shipped",
    category: "Tooling",
    stack: ["TypeScript", "Node.js", "VS Code API", "LLM APIs"],
    outcome: "Completed 68% of previously failed benchmark tasks",
    repo: "https://github.com/premxai/PackAI",
    demo: "https://marketplace.visualstudio.com/items?itemName=premxai.packai",
    hasCaseStudy: true,
    image: "/projects/packai.png",
    hero: "/projects/packai-hero.png",
    heroFit: "contain",
  },
  {
    slug: "sushi",
    title: "Sushi",
    tagline: "Premium EDA platform for automated data quality, stats, and visualizations.",
    year: "2026",
    period: "2026",
    status: "live",
    category: "Tooling",
    stack: ["Python", "FastAPI", "Next.js", "Plotly", "SQLite"],
    outcome: "0-100 quality scoring | outlier analysis | 6 supported formats",
    repo: "https://github.com/premxai/sushi-eda",
    demo: "https://trysushi.xyz/",
    featured: false,
    featuredVideo: "/projects/sushi-home.mp4",
    hasCaseStudy: true,
    image: "/projects/sushi-work.webp",
    hero: "/projects/sushi.png",
    heroFit: "contain",
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
];

export const featuredProjects = projects.filter((p) => p.featured);

const flagshipSlugs = new Set([
  "kerna",
  "jobclaw",
  "cryo",
  "emotion-engine",
  "packai",
  "sushi",
]);

export const flagshipProjects = projects.filter((project) =>
  flagshipSlugs.has(project.slug),
);

export type GithubProject = {
  title: string;
  description: string;
  stack: string[];
  repo: string;
  href?: string;
  demo?: string;
  status?: string;
  image?: string;
  imageFit?: "cover" | "contain";
};

export const githubProjects: GithubProject[] = [
  {
    title: "QuantRAG",
    description:
      "Grounded financial research copilot over SEC filings with four retrieval modes, claim-level hallucination checks, and abstention.",
    stack: ["Python", "FastAPI", "FAISS", "BM25", "Cross-encoder", "SQLite"],
    repo: "https://github.com/premxai/quantrag",
    image: "/projects/archive/quantrag.png",
  },
  {
    title: "PaperMind",
    description:
      "Research assistant that coordinates specialized agents for literature, methods, results, critique, and research-gap synthesis.",
    stack: ["Python", "FastAPI", "Streamlit", "FAISS", "PyPDF"],
    repo: "https://github.com/premxai/papermind",
    href: "/work/papermind",
    image: "/projects/papermind.png",
  },
  {
    title: "Transformer from Scratch",
    description:
      "Encoder-decoder transformer implemented with basic PyTorch tensor operations, including attention, masks, and positional encoding.",
    stack: ["Python", "PyTorch", "Multi-head attention", "Transformers"],
    repo: "https://github.com/premxai/transformer-from-scratch",
    href: "/writing/transformer-from-scratch",
    image: "/projects/archive/transformer-from-scratch.png",
  },
  {
    title: "Video Search Platform",
    description:
      "Natural-language video search using scene detection, CLIP embeddings, timestamped matches, and Qdrant vector retrieval.",
    stack: ["FastAPI", "PyTorch", "CLIP", "Qdrant", "OpenCV", "React"],
    repo: "https://github.com/premxai/video-search-platform",
    image: "/projects/archive/video-search-platform.png",
  },
  {
    title: "Document Intelligence System",
    description:
      "Multi-agent document processing for OCR, structured extraction, semantic search, and grounded question answering.",
    stack: ["Python", "LangGraph", "Qdrant", "Tesseract", "FastAPI"],
    repo: "https://github.com/premxai/document-intelligence-system",
    image: "/projects/archive/document-intelligence-system.png",
  },
  {
    title: "Kubernetes MLOps Pipeline",
    description:
      "Reference pipeline for training, deployment, artifact tracking, monitoring, and infrastructure automation on Kubernetes.",
    stack: ["Python", "Kubernetes", "Terraform", "FastAPI", "MLflow", "Prometheus"],
    repo: "https://github.com/premxai/Production-MLOps-Pipeline-Kubernetes",
    image: "/projects/archive/production-mlops-pipeline-kubernetes.png",
  },
];
