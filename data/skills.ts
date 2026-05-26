import type { ComponentType, SVGProps } from "react";
import {
  SiPython,
  SiPytorch,
  SiTensorflow,
  SiScikitlearn,
  SiHuggingface,
  SiFastapi,
  SiPostgresql,
  SiMongodb,
  SiApachekafka,
  SiApachespark,
  SiGooglecloud,
  SiDocker,
  SiKubernetes,
  SiTerraform,
  SiMlflow,
  SiGit,
  SiTypescript,
  SiNextdotjs,
  SiVercel,
  SiOpenai,
  SiAnthropic,
  SiLangchain,
} from "react-icons/si";
import { Cloud } from "lucide-react";

type IconCmp = ComponentType<SVGProps<SVGSVGElement> & { size?: string | number }>;

export type Skill = { name: string; Icon: IconCmp };

export const skills: Skill[] = [
  { name: "Python", Icon: SiPython },
  { name: "PyTorch", Icon: SiPytorch },
  { name: "TensorFlow", Icon: SiTensorflow },
  { name: "scikit-learn", Icon: SiScikitlearn },
  { name: "Hugging Face", Icon: SiHuggingface },
  { name: "FastAPI", Icon: SiFastapi },
  { name: "PostgreSQL", Icon: SiPostgresql },
  { name: "MongoDB", Icon: SiMongodb },
  { name: "Kafka", Icon: SiApachekafka },
  { name: "PySpark", Icon: SiApachespark },
  { name: "GCP", Icon: SiGooglecloud },
  { name: "AWS", Icon: Cloud },
  { name: "Docker", Icon: SiDocker },
  { name: "Kubernetes", Icon: SiKubernetes },
  { name: "Terraform", Icon: SiTerraform },
  { name: "MLflow", Icon: SiMlflow },
  { name: "OpenAI", Icon: SiOpenai },
  { name: "Anthropic", Icon: SiAnthropic },
  { name: "LangChain", Icon: SiLangchain },
  { name: "TypeScript", Icon: SiTypescript },
  { name: "Next.js", Icon: SiNextdotjs },
  { name: "Vercel", Icon: SiVercel },
  { name: "Git", Icon: SiGit },
];
