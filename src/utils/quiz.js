import { localizeText } from "./locale";
import { QR_BRAND_HEADER } from "./branding";

export function shuffleArray(items) {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [nextItems[index], nextItems[swapIndex]] = [nextItems[swapIndex], nextItems[index]];
  }

  return nextItems;
}

export function pickRandomItems(items, count) {
  return shuffleArray(items).slice(0, count);
}

export function calculateScore(questions, answers) {
  const correctCount = questions.reduce((total, question) => {
    return total + Number(answers[question.id] === question.correctAnswer);
  }, 0);

  const total = questions.length;
  const wrongCount = total - correctCount;
  const score = total ? Math.round((correctCount / total) * 100) : 0;

  return {
    score,
    total,
    correctCount,
    wrongCount
  };
}

export function buildTopicBreakdown(questions, answers) {
  const map = new Map();

  questions.forEach((question) => {
    const current = map.get(question.topicId) ?? {
      topicId: question.topicId,
      topicTitle: question.topicTitle,
      correctCount: 0,
      totalCount: 0
    };

    current.totalCount += 1;
    if (answers[question.id] === question.correctAnswer) {
      current.correctCount += 1;
    }

    map.set(question.topicId, current);
  });

  return [...map.values()].sort((left, right) => left.topicTitle.localeCompare(right.topicTitle));
}

export function formatDate(value, language = "uz") {
  const formatted = new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(value));

  return localizeText(formatted, language);
}

export function createCertificateSerial() {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}`;
  const randomPart = Math.floor(1000 + Math.random() * 9000);

  return `LTT-${datePart}-${randomPart}`;
}

export function buildCertificateQrValue(certificate) {
  return [
    QR_BRAND_HEADER,
    `ID: ${certificate.serialNumber}`,
    `NAME: ${certificate.fullName}`,
    `SCORE: ${certificate.score}%`,
    `DATE: ${new Date(certificate.issueDate).toISOString()}`,
    `ATTEMPT: ${certificate.attemptId}`
  ].join("\n");
}

export function getAchievementMeta(score) {
  if (score >= 95) {
    return {
      title: "A'lo daraja",
      message: "Ajoyib natija. Siz materialni yuqori darajada o'zlashtirgansiz.",
      accent: "emerald"
    };
  }

  if (score >= 90) {
    return {
      title: "Zo'r natija",
      message: "Juda kuchli natija. Siz mavzularni ishonchli tarzda egallagansiz.",
      accent: "sky"
    };
  }

  if (score >= 80) {
    return {
      title: "Yaxshi natija",
      message: "Yaxshi va barqaror natija qayd etildi.",
      accent: "amber"
    };
  }

  if (score >= 70) {
    return {
      title: "Barqaror daraja",
      message: "Asosiy bilim shakllangan va natija muvaffaqiyatli qayd etildi.",
      accent: "violet"
    };
  }

  return {
    title: "Asosiy daraja",
    message: "Natija qayd etildi. Bilimni yanada mustahkamlash tavsiya etiladi.",
    accent: "rose"
  };
}
