import { useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import CertificatePreview from "../components/CertificatePreview";
import { useAppContext } from "../context/AppContext";
import { formatDate, getAchievementMeta } from "../utils/quiz";
import { localizeText } from "../utils/locale";

export default function CertificateResultPage() {
  const {
    user,
    language,
    quizThresholds,
    certificateExamResult,
    generatedCertificate,
    certificateHistory = [],
    generateCertificate
  } = useAppContext();
  const certificateRef = useRef(null);
  const [formState, setFormState] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? ""
  });
  const [selectedAttemptId, setSelectedAttemptId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const tx = (value) => localizeText(value, language);

  const currentAttemptCertificate = certificateExamResult
    ? certificateHistory.find((item) => item.attemptId === certificateExamResult.attemptId) ??
      (generatedCertificate?.attemptId === certificateExamResult.attemptId ? generatedCertificate : null)
    : null;

  useEffect(() => {
    const fallbackAttemptId = currentAttemptCertificate?.attemptId ?? certificateHistory[0]?.attemptId ?? null;

    setSelectedAttemptId((previousState) => {
      if (previousState && certificateHistory.some((item) => item.attemptId === previousState)) {
        return previousState;
      }

      return fallbackAttemptId;
    });
  }, [certificateHistory, currentAttemptCertificate]);

  if (!certificateExamResult && certificateHistory.length === 0) {
    return <Navigate replace to="/certificate/exam" />;
  }

  const selectedCertificate =
    certificateHistory.find((item) => item.attemptId === selectedAttemptId) ??
    currentAttemptCertificate ??
    certificateHistory[0] ??
    null;

  const currentExamNeedsCertificate = Boolean(certificateExamResult?.passed && !currentAttemptCertificate);
  const currentExamFailed = Boolean(certificateExamResult && !certificateExamResult.passed && !currentAttemptCertificate);
  const achievement = certificateExamResult ? getAchievementMeta(certificateExamResult.score) : null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((previousState) => ({
      ...previousState,
      [name]: value
    }));
  };

  const handleGenerate = async (event) => {
    event.preventDefault();

    if (!formState.firstName.trim() || !formState.lastName.trim()) {
      setErrorMessage(tx("Sertifikat yaratish uchun ism va familyani kiriting."));
      return;
    }

    setErrorMessage("");
    setIsGenerating(true);

    try {
      const createdCertificate = await generateCertificate(formState);

      if (createdCertificate) {
        setSelectedAttemptId(createdCertificate.attemptId);
      }
    } catch (error) {
      setErrorMessage(error.message ?? tx("Sertifikat yaratishda xatolik yuz berdi."));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!certificateRef.current || !selectedCertificate) {
      return;
    }

    setIsDownloading(true);

    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf")
      ]);

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: "#f8fafc",
        useCORS: true
      });

      const imageData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imageData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${selectedCertificate.fullName.replace(/\s+/g, "-").toLowerCase()}-${tx("sertifikat")}.pdf`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="page-shell space-y-8">
      <section className="glass-panel px-6 py-8 sm:px-10 sm:py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div className="space-y-4">
            <p className="section-kicker">
              {currentExamNeedsCertificate || currentExamFailed ? tx("Imtihon natijasi") : tx("Sertifikatlarim")}
            </p>
            <h2 className="section-title">
              {currentExamNeedsCertificate || currentExamFailed ? tx("Yakuniy natija tayyor") : tx("Oldingi sertifikatlar")}
            </h2>
            <p className="section-copy">
              {currentExamNeedsCertificate
                ? `${tx("Sana")}: ${formatDate(certificateExamResult.attemptedAt, language)}. ${tx(
                    "Sertifikatni hozirning o'zida yaratib, PDF ko'rinishida yuklab olishingiz mumkin."
                  )}`
                : currentExamFailed
                  ? `${tx("Sana")}: ${formatDate(certificateExamResult.attemptedAt, language)}. ${tx(
                      `Sertifikat olish uchun kamida ${quizThresholds.certificate}% natija kerak.`
                    )}`
                : tx("Bu yerda oldin yaratilgan barcha sertifikatlaringiz saqlanadi. Keraklisini tanlab ko'ring va yuklab oling.")}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="surface-card p-5">
              <p className="text-sm font-semibold text-slate-500">{tx("Soni")}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">{certificateHistory.length}</p>
            </div>
            <div className="surface-card p-5">
              <p className="text-sm font-semibold text-slate-500">{tx("Eng yuqori")}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">
                {certificateHistory.length ? `${Math.max(...certificateHistory.map((item) => item.score))}%` : "--"}
              </p>
            </div>
            <div className="surface-card p-5">
              <p className="text-sm font-semibold text-slate-500">{tx("Tanlangan")}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">
                {selectedCertificate ? `${selectedCertificate.score}%` : "--"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="surface-card space-y-6 p-6 sm:p-8">
          {currentExamNeedsCertificate ? (
            <>
              <div className="rounded-[28px] bg-emerald-50 p-6 text-emerald-900">
                <p className="text-xl font-semibold">{tx("Natijangiz tayyor va sertifikat yaratish mumkin.")}</p>
                <p className="mt-3 text-sm leading-7">
                  {tx("Nechchi foiz ishlagan bo'lsangiz, sertifikat shu natija bilan yaratiladi. Endi ism va familyani tasdiqlang.")}
                </p>
                <div className="mt-4 inline-flex rounded-full border border-current/20 bg-white/60 px-4 py-2 text-sm font-semibold">
                  {tx(achievement?.title)}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-lg font-semibold text-slate-950">{tx("Mavzular bo'yicha natija")}</p>
                <div className="grid gap-3">
                  {certificateExamResult.breakdown.map((item) => (
                    <div key={item.topicId} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-slate-800">{tx(item.topicTitle)}</span>
                        <span className="text-sm font-semibold text-slate-500">
                          {item.correctCount} / {item.totalCount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <form className="space-y-5" onSubmit={handleGenerate}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="field-label">
                      {tx("Ism")}
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      value={formState.firstName}
                      onChange={handleChange}
                      className="field-input"
                      placeholder={tx("Ali")}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="field-label">
                      {tx("Familya")}
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      value={formState.lastName}
                      onChange={handleChange}
                      className="field-input"
                      placeholder={tx("Valiyev")}
                    />
                  </div>
                </div>
                {errorMessage ? <p className="text-sm font-medium text-rose-600">{errorMessage}</p> : null}
                <button type="submit" className="primary-button w-full">
                  {isGenerating ? tx("Yaratilmoqda...") : tx("Sertifikatni yaratish")}
                </button>
              </form>
            </>
          ) : currentExamFailed ? (
            <div className="rounded-[28px] bg-amber-50 p-6 text-amber-900">
              <p className="text-xl font-semibold">{tx("Bu urinishda sertifikat olinmadi.")}</p>
              <p className="mt-3 text-sm leading-7">
                {tx(`Siz ${certificateExamResult.score}% ishladingiz. Sertifikat olish uchun kamida ${certificateExamResult.threshold ?? quizThresholds.certificate}% kerak.`)}
              </p>
            </div>
          ) : null}

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-lg font-semibold text-slate-950">{tx("Sertifikatlarim")}</p>
              {certificateHistory.length ? (
                <span className="badge-chip">{certificateHistory.length} {tx("ta sertifikat")}</span>
              ) : null}
            </div>

            {certificateHistory.length ? (
              <div className="grid gap-3">
                {certificateHistory.map((item, index) => {
                  const isActive = item.attemptId === selectedCertificate?.attemptId;

                  return (
                    <button
                      key={item.attemptId}
                      type="button"
                      onClick={() => setSelectedAttemptId(item.attemptId)}
                      className={`rounded-[24px] border px-4 py-4 text-left transition-all duration-300 ${
                        isActive
                          ? "border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-950/10"
                          : "border-slate-200 bg-slate-50 text-slate-800 hover:border-sky-200 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold">
                            {tx("Sertifikat")} #{certificateHistory.length - index}
                          </p>
                          <p className={`mt-1 text-xs ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                            {formatDate(item.issueDate, language)}
                          </p>
                        </div>
                        <span className={`text-lg font-semibold ${isActive ? "text-white" : "text-slate-950"}`}>
                          {item.score}%
                        </span>
                      </div>
                      <div className={`mt-3 flex flex-wrap items-center justify-between gap-3 text-sm ${isActive ? "text-slate-200" : "text-slate-500"}`}>
                        <span>{item.serialNumber}</span>
                        <span>
                          {item.correctCount}/{item.total}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                {tx("Hozircha saqlangan sertifikat yo'q.")}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link to="/certificate/exam" className="secondary-button w-full sm:w-auto">
              {tx("Imtihonni qayta ishlash")}
            </Link>
            <Link to="/topics" className="secondary-button w-full sm:w-auto">
              {tx("Mavzularga qaytish")}
            </Link>
          </div>
        </div>

        <div className="space-y-5">
          {selectedCertificate ? (
            <>
              <CertificatePreview certificate={selectedCertificate} certificateRef={certificateRef} />
              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={handleDownload} className="primary-button w-full sm:w-auto">
                  {isDownloading ? tx("Yuklab olinmoqda...") : tx("PDF yuklab olish")}
                </button>
              </div>
            </>
          ) : (
            <div className="surface-card flex min-h-[520px] items-center justify-center p-8 text-center">
              <div className="max-w-md space-y-4">
                <p className="text-2xl font-semibold text-slate-950">{tx("Sertifikat ko'rinishi shu yerda")}</p>
                <p className="text-sm leading-7 text-slate-600">
                  {currentExamFailed
                    ? tx("Joriy urinish sertifikat uchun yetarli emas. Qayta urinib, kerakli foizni oling.")
                    : tx("Ro'yxatdan biror sertifikatni tanlang yoki yangi imtihon natijasi asosida sertifikat yarating.")}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
