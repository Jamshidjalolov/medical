import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import ogizImage from "../rasm/ogiz.png";
import kallaImage from "../rasm/kalla.png";
import yuzImage from "../rasm/yuz.png";
import boyinImage from "../rasm/boyin.png";
import ProgressBar from "../components/ProgressBar";
import SmartImage from "../components/SmartImage";
import { useAppContext } from "../context/AppContext";
import { localizeText } from "../utils/locale";

const structuredTopicConfigs = {
  "noun-five-declensions": {
    singularLabel: "turlanish",
    pluralLabel: "ta turlanish",
    heading: "5 ta turlanish",
    overviewText: "Har bir turlanishni alohida tanlab o'rganing. Bitta turlanish tugagach ro'yxatga qaytasiz.",
    progressText: "ta turlanish tugatildi",
    finishButton: "Turlanishni tugatish",
    lockedQuizText: "Avval 5 ta turlanishni tugating"
  },
  "noun-third-declension": {
    singularLabel: "bo'lim",
    pluralLabel: "ta bo'lim",
    heading: "3-turlanish bo'limlari",
    overviewText: "Har bir bo'limni alohida tanlab o'rganing. Bitta bo'lim tugagach ro'yxatga qaytasiz.",
    progressText: "ta bo'lim tugatildi",
    finishButton: "Bo'limni tugatish",
    lockedQuizText: "Avval barcha bo'limlarni tugating"
  },
  "adjective-groups": {
    singularLabel: "bo'lim",
    pluralLabel: "ta bo'lim",
    heading: "Sifat bo'limlari",
    overviewText: "Har bir bo'limni alohida tanlab o'rganing. Bitta bo'lim tugagach ro'yxatga qaytasiz.",
    progressText: "ta bo'lim tugatildi",
    finishButton: "Bo'limni tugatish",
    lockedQuizText: "Avval barcha bo'limlarni tugating"
  },
  "tooth-anatomy": {
    singularLabel: "bo'lim",
    pluralLabel: "ta bo'lim",
    heading: "Tish anatomiyasi bo'limlari",
    overviewText: "Avval diagrammaga qarang, keyin bo'limlarni alohida tanlab o'rganing. Har bir bo'lim tugagach ro'yxatga qaytasiz.",
    progressText: "ta bo'lim tugatildi",
    finishButton: "Bo'limni tugatish",
    lockedQuizText: "Avval barcha bo'limlarni tugating",
    showIntroImage: true
  },
  "oral-cavity": {
    singularLabel: "bo'lim",
    pluralLabel: "ta bo'lim",
    heading: "Og'iz bo'shlig'i bo'limlari",
    overviewText: "Avval diagrammaga qarang, keyin bo'limlarni alohida tanlab o'rganing. Har bir bo'lim tugagach ro'yxatga qaytasiz.",
    progressText: "ta bo'lim tugatildi",
    finishButton: "Bo'limni tugatish",
    lockedQuizText: "Avval barcha bo'limlarni tugating",
    showIntroImage: true
  },
  "skull-bones": {
    singularLabel: "bo'lim",
    pluralLabel: "ta bo'lim",
    heading: "Kalla suyagi bo'limlari",
    overviewText: "Avval rasmga qarang, keyin bo'limlarni alohida tanlab o'rganing. Har bir bo'lim tugagach ro'yxatga qaytasiz.",
    progressText: "ta bo'lim tugatildi",
    finishButton: "Bo'limni tugatish",
    lockedQuizText: "Avval barcha bo'limlarni tugating",
    showIntroImage: true
  },
  "dental-formula": {
    singularLabel: "bo'lim",
    pluralLabel: "ta bo'lim",
    heading: "Yuz mushaklari bo'limlari",
    overviewText: "Avval rasmga qarang, keyin bo'limlarni alohida tanlab o'rganing. Har bir bo'lim tugagach ro'yxatga qaytasiz.",
    progressText: "ta bo'lim tugatildi",
    finishButton: "Bo'limni tugatish",
    lockedQuizText: "Avval barcha bo'limlarni tugating",
    showIntroImage: true
  },
  "tooth-surfaces": {
    singularLabel: "bo'lim",
    pluralLabel: "ta bo'lim",
    heading: "Bo'yin mushaklari bo'limlari",
    overviewText: "Avval rasmga qarang, keyin bo'limlarni alohida tanlab o'rganing. Har bir bo'lim tugagach ro'yxatga qaytasiz.",
    progressText: "ta bo'lim tugatildi",
    finishButton: "Bo'limni tugatish",
    lockedQuizText: "Avval barcha bo'limlarni tugating",
    showIntroImage: true
  }
};

export default function TopicLearningPage() {
  const { topicId } = useParams();
  const { language, completedLearningItemsByTopic, completeLearningItem, topicQuizResults, topicLookup } = useAppContext();
  const topic = topicLookup[topicId];
  const tx = (value) => localizeText(value, language);
  const structuredTopicConfig = topic ? structuredTopicConfigs[topic.id] : null;
  const isStructuredTopic = Boolean(structuredTopicConfig);
  const fullItemIds = topic?.learnItems.map((item) => item.id) ?? [];
  const completedItemIds = completedLearningItemsByTopic[topicId] ?? [];
  const isReviewed = Boolean(topic?.learnItems.length) && completedItemIds.length >= topic.learnItems.length;
  const [viewMode, setViewMode] = useState("overview");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [subStepIndex, setSubStepIndex] = useState(0);
  const [seenIds, setSeenIds] = useState(completedItemIds);

  useEffect(() => {
    setViewMode("overview");
    setCurrentIndex(0);
    setSubStepIndex(0);
    setSeenIds(completedItemIds);
  }, [completedItemIds, topicId]);

  if (!topic) {
    return <Navigate replace to="/topics" />;
  }

  const topicHeroOverrides = {
    "oral-cavity": ogizImage,
    "skull-bones": kallaImage,
    "dental-formula": yuzImage,
    "tooth-surfaces": boyinImage
  };
  const topicHeroImage = topicHeroOverrides[topic.id] ?? topic.image;
  const topicHeroFallbackImage = topicHeroOverrides[topic.id] ?? topic.fallbackImage;
  const canTakeQuiz = seenIds.length === topic.learnItems.length || Boolean(lastResult) || isReviewed;
  const lastResult = topicQuizResults[topic.id];
  const currentItem = topic.learnItems[currentIndex];
  const learnUnitLabel = tx(isStructuredTopic ? structuredTopicConfig.pluralLabel : "ta karta");
  const overviewProgressLabel = isStructuredTopic
    ? `${seenIds.length} / ${topic.learnItems.length} ${tx(structuredTopicConfig.singularLabel)}`
    : `${seenIds.length} ${tx("ta ko'rildi")}`;
  const learnProgressHint = isStructuredTopic
    ? `${seenIds.length} / ${topic.learnItems.length} ${tx(structuredTopicConfig.progressText)}.`
    : `${seenIds.length} / ${topic.learnItems.length} ${tx("ta karta ko'rildi")}.`;
  const getLearningPreview = (description) => {
    const lines = String(description ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => line !== "Qoidasi:" && line !== "Misollar:");

    return lines[0] ?? "";
  };
  const getDeclensionSteps = (description) => {
    const lines = String(description ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const steps = [];
    let mode = "default";
    let exampleIndex = 0;

    lines.forEach((line) => {
      if (line === "Qoidasi:") {
        mode = "rule";
        return;
      }

      if (line === "Misollar:") {
        mode = "examples";
        return;
      }

      if (mode === "rule") {
        steps.push({
          label: "Qoida",
          text: line
        });
        return;
      }

      if (mode === "examples") {
        exampleIndex += 1;
        steps.push({
          label: `Misol ${exampleIndex}`,
          text: line
        });
        return;
      }

      steps.push({
        label: "Ma'lumot",
        text: line
      });
    });

    return steps.length
      ? steps
      : [
          {
            label: "Ma'lumot",
            text: String(description ?? "")
          }
        ];
  };
  const getStepType = (step) => {
    if (step?.label?.startsWith("Misol")) {
      return "example";
    }

    if (step?.label === "Qoida") {
      return "rule";
    }

    return "info";
  };
  const parseExampleText = (text) => {
    const [term, ...meaningParts] = String(text ?? "").split(/\s+-\s+/);

    return {
      term: term?.trim() ?? "",
      meaning: meaningParts.join(" - ").trim()
    };
  };
  const currentSteps = isStructuredTopic ? getDeclensionSteps(currentItem?.description) : [];
  const currentStep = currentSteps[subStepIndex] ?? null;
  const currentStepType = getStepType(currentStep);
  const currentExample = currentStepType === "example" ? parseExampleText(currentStep?.text) : null;
  const isPreviousDisabled = isStructuredTopic ? currentIndex === 0 && subStepIndex === 0 : currentIndex === 0;
  const nextButtonLabel = isStructuredTopic
    ? subStepIndex === currentSteps.length - 1
      ? tx(structuredTopicConfig.finishButton)
      : tx("Keyingi")
    : currentIndex === topic.learnItems.length - 1
      ? tx("Yakunlash")
      : tx("Keyingi");

  const markLearningItemSeen = async (itemId) => {
    if (!itemId || seenIds.includes(itemId) || !topic) {
      return;
    }

    await completeLearningItem(topic.id, itemId);
    setSeenIds((previousState) => (previousState.includes(itemId) ? previousState : [...previousState, itemId]));
  };

  const handleStartLearning = (startIndex = 0) => {
    setViewMode("learning");
    setCurrentIndex(startIndex);
    setSubStepIndex(0);
  };

  const handleNextCard = async () => {
    if (isStructuredTopic) {
      if (subStepIndex < currentSteps.length - 1) {
        setSubStepIndex((previousState) => previousState + 1);
        return;
      }

      await markLearningItemSeen(currentItem.id);
      setViewMode("overview");
      setSubStepIndex(0);
      return;
    }

    await markLearningItemSeen(currentItem.id);

    if (currentIndex === topic.learnItems.length - 1) {
      setViewMode("overview");
      return;
    }

    setCurrentIndex((previousState) => Math.min(previousState + 1, topic.learnItems.length - 1));
  };

  const handlePreviousCard = () => {
    if (isStructuredTopic) {
      if (subStepIndex > 0) {
        setSubStepIndex((previousState) => Math.max(previousState - 1, 0));
        return;
      }

      if (currentIndex === 0) {
        return;
      }

      const previousIndex = currentIndex - 1;
      const previousSteps = getDeclensionSteps(topic.learnItems[previousIndex]?.description);
      setCurrentIndex(previousIndex);
      setSubStepIndex(Math.max(previousSteps.length - 1, 0));
      return;
    }

    setCurrentIndex((previousState) => Math.max(previousState - 1, 0));
  };

  return (
    <div className="page-shell -mt-5 sm:-mt-6">
      {viewMode === "overview" ? (
        <section className="w-full overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/92 shadow-soft sm:rounded-[34px]">
          <div className="flex flex-col gap-5 px-4 pt-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pt-6">
            <div className="flex min-w-0 flex-wrap items-center gap-3 sm:flex-nowrap sm:gap-4">
              <Link to="/topics" className="secondary-button">
                {tx("Orqaga")}
              </Link>
              <div className="h-14 w-14 overflow-hidden rounded-[20px] border border-slate-200 bg-slate-100 shadow-sm sm:h-16 sm:w-16 sm:rounded-[24px]">
                <SmartImage
                  src={topicHeroImage}
                  fallbackSrc={topicHeroFallbackImage}
                  alt={tx(topic.title)}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="break-words text-xl font-semibold text-slate-950 sm:text-2xl">{tx(topic.title)}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {topic.learnItems.length} {learnUnitLabel}
                </p>
              </div>
            </div>

            <div className="inline-flex w-fit self-start rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 sm:self-auto">
              {overviewProgressLabel}
            </div>
          </div>

          <div className="px-4 py-8 sm:px-10 sm:py-10">
            {isStructuredTopic ? (
              <div className="space-y-4">
                <div className="text-center">
                  {structuredTopicConfig.showIntroImage ? (
                    <div className="mx-auto mb-6 max-w-3xl overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-soft sm:rounded-[30px]">
                      <SmartImage
                        src={topicHeroImage}
                        fallbackSrc={topicHeroFallbackImage}
                        alt={tx(topic.title)}
                        className="h-auto w-full object-cover"
                      />
                    </div>
                  ) : null}
                  <h2 className="text-2xl font-semibold text-slate-950 sm:text-4xl">{tx(structuredTopicConfig.heading)}</h2>
                  <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                    {tx(structuredTopicConfig.overviewText)}
                  </p>
                </div>

                <div className="grid gap-4">
                  {topic.learnItems.map((item, itemIndex) => {
                    const isSeen = seenIds.includes(item.id);
                    const isUnlocked =
                      itemIndex === 0 ||
                      isSeen ||
                      seenIds.includes(topic.learnItems[itemIndex - 1]?.id);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleStartLearning(itemIndex)}
                        disabled={!isUnlocked}
                        className={`flex w-full flex-col items-start gap-4 rounded-[24px] border px-4 py-4 text-left transition-all duration-300 sm:flex-row sm:items-center sm:justify-between sm:rounded-[30px] sm:px-6 sm:py-5 ${
                          isUnlocked
                            ? "border-slate-200 bg-white shadow-soft hover:-translate-y-0.5 hover:shadow-lg"
                            : "cursor-not-allowed border-slate-200 bg-slate-100 opacity-70"
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] text-sm font-semibold sm:h-14 sm:w-14 sm:rounded-[20px] sm:text-base ${
                              isSeen ? "bg-emerald-500 text-white" : "bg-slate-950 text-white"
                            }`}
                          >
                            {String(itemIndex + 1).padStart(2, "0")}
                          </div>
                          <div className="min-w-0">
                            <p className="text-lg font-semibold text-slate-950 sm:text-xl">{tx(item.title)}</p>
                            <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-500">
                              {tx(getLearningPreview(item.description))}
                            </p>
                          </div>
                        </div>
                        <div className="flex w-full shrink-0 items-center justify-between gap-3 sm:ml-4 sm:w-auto sm:justify-end">
                          {isSeen ? (
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                              {tx("Ko'rildi")}
                            </span>
                          ) : null}
                          <span className="text-3xl text-slate-300">{">"}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {canTakeQuiz ? (
                  <Link
                    to={`/topics/${topic.id}/quiz`}
                    className="mt-4 flex w-full flex-col items-start gap-4 rounded-[28px] border border-slate-200 bg-slate-950 px-5 py-6 text-left text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:flex-row sm:items-center sm:justify-between sm:rounded-[32px] sm:px-8 sm:py-7"
                  >
                    <div className="flex items-center gap-4 sm:gap-5">
                      <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-white/10 text-base font-semibold text-white ring-1 ring-white/10 sm:h-16 sm:w-16 sm:rounded-[22px] sm:text-lg">
                        02
                      </div>
                      <div>
                        <p className="text-xl font-semibold sm:text-2xl">{tx("Test ishlash")}</p>
                        <p className="mt-2 text-sm leading-7 text-slate-300">{tx("Endi testni boshlashingiz mumkin")}</p>
                      </div>
                    </div>
                    <span className="self-end text-3xl text-slate-400 sm:self-auto">{">"}</span>
                  </Link>
                ) : (
                  <div className="mt-4 flex w-full flex-col items-start gap-4 rounded-[28px] border border-slate-200 bg-slate-100 px-5 py-6 text-left shadow-sm sm:flex-row sm:items-center sm:justify-between sm:rounded-[32px] sm:px-8 sm:py-7">
                    <div className="flex items-center gap-4 sm:gap-5">
                      <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-white text-base font-semibold text-slate-500 shadow-sm sm:h-16 sm:w-16 sm:rounded-[22px] sm:text-lg">
                        02
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-slate-500 sm:text-2xl">{tx("Test ishlash")}</p>
                        <p className="mt-2 text-sm leading-7 text-slate-400">{tx(structuredTopicConfig.lockedQuizText)}</p>
                      </div>
                    </div>
                    <span className="self-end text-3xl text-slate-300 sm:self-auto">{">"}</span>
                  </div>
                )}

                {lastResult ? (
                  <div className="rounded-[26px] border border-slate-200 bg-slate-50 px-5 py-4 text-left">
                    <p className="text-sm font-semibold text-slate-500">{tx("Oxirgi natija")}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">{lastResult.score}%</p>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="text-center">
                <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.35)] ring-1 ring-slate-200 sm:h-28 sm:w-28">
                  <SmartImage
                    src={topicHeroImage}
                    fallbackSrc={topicHeroFallbackImage}
                    alt={tx(topic.title)}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h2 className="mt-8 text-2xl font-semibold text-slate-950 sm:text-4xl">{tx("O'rganishni boshlang")}</h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
                  {tx("Avval barcha kartalarni birma-bir ko'rib chiqing. Hamma kartalar tugagandan keyin test ochiladi.")}
                </p>

                <div className="mt-10 grid gap-4">
                  <button
                    type="button"
                    onClick={() => handleStartLearning(0)}
                    className="flex w-full flex-col items-start gap-4 rounded-[28px] border border-slate-200 bg-white px-5 py-6 text-left shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:flex-row sm:items-center sm:justify-between sm:rounded-[32px] sm:px-8 sm:py-7"
                  >
                    <div className="flex items-center gap-4 sm:gap-5">
                      <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-slate-950 text-base font-semibold text-white shadow-sm sm:h-16 sm:w-16 sm:rounded-[22px] sm:text-lg">
                        01
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-slate-950 sm:text-2xl">{tx("O'rganish")}</p>
                        <p className="mt-2 text-sm leading-7 text-slate-500">{tx("Kartalarni bittadan ko'rish")}</p>
                      </div>
                    </div>
                    <span className="self-end text-3xl text-slate-300 sm:self-auto">{">"}</span>
                  </button>

                  {canTakeQuiz ? (
                    <Link
                      to={`/topics/${topic.id}/quiz`}
                      className="flex w-full flex-col items-start gap-4 rounded-[28px] border border-slate-200 bg-slate-950 px-5 py-6 text-left text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:flex-row sm:items-center sm:justify-between sm:rounded-[32px] sm:px-8 sm:py-7"
                    >
                      <div className="flex items-center gap-4 sm:gap-5">
                        <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-white/10 text-base font-semibold text-white ring-1 ring-white/10 sm:h-16 sm:w-16 sm:rounded-[22px] sm:text-lg">
                          02
                        </div>
                        <div>
                          <p className="text-xl font-semibold sm:text-2xl">{tx("Test ishlash")}</p>
                          <p className="mt-2 text-sm leading-7 text-slate-300">{tx("Endi testni boshlashingiz mumkin")}</p>
                        </div>
                      </div>
                      <span className="self-end text-3xl text-slate-400 sm:self-auto">{">"}</span>
                    </Link>
                  ) : (
                    <div className="flex w-full flex-col items-start gap-4 rounded-[28px] border border-slate-200 bg-slate-100 px-5 py-6 text-left shadow-sm sm:flex-row sm:items-center sm:justify-between sm:rounded-[32px] sm:px-8 sm:py-7">
                      <div className="flex items-center gap-4 sm:gap-5">
                        <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-white text-base font-semibold text-slate-500 shadow-sm sm:h-16 sm:w-16 sm:rounded-[22px] sm:text-lg">
                          02
                        </div>
                        <div>
                          <p className="text-xl font-semibold text-slate-500 sm:text-2xl">{tx("Test ishlash")}</p>
                          <p className="mt-2 text-sm leading-7 text-slate-400">{tx("Avval o'rganishni tugating")}</p>
                        </div>
                      </div>
                      <span className="self-end text-3xl text-slate-300 sm:self-auto">{">"}</span>
                    </div>
                  )}
                </div>

                {lastResult ? (
                  <div className="mt-6 rounded-[26px] border border-slate-200 bg-slate-50 px-5 py-4 text-left">
                    <p className="text-sm font-semibold text-slate-500">{tx("Oxirgi natija")}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">{lastResult.score}%</p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </section>
      ) : (
        <div className="mx-auto max-w-3xl space-y-6">
          <section className="rounded-[28px] border border-slate-200 bg-white/90 px-4 py-4 shadow-soft sm:rounded-[34px] sm:px-6 sm:py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={() => setViewMode("overview")} className="secondary-button self-start">
                {tx("Orqaga")}
              </button>
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-11 w-11 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:h-12 sm:w-12">
                  <SmartImage
                    src={topicHeroImage}
                    fallbackSrc={topicHeroFallbackImage}
                    alt={tx(topic.title)}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="break-words text-base font-semibold text-slate-950 sm:text-lg">{tx(currentItem.title)}</p>
                  <p className="text-xs text-slate-500 sm:text-sm">
                    {currentIndex + 1} / {topic.learnItems.length} {tx(isStructuredTopic ? structuredTopicConfig.singularLabel : "ta karta")}
                    {isStructuredTopic && currentStep ? ` | ${subStepIndex + 1} / ${currentSteps.length} ${tx("bosqich")}` : ""}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="rounded-[28px] border border-slate-200 bg-gradient-to-b from-slate-50 via-white to-slate-50 p-3 shadow-soft sm:rounded-[34px] sm:p-6">
            <div className="mx-auto max-w-xl space-y-5">
              {isStructuredTopic ? (
                <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-soft sm:rounded-[30px]">
                  <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">{tx(currentStep?.label ?? "Bosqich")}</p>
                        <h3 className="mt-2 text-xl font-semibold text-slate-950 sm:text-2xl">{tx(currentItem.title)}</h3>
                      </div>
                      <span className="w-fit rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                        {subStepIndex + 1} / {currentSteps.length}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-5 p-6 sm:p-8">
                    {currentStepType === "rule" ? (
                      <div className="rounded-[26px] border border-sky-100 bg-sky-50/70 p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">{tx("Asosiy qoida")}</p>
                        <p className="mt-3 text-lg leading-8 text-slate-700 sm:text-xl">{tx(currentStep?.text ?? "")}</p>
                      </div>
                    ) : null}

                    {currentStepType === "example" ? (
                      <div className="rounded-[26px] border border-emerald-100 bg-emerald-50/60 p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">{tx("Misol")}</p>
                        <div className="mt-4 space-y-4">
                          <div className="rounded-[22px] border border-white/80 bg-white px-4 py-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{tx("Atama")}</p>
                            <p className="mt-2 text-xl font-semibold text-slate-950">{tx(currentExample?.term ?? currentStep?.text ?? "")}</p>
                          </div>
                          <div className="rounded-[22px] border border-white/80 bg-white px-4 py-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{tx("Ma'nosi")}</p>
                            <p className="mt-2 text-lg leading-8 text-slate-700">{tx(currentExample?.meaning || currentStep?.text || "")}</p>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {currentStepType === "info" ? (
                      <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
                        <p className="text-lg leading-8 text-slate-700 sm:text-xl">{tx(currentStep?.text ?? "")}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-soft">
                  <SmartImage
                    src={currentItem.image}
                    fallbackSrc={currentItem.fallbackImage}
                    alt={tx(currentItem.title)}
                    className="h-64 w-full object-cover sm:h-[380px]"
                  />
                  <div className="space-y-3 p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-2xl font-semibold text-slate-950">{tx(currentItem.title)}</h3>
                      <span className="badge-chip">{tx("Ko'rildi")}</span>
                    </div>
                    <p className="whitespace-pre-line text-sm leading-7 text-slate-600">{tx(currentItem.description)}</p>
                  </div>
                </div>
              )}

              <ProgressBar
                value={seenIds.length}
                max={topic.learnItems.length}
                label={tx("O'rganish progressi")}
                hint={learnProgressHint}
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={handlePreviousCard}
                  disabled={isPreviousDisabled}
                  className={`secondary-button ${isPreviousDisabled ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  {tx("Oldingi")}
                </button>
                <button type="button" onClick={handleNextCard} className="primary-button">
                  {nextButtonLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
