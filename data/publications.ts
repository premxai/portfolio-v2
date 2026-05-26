export type Publication = {
  title: string;
  venue?: string;
  year: string;
  authors: string;
  abstract: string;
  href?: string;
};

export const publications: Publication[] = [
  {
    title: "Lightweight Channel Attention for Efficient CNNs",
    year: "2024",
    venue: "Preprint",
    authors: "Prem Babu Kanaparthi",
    abstract:
      "Designed and evaluated a lightweight channel attention module (LCA) achieving competitive accuracy with negligible parameter and latency overhead on ResNet-18 and MobileNetV2.",
    href: "https://arxiv.org/abs/2601.01002",
  },
];
