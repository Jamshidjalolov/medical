import { Link } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import TopicCard from "../components/TopicCard";
import { useAppContext } from "../context/AppContext";
import { localizeText } from "../utils/locale";

export default function TopicsPage() {
  const { language, reviewedTopics, completedTopics, topicQuizResults, certificateExamResult, certificateExamConfig, topics } =
    useAppContext();
  const tx = (value) => localizeText(value, language);
  const completedCount = completedTopics.length;
  const reviewedCount = reviewedTopics.length;
  const certificateScore = certificateExamResult?.score ?? "--";

  return (
    <div className="page-shell -mt-1 sm:-mt-3">
      <section className="glass-panel relative overflow-hidden rounded-t-[22px] border-t-transparent bg-gradient-to-b from-white/95 via-white/90 to-slate-50/85 shadow-[0_32px_80px_-42px_rgba(15,23,42,0.24)]">
        <div className="pointer-events-none absolute inset-x-10 top-0 h-10 -translate-y-1/2 rounded-full bg-white/90 blur-2xl" />
        <div className="space-y-5 px-4 py-5 sm:px-8 sm:py-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <span className="badge-chip">{topics.length} {tx("ta mavzu")}</span>
                <span className="muted-chip">{certificateExamConfig.questionCount} {tx("ta yakuniy test")}</span>
              </div>
              <p className="section-copy max-w-2xl">
                {tx("Mavzularni tugatib boring va yakunda umumiy sertifikat imtihonini ishlang.")}
              </p>
            </div>

            <Link
              to="/certificate/exam"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-sky-700 sm:w-auto"
            >
              {tx("Sertifikat imtihoni")}
            </Link>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_1.1fr]">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] border border-slate-200/70 bg-slate-50/90 px-4 py-4">
                <p className="text-sm font-medium text-slate-500">{tx("Ko'rilgan")}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">{reviewedCount}</p>
              </div>
              <div className="rounded-[24px] border border-slate-200/70 bg-slate-50/90 px-4 py-4">
                <p className="text-sm font-medium text-slate-500">{tx("Tugagan")}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">{completedCount}</p>
              </div>
              <div className="rounded-[24px] border border-slate-200/70 bg-slate-50/90 px-4 py-4">
                <p className="text-sm font-medium text-slate-500">{tx("Sertifikat natijasi")}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">
                  {certificateScore}
                  {certificateExamResult ? "%" : ""}
                </p>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200/70 bg-slate-50/90 px-4 py-4 sm:px-5">
              <ProgressBar
                value={completedCount}
                max={topics.length}
                label={tx("Umumiy progress")}
                hint={`${completedCount} ${tx("ta mavzu yakunlangan.")}`}
              />
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-8">
          <div className="h-px bg-gradient-to-r from-transparent via-sky-200/80 to-transparent" />
        </div>

        <div className="relative space-y-5 bg-gradient-to-b from-slate-50/35 to-transparent px-4 pb-6 pt-5 sm:px-8 sm:pb-8 sm:pt-6">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-24 rounded-b-[32px] bg-gradient-to-b from-sky-50/35 to-transparent blur-2xl" />

          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-kicker">{tx("Mavzular")}</p>
              <h2 className="section-title">{topics.length} {tx("ta mavzu")}</h2>
            </div>
            <p className="section-copy max-w-xl">{tx("Har bir mavzuda 10 ta karta va 10 ta test savoli bor.")}</p>
          </div>

          <div className="relative grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {topics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                status={{
                  reviewed: reviewedTopics.includes(topic.id),
                  completed: completedTopics.includes(topic.id),
                  score: topicQuizResults[topic.id]?.score
                }}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
