import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import SmartImage from "./SmartImage";
import { localizeText } from "../utils/locale";

export default function TopicCard({ topic, status }) {
  const { language } = useAppContext();
  const tx = (value) => localizeText(value, language);
  const learningItemCount = Array.isArray(topic.learnItems) ? topic.learnItems.length : Number(topic.learnItemCount ?? 0);
  const quizQuestionCount = Array.isArray(topic.quizQuestions) ? topic.quizQuestions.length : Number(topic.quizQuestionCount ?? 0);
  const actionLabel = status.completed ? tx("Qayta kirish") : status.reviewed ? tx("Davom etish") : tx("Boshlash");
  const accentStyle = {
    backgroundImage: `linear-gradient(135deg, ${topic.palette?.from ?? "#E0F2FE"} 0%, ${topic.palette?.to ?? "#FFFFFF"} 100%)`
  };
  const tintStyle = {
    background: `${topic.palette?.highlight ?? "#DBEAFE"}`
  };
  const titleStyle = {
    color: topic.palette?.ink ?? "#0F172A"
  };

  return (
    <Link to={`/topics/${topic.id}`} className="group block h-full">
      <article className="premium-card relative flex h-full flex-col overflow-hidden rounded-[34px]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-90" style={accentStyle} />
        <div className="relative h-44 overflow-hidden sm:h-52">
          <SmartImage
            src={topic.image}
            fallbackSrc={topic.fallbackImage}
            alt={topic.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/10 to-transparent" />
          <div className="absolute inset-x-4 top-4 flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
              {tx("Ta'lim mavzusi")}
            </span>
            <div className="flex flex-wrap gap-2">
              {status.reviewed ? <span className="badge-chip">{tx("Ko'rilgan")}</span> : null}
              {status.completed ? <span className="badge-chip bg-emerald-50 text-emerald-700">{tx("Tugagan")}</span> : null}
            </div>
          </div>
          <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4">
            <div className="rounded-[22px] border border-white/70 bg-white/90 px-3 py-3 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.45)] backdrop-blur sm:rounded-[24px] sm:px-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold shadow-sm sm:h-12 sm:w-12"
                  style={{ ...tintStyle, color: topic.palette?.ink ?? "#0F172A" }}
                >
                  {topic.glyph}
                </div>
                <h3 className="line-clamp-2 text-lg font-semibold sm:text-2xl" style={titleStyle}>
                  {tx(topic.title)}
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4 sm:p-6">
          <div className="flex-1 space-y-4">
            <p className="min-h-[72px] text-sm leading-6 text-slate-600 sm:min-h-[88px] sm:leading-7">{tx(topic.description)}</p>

            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="muted-chip">{learningItemCount} {tx("ta karta")}</span>
              <span className="muted-chip">{quizQuestionCount} {tx("ta test")}</span>
            </div>

            {typeof status.score === "number" ? (
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{tx("Oxirgi natija")}</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-lg font-semibold text-slate-950">{status.score}%</p>
                  <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.max(8, status.score)}%`, background: topic.palette?.ink ?? "#0F172A" }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{tx("Holat")}</p>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {status.reviewed ? tx("Davom etishga tayyor") : tx("Boshlashga tayyor")}
                </p>
              </div>
            )}
          </div>

          <div className="mt-5">
            <div
              className="flex w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 group-hover:-translate-y-0.5"
              style={{ background: topic.palette?.ink ?? "#0F172A" }}
            >
              {actionLabel}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
