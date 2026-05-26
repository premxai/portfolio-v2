export type ArticleTopic =
  | "ML Fundamentals"
  | "Inference"
  | "Agents"
  | "Evaluation"
  | "Notes";

export type Article = {
  slug: string;
  title: string;
  tagline: string;
  date: string; // ISO-ish: "2025-04-12"
  readMinutes: number;
  topic: ArticleTopic;
  /** Show on the home page writing teaser when true. */
  featured?: boolean;
  /** External URL — when set, the card links out instead of routing internally. */
  href?: string;
};

export const articles: Article[] = [
  {
    slug: "transformer-from-scratch",
    title: "Transformer from Scratch",
    tagline:
      '"Attention Is All You Need" reimplemented in raw PyTorch — what I learned by typing every line.',
    date: "2025-04-20",
    readMinutes: 12,
    topic: "ML Fundamentals",
    featured: true,
  },
];

export const featuredArticles = articles.filter((a) => a.featured);
