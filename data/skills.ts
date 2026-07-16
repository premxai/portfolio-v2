import type { ComponentType, SVGProps } from "react";
import {
  SiDocker,
  SiFastapi,
  SiGit,
  SiHuggingface,
  SiNextdotjs,
  SiPostgresql,
  SiPython,
  SiPytorch,
  SiRedis,
  SiRust,
  SiScikitlearn,
  SiTypescript,
} from "react-icons/si";
import { BrainCircuit, Braces, Cloud, Database, Network, Search } from "lucide-react";

type IconCmp = ComponentType<SVGProps<SVGSVGElement> & { size?: string | number }>;

export type Skill = { name: string; Icon: IconCmp };

// Keep this list selective: it is a signal strip, not an ATS keyword dump.
export const skills: Skill[] = [
  { name: "Python", Icon: SiPython },
  { name: "PyTorch", Icon: SiPytorch },
  { name: "scikit-learn", Icon: SiScikitlearn },
  { name: "Hugging Face", Icon: SiHuggingface },
  { name: "FastAPI", Icon: SiFastapi },
  { name: "PostgreSQL", Icon: SiPostgresql },
  { name: "Redis", Icon: SiRedis },
  { name: "Docker", Icon: SiDocker },
  { name: "AWS Bedrock", Icon: Cloud },
  { name: "SageMaker", Icon: Cloud },
  { name: "TypeScript", Icon: SiTypescript },
  { name: "Rust", Icon: SiRust },
  { name: "Next.js", Icon: SiNextdotjs },
  { name: "Playwright", Icon: Braces },
  { name: "MCP", Icon: Network },
  { name: "BM25", Icon: Search },
  { name: "Qdrant", Icon: Database },
  { name: "LLM evaluation", Icon: BrainCircuit },
  { name: "Git", Icon: SiGit },
];
