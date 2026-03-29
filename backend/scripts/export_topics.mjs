import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..", "..");
const sourcePath = path.join(rootDir, "src", "data", "topics.js");
const outputPath = path.join(rootDir, "backend", "app", "seed", "initial_topics.json");

const optionOrders = [
  [0, 1, 2, 3],
  [1, 0, 3, 2],
  [2, 3, 0, 1],
  [3, 0, 1, 2]
];

function createInternetImage({ width = 1280, height = 860, keywords, lock }) {
  const keywordList = Array.isArray(keywords) ? keywords : [keywords];
  const normalizedKeywords = keywordList
    .filter(Boolean)
    .map((keyword) => String(keyword).trim().replace(/\s+/g, " "))
    .join(" ");
  const query = normalizedKeywords ? `&q=${encodeURIComponent(normalizedKeywords)}` : "";
  const version = typeof lock === "number" ? `&v=${lock}` : "";

  return `https://www.sourcesplash.com/i/random?w=${width}&h=${height}${query}${version}`;
}

function buildQuizQuestions(topicId, topicTitle, items) {
  return items.map((item, index) => {
    const distractorPool = items.filter((candidate) => candidate.id !== item.id).map((candidate) => candidate.title);
    const startIndex = distractorPool.length ? index % distractorPool.length : 0;
    const distractors = Array.from({ length: Math.min(3, distractorPool.length) }, (_, offset) => {
      return distractorPool[(startIndex + offset) % distractorPool.length];
    });

    const baseOptions = [item.title, ...distractors];
    while (baseOptions.length < 4) {
      baseOptions.push(item.title);
    }

    const options = optionOrders[index % optionOrders.length].map((orderIndex) => baseOptions[orderIndex]);

    return {
      id: `${topicId}-quiz-${index + 1}`,
      topicId,
      topicTitle,
      learningItemId: item.id,
      question: item.quizQuestion ?? `"${item.description}" ma'lumotiga mos atamani tanlang.`,
      options,
      correctAnswer: item.title,
      sortOrder: index,
    };
  });
}

function extractArrayExpression(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error(`Marker not found: ${marker}`);
  }

  const startIndex = source.indexOf("[", markerIndex);
  if (startIndex === -1) {
    throw new Error("Array start not found");
  }

  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = startIndex; index < source.length; index += 1) {
    const char = source[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      continue;
    }

    if (char === "[") {
      depth += 1;
    } else if (char === "]") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(startIndex, index + 1);
      }
    }
  }

  throw new Error("Array expression was not closed");
}

function mapAsset(assetName) {
  const lookup = {
    toothAnatomyDiagram: "/assets/tooth-anatomy-diagram.svg",
    ogizImage: "/rasm/ogiz.png",
    kallaImage: "/rasm/kalla.png",
    yuzImage: "/rasm/yuz.png",
    boyinImage: "/rasm/boyin.png"
  };

  return lookup[assetName] ?? null;
}

const source = await readFile(sourcePath, "utf8");
const arrayExpression = extractArrayExpression(source, "const topicBlueprints =");

const topicBlueprints = Function(
  "toothAnatomyDiagram",
  "ogizImage",
  "kallaImage",
  "yuzImage",
  "boyinImage",
  `return ${arrayExpression};`
)(
  mapAsset("toothAnatomyDiagram"),
  mapAsset("ogizImage"),
  mapAsset("kallaImage"),
  mapAsset("yuzImage"),
  mapAsset("boyinImage")
);

const topics = topicBlueprints.map((topic, topicIndex) => {
  const learnItems = topic.items.map((item, itemIndex) => ({
    id: `${topic.id}-item-${itemIndex + 1}`,
    title: item.title,
    description: item.description,
    quizQuestion: item.quizQuestion,
    image:
      item.image ??
      createInternetImage({
        width: 880,
        height: 620,
        keywords: item.imageKeywords,
        lock: (topicIndex + 1) * 100 + itemIndex + 1
      }),
    fallbackImage: item.fallbackImage ?? item.image ?? null,
    imageKeywords: item.imageKeywords ?? [],
    sortOrder: itemIndex
  }));

  return {
    id: topic.id,
    title: topic.title,
    description: topic.description,
    glyph: topic.glyph ?? null,
    palette: topic.palette ?? {},
    image:
      topic.image ??
      createInternetImage({
        width: 1280,
        height: 860,
        keywords: topic.imageKeywords,
        lock: topicIndex + 1
      }),
    fallbackImage: topic.fallbackImage ?? topic.image ?? null,
    sortOrder: topicIndex,
    learnItems,
    quizQuestions: buildQuizQuestions(topic.id, topic.title, learnItems)
  };
});

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(
  outputPath,
  JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      topics
    },
    null,
    2
  )
);

console.log(`Seed exported to ${outputPath}`);
