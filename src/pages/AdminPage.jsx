import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import SmartImage from "../components/SmartImage";
import { useAppContext } from "../context/AppContext";
import { localizeText } from "../utils/locale";
import { formatDate } from "../utils/quiz";

function MetricCard({ label, value, hint }) {
  return (
    <div className="surface-card p-5">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">{value}</p>
      {hint ? <p className="mt-2 text-xs leading-6 text-slate-500">{hint}</p> : null}
    </div>
  );
}

function ViewButton({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all ${
        active ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
      }`}
    >
      {label}
    </button>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
      <p className="text-base font-semibold text-slate-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function ModalShell({ open, kicker, title, description, onClose, footer, maxWidth = "max-w-2xl", children }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-slate-950/28 px-3 py-4 backdrop-blur-[5px] sm:items-center sm:p-4" onClick={onClose}>
      <div
        className={`relative w-full ${maxWidth} overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_45px_140px_-45px_rgba(15,23,42,0.55)] sm:rounded-[36px]`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_46%),radial-gradient(circle_at_top_right,rgba(15,23,42,0.06),transparent_42%)]" />

        <div className="relative flex items-start justify-between gap-4 border-b border-slate-100/80 px-4 py-5 sm:px-8 sm:py-6">
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-slate-950 text-base font-semibold text-white shadow-lg shadow-slate-950/15 sm:h-14 sm:w-14 sm:rounded-[20px] sm:text-lg">
              {String(title ?? kicker ?? "A").trim().slice(0, 1).toUpperCase()}
            </div>

            <div className="min-w-0 space-y-2">
              {kicker ? <p className="section-kicker">{kicker}</p> : null}
              <h3 className="text-xl font-semibold text-slate-950 sm:text-2xl">{title}</h3>
              {description ? <p className="max-w-xl text-sm leading-6 text-slate-500">{description}</p> : null}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white/85 text-lg font-semibold text-slate-500 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950"
            aria-label="Close"
          >
            x
          </button>
        </div>

        <div className="relative max-h-[78vh] overflow-y-auto bg-white px-4 py-5 sm:px-8 sm:py-6">{children}</div>

        {footer ? <div className="relative border-t border-slate-100 bg-white px-4 py-4 sm:px-8 sm:py-5">{footer}</div> : null}
      </div>
    </div>
  );
}

function buildEmptyTopicForm() {
  return {
    title: "",
    description: "",
    glyph: "",
    image: ""
  };
}

function buildEmptyItemForm() {
  return {
    title: "",
    description: "",
    quizQuestion: "",
    image: ""
  };
}

function buildEmptyQuestionForm() {
  return {
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correctAnswer: ""
  };
}

function questionToForm(question) {
  return {
    question: question.question,
    option1: question.options[0] ?? "",
    option2: question.options[1] ?? "",
    option3: question.options[2] ?? "",
    option4: question.options[3] ?? "",
    correctAnswer: question.correctAnswer
  };
}

const modalPrimaryButtonClass =
  "inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 sm:min-w-[140px] sm:w-auto";

const modalSecondaryButtonClass =
  "inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 sm:min-w-[140px] sm:w-auto";

const modalDangerButtonClass =
  "inline-flex w-full items-center justify-center rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold leading-none text-white shadow-lg shadow-rose-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-rose-700 sm:min-w-[160px] sm:w-auto";

const roleOptions = ["user", "teacher", "admin"];

function getRoleLabel(role, tx) {
  if (role === "admin") {
    return tx("Admin");
  }

  if (role === "teacher") {
    return tx("Teacher");
  }

  return tx("User");
}

function getRoleChipClass(role) {
  if (role === "admin") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (role === "teacher") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-sky-200 bg-sky-50 text-sky-700";
}

export default function AdminPage() {
  const {
    language,
    adminTopics: topics,
    registeredUsers,
    certificateRecords,
    refreshAdminData,
    updateUserRoles,
    updateUserStatus,
    deleteUserAccount,
    deleteCertificateRecord,
    uploadAdminImage,
    addTopic,
    updateTopic,
    deleteTopic,
    addLearningItem,
    updateLearningItem,
    deleteLearningItem,
    addQuizQuestion,
    updateQuizQuestion,
    deleteQuizQuestion
  } = useAppContext();
  const tx = (value) => localizeText(value, language);

  const [activeView, setActiveView] = useState("dashboard");
  const [topicView, setTopicView] = useState("info");
  const [selectedTopicId, setSelectedTopicId] = useState(topics[0]?.id ?? "");
  const [topicForm, setTopicForm] = useState(buildEmptyTopicForm());
  const [itemForm, setItemForm] = useState(buildEmptyItemForm());
  const [questionForm, setQuestionForm] = useState(buildEmptyQuestionForm());
  const [topicModal, setTopicModal] = useState({ open: false, mode: "create" });
  const [itemModal, setItemModal] = useState({ open: false, mode: "create", itemId: null });
  const [questionModal, setQuestionModal] = useState({ open: false, mode: "create", questionId: null });
  const [roleModal, setRoleModal] = useState({ open: false, userId: null, name: "", roles: [] });
  const [confirmModal, setConfirmModal] = useState(null);
  const [isTopicImageUploading, setIsTopicImageUploading] = useState(false);

  const selectedTopic = useMemo(
    () => topics.find((topic) => topic.id === selectedTopicId) ?? topics[0] ?? null,
    [selectedTopicId, topics]
  );
  const totalLearningItems = useMemo(() => topics.reduce((sum, topic) => sum + topic.learnItems.length, 0), [topics]);
  const totalQuestions = useMemo(() => topics.reduce((sum, topic) => sum + topic.quizQuestions.length, 0), [topics]);
  const sortedUsers = useMemo(
    () => [...registeredUsers].sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()),
    [registeredUsers]
  );
  const sortedCertificates = useMemo(
    () => [...certificateRecords].sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()),
    [certificateRecords]
  );
  const hasOpenModal = topicModal.open || itemModal.open || questionModal.open || roleModal.open || Boolean(confirmModal);

  useEffect(() => {
    void refreshAdminData().catch((error) => {
      toast.error(error.message ?? tx("Admin ma'lumotlarini olishda xatolik yuz berdi."));
    });
  }, []);

  useEffect(() => {
    if (!topics.length) {
      setSelectedTopicId("");
      return;
    }

    if (!topics.some((topic) => topic.id === selectedTopicId)) {
      setSelectedTopicId(topics[0].id);
    }
  }, [selectedTopicId, topics]);

  useEffect(() => {
    setTopicView("info");
  }, [selectedTopicId]);

  useEffect(() => {
    if (!hasOpenModal) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setTopicModal({ open: false, mode: "create" });
        setItemModal({ open: false, mode: "create", itemId: null });
        setQuestionModal({ open: false, mode: "create", questionId: null });
        setRoleModal({ open: false, userId: null, name: "", roles: [] });
        setConfirmModal(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [hasOpenModal]);

  const closeTopicModal = () => {
    setTopicModal({ open: false, mode: "create" });
    setTopicForm(buildEmptyTopicForm());
    setIsTopicImageUploading(false);
  };

  const closeItemModal = () => {
    setItemModal({ open: false, mode: "create", itemId: null });
    setItemForm(buildEmptyItemForm());
  };

  const closeQuestionModal = () => {
    setQuestionModal({ open: false, mode: "create", questionId: null });
    setQuestionForm(buildEmptyQuestionForm());
  };

  const closeRoleModal = () => {
    setRoleModal({ open: false, userId: null, name: "", roles: [] });
  };

  const openTopicCreateModal = () => {
    setActiveView("topics");
    setTopicForm(buildEmptyTopicForm());
    setTopicModal({ open: true, mode: "create" });
  };

  const openTopicEditModal = () => {
    if (!selectedTopic) {
      return;
    }

    setTopicForm({
      title: selectedTopic.title,
      description: selectedTopic.description,
      glyph: selectedTopic.glyph,
      image: selectedTopic.image ?? ""
    });
    setTopicModal({ open: true, mode: "edit" });
  };

  const openItemCreateModal = () => {
    setItemForm(buildEmptyItemForm());
    setItemModal({ open: true, mode: "create", itemId: null });
  };

  const openItemEditModal = (item) => {
    setItemForm({
      title: item.title,
      description: item.description,
      quizQuestion: item.quizQuestion,
      image: item.image ?? ""
    });
    setItemModal({ open: true, mode: "edit", itemId: item.id });
  };

  const openQuestionCreateModal = () => {
    setQuestionForm(buildEmptyQuestionForm());
    setQuestionModal({ open: true, mode: "create", questionId: null });
  };

  const openQuestionEditModal = (question) => {
    setQuestionForm(questionToForm(question));
    setQuestionModal({ open: true, mode: "edit", questionId: question.id });
  };

  const openDeleteModal = (payload) => {
    setConfirmModal(payload);
  };

  const openRoleModal = (account) => {
    setRoleModal({
      open: true,
      userId: account.id,
      name: account.fullName,
      roles: Array.isArray(account.roles) ? account.roles : ["user"]
    });
  };

  const toggleRole = (role) => {
    setRoleModal((previous) => {
      const exists = previous.roles.includes(role);
      const nextRoles = exists ? previous.roles.filter((item) => item !== role) : [...previous.roles, role];

      return {
        ...previous,
        roles: nextRoles
      };
    });
  };

  const handleTopicSubmit = async (event) => {
    event.preventDefault();

    try {
      if (topicModal.mode === "edit" && selectedTopic) {
        await updateTopic(selectedTopic.id, topicForm);
        closeTopicModal();
        return;
      }

      const createdTopic = await addTopic(topicForm);
      if (createdTopic) {
        setSelectedTopicId(createdTopic.id);
      }
      closeTopicModal();
    } catch (error) {
      toast.error(error.message ?? tx("Mavzuni saqlashda xatolik yuz berdi."));
    }
  };

  const handleTopicImageUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setIsTopicImageUploading(true);

    try {
      const result = await uploadAdminImage(file, "topics");
      setTopicForm((previous) => ({ ...previous, image: result.url ?? "" }));
      toast.success(tx("Rasm yuklandi."));
    } catch (error) {
      toast.error(error.message ?? tx("Rasmni yuklashda xatolik yuz berdi."));
    } finally {
      setIsTopicImageUploading(false);
    }
  };

  const handleItemSubmit = async (event) => {
    event.preventDefault();

    if (!selectedTopic) {
      return;
    }

    try {
      if (itemModal.mode === "edit" && itemModal.itemId) {
        await updateLearningItem(selectedTopic.id, itemModal.itemId, itemForm);
      } else {
        await addLearningItem(selectedTopic.id, itemForm);
      }

      closeItemModal();
    } catch (error) {
      toast.error(error.message ?? tx("Kartani saqlashda xatolik yuz berdi."));
    }
  };

  const handleQuestionSubmit = async (event) => {
    event.preventDefault();

    if (!selectedTopic) {
      return;
    }

    const payload = {
      question: questionForm.question,
      options: [questionForm.option1, questionForm.option2, questionForm.option3, questionForm.option4],
      correctAnswer: questionForm.correctAnswer
    };

    try {
      if (questionModal.mode === "edit" && questionModal.questionId) {
        await updateQuizQuestion(selectedTopic.id, questionModal.questionId, payload);
      } else {
        await addQuizQuestion(selectedTopic.id, payload);
      }

      closeQuestionModal();
    } catch (error) {
      toast.error(error.message ?? tx("Savolni saqlashda xatolik yuz berdi."));
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmModal) {
      return;
    }

    try {
      if (confirmModal.type === "topic" && selectedTopic) {
        const currentIndex = topics.findIndex((topic) => topic.id === selectedTopic.id);
        const nextTopic = topics[currentIndex + 1] ?? topics[currentIndex - 1] ?? null;
        await deleteTopic(selectedTopic.id);
        setSelectedTopicId(nextTopic?.id ?? "");
      }

      if (confirmModal.type === "item" && selectedTopic) {
        await deleteLearningItem(selectedTopic.id, confirmModal.itemId);
      }

      if (confirmModal.type === "question" && selectedTopic) {
        await deleteQuizQuestion(selectedTopic.id, confirmModal.questionId);
      }

      if (confirmModal.type === "user") {
        await deleteUserAccount(confirmModal.userId);
      }

      if (confirmModal.type === "certificate") {
        await deleteCertificateRecord(confirmModal.serialNumber);
      }

      setConfirmModal(null);
    } catch (error) {
      toast.error(error.message ?? tx("O'chirishda xatolik yuz berdi."));
    }
  };

  const handleRoleSave = async () => {
    if (!roleModal.userId || !roleModal.roles.length) {
      return;
    }

    try {
      await updateUserRoles(roleModal.userId, roleModal.roles);
      closeRoleModal();
    } catch (error) {
      toast.error(error.message ?? tx("Rollarni saqlashda xatolik yuz berdi."));
    }
  };

  const handleUserStatusToggle = async (account) => {
    try {
      await updateUserStatus(account.id, !account.isActive);
    } catch (error) {
      toast.error(error.message ?? tx("Foydalanuvchi holatini yangilashda xatolik yuz berdi."));
    }
  };

  return (
    <>
      <div className="page-shell space-y-6">
        <section className="surface-card p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <ViewButton active={activeView === "dashboard"} label={tx("Asosiy")} onClick={() => setActiveView("dashboard")} />
              <ViewButton active={activeView === "topics"} label={tx("Mavzular")} onClick={() => setActiveView("topics")} />
              <ViewButton active={activeView === "users"} label={tx("Foydalanuvchilar")} onClick={() => setActiveView("users")} />
              <ViewButton active={activeView === "certificates"} label={tx("Sertifikatlar")} onClick={() => setActiveView("certificates")} />
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={openTopicCreateModal} className="primary-button">
                {tx("Yangi mavzu")}
              </button>
              <Link to="/topics" className="secondary-button">
                {tx("Saytga qaytish")}
              </Link>
            </div>
          </div>
        </section>

        {activeView === "dashboard" ? (
          <section className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard label={tx("Ro'yxatdan o'tganlar")} value={registeredUsers.length} hint={tx("Jami foydalanuvchilar")} />
              <MetricCard label={tx("Mavzular")} value={topics.length} hint={tx("Jami bo'limlar")} />
              <MetricCard label={tx("Learning kartalar")} value={totalLearningItems} hint={tx("Barcha kartalar")} />
              <MetricCard label={tx("Quiz savollar")} value={totalQuestions} hint={tx("Barcha savollar")} />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="surface-card p-6">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <p className="section-kicker">{tx("Tez ko'rinish")}</p>
                    <h3 className="text-2xl font-semibold text-slate-950">{tx("Oxirgi foydalanuvchilar")}</h3>
                  </div>
                  <span className="muted-chip">{sortedUsers.length}</span>
                </div>

                <div className="mt-5 space-y-3">
                  {sortedUsers.slice(0, 5).map((account) => (
                    <div key={account.id} className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">{account.fullName}</p>
                          <p className="mt-1 text-xs text-slate-500">{account.email}</p>
                        </div>
                        <span className="muted-chip">{account.certificateCount}</span>
                      </div>
                      <p className="mt-3 text-xs text-slate-500">
                        {tx("Ro'yxatdan o'tgan")}: {formatDate(account.registeredAt, language)}
                      </p>
                    </div>
                  ))}

                  {!sortedUsers.length ? (
                    <EmptyState title={tx("Foydalanuvchi yo'q")} description={tx("Ro'yxatdan o'tganlar shu yerda ko'rinadi.")} />
                  ) : null}
                </div>
              </div>

              <div className="surface-card p-6">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <p className="section-kicker">{tx("Tez ko'rinish")}</p>
                    <h3 className="text-2xl font-semibold text-slate-950">{tx("Oxirgi sertifikatlar")}</h3>
                  </div>
                  <span className="muted-chip">{sortedCertificates.length}</span>
                </div>

                <div className="mt-5 space-y-3">
                  {sortedCertificates.slice(0, 5).map((record) => (
                    <div key={record.serialNumber} className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">{record.userFullName}</p>
                          <p className="mt-1 text-xs text-slate-500">{record.serialNumber}</p>
                        </div>
                        <span className="badge-chip">{record.score}%</span>
                      </div>
                      <p className="mt-3 text-xs text-slate-500">{formatDate(record.issueDate, language)}</p>
                    </div>
                  ))}

                  {!sortedCertificates.length ? (
                    <EmptyState title={tx("Sertifikat yo'q")} description={tx("Yaratilgan sertifikatlar shu yerda ko'rinadi.")} />
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {activeView === "topics" ? (
          <section className="grid gap-6 xl:grid-cols-[320px_1fr]">
            <div className="surface-card p-5">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <p className="section-kicker">{tx("Bo'lim")}</p>
                  <h3 className="text-2xl font-semibold text-slate-950">{tx("Mavzular ro'yxati")}</h3>
                </div>
                <button type="button" onClick={openTopicCreateModal} className="secondary-button">
                  {tx("Qo'shish")}
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {topics.map((topic) => {
                  const isActive = topic.id === selectedTopic?.id;

                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => setSelectedTopicId(topic.id)}
                      className={`w-full rounded-[24px] border px-4 py-4 text-left transition-all ${
                        isActive ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 overflow-hidden rounded-[18px] border border-white/10 bg-slate-100">
                          <SmartImage
                            src={topic.image}
                            fallbackSrc={topic.fallbackImage}
                            alt={tx(topic.title)}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`truncate text-sm font-semibold ${isActive ? "text-white" : "text-slate-950"}`}>{tx(topic.title)}</p>
                          <p className={`mt-1 text-xs ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                            {topic.learnItems.length} {tx("ta karta")} | {topic.quizQuestions.length} {tx("ta savol")}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              {selectedTopic ? (
                <>
                  <div className="surface-card p-6 sm:p-7">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex gap-4">
                        <div className="h-24 w-24 overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100">
                          <SmartImage
                            src={selectedTopic.image}
                            fallbackSrc={selectedTopic.fallbackImage}
                            alt={tx(selectedTopic.title)}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="section-kicker">{tx("Tanlangan mavzu")}</p>
                            <h3 className="text-3xl font-semibold text-slate-950">{tx(selectedTopic.title)}</h3>
                          </div>
                          <p className="max-w-2xl text-sm leading-7 text-slate-600">{tx(selectedTopic.description)}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button type="button" onClick={openTopicEditModal} className="secondary-button">
                          {tx("Tahrirlash")}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            openDeleteModal({
                              type: "topic",
                              title: tx("Mavzuni o'chirish"),
                              description: tx("Haqiqatdan ham shu mavzuni o'chirmoqchimisiz?")
                            })
                          }
                          className="secondary-button text-rose-600 hover:border-rose-100 hover:text-rose-600"
                        >
                          {tx("O'chirish")}
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                      <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                        <p className="text-sm font-semibold text-slate-500">{tx("Kartalar")}</p>
                        <p className="mt-2 text-3xl font-semibold text-slate-950">{selectedTopic.learnItems.length}</p>
                      </div>
                      <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                        <p className="text-sm font-semibold text-slate-500">{tx("Savollar")}</p>
                        <p className="mt-2 text-3xl font-semibold text-slate-950">{selectedTopic.quizQuestions.length}</p>
                      </div>
                      <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                        <p className="text-sm font-semibold text-slate-500">{tx("Holat")}</p>
                        <p className="mt-2 text-lg font-semibold text-slate-950">{tx("Tayyor")}</p>
                      </div>
                    </div>

                    <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-2">
                      <div className="flex flex-wrap gap-2">
                        <ViewButton active={topicView === "info"} label={tx("Mavzu")} onClick={() => setTopicView("info")} />
                        <ViewButton active={topicView === "items"} label={tx("Kartalar")} onClick={() => setTopicView("items")} />
                        <ViewButton active={topicView === "questions"} label={tx("Savollar")} onClick={() => setTopicView("questions")} />
                      </div>
                    </div>
                  </div>

                  {topicView === "info" ? (
                    <div className="surface-card p-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5">
                          <p className="text-sm font-semibold text-slate-500">{tx("Mavzu haqida")}</p>
                          <p className="mt-3 text-sm leading-7 text-slate-700">{tx(selectedTopic.description)}</p>
                        </div>

                        <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5">
                          <p className="text-sm font-semibold text-slate-500">{tx("Tez amallar")}</p>
                          <div className="mt-4 flex flex-wrap gap-3">
                            <button type="button" onClick={openItemCreateModal} className="primary-button">
                              {tx("Karta qo'shish")}
                            </button>
                            <button type="button" onClick={openQuestionCreateModal} className="secondary-button">
                              {tx("Savol qo'shish")}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {topicView === "items" ? (
                    <div className="surface-card p-6">
                      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="section-kicker">{tx("Learning kartalar")}</p>
                          <h3 className="text-2xl font-semibold text-slate-950">{tx("Kartalar ro'yxati")}</h3>
                        </div>
                        <button type="button" onClick={openItemCreateModal} className="primary-button">
                          {tx("Karta qo'shish")}
                        </button>
                      </div>

                      <div className="mt-6 space-y-3">
                        {selectedTopic.learnItems.length ? (
                          selectedTopic.learnItems.map((item, index) => (
                            <div key={item.id} className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex gap-4">
                                  <div className="h-16 w-16 overflow-hidden rounded-[18px] border border-slate-200 bg-white">
                                    <SmartImage
                                      src={item.image}
                                      fallbackSrc={item.fallbackImage}
                                      alt={tx(item.title)}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-sm font-semibold text-slate-950">
                                      {index + 1}. {tx(item.title)}
                                    </p>
                                    <p className="text-sm leading-6 text-slate-600">{tx(item.description)}</p>
                                    <p className="text-xs text-slate-500">{tx(item.quizQuestion)}</p>
                                  </div>
                                </div>

                                <div className="flex gap-3">
                                  <button type="button" onClick={() => openItemEditModal(item)} className="secondary-button">
                                    {tx("Tahrirlash")}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openDeleteModal({
                                        type: "item",
                                        itemId: item.id,
                                        title: tx("Kartani o'chirish"),
                                        description: tx("Haqiqatdan ham shu kartani o'chirmoqchimisiz?")
                                      })
                                    }
                                    className="secondary-button text-rose-600 hover:border-rose-100 hover:text-rose-600"
                                  >
                                    {tx("O'chirish")}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <EmptyState title={tx("Karta yo'q")} description={tx("Bu mavzuga hali learning karta qo'shilmagan.")} />
                        )}
                      </div>
                    </div>
                  ) : null}

                  {topicView === "questions" ? (
                    <div className="surface-card p-6">
                      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="section-kicker">{tx("Quiz savollar")}</p>
                          <h3 className="text-2xl font-semibold text-slate-950">{tx("Savollar ro'yxati")}</h3>
                        </div>
                        <button type="button" onClick={openQuestionCreateModal} className="primary-button">
                          {tx("Savol qo'shish")}
                        </button>
                      </div>

                      <div className="mt-6 space-y-3">
                        {selectedTopic.quizQuestions.length ? (
                          selectedTopic.quizQuestions.map((question, index) => (
                            <div key={question.id} className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                              <p className="text-sm font-semibold text-slate-950">
                                {index + 1}. {tx(question.question)}
                              </p>

                              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                {question.options.map((option) => (
                                  <div
                                    key={option}
                                    className={`rounded-2xl border px-3 py-3 text-sm ${
                                      option === question.correctAnswer
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                        : "border-slate-200 bg-white text-slate-700"
                                    }`}
                                  >
                                    {tx(option)}
                                  </div>
                                ))}
                              </div>

                              <div className="mt-4 flex gap-3">
                                <button type="button" onClick={() => openQuestionEditModal(question)} className="secondary-button">
                                  {tx("Tahrirlash")}
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    openDeleteModal({
                                      type: "question",
                                      questionId: question.id,
                                      title: tx("Savolni o'chirish"),
                                      description: tx("Haqiqatdan ham shu savolni o'chirmoqchimisiz?")
                                    })
                                  }
                                  className="secondary-button text-rose-600 hover:border-rose-100 hover:text-rose-600"
                                >
                                  {tx("O'chirish")}
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <EmptyState title={tx("Savol yo'q")} description={tx("Bu mavzuga hali savol qo'shilmagan.")} />
                        )}
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="surface-card p-8">
                  <EmptyState title={tx("Tanlangan mavzu yo'q")} description={tx("Chap tomondan mavzuni tanlang yoki yangi mavzu qo'shing.")} />
                </div>
              )}
            </div>
          </section>
        ) : null}

        {activeView === "users" ? (
          <section className="surface-card p-6">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <p className="section-kicker">{tx("Foydalanuvchilar")}</p>
                <h3 className="text-2xl font-semibold text-slate-950">{tx("Ro'yxatdan o'tganlar")}</h3>
              </div>
              <span className="muted-chip">{sortedUsers.length}</span>
            </div>

            <div className="mt-6 grid gap-4">
              {sortedUsers.length ? (
                sortedUsers.map((account) => (
                  <div key={account.id} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xl font-semibold text-slate-950">{account.fullName}</p>
                          <p className="mt-1 text-sm text-slate-500">{account.email}</p>
                          <p className="mt-2 text-xs text-slate-500">{tx("Ro'yxatdan o'tgan")}: {formatDate(account.registeredAt, language)}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                              account.isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                          >
                            {account.isActive ? tx("Faol") : tx("Bloklangan")}
                          </span>
                          {account.roles?.map((role) => (
                            <span key={role} className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getRoleChipClass(role)}`}>
                              {getRoleLabel(role, tx)}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <div className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-center">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{tx("Ko'rilgan")}</p>
                          <p className="mt-2 text-xl font-semibold text-slate-950">{account.reviewedCount}</p>
                        </div>
                        <div className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-center">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{tx("Tugagan")}</p>
                          <p className="mt-2 text-xl font-semibold text-slate-950">{account.completedCount}</p>
                        </div>
                        <div className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-center">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{tx("Sertifikat")}</p>
                          <p className="mt-2 text-xl font-semibold text-slate-950">{account.certificateCount}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap justify-end gap-3">
                      <button type="button" onClick={() => handleUserStatusToggle(account)} className="secondary-button">
                        {account.isActive ? tx("Bloklash") : tx("Faollashtirish")}
                      </button>
                      <button type="button" onClick={() => openRoleModal(account)} className="secondary-button">
                        {tx("Rollarni boshqarish")}
                      </button>
                      {!account.roles?.includes("admin") ? (
                        <button
                          type="button"
                          onClick={() =>
                            openDeleteModal({
                              type: "user",
                              userId: account.id,
                              title: tx("Foydalanuvchini o'chirish"),
                              description: tx("Haqiqatdan ham shu foydalanuvchini o'chirmoqchimisiz?")
                            })
                          }
                          className="secondary-button text-rose-600 hover:border-rose-100 hover:text-rose-600"
                        >
                          {tx("O'chirish")}
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState title={tx("Foydalanuvchi yo'q")} description={tx("Ro'yxatdan o'tganlar shu yerda ko'rinadi.")} />
              )}
            </div>
          </section>
        ) : null}

        {activeView === "certificates" ? (
          <section className="surface-card p-6">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <p className="section-kicker">{tx("Sertifikatlar")}</p>
                <h3 className="text-2xl font-semibold text-slate-950">{tx("Olingan sertifikatlar")}</h3>
              </div>
              <span className="muted-chip">{sortedCertificates.length}</span>
            </div>

            <div className="mt-6 space-y-3">
              {sortedCertificates.length ? (
                sortedCertificates.map((record) => (
                  <div key={record.serialNumber} className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{record.userFullName}</p>
                        <p className="mt-1 text-xs text-slate-500">{record.userEmail}</p>
                      </div>
                      <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-3 sm:gap-6">
                        <span>{record.serialNumber}</span>
                        <span>{formatDate(record.issueDate, language)}</span>
                        <span className="font-semibold text-slate-950">{record.score}%</span>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          openDeleteModal({
                            type: "certificate",
                            serialNumber: record.serialNumber,
                            title: tx("Sertifikatni o'chirish"),
                            description: tx("Haqiqatdan ham shu sertifikatni o'chirmoqchimisiz?")
                          })
                        }
                        className="secondary-button text-rose-600 hover:border-rose-100 hover:text-rose-600"
                      >
                        {tx("O'chirish")}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState title={tx("Sertifikat yo'q")} description={tx("Yaratilgan sertifikatlar shu yerda ko'rinadi.")} />
              )}
            </div>
          </section>
        ) : null}
      </div>

      <ModalShell
        open={topicModal.open}
        kicker={tx("Mavzu")}
        title={topicModal.mode === "edit" ? tx("Mavzuni tahrirlash") : tx("Yangi mavzu qo'shish")}
        description={tx("Mavzu ma'lumotlarini shu oynada kiriting.")}
        onClose={closeTopicModal}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={closeTopicModal} className={modalSecondaryButtonClass}>
              {tx("Bekor qilish")}
            </button>
            <button
              type="submit"
              form="topic-form"
              disabled={isTopicImageUploading}
              className={`${modalPrimaryButtonClass} ${isTopicImageUploading ? "cursor-not-allowed opacity-60" : ""}`}
            >
              {topicModal.mode === "edit" ? tx("Saqlash") : tx("Qo'shish")}
            </button>
          </div>
        }
      >
        <form id="topic-form" className="grid gap-4" onSubmit={handleTopicSubmit}>
          <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
            <div className="h-44 overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100">
              <SmartImage
                src={topicForm.image}
                fallbackSrc={selectedTopic?.fallbackImage}
                alt={tx(topicForm.title || "Mavzu")}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
                <div>
                  <label className="field-label">{tx("Mavzu nomi")}</label>
                  <input
                    className="field-input"
                    value={topicForm.title}
                    onChange={(event) => setTopicForm((previous) => ({ ...previous, title: event.target.value }))}
                  />
                </div>

                <div>
                  <label className="field-label">{tx("Belgi")}</label>
                  <input
                    className="field-input"
                    value={topicForm.glyph}
                    onChange={(event) => setTopicForm((previous) => ({ ...previous, glyph: event.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="field-label">{tx("Tavsif")}</label>
                <textarea
                  className="field-input min-h-[120px] resize-y"
                  value={topicForm.description}
                  onChange={(event) => setTopicForm((previous) => ({ ...previous, description: event.target.value }))}
                />
              </div>

              <div>
                <label className="field-label">{tx("Rasm URL")}</label>
                <input
                  className="field-input"
                  value={topicForm.image}
                  onChange={(event) => setTopicForm((previous) => ({ ...previous, image: event.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="field-label">{tx("Rasm fayli")}</label>
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition-all hover:border-slate-400 hover:bg-slate-100">
                  <span className="text-sm font-semibold text-slate-800">
                    {isTopicImageUploading ? tx("Rasm yuklanmoqda...") : tx("Kompyuterdan rasm tanlang")}
                  </span>
                  <span className="text-xs leading-5 text-slate-500">{tx("PNG, JPG, WEBP, GIF yoki SVG yuklash mumkin.")}</span>
                  <input type="file" accept="image/*" onChange={handleTopicImageUpload} disabled={isTopicImageUploading} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </form>
      </ModalShell>

      <ModalShell
        open={itemModal.open}
        kicker={tx("Learning karta")}
        title={itemModal.mode === "edit" ? tx("Kartani tahrirlash") : tx("Yangi karta qo'shish")}
        description={tx("Karta rasmi, nomi va izohini shu yerda kiriting.")}
        onClose={closeItemModal}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={closeItemModal} className={modalSecondaryButtonClass}>
              {tx("Bekor qilish")}
            </button>
            <button type="submit" form="item-form" className={modalPrimaryButtonClass}>
              {itemModal.mode === "edit" ? tx("Saqlash") : tx("Qo'shish")}
            </button>
          </div>
        }
      >
        <form id="item-form" className="grid gap-4" onSubmit={handleItemSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">{tx("Karta nomi")}</label>
              <input
                className="field-input"
                value={itemForm.title}
                onChange={(event) => setItemForm((previous) => ({ ...previous, title: event.target.value }))}
              />
            </div>

            <div>
              <label className="field-label">{tx("Rasm URL")}</label>
              <input
                className="field-input"
                value={itemForm.image}
                onChange={(event) => setItemForm((previous) => ({ ...previous, image: event.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <label className="field-label">{tx("Izoh")}</label>
            <textarea
              className="field-input min-h-[110px] resize-y"
              value={itemForm.description}
              onChange={(event) => setItemForm((previous) => ({ ...previous, description: event.target.value }))}
            />
          </div>

          <div>
            <label className="field-label">{tx("Savol matni")}</label>
            <input
              className="field-input"
              value={itemForm.quizQuestion}
              onChange={(event) => setItemForm((previous) => ({ ...previous, quizQuestion: event.target.value }))}
            />
          </div>
        </form>
      </ModalShell>

      <ModalShell
        open={questionModal.open}
        kicker={tx("Quiz savol")}
        title={questionModal.mode === "edit" ? tx("Savolni tahrirlash") : tx("Yangi savol qo'shish")}
        description={tx("Savol va 4 ta variantni shu oynada kiriting.")}
        onClose={closeQuestionModal}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={closeQuestionModal} className={modalSecondaryButtonClass}>
              {tx("Bekor qilish")}
            </button>
            <button type="submit" form="question-form" className={modalPrimaryButtonClass}>
              {questionModal.mode === "edit" ? tx("Saqlash") : tx("Qo'shish")}
            </button>
          </div>
        }
      >
        <form id="question-form" className="grid gap-4" onSubmit={handleQuestionSubmit}>
          <div>
            <label className="field-label">{tx("Savol")}</label>
            <textarea
              className="field-input min-h-[110px] resize-y"
              value={questionForm.question}
              onChange={(event) => setQuestionForm((previous) => ({ ...previous, question: event.target.value }))}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {["option1", "option2", "option3", "option4"].map((key, index) => (
              <div key={key}>
                <label className="field-label">
                  {tx("Variant")} {index + 1}
                </label>
                <input
                  className="field-input"
                  value={questionForm[key]}
                  onChange={(event) => setQuestionForm((previous) => ({ ...previous, [key]: event.target.value }))}
                />
              </div>
            ))}
          </div>

          <div>
            <label className="field-label">{tx("To'g'ri javob")}</label>
            <input
              className="field-input"
              value={questionForm.correctAnswer}
              onChange={(event) => setQuestionForm((previous) => ({ ...previous, correctAnswer: event.target.value }))}
            />
          </div>
        </form>
      </ModalShell>

      <ModalShell
        open={roleModal.open}
        kicker={tx("Foydalanuvchi rollari")}
        title={tx("Rollarni boshqarish")}
        description={`${roleModal.name}${roleModal.name ? " - " : ""}${tx("bir foydalanuvchiga bir nechta rol berish mumkin.")}`}
        onClose={closeRoleModal}
        maxWidth="max-w-xl"
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={closeRoleModal} className={modalSecondaryButtonClass}>
              {tx("Bekor qilish")}
            </button>
            <button type="button" onClick={handleRoleSave} disabled={!roleModal.roles.length} className={`${modalPrimaryButtonClass} ${!roleModal.roles.length ? "cursor-not-allowed opacity-50" : ""}`}>
              {tx("Saqlash")}
            </button>
          </div>
        }
      >
        <div className="grid gap-3">
          {roleOptions.map((role) => {
            const checked = roleModal.roles.includes(role);

            return (
              <button
                key={role}
                type="button"
                onClick={() => toggleRole(role)}
                className={`flex items-center justify-between rounded-[24px] border px-4 py-4 text-left transition-all ${
                  checked ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-slate-50 text-slate-800"
                }`}
              >
                <div>
                  <p className="text-sm font-semibold">{getRoleLabel(role, tx)}</p>
                  <p className={`mt-1 text-xs ${checked ? "text-slate-300" : "text-slate-500"}`}>
                    {role === "admin"
                      ? tx("Admin panelga kirish huquqi")
                      : role === "teacher"
                        ? tx("O'qituvchi vakolatlari")
                        : tx("Oddiy foydalanuvchi roli")}
                  </p>
                </div>

                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold ${
                    checked ? "border-white bg-white text-slate-950" : "border-slate-300 bg-white text-slate-300"
                  }`}
                >
                  {checked ? "✓" : ""}
                </div>
              </button>
            );
          })}
        </div>

        {!roleModal.roles.length ? (
          <div className="mt-4 rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {tx("Kamida bitta rol tanlang.")}
          </div>
        ) : null}
      </ModalShell>

      <ModalShell
        open={Boolean(confirmModal)}
        kicker={tx("Tasdiqlash")}
        title={confirmModal?.title ?? ""}
        description={confirmModal?.description ?? ""}
        onClose={() => setConfirmModal(null)}
        maxWidth="max-w-xl"
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setConfirmModal(null)} className={modalSecondaryButtonClass}>
              {tx("Bekor qilish")}
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className={modalDangerButtonClass}
            >
              {tx("Ha, o'chirish")}
            </button>
          </div>
        }
      >
        <div className="rounded-[24px] border border-rose-100 bg-rose-50 px-4 py-4 text-sm leading-7 text-rose-700">
          {tx("Bu amalni ortga qaytarib bo'lmaydi. Davom etishdan oldin yana bir marta tekshiring.")}
        </div>
      </ModalShell>
    </>
  );
}
