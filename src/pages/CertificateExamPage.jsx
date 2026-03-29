import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import QuizCard from "../components/QuizCard";
import { useAppContext } from "../context/AppContext";
import { localizeText } from "../utils/locale";

export default function CertificateExamPage() {
  const navigate = useNavigate();
  const { language, certificateExamConfig, quizThresholds, fetchCertificateExamQuestions, saveCertificateExamResult } = useAppContext();
  const tx = (value) => localizeText(value, language);
  const [questions, setQuestions] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [validationMessage, setValidationMessage] = useState("");
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadQuestions() {
      setIsLoadingQuestions(true);
      setLoadError("");

      try {
        const loadedQuestions = await fetchCertificateExamQuestions(certificateExamConfig.questionCount);

        if (!isCancelled) {
          setQuestions(loadedQuestions);
        }
      } catch (error) {
        if (!isCancelled) {
          setLoadError(error.message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingQuestions(false);
        }
      }
    }

    void loadQuestions();

    return () => {
      isCancelled = true;
    };
  }, []);

  const currentQuestion = questions[currentIndex];
  const selectedOption = currentQuestion ? answers[currentQuestion.id] : undefined;

  const handleSelect = (option) => {
    setValidationMessage("");
    setAnswers((previousState) => ({
      ...previousState,
      [currentQuestion.id]: option
    }));
  };

  const finalizeExam = async () => {
    setIsSubmitting(true);

    try {
      await saveCertificateExamResult({
        questionIds: questions.map((question) => question.id),
        answers
      });
      navigate("/certificate/result");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (!selectedOption) {
      setValidationMessage(tx("Davom etish uchun javoblardan birini tanlang."));
      return;
    }

    if (currentIndex === questions.length - 1) {
      await finalizeExam();
      return;
    }

    setCurrentIndex((previousState) => previousState + 1);
  };

  const handlePrevious = () => {
    setValidationMessage("");
    setCurrentIndex((previousState) => Math.max(0, previousState - 1));
  };

  return (
    <div className="page-shell space-y-8">
      <section className="glass-panel px-6 py-8 sm:px-10 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className="space-y-4">
            <p className="section-kicker">{tx("Sertifikat imtihoni")}</p>
            <h2 className="section-title">{tx(`${certificateExamConfig.questionCount} ta aralash yakuniy test`)}</h2>
            <p className="section-copy">
              {tx("Bu bo'limda 8 ta mavzu bo'yicha aralash savollar chiqadi.")}{" "}
              {tx(`Sertifikat olish uchun kamida ${quizThresholds.certificate}% natija kerak.`)}
            </p>
          </div>

          <div className="surface-card space-y-5 p-6">
            <ProgressBar
              value={hasStarted ? currentIndex + 1 : 0}
              max={questions.length}
              label={tx("Yakuniy imtihon progressi")}
              hint={`${hasStarted ? currentIndex + 1 : 0} / ${questions.length} ${tx("ta savol")}`}
            />
            <div className="rounded-[24px] bg-slate-950 p-5 text-white">
              <p className="text-sm font-semibold text-slate-300">{tx("Sertifikat holati")}</p>
              <p className="mt-3 text-2xl font-semibold sm:text-3xl">{quizThresholds.certificate}%+</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                {tx("Imtihon tugagach natija hisoblanadi. Belgilangan foizdan o'tsangiz, sertifikat formasi ochiladi va PDF qilib yuklab olasiz.")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {isLoadingQuestions ? (
        <section className="surface-card space-y-4 rounded-[34px] p-6 text-center sm:p-8">
          <h3 className="text-2xl font-semibold text-slate-950">{tx("Savollar yuklanmoqda")}</h3>
          <p className="text-sm leading-7 text-slate-500">{tx("Backenddan sertifikat savollari olinmoqda.")}</p>
        </section>
      ) : loadError ? (
        <section className="surface-card space-y-4 rounded-[34px] p-6 text-center sm:p-8">
          <h3 className="text-2xl font-semibold text-slate-950">{tx("Savollarni olishda xatolik")}</h3>
          <p className="text-sm leading-7 text-rose-600">{loadError}</p>
          <button type="button" onClick={() => window.location.reload()} className="primary-button mx-auto w-full sm:w-auto">
            {tx("Qayta urinish")}
          </button>
        </section>
      ) : hasStarted && currentQuestion ? (
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
          topicLabel={currentQuestion.topicTitle}
          validationMessage={validationMessage}
        />
      ) : (
        <section className="surface-card space-y-6 rounded-[34px] p-6 text-center sm:p-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-950 text-2xl font-semibold text-white shadow-soft sm:h-24 sm:w-24 sm:text-3xl">
            {certificateExamConfig.questionCount}
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-slate-950 sm:text-3xl">{tx("Testni boshlash")}</h3>
            <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
              {tx(`Imtihon boshlangandan keyin savollar bittadan ko'rinadi. Barcha ${certificateExamConfig.questionCount} ta savol tugagach natija hisoblanadi.`)}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500">{tx("Savollar")}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">{questions.length}</p>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500">{tx("Sertifikat")}</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">{quizThresholds.certificate}%+</p>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500">{tx("Format")}</p>
              <p className="mt-2 text-xl font-semibold text-slate-950">{tx("Bitta-bitta")}</p>
            </div>
          </div>
          <button type="button" onClick={() => setHasStarted(true)} className="primary-button mx-auto w-full sm:w-auto">
            {isSubmitting ? tx("Yuborilmoqda...") : tx("Testni boshlash")}
          </button>
        </section>
      )}
    </div>
  );
}
