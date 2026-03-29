import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import QuizCard from "../components/QuizCard";
import { useAppContext } from "../context/AppContext";
import { localizeText } from "../utils/locale";

export default function TopicQuizPage() {
  const { topicId } = useParams();
  const { language, completedLearningItemsByTopic, saveTopicQuizResult, topicQuizResults, topicLookup, quizThresholds } =
    useAppContext();
  const topic = topicLookup[topicId];
  const tx = (value) => localizeText(value, language);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [validationMessage, setValidationMessage] = useState("");
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!topic) {
    return <Navigate replace to="/topics" />;
  }

  const questions = topic.quizQuestions;
  const currentQuestion = questions[currentIndex];
  const selectedOption = answers[currentQuestion.id];
  const previousResult = topicQuizResults[topic.id];
  const completedItemIds = completedLearningItemsByTopic[topic.id] ?? [];
  const canAccessQuiz = completedItemIds.length === topic.learnItems.length || Boolean(previousResult);

  if (!canAccessQuiz) {
    return <Navigate replace to={`/topics/${topic.id}`} />;
  }

  const handleSelect = (option) => {
    setValidationMessage("");
    setAnswers((previousState) => ({
      ...previousState,
      [currentQuestion.id]: option
    }));
  };

  const finalizeQuiz = async () => {
    setIsSubmitting(true);

    try {
      const finalResult = await saveTopicQuizResult(topic.id, answers);
      setResult(finalResult);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (!selectedOption) {
      setValidationMessage(tx("Davom etishdan oldin bitta javobni tanlang."));
      return;
    }

    if (currentIndex === questions.length - 1) {
      await finalizeQuiz();
      return;
    }

    setCurrentIndex((previousState) => previousState + 1);
  };

  const handlePrevious = () => {
    setValidationMessage("");
    setCurrentIndex((previousState) => Math.max(0, previousState - 1));
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentIndex(0);
    setValidationMessage("");
    setResult(null);
  };

  return (
    <div className="page-shell space-y-8">
      <section className="glass-panel px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <Link to={`/topics/${topic.id}`} className="secondary-button">
              {tx("Mavzuga qaytish")}
            </Link>
            <div>
              <p className="section-kicker">{tx("Test")}</p>
              <h2 className="section-title">
                {tx(topic.title)} {tx("bo'yicha test")}
              </h2>
              <p className="section-copy">
                {tx("Ushbu test aynan ko'rilgan 10 ta karta asosida tuzilgan.")} {tx("Mavzuni tugatish uchun kamida")}{" "}
                {quizThresholds.topic}% {tx("natija kerak.")}
              </p>
            </div>
          </div>

          <div className="surface-card w-full space-y-4 p-5 sm:p-6 lg:max-w-sm">
            <ProgressBar
              value={result ? questions.length : currentIndex + 1}
              max={questions.length}
              label={tx("Test progressi")}
              hint={`${questions.length} ${tx("ta savol")}`}
            />
            {previousResult ? (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                {tx("Oxirgi saqlangan natija")}: <span className="font-semibold text-slate-950">{previousResult.score}%</span>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {result ? (
        <section className="surface-card space-y-6 p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500">{tx("Natija")}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">{result.score}%</p>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500">{tx("To'g'ri javob")}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">{result.correctCount}</p>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500">{tx("Noto'g'ri javob")}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">{result.wrongCount}</p>
            </div>
          </div>

          <div
            className={`rounded-[28px] p-6 ${
              result.passed ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"
            }`}
          >
            <p className="text-xl font-semibold">
              {result.passed ? tx("Mavzu muvaffaqiyatli yakunlandi.") : tx("Yana bir urinish kerak.")}
            </p>
            <p className="mt-3 text-sm leading-7">
              {result.passed
                ? tx("Ushbu mavzu tugatildi va panelda ko'rinadi.")
                : `${tx("Tugatish uchun kamida")} ${quizThresholds.topic}% ${tx("natija kerak.")}`}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button type="button" onClick={handleRetry} className="primary-button w-full sm:w-auto">
              {tx("Qayta ishlash")}
            </button>
            <Link to={`/topics/${topic.id}`} className="secondary-button w-full sm:w-auto">
              {tx("Mavzuga qaytish")}
            </Link>
            <Link to="/topics" className="secondary-button w-full sm:w-auto">
              {tx("Barcha mavzular")}
            </Link>
          </div>
        </section>
      ) : (
        <QuizCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          selectedOption={selectedOption}
          onSelect={handleSelect}
          onNext={handleNext}
          onPrevious={handlePrevious}
          isFirst={currentIndex === 0}
          isLast={currentIndex === questions.length - 1}
          topicLabel={topic.title}
          validationMessage={validationMessage}
        />
      )}
    </div>
  );
}
