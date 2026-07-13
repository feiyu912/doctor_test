export type QuestionType = "single-choice" | "multiple-choice" | "true-false" | "case";

export type Question = {
  id: string;
  originalId?: string;
  subject: string;
  chapter: string;
  type: QuestionType;
  typeLabel: string;
  question: string;
  options: Record<string, string>;
  answer: string[];
  explanation?: string;
  image?: string;
  imageAlt?: string;
  tags: string[];
  source?: string;
};

export function validateQuestion(question: Question): string[] {
  const errors: string[] = [];
  if (!question.id) errors.push("missing id");
  if (!question.subject) errors.push("missing subject");
  if (!question.chapter) errors.push("missing chapter");
  if (!question.question) errors.push("missing question");
  if (!question.options || Object.keys(question.options).length === 0) errors.push("missing options");
  if (!Array.isArray(question.answer) || question.answer.length === 0) errors.push("missing answer");
  for (const answer of question.answer || []) {
    if (!Object.prototype.hasOwnProperty.call(question.options, answer)) {
      errors.push(`answer ${answer} is not present in options`);
    }
  }
  return errors;
}
