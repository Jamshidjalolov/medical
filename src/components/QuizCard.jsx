import { useAppContext } from "../context/AppContext";
import { localizeText } from "../utils/locale";

const optionLetters = ["A", "B", "C", "D"];

export default function QuizCard({
  question,
  questionNumber,
  totalQuestions,
  selectedOption,
  onSelect,
  onNext,
  onPrevious,
  isFirst,
  isLast,
  topicLabel,
  validationMessage
}) {
  const { language } = useAppContext();
  const tx = (value) => localizeText(value, language);

  return (
    <div className="surface-card space-y-6 rounded-[28px] p-4 sm:rounded-[34px] sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="badge-chip">{tx(topicLabel)}</span>
          <h2 className="mt-3 text-xl font-semibold text-slate-950 sm:text-2xl">
            {tx("Savol")} {questionNumber} / {totalQuestions}
          </h2>
        </div>
        <div className="muted-chip">{tx("4 ta variant")}</div>
      </div>

      <p className="text-base leading-8 text-slate-800 sm:text-lg">{tx(question.question)}</p>

      <div className="grid gap-3">
        {question.options.map((option, index) => {
          const isSelected = selectedOption === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              className={`flex items-start gap-3 rounded-[20px] border px-3 py-3 text-left transition-all duration-300 sm:items-center sm:gap-4 sm:rounded-[22px] sm:px-4 sm:py-4 ${
                isSelected
                  ? "border-sky-300 bg-gradient-to-r from-sky-50 to-cyan-50 text-sky-900 shadow-md shadow-sky-100"
                  : "border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold sm:h-10 sm:w-10 ${
                  isSelected ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {optionLetters[index]}
              </span>
              <span className="text-sm font-medium leading-7 sm:text-base">{tx(option)}</span>
            </button>
          );
        })}
      </div>

      {validationMessage ? <p className="text-sm font-medium text-rose-600">{validationMessage}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isFirst}
          className={`secondary-button w-full sm:w-auto ${isFirst ? "cursor-not-allowed opacity-50" : ""}`}
        >
          {tx("Oldingi")}
        </button>
        <button type="button" onClick={onNext} className="primary-button w-full sm:w-auto">
          {isLast ? tx("Yakunlash") : tx("Keyingisi")}
        </button>
      </div>
    </div>
  );
}
