import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import logoMark from "../assets/academy-mark.svg";
import GoogleAuthButton from "../components/GoogleAuthButton";
import LanguageSwitch from "../components/LanguageSwitch";
import { useAppContext } from "../context/AppContext";
import { BRAND_HERO_DESCRIPTION, BRAND_HERO_KICKER, BRAND_NAME } from "../utils/branding";
import { localizeText } from "../utils/locale";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: ""
};

function tabClass(isActive) {
  return `flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
    isActive ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10" : "text-slate-600 hover:bg-white hover:text-sky-700"
  }`;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, language, registerUser, loginUser, loginWithGoogle, topics, certificateExamConfig, isAuthPending, isFrontendOnlyMode } =
    useAppContext();
  const [formState, setFormState] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [mode, setMode] = useState(location.pathname === "/login" ? "login" : "register");
  const [showPassword, setShowPassword] = useState(false);
  const tx = (value) => localizeText(value, language);
  const totalCards = topics.reduce((total, topic) => total + topic.learnItems.length, 0);

  useEffect(() => {
    setMode(location.pathname === "/login" ? "login" : "register");
  }, [location.pathname]);

  useEffect(() => {
    if (user) {
      navigate("/topics", { replace: true });
    }
  }, [navigate, user]);

  const authMeta = useMemo(
    () =>
      mode === "login"
        ? {
            kicker: tx("Kirish"),
            title: tx("Hisobga kirish"),
            description: tx("Mavjud akkauntingiz bilan tizimga kiring."),
            button: tx("Kirish")
          }
        : {
            kicker: tx("Ro'yxatdan o'tish"),
            title: tx("Ro'yxatdan o'tish"),
            description: tx("Yangi hisob yarating va darhol mavzular bo'limiga o'ting."),
            button: tx("Ro'yxatdan o'tish")
          },
    [mode, language]
  );

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setErrors({});
    setAuthError("");
    setShowPassword(false);
    navigate(nextMode === "login" ? "/login" : "/register", { replace: true });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((previousState) => ({
      ...previousState,
      [name]: value
    }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (mode === "register") {
      if (!formState.firstName.trim()) {
        nextErrors.firstName = tx("Ism kiritilishi shart.");
      }

      if (!formState.lastName.trim()) {
        nextErrors.lastName = tx("Familya kiritilishi shart.");
      }
    }

    if (!/\S+@\S+\.\S+/.test(formState.email)) {
      nextErrors.email = tx("Email manzil to'g'ri formatda bo'lishi kerak.");
    }

    if (formState.password.trim().length < 6) {
      nextErrors.password = tx("Parol kamida 6 ta belgidan iborat bo'lishi kerak.");
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateForm();
    setErrors(nextErrors);
    setAuthError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const result =
      mode === "login"
        ? await loginUser({
            email: formState.email,
            password: formState.password
          })
        : await registerUser(formState);

    if (!result?.success) {
      const message = tx(result?.error ?? "Email yoki parol noto'g'ri.");
      setAuthError(message);
      toast.error(message);
      return;
    }

    toast.success(mode === "login" ? tx("Hisobga muvaffaqiyatli kirildi.") : tx("Ro'yxatdan o'tish muvaffaqiyatli yakunlandi."));
    navigate("/topics", { replace: true });
  };

  const handleGoogleAuth = async () => {
    setAuthError("");
    const result = await loginWithGoogle();

    if (!result?.success) {
      const message = tx(result?.error ?? "Google orqali kirishda xatolik yuz berdi.");
      setAuthError(message);
      toast.error(message);
      return;
    }

    toast.success(tx("Google orqali muvaffaqiyatli kirildi."));
    navigate("/topics", { replace: true });
  };

  return (
    <div className="page-shell py-4 sm:py-10">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="glass-panel relative overflow-hidden px-5 py-6 sm:px-10 sm:py-12">
          <div className="absolute inset-0 -z-10 bg-hero-grid bg-[size:32px_32px] opacity-60" />
          <div className="absolute right-6 top-6 h-28 w-28 rounded-full bg-sky-100/70 blur-2xl" />
          <div className="absolute bottom-6 left-10 h-36 w-36 rounded-full bg-cyan-100/70 blur-3xl" />

          <div className="max-w-2xl space-y-8">
            <div className="flex justify-end">
              <LanguageSwitch />
            </div>

            <div className="flex items-center gap-4">
              <img src={logoMark} alt={tx(BRAND_NAME)} className="h-14 w-14 rounded-[20px] shadow-soft sm:h-16 sm:w-16 sm:rounded-[24px]" />
              <div>
                <p className="section-kicker">{tx(BRAND_HERO_KICKER)}</p>
                <h1 className="text-2xl font-semibold text-slate-950 sm:text-4xl">{tx(BRAND_NAME)}</h1>
              </div>
            </div>

            <div className="space-y-4">
              <p className="section-copy max-w-2xl text-base sm:text-lg">
                {tx(`${BRAND_HERO_DESCRIPTION} Endi sahifada alohida kirish va ro'yxatdan o'tish bo'limlari mavjud.`)}
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="surface-card p-5">
                  <p className="text-2xl font-semibold text-slate-950 sm:text-3xl">{topics.length}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{tx("Mavzu")}</p>
                </div>
                <div className="surface-card p-5">
                  <p className="text-2xl font-semibold text-slate-950 sm:text-3xl">{totalCards}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{tx("Karta")}</p>
                </div>
                <div className="surface-card p-5">
                  <p className="text-2xl font-semibold text-slate-950 sm:text-3xl">{certificateExamConfig.questionCount}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{tx("Sertifikat testi")}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="surface-card p-5">
                <p className="text-sm font-semibold text-slate-800">{tx("Kirish mavjud")}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {tx("Mavjud akkaunt bo'lsa email va parol bilan tizimga darhol kirish mumkin.")}
                </p>
              </div>
              <div className="surface-card p-5">
                <p className="text-sm font-semibold text-slate-800">{tx("Google kirishi")}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {tx("Firebase sozlangan bo'lsa, Google akkaunt orqali bir tugma bilan xavfsiz kirish mumkin.")}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="surface-card px-5 py-6 sm:px-8 sm:py-10">
          <div className="space-y-5">
            <div className="rounded-[24px] bg-slate-100 p-1">
              <div className="flex gap-1">
                <button type="button" onClick={() => handleModeChange("register")} className={tabClass(mode === "register")}>
                  {tx("Ro'yxatdan o'tish")}
                </button>
                <button type="button" onClick={() => handleModeChange("login")} className={tabClass(mode === "login")}>
                  {tx("Kirish")}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="section-kicker">{authMeta.kicker}</p>
              <h2 className="section-title">{authMeta.title}</h2>
              <p className="section-copy">{authMeta.description}</p>
            </div>

            {isFrontendOnlyMode ? (
              <div className="rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
                {tx("Frontend-only rejim yoqilgan. Ro'yxatdan o'tish, kirish va progress shu brauzerning local storage xotirasida saqlanadi.")}
              </div>
            ) : null}
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {mode === "register" ? (
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
                    disabled={isAuthPending}
                    className="field-input"
                    placeholder={tx("Ali")}
                  />
                  {errors.firstName ? <p className="mt-2 text-sm text-rose-600">{errors.firstName}</p> : null}
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
                    disabled={isAuthPending}
                    className="field-input"
                    placeholder={tx("Valiyev")}
                  />
                  {errors.lastName ? <p className="mt-2 text-sm text-rose-600">{errors.lastName}</p> : null}
                </div>
              </div>
            ) : null}

            <div>
              <label htmlFor="email" className="field-label">
                {tx("Email")}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formState.email}
                onChange={handleChange}
                disabled={isAuthPending}
                className="field-input"
                placeholder="ali@example.com"
              />
              {errors.email ? <p className="mt-2 text-sm text-rose-600">{errors.email}</p> : null}
            </div>

            <div>
              <label htmlFor="password" className="field-label">
                {tx("Parol")}
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formState.password}
                  onChange={handleChange}
                  disabled={isAuthPending}
                  className="field-input pr-14"
                  placeholder={tx("Kamida 6 ta belgi")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((previousState) => !previousState)}
                  disabled={isAuthPending}
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all duration-300 hover:border-sky-200 hover:text-sky-700"
                  aria-label={showPassword ? tx("Parolni yashirish") : tx("Parolni ko'rsatish")}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.5 3L17.5 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      <path
                        d="M8.2 8.2A2.5 2.5 0 0 1 11.8 11.8"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M6.2 5.7C4.6 6.7 3.4 8.1 2.5 10C4.1 13.2 6.7 15 10 15C11.3 15 12.5 14.7 13.6 14.1"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8.3 5.2C8.8 5.1 9.4 5 10 5C13.3 5 15.9 6.8 17.5 10C16.9 11.2 16.1 12.2 15.2 13"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M2.5 10C4.1 6.8 6.7 5 10 5C13.3 5 15.9 6.8 17.5 10C15.9 13.2 13.3 15 10 15C6.7 15 4.1 13.2 2.5 10Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password ? <p className="mt-2 text-sm text-rose-600">{errors.password}</p> : null}
            </div>

            {authError ? (
              <p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
                {authError}
              </p>
            ) : null}

            <button type="submit" disabled={isAuthPending} className={`primary-button w-full ${isAuthPending ? "cursor-not-allowed opacity-80" : ""}`}>
              {isAuthPending ? tx("Tekshirilmoqda...") : authMeta.button}
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{tx("yoki")}</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <GoogleAuthButton language={language} loading={isAuthPending} onClick={handleGoogleAuth} />
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            {mode === "register" ? (
              <button type="button" onClick={() => handleModeChange("login")} className="font-semibold text-sky-700 transition-colors hover:text-sky-800">
                {tx("Akkauntingiz bormi? Kirish")}
              </button>
            ) : (
              <button type="button" onClick={() => handleModeChange("register")} className="font-semibold text-sky-700 transition-colors hover:text-sky-800">
                {tx("Hisobingiz yo'qmi? Ro'yxatdan o'ting")}
              </button>
            )}
          </div>

          <div className="mt-4 text-center text-xs text-slate-400">
            <Link to={mode === "login" ? "/register" : "/login"} className="transition-colors hover:text-slate-600">
              {mode === "login" ? tx("Ro'yxatdan o'tish sahifasi URL") : tx("Kirish sahifasi URL")}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
