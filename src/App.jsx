import { Suspense, lazy, useEffect } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import SkeletonBlock from "./components/SkeletonBlock";
import { useAppContext } from "./context/AppContext";
import { localizeText } from "./utils/locale";

const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const TopicsPage = lazy(() => import("./pages/TopicsPage"));
const TopicLearningPage = lazy(() => import("./pages/TopicLearningPage"));
const TopicQuizPage = lazy(() => import("./pages/TopicQuizPage"));
const CertificateExamPage = lazy(() => import("./pages/CertificateExamPage"));
const CertificateResultPage = lazy(() => import("./pages/CertificateResultPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));

function AppShell() {
  const location = useLocation();
  const isTopicsPage = location.pathname === "/topics";

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute right-[-6rem] top-28 h-80 w-80 rounded-full bg-cyan-100/60 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-amber-100/60 blur-3xl" />
      </div>
      <Navbar />
      <main className={`pb-12 ${isTopicsPage ? "pt-2 sm:pt-3" : "pt-8"}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function RootRedirect() {
  const { user, isAppReady } = useAppContext();

  if (!isAppReady) {
    return <RouteLoader />;
  }

  return <Navigate replace to={user ? "/topics" : "/register"} />;
}

function RouteLoader() {
  const { language } = useAppContext();
  const tx = (value) => localizeText(value, language);

  return (
    <div className="page-shell">
      <div className="surface-card min-h-[320px] space-y-6 px-6 py-10">
        <div className="space-y-3">
          <p className="section-kicker">{tx("Yuklanmoqda")}</p>
          <p className="text-lg font-semibold text-slate-900">{tx("Sahifa yuklanmoqda...")}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <SkeletonBlock className="h-36 rounded-[28px]" />
          <SkeletonBlock className="h-36 rounded-[28px]" />
          <SkeletonBlock className="h-48 rounded-[28px] md:col-span-2" />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<RegisterPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/topics" element={<TopicsPage />} />
          <Route path="/topics/:topicId" element={<TopicLearningPage />} />
          <Route path="/topics/:topicId/quiz" element={<TopicQuizPage />} />
          <Route path="/certificate/exam" element={<CertificateExamPage />} />
          <Route path="/certificate/result" element={<CertificateResultPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </Suspense>
  );
}
