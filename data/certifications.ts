export type Certification = {
  title: string;
  issuer: string;
  year?: string;
  href?: string;
};

export const certifications: Certification[] = [
  {
    title: "Machine Learning Specialization",
    issuer: "Stanford Online · Coursera",
    href: "https://www.coursera.org/specializations/machine-learning-introduction",
  },
];
