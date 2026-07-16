export type Experience = {
  slug: string;
  company: string;
  role: string;
  location: string;
  start: string;
  end: string;
  blurb: string;
  bullets: string[];
  stack: string[];
  relatedHref?: string;
  relatedLabel?: string;
};

export const experience: Experience[] = [
  {
    slug: "rit-graduate-researcher",
    company: "Rochester Institute of Technology",
    role: "Graduate Researcher",
    location: "Rochester, NY",
    start: "Jan 2026",
    end: "Apr 2026",
    blurb: "Official RIT appointment researching predictive world models and emergent emotional appraisal in generative agents.",
    bullets: [
      "Extended Stanford's Generative Agents with a 72-feature LSTM predictive model, controlled scenarios, ablations, and statistical comparisons across 205,940 agent-step records.",
      "Validated statistically significant emergent emotion patterns against Gallup 2024 human baselines and documented model behavior, limitations, and failure modes in a research poster.",
    ],
    stack: ["Python", "PyTorch", "LSTM", "Multi-agent simulation", "Ablation studies", "Statistical analysis"],
    relatedHref: "/work/emotion-engine",
    relatedLabel: "Read the Emotion Engine case study",
  },
  {
    slug: "concentrix-generative-ai-engineer",
    company: "Concentrix + Webhelp",
    role: "Generative AI Engineer",
    location: "Newark, CA",
    start: "Feb 2024",
    end: "Jul 2024",
    blurb: "Owned production LLM inference routing and evaluation for customer-support automation.",
    bullets: [
      "Owned the production LLM inference routing layer for 50K daily requests across 3 foundation models on AWS Bedrock and SageMaker; used LiteLLM, provider fallback, and latency-aware routing to cut p95 latency from 4s to 1.5s.",
      "Built production LLM evaluation and safety gates with CloudWatch logging, hallucination checks, drift monitoring, and a 500-case test set; reduced incidents by 42% and MTTD by 35%.",
      "Reduced monthly inference spend from $45K to $37K through cost-aware routing, prompt caching, and provider fallback while maintaining 95%+ task success.",
    ],
    stack: ["Python", "AWS Bedrock", "SageMaker", "LiteLLM", "CloudWatch", "LLM evaluation"],
    relatedHref: "/work/llm-routing",
    relatedLabel: "Read the LLM routing case study",
  },
  {
    slug: "alphabits-data-science-intern",
    company: "AlphaBits Technologies",
    role: "Data Science Intern",
    location: "Bengaluru, India",
    start: "Aug 2023",
    end: "Jan 2024",
    blurb: "Rebuilt a Python search-ranking experimentation and offline evaluation workflow.",
    bullets: [
      "Rebuilt preprocessing, feature generation, SQL-backed analysis, and evaluation across 5 model variants; cut iteration time by 90% and improved relevance by 10%.",
      "Created an offline ranking evaluation harness tracking relevance, error cases, and preprocessing differences across model variants before deployment.",
    ],
    stack: ["Python", "SQL", "Ranking models", "Feature engineering", "Offline evaluation"],
  },
  {
    slug: "ineuron-ml-engineer-intern",
    company: "iNeuron AI",
    role: "ML Engineer Intern",
    location: "Bengaluru, India",
    start: "Jun 2023",
    end: "Aug 2023",
    blurb: "Built learner dropout-risk and phishing URL classifiers with feature and data-quality pipelines.",
    bullets: [
      "Developed XGBoost classifiers for learner dropout risk (0.86 AUC across 12,000 learners) and phishing URL detection (20+ URL/domain features, 92% accuracy).",
      "Built a behavioral feature pipeline converting raw activity logs into 24 rolling-window features with drift and quality checks for retraining.",
    ],
    stack: ["Python", "XGBoost", "Feature engineering", "Model evaluation", "Drift monitoring"],
  },
  {
    slug: "exposys-software-developer-intern",
    company: "Exposys Data Labs",
    role: "Software Developer Intern",
    location: "Bengaluru, India",
    start: "May 2021",
    end: "Jun 2022",
    blurb: "Built and tested full-stack features for an internal inventory and order-management application.",
    bullets: [
      "Built reusable React and Bootstrap interfaces and Node.js/Express REST APIs backed by PostgreSQL; client-side validation reduced order-entry errors by approximately 25%.",
      "Automated weekly SQL reporting and assisted API refactoring and database indexing that improved retrieval speed by approximately 20%; added Jest/Mocha tests with over 70% coverage on assigned modules.",
    ],
    stack: ["JavaScript", "React", "Node.js", "Express", "PostgreSQL", "Jest", "Mocha"],
  },
];

export type Education = {
  school: string;
  degree: string;
  location: string;
  start: string;
  end: string;
};

export const education: Education[] = [
  {
    school: "Rochester Institute of Technology",
    degree: "M.S. in Artificial Intelligence, completed May 2026",
    location: "Rochester, NY",
    start: "Aug 2024",
    end: "May 2026",
  },
  {
    school: "National Institute of Technology Silchar",
    degree: "B.Tech. in Computer Science, completed May 2024",
    location: "Silchar, India",
    start: "Aug 2020",
    end: "May 2024",
  },
];
