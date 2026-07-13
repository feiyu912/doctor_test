import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultSourcePath =
  "C:\\Users\\薛开成\\Documents\\Codex\\2026-07-10\\https-pdyb-shanghaihengzan-com-exam-mytraining-2\\work\\fifth_set\\questions.json";
const defaultWorkDir = path.dirname(defaultSourcePath);

const sourcePath = path.resolve(process.argv[2] || process.env.SOURCE_QUESTIONS_JSON || defaultSourcePath);
const workDir = path.resolve(process.env.SOURCE_WORK_DIR || path.dirname(sourcePath) || defaultWorkDir);
const outputPath = path.join(projectRoot, "src", "data", "questions.json");
const imageOutputDir = path.join(projectRoot, "public", "images", "questions");

const subjectByChapterId = {
  "106205": "西医医师"
};

const typeByTypeId = {
  "1": "single-choice",
  "2": "multiple-choice",
  "4": "single-choice",
  "10": "case"
};

const sourceImageBase = "https://pdyb.shanghaihengzan.com";
const knownReadImagePathsByChapter = {
  "106205": [
    "/Areas/Exam/Content/20260319040903530/XD15.png",
    "/Areas/Exam/Content/20260319040621731/p056.jpg",
    "/Areas/Exam/Content/20260319040621731/p020.jpg",
    "/Areas/Exam/Content/20260319040621731/p006.jpg",
    "/Areas/Exam/Content/20260319040903530/XD8.png",
    "/Areas/Exam/Content/20260319040903530/XD2.png",
    "/Areas/Exam/Content/20260319040621731/p026.jpg",
    "/Areas/Exam/Content/20260319040621731/p001.jpg",
    "/Areas/Exam/Content/20260319040903530/XD89.png",
    "/Areas/Exam/Content/20260319040903530/XD1.png",
    "/Areas/Exam/Content/20260319040621731/p060.jpg",
    "/Areas/Exam/Content/20260319040903530/XD3.png",
    "/Areas/Exam/Content/20260319040621731/p019.jpg",
    "/Areas/Exam/Content/20260319040621731/p007.jpg",
    "/Areas/Exam/Content/20260319040621731/p025.jpg",
    "/Areas/Exam/Content/20260319040621731/p016.jpg",
    "/Areas/Exam/Content/20260319040621731/p008.jpg",
    "/Areas/Exam/Content/20260319040903530/XD91.png",
    "/Areas/Exam/Content/20260319040621731/p014.jpg",
    "/Areas/Exam/Content/20260319040903530/XD5.png",
    "/Areas/Exam/Content/20260319040903530/XD12.png",
    "/Areas/Exam/Content/20260319040903530/XD6.png",
    "/Areas/Exam/Content/20260319040903530/XD82.png",
    "/Areas/Exam/Content/20260319040903530/XD84.png",
    "/Areas/Exam/Content/20260319040903530/XD88.png",
    "/Areas/Exam/Content/20260319040621731/p005.jpg",
    "/Areas/Exam/Content/20260319040903530/XD7.png",
    "/Areas/Exam/Content/20260319040621731/p055.jpg",
    "/Areas/Exam/Content/20260319040621731/p009.jpg",
    "/Areas/Exam/Content/20260319040621731/p022.jpg"
  ]
};

function normalizeText(value) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .trim();
}

function normalizeAnswer(value) {
  const text = normalizeText(value).toUpperCase();
  if (!text) return [];
  return [...new Set(text.match(/[A-Z]/g) ?? [])];
}

function toOptions(rawOptions) {
  const options = {};
  for (const option of rawOptions ?? []) {
    const key = normalizeText(option.key).toUpperCase();
    const text = normalizeText(option.text);
    if (key && text) options[key] = text;
  }
  return options;
}

function buildTags(raw, hasImage) {
  const tags = [
    normalizeText(raw.typeName),
    normalizeText(raw.questionType),
    `training-${normalizeText(raw.chapterId)}`
  ];
  if (String(raw.typeId) === "4") tags.push("读片题");
  if (hasImage) tags.push("含图片");
  return [...new Set(tags.filter(Boolean))];
}

function getType(raw) {
  const typeId = String(raw.typeId ?? "");
  if (typeByTypeId[typeId]) return typeByTypeId[typeId];
  if (normalizeText(raw.questionType).includes("多选")) return "multiple-choice";
  return "single-choice";
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function extractHtmlImageRefs(html) {
  const refs = [];
  const imageMatches = [...html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)];
  const answerIdMatch = html.match(/doAnswer\((\d+),\s*this\s*,/i);
  if (!answerIdMatch) return refs;

  for (const match of imageMatches) {
    const src = match[1];
    if (!src.includes("/Areas/Exam/Content/")) continue;
    refs.push({
      originalId: answerIdMatch[1],
      sourceUrl: src.startsWith("http") ? src : `${sourceImageBase}${src}`,
      sourcePath: src
    });
  }
  return refs;
}

async function discoverReadImages() {
  const refsById = new Map();
  let entries = [];
  try {
    entries = await fs.readdir(workDir, { withFileTypes: true });
  } catch {
    return refsById;
  }

  for (const entry of entries) {
    if (!entry.isFile() || !/^last_106205_\d+\.html$/i.test(entry.name)) continue;
    const htmlPath = path.join(workDir, entry.name);
    const html = await fs.readFile(htmlPath, "utf8");
    for (const ref of extractHtmlImageRefs(html)) {
      if (!refsById.has(ref.originalId)) refsById.set(ref.originalId, ref);
    }
  }
  return refsById;
}

function addKnownReadImagesByOrder(refsById, rawQuestions) {
  for (const [chapterId, imagePaths] of Object.entries(knownReadImagePathsByChapter)) {
    const readQuestions = rawQuestions.filter(
      (raw) => normalizeText(raw.chapterId) === chapterId && String(raw.typeId) === "4"
    );

    for (let index = 0; index < Math.min(imagePaths.length, readQuestions.length); index += 1) {
      const raw = readQuestions[index];
      const originalId = normalizeText(raw.id);
      const sourcePath = imagePaths[index];
      refsById.set(originalId, {
        originalId,
        sourceUrl: `${sourceImageBase}${sourcePath}`,
        sourcePath
      });
    }
  }
  return refsById;
}

async function downloadImage(ref, chapterId) {
  const ext = path.extname(new URL(ref.sourceUrl).pathname) || ".jpg";
  const filename = `${chapterId}-${ref.originalId}-${path.basename(ref.sourcePath, ext)}${ext}`.replace(/[^\w.-]+/g, "-");
  const targetPath = path.join(imageOutputDir, filename);
  await fs.mkdir(imageOutputDir, { recursive: true });

  if (!(await fileExists(targetPath))) {
    const response = await fetch(ref.sourceUrl);
    if (!response.ok) {
      throw new Error(`Failed to download ${ref.sourceUrl}: ${response.status} ${response.statusText}`);
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(targetPath, bytes);
  }

  return `/images/questions/${filename}`;
}

function validateQuestion(question) {
  const errors = [];
  if (!question.id) errors.push("missing id");
  if (!question.subject) errors.push(`${question.id}: missing subject`);
  if (!question.chapter) errors.push(`${question.id}: missing chapter`);
  if (!question.question) errors.push(`${question.id}: missing question`);
  if (!question.options || Object.keys(question.options).length === 0) {
    errors.push(`${question.id}: missing options`);
  }
  if (!Array.isArray(question.answer) || question.answer.length === 0) {
    errors.push(`${question.id}: missing answer`);
  }
  for (const answer of question.answer || []) {
    if (!Object.prototype.hasOwnProperty.call(question.options, answer)) {
      errors.push(`${question.id}: answer ${answer} is not present in options`);
    }
  }
  return errors;
}

async function main() {
  const rawQuestions = JSON.parse(await fs.readFile(sourcePath, "utf8"));
  if (!Array.isArray(rawQuestions)) {
    throw new Error(`Expected an array in ${sourcePath}`);
  }

  const readImageRefs = addKnownReadImagesByOrder(await discoverReadImages(), rawQuestions);
  const imageByOriginalId = new Map();
  const imageFailures = [];

  for (const raw of rawQuestions) {
    const originalId = normalizeText(raw.id);
    const ref = readImageRefs.get(originalId);
    if (!ref) continue;
    try {
      imageByOriginalId.set(originalId, await downloadImage(ref, normalizeText(raw.chapterId)));
    } catch (error) {
      imageFailures.push(`${originalId}: ${error.message}`);
    }
  }

  const ids = new Set();
  const imported = rawQuestions.map((raw) => {
    const originalId = normalizeText(raw.id);
    const chapterId = normalizeText(raw.chapterId);
    const id = `${chapterId}-${originalId}`;
    const options = toOptions(raw.options);
    const answer = normalizeAnswer(raw.correctAnswer);
    const image = imageByOriginalId.get(originalId) || "";

    const question = {
      id,
      originalId,
      subject: subjectByChapterId[chapterId] || "医学",
      chapter: normalizeText(raw.chapterName) || `训练 ${chapterId}`,
      type: getType(raw),
      typeLabel: normalizeText(raw.typeName) || normalizeText(raw.questionType),
      sharedStem: normalizeText(raw.stem),
      question: normalizeText(raw.question || raw.stem),
      options,
      answer,
      explanation: normalizeText(raw.analysis),
      image,
      imageAlt: image ? `${normalizeText(raw.typeName)} ${raw.number ?? originalId}` : "",
      tags: buildTags(raw, Boolean(image)),
      source: normalizeText(raw.sourceUrl)
    };

    if (ids.has(id)) throw new Error(`Duplicate id ${id}`);
    ids.add(id);
    return question;
  });

  const validationErrors = imported.flatMap(validateQuestion);
  if (validationErrors.length > 0) {
    throw new Error(`Validation failed:\n${validationErrors.join("\n")}`);
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(imported, null, 2)}\n`, "utf8");

  const readCount = imported.filter((question) => question.tags.includes("读片题")).length;
  const imageCount = imported.filter((question) => question.image).length;
  console.log(`Imported ${imported.length} questions to ${outputPath}`);
  console.log(`Read-image questions: ${readCount}; questions with local images: ${imageCount}`);
  if (imageFailures.length > 0) {
    console.warn(`Image download failures:\n${imageFailures.join("\n")}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
