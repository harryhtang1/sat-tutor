export const SECTION_CONFIG = {
  math: {
    label: "Math",
    emoji: "📐",
    accent: "blue",
    topics: [
      { label: "Algebra", slug: "algebra" },
      { label: "Advanced Math", slug: "advanced-math" },
      { label: "Problem-Solving & Data Analysis", slug: "problem-solving-data" },
      { label: "Geometry & Trigonometry", slug: "geometry-trigonometry" },
    ],
  },
  "reading-writing": {
    label: "Reading & Writing",
    emoji: "📖",
    accent: "violet",
    topics: [
      { label: "Information & Ideas", slug: "information-ideas" },
      { label: "Craft & Structure", slug: "craft-structure" },
      { label: "Expression of Ideas", slug: "expression-ideas" },
      { label: "Standard English Conventions", slug: "standard-english-conventions" },
    ],
  },
} as const;

export type SectionKey = keyof typeof SECTION_CONFIG;

export function getSectionConfig(section: string) {
  return SECTION_CONFIG[section as SectionKey] ?? null;
}

export function getTopicLabel(section: string, slug: string): string {
  const config = getSectionConfig(section);
  return config?.topics.find((t) => t.slug === slug)?.label ?? slug;
}
