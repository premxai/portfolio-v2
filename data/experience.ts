export type Experience = {
  company: string;
  role: string;
  location: string;
  start: string;
  end: string;
  blurb: string;
  bullets: string[];
};

export const experience: Experience[] = [
  {
    company: "Concentrix + Webhelp",
    role: "Generative AI Engineer",
    location: "Newark, CA",
    start: "Feb 2024",
    end: "Jul 2024",
    blurb:
      "Built a production multi-model LLM routing layer behind enterprise apps, owning latency, cost, and reliability.",
    bullets: [
      "Designed a routing system across 3+ foundation models with 1.5s end-to-end latency and 18% inference cost reduction.",
      "Integrated LiteLLM with AWS Bedrock and SageMaker, handling thousands of daily requests at 95%+ response accuracy.",
      "Shipped CloudWatch-based observability with logging, safety checks, and drift monitoring — cut prod incidents 42% and improved MTTD 35%.",
    ],
  },
  {
    company: "AlphaBits Technologies",
    role: "Data Science Intern",
    location: "India",
    start: "Aug 2023",
    end: "Jan 2024",
    blurb: "Rebuilt the ML experimentation and evaluation pipeline for ranking models.",
    bullets: [
      "Redesigned preprocessing and evaluation across 5+ model variants, cutting iteration time 90% and lifting ranking relevance 10%.",
      "Stood up a centralized feature store and reusable training pipelines for 100% reproducible experiments.",
    ],
  },
  {
    company: "iNeuron.ai",
    role: "ML Engineer Intern",
    location: "India",
    start: "Jun 2023",
    end: "Aug 2023",
    blurb: "Built supervised classifiers for phishing detection and productionized them.",
    bullets: [
      "20+ engineered URL/domain features; 92% classification accuracy on held-out validation.",
      "Wrapped models in production-style services with logging, monitoring, and validation checks.",
    ],
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
    degree: "M.S. in Artificial Intelligence",
    location: "Rochester, NY",
    start: "Aug 2024",
    end: "May 2026",
  },
  {
    school: "National Institute of Technology, Silchar",
    degree: "B.Tech in Computer Science and Engineering",
    location: "India",
    start: "Aug 2020",
    end: "May 2024",
  },
];
