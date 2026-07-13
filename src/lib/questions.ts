import rawQuestions from "../data/questions.json";
import type { Question } from "../data/questions-schema";

export const questions = rawQuestions as Question[];

export type QuestionSummary = {
  total: number;
  subjects: string[];
  chapters: string[];
  types: string[];
  tags: string[];
  imageCount: number;
  explanationCount: number;
};

export function getQuestionById(id: string): Question | undefined {
  return questions.find((question) => question.id === id);
}

export function getQuestionIndex(id: string): number {
  return questions.findIndex((question) => question.id === id);
}

export function getSummary(): QuestionSummary {
  const subjects = new Set<string>();
  const chapters = new Set<string>();
  const types = new Set<string>();
  const tags = new Set<string>();
  let imageCount = 0;
  let explanationCount = 0;

  for (const question of questions) {
    subjects.add(question.subject);
    chapters.add(question.chapter);
    types.add(question.typeLabel);
    for (const tag of question.tags) tags.add(tag);
    if (question.image) imageCount += 1;
    if (question.explanation) explanationCount += 1;
  }

  return {
    total: questions.length,
    subjects: [...subjects].sort(),
    chapters: [...chapters].sort(),
    types: [...types].sort(),
    tags: [...tags].sort(),
    imageCount,
    explanationCount
  };
}

export function adjacentQuestion(id: string): { previous?: Question; next?: Question } {
  const index = getQuestionIndex(id);
  return {
    previous: index > 0 ? questions[index - 1] : undefined,
    next: index >= 0 && index < questions.length - 1 ? questions[index + 1] : undefined
  };
}
