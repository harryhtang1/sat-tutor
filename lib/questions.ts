import questionsData from "@/data/questions.json";

export interface Question {
  id: string;
  subject: string;
  topic: string;
  slug: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
}

export function getQuestions(): Question[] {
  return questionsData as Question[];
}

export function getQuestionsBySlug(slug: string): Question[] {
  return getQuestions().filter((q) => q.slug === slug);
}

export function getQuestionsBySubjects(subjects: string[]): Question[] {
  const all = getQuestions();
  if (subjects.length === 0) return all;
  return all.filter((q) => subjects.includes(q.subject));
}
