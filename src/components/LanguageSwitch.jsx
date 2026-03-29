import { useAppContext } from "../context/AppContext";

const languages = [
  { id: "uz", label: "UZ" },
  { id: "ru", label: "RU" }
];

export default function LanguageSwitch({ className = "" }) {
  const { language, setLanguage } = useAppContext();

  return (
    <div className={`inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/90 p-1 shadow-soft ${className}`}>
      {languages.map((item) => {
        const isActive = language === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setLanguage(item.id)}
            className={`rounded-full px-3 py-2 text-xs font-semibold tracking-[0.18em] transition-all duration-300 ${
              isActive ? "bg-slate-950 text-white shadow-md" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
