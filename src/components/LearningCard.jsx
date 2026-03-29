import SmartImage from "./SmartImage";
import { toCyrillicUz as cy } from "../utils/cyrillic";

export default function LearningCard({ item, index, viewed }) {
  return (
    <article className={`premium-card overflow-hidden rounded-[30px] ${viewed ? "ring-2 ring-emerald-200" : ""}`}>
      <div className="relative">
        <SmartImage
          src={item.image}
          fallbackSrc={item.fallbackImage}
          alt={item.title}
          className="h-56 w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/5 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
          {cy("Karta")} {String(index + 1).padStart(2, "0")}
        </span>
        {viewed ? (
          <span className="absolute right-4 top-4 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            {cy("Ko'rildi")}
          </span>
        ) : null}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="inline-flex rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm">
            {cy("O'quv kartasi")}
          </div>
        </div>
      </div>

      <div className="space-y-3 p-5 sm:p-6">
        <h3 className="text-xl font-semibold text-slate-950">{item.title}</h3>
        <p className="whitespace-pre-line text-sm leading-7 text-slate-600">{item.description}</p>
      </div>
    </article>
  );
}
