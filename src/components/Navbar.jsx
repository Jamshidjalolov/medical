import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import logoMark from "../assets/academy-mark.svg";
import LanguageSwitch from "./LanguageSwitch";
import { useAppContext } from "../context/AppContext";
import { BRAND_NAME, BRAND_SHORT_TAGLINE } from "../utils/branding";
import { localizeText } from "../utils/locale";

function navLinkClass({ isActive }) {
  return `rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
    isActive ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10" : "text-slate-600 hover:bg-white hover:text-sky-700"
  }`;
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, language, generatedCertificate, certificateExamResult, certificateHistory, logoutUser } =
    useAppContext();
  const tx = (value) => localizeText(value, language);

  const localizedFirstName = tx(user?.firstName ?? "");
  const localizedLastName = tx(user?.lastName ?? "");
  const initials = `${localizedFirstName[0] ?? ""}${localizedLastName[0] ?? ""}`.toUpperCase() || "U";
  const certificateLink = generatedCertificate || certificateExamResult || certificateHistory.length ? "/certificate/result" : "/certificate/exam";
  const isTopicsPage = location.pathname === "/topics";

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logoutUser();
    navigate("/register", { replace: true });
  };

  return (
    <header className="page-shell relative z-50 pt-3 sm:pt-4">
      <div
        className={`glass-panel relative overflow-visible px-4 py-4 sm:px-6 ${
          isTopicsPage ? "rounded-b-[22px] border-b-transparent shadow-[0_26px_60px_-42px_rgba(15,23,42,0.24)]" : ""
        }`}
      >
        {isTopicsPage ? (
          <div className="pointer-events-none absolute inset-x-10 -bottom-5 h-10 rounded-full bg-white/90 blur-2xl" />
        ) : null}

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-center">
            <Link to="/topics" className="group flex min-w-0 items-center gap-3 sm:gap-4" aria-label={tx(BRAND_NAME)}>
              <span className="flex h-[70px] w-[70px] items-center justify-center rounded-[26px] border border-sky-100 bg-gradient-to-br from-white via-sky-50 to-cyan-100 shadow-[0_20px_45px_-24px_rgba(14,116,144,0.45)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-xl sm:h-[82px] sm:w-[82px]">
                <img
                  src={logoMark}
                  alt=""
                  className="h-12 w-12 transition-transform duration-300 group-hover:scale-105 sm:h-16 sm:w-16"
                />
              </span>
              <span className="min-w-0 space-y-1">
                <span className="block break-words text-base font-semibold text-slate-950 sm:text-2xl">{tx(BRAND_NAME)}</span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-700 sm:text-xs sm:tracking-[0.28em]">
                  {tx(BRAND_SHORT_TAGLINE)}
                </span>
              </span>
            </Link>

            <nav className="scrollbar-none -mx-1 flex items-center gap-2 overflow-x-auto pb-1 xl:mx-0 xl:flex-wrap xl:overflow-visible">
              <NavLink to="/topics" className={navLinkClass}>
                {tx("Mavzular")}
              </NavLink>
              <NavLink to="/certificate/exam" className={navLinkClass}>
                {tx("Sertifikat")}
              </NavLink>
              {user?.isAdmin ? (
                <NavLink to="/admin" className={navLinkClass}>
                  {tx("Admin")}
                </NavLink>
              ) : null}
            </nav>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between xl:w-auto xl:flex-nowrap xl:justify-end">
            <LanguageSwitch className="w-fit" />

            <div ref={menuRef} className="relative z-[90] w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsMenuOpen((previousState) => !previousState)}
                aria-expanded={isMenuOpen}
                aria-haspopup="menu"
                className={`group flex w-full max-w-full items-center gap-3 rounded-[28px] border border-slate-200/80 bg-gradient-to-r from-white via-slate-50/95 to-sky-50/80 px-3 py-2.5 pr-2 text-left shadow-[0_22px_50px_-28px_rgba(15,23,42,0.34)] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_24px_60px_-30px_rgba(14,116,144,0.28)] sm:w-auto ${
                  isMenuOpen ? "border-sky-200 ring-4 ring-sky-100/70 shadow-[0_24px_60px_-30px_rgba(14,116,144,0.32)]" : ""
                }`}
              >
                <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[20px] bg-gradient-to-br from-slate-950 via-sky-800 to-cyan-500 text-sm font-bold text-white shadow-[0_18px_36px_-18px_rgba(14,116,144,0.82)] ring-1 ring-white/80">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={tx(user?.fullName)} className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                  <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block max-w-[140px] truncate text-sm font-semibold leading-none text-slate-950 sm:max-w-[150px]">
                    {tx(user?.fullName)}
                  </span>
                  <span className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {tx("Profil")}
                  </span>
                </span>

                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-[18px] border border-slate-200/80 bg-gradient-to-b from-white to-slate-50 text-slate-500 shadow-[0_10px_24px_-16px_rgba(15,23,42,0.4)] transition-all duration-300 ${
                    isMenuOpen
                      ? "rotate-180 border-sky-200 bg-gradient-to-b from-sky-50 to-white text-sky-700 shadow-[0_14px_28px_-18px_rgba(14,116,144,0.45)]"
                      : "group-hover:border-sky-200 group-hover:bg-gradient-to-b group-hover:from-sky-50 group-hover:to-white group-hover:text-sky-700"
                  }`}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.5 7.5L10 12L14.5 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>

              {isMenuOpen ? (
                <div className="absolute left-0 right-0 top-[calc(100%+12px)] z-[100] rounded-[30px] border border-slate-200 bg-white p-3 shadow-[0_40px_100px_-40px_rgba(15,23,42,0.5)] ring-1 ring-slate-100 sm:left-auto sm:right-0 sm:w-[296px]">
                  <div className="pointer-events-none absolute inset-0 rounded-[30px] bg-white" />
                  <div className="relative z-10 rounded-[22px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.18)]">
                    <p className="text-sm font-semibold text-slate-950">{tx(user?.fullName)}</p>
                    <p className="mt-1 text-xs text-slate-500">{user?.email}</p>
                  </div>

                  <div className="relative mt-3 grid gap-2 rounded-[24px] bg-slate-50/80 p-2">
                    {user?.isAdmin ? (
                      <Link
                        to="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex w-full cursor-pointer items-center justify-between rounded-[18px] border border-slate-200/80 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:border-sky-100 hover:bg-sky-50 hover:text-sky-700 active:scale-[0.99]"
                      >
                        <span>{tx("Admin panel")}</span>
                        <span aria-hidden="true" className="text-slate-400">
                          {">"}
                        </span>
                      </Link>
                    ) : null}

                    <Link
                      to={certificateLink}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex w-full cursor-pointer items-center justify-between rounded-[18px] border border-slate-200/80 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:border-sky-100 hover:bg-sky-50 hover:text-sky-700 active:scale-[0.99]"
                    >
                      <span>{tx("Sertifikatim")}</span>
                      <span aria-hidden="true" className="text-slate-400">
                        {">"}
                      </span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full cursor-pointer items-center justify-between rounded-[18px] border border-rose-100 bg-white px-4 py-3 text-sm font-semibold text-rose-600 shadow-sm transition-all duration-300 hover:bg-rose-50 active:scale-[0.99]"
                    >
                      <span>{tx("Chiqish")}</span>
                      <span aria-hidden="true" className="text-rose-400">
                        {">"}
                      </span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
