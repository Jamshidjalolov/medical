import { createInternetImage, createItemImage, createTopicImage } from "./imageFactory";

const palettePresets = [
  { from: "#E0F2FE", to: "#DBEAFE", highlight: "#BFDBFE", ink: "#0F172A" },
  { from: "#DCFCE7", to: "#BFDBFE", highlight: "#FDE68A", ink: "#14532D" },
  { from: "#FEE2E2", to: "#FBCFE8", highlight: "#FDE68A", ink: "#7F1D1D" },
  { from: "#EDE9FE", to: "#DDD6FE", highlight: "#C4B5FD", ink: "#312E81" },
  { from: "#FEF3C7", to: "#FED7AA", highlight: "#FDE68A", ink: "#7C2D12" },
  { from: "#E2E8F0", to: "#CBD5E1", highlight: "#BFDBFE", ink: "#1E293B" }
];

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createGlyph(value) {
  return String(value ?? "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 3) || "MV";
}

function getPalette(index, palette) {
  const fallback = palettePresets[index % palettePresets.length];
  return {
    from: palette?.from ?? fallback.from,
    to: palette?.to ?? fallback.to,
    highlight: palette?.highlight ?? fallback.highlight,
    ink: palette?.ink ?? fallback.ink
  };
}

function ensureOptions(question, learnItems) {
  const rawOptions = Array.isArray(question?.options)
    ? question.options.map((item) => String(item ?? "").trim()).filter(Boolean)
    : [];

  const fallbackOptions = learnItems.map((item) => item.title).filter(Boolean);
  const correctAnswer = String(question?.correctAnswer ?? rawOptions[0] ?? fallbackOptions[0] ?? "Variant 1").trim();
  const unique = [];

  [correctAnswer, ...rawOptions, ...fallbackOptions].forEach((option) => {
    if (option && !unique.includes(option)) {
      unique.push(option);
    }
  });

  while (unique.length < 4) {
    unique.push(`Variant ${unique.length + 1}`);
  }

  return {
    options: unique.slice(0, 4),
    correctAnswer
  };
}

export function createEmptyProgress() {
  return {
    reviewedTopics: [],
    completedTopics: [],
    topicQuizResults: {},
    certificateExamResult: null,
    generatedCertificate: null,
    certificateHistory: []
  };
}

export function ensureLearningItemShape(item, meta) {
  const title = String(item?.title ?? `Karta ${meta.itemIndex + 1}`).trim() || `Karta ${meta.itemIndex + 1}`;
  const description = String(item?.description ?? "Qisqa izoh qo'shing.").trim() || "Qisqa izoh qo'shing.";
  const itemId = slugify(item?.id || `${meta.topicId}-item-${meta.itemIndex + 1}`) || `${meta.topicId}-item-${meta.itemIndex + 1}`;
  const imageKeywords = Array.isArray(item?.imageKeywords) && item.imageKeywords.length ? item.imageKeywords : [title, meta.topicTitle];

  return {
    id: itemId,
    title,
    description,
    quizQuestion:
      String(item?.quizQuestion ?? `"${description}" ma'lumotiga mos atamani tanlang.`).trim() ||
      `"${description}" ma'lumotiga mos atamani tanlang.`,
    imageKeywords,
    image:
      String(item?.image ?? "").trim() ||
      createInternetImage({
        width: 880,
        height: 620,
        keywords: imageKeywords,
        lock: (meta.topicIndex + 1) * 100 + meta.itemIndex + 1
      }),
    fallbackImage:
      item?.fallbackImage ||
      createItemImage({
        title,
        subtitle: meta.topicTitle,
        palette: meta.palette,
        glyph: String(meta.itemIndex + 1).padStart(2, "0")
      })
  };
}

export function ensureQuizQuestionShape(question, meta) {
  const questionId =
    slugify(question?.id || `${meta.topicId}-quiz-${meta.questionIndex + 1}`) || `${meta.topicId}-quiz-${meta.questionIndex + 1}`;
  const { options, correctAnswer } = ensureOptions(question, meta.learnItems);
  const text =
    String(question?.question ?? `"${meta.learnItems[meta.questionIndex]?.description ?? meta.topicTitle}" ma'lumotiga mos javobni tanlang.`).trim() ||
    `"${meta.learnItems[meta.questionIndex]?.description ?? meta.topicTitle}" ma'lumotiga mos javobni tanlang.`;

  return {
    id: questionId,
    topicId: meta.topicId,
    topicTitle: meta.topicTitle,
    learningItemId: question?.learningItemId ?? meta.learnItems[meta.questionIndex]?.id ?? null,
    question: text,
    options,
    correctAnswer
  };
}

export function ensureTopicShape(topic, index) {
  const title = String(topic?.title ?? `Yangi mavzu ${index + 1}`).trim() || `Yangi mavzu ${index + 1}`;
  const id = slugify(topic?.id || title || `topic-${index + 1}`) || `topic-${index + 1}`;
  const palette = getPalette(index, topic?.palette);
  const glyph = String(topic?.glyph ?? createGlyph(title)).trim().slice(0, 3) || createGlyph(title);
  const description = String(topic?.description ?? "Mavzu uchun qisqa tavsif.").trim() || "Mavzu uchun qisqa tavsif.";
  const imageKeywords = Array.isArray(topic?.imageKeywords) && topic.imageKeywords.length ? topic.imageKeywords : [title, "education"];

  const learnItems = Array.isArray(topic?.learnItems)
    ? topic.learnItems.map((item, itemIndex) =>
        ensureLearningItemShape(item, {
          topicId: id,
          topicTitle: title,
          topicIndex: index,
          itemIndex,
          palette
        })
      )
    : [];

  const quizQuestions = Array.isArray(topic?.quizQuestions)
    ? topic.quizQuestions.map((question, questionIndex) =>
        ensureQuizQuestionShape(question, {
          topicId: id,
          topicTitle: title,
          learnItems,
          questionIndex
        })
      )
    : [];

  return {
    id,
    title,
    description,
    glyph,
    palette,
    imageKeywords,
    image:
      String(topic?.image ?? "").trim() ||
      createInternetImage({
        width: 1280,
        height: 860,
        keywords: imageKeywords,
        lock: index + 1
      }),
    fallbackImage:
      topic?.fallbackImage ||
      createTopicImage({
        title,
        subtitle: "Ta'lim mavzusi",
        palette,
        glyph
      }),
    learnItems,
    quizQuestions
  };
}

export function normalizeTopicsData(items) {
  return (Array.isArray(items) ? items : []).map((item, index) => ensureTopicShape(item, index));
}

export function createTopicDraft(topicCount) {
  return ensureTopicShape(
    {
      id: `yangi-mavzu-${topicCount + 1}`,
      title: `Yangi mavzu ${topicCount + 1}`,
      description: "Mavzu uchun qisqa tavsif yozing.",
      glyph: `M${topicCount + 1}`
    },
    topicCount
  );
}
