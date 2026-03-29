import { useAppContext } from "../context/AppContext";
import { BRAND_NAME } from "../utils/branding";
import { localizeText } from "../utils/locale";

export default function Footer() {
  const { language } = useAppContext();
  const tx = (value) => localizeText(value, language);

  return (
    <footer className="page-shell pb-8">
      <div className="surface-card flex flex-col gap-3 px-6 py-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>{tx(`${BRAND_NAME} - o'quv va test platformasi.`)}</p>
        <p>
          {new Date().getFullYear()} | {tx("Mahalliy progress va sertifikat ko'rinishi.")}
        </p>
      </div>
    </footer>
  );
}
