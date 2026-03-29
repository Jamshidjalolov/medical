import { createContext, useContext, useEffect, useState } from "react";
import { ApiError, apiRequest, buildApiUrl } from "../utils/api";
import { logoutFirebaseSession, signInWithGooglePopup } from "../utils/firebase";
import { readStorage, removeStorage, writeStorage } from "../utils/localStorage";

const AUTH_STORAGE_KEY = "eduvista-auth-token";
const LANGUAGE_STORAGE_KEY = "eduvista-language";
const certificateExamConfig = {
  questionCount: 50,
  passingScore: 70
};

const quizThresholds = {
  topic: 70,
  certificate: certificateExamConfig.passingScore
};

const defaultProgressState = {
  reviewedTopics: [],
  completedTopics: [],
  completedLearningItemsByTopic: {},
  topicQuizResults: {},
  certificateExamResult: null,
  generatedCertificate: null,
  certificateHistory: []
};

const defaultAdminState = {
  adminTopics: [],
  registeredUsers: [],
  certificateRecords: []
};

const AppContext = createContext(null);

function sortBySortOrder(items) {
  return [...(Array.isArray(items) ? items : [])].sort((left, right) => {
    const leftOrder = Number(left?.sortOrder ?? 0);
    const rightOrder = Number(right?.sortOrder ?? 0);

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return String(left?.title ?? left?.question ?? "").localeCompare(String(right?.title ?? right?.question ?? ""));
  });
}

function normalizeQuestion(question) {
  return {
    id: String(question?.id ?? ""),
    topicId: String(question?.topicId ?? ""),
    topicTitle: String(question?.topicTitle ?? ""),
    learningItemId: question?.learningItemId ?? null,
    question: String(question?.question ?? ""),
    options: Array.isArray(question?.options) ? question.options : [],
    correctAnswer: question?.correctAnswer ?? undefined,
    sortOrder: Number(question?.sortOrder ?? 0)
  };
}

function normalizeLearningItem(item) {
  return {
    id: String(item?.id ?? ""),
    topicId: String(item?.topicId ?? ""),
    title: String(item?.title ?? ""),
    description: String(item?.description ?? ""),
    quizQuestion: item?.quizQuestion ?? "",
    image: item?.image ?? "",
    fallbackImage: item?.fallbackImage ?? "",
    sortOrder: Number(item?.sortOrder ?? 0)
  };
}

function normalizeTopic(topic) {
  const learnItems = sortBySortOrder(topic?.learnItems).map(normalizeLearningItem);
  const quizQuestions = sortBySortOrder(topic?.quizQuestions).map(normalizeQuestion);

  return {
    id: String(topic?.id ?? ""),
    title: String(topic?.title ?? ""),
    description: String(topic?.description ?? ""),
    glyph: String(topic?.glyph ?? ""),
    palette: topic?.palette ?? {},
    image: topic?.image ?? "",
    fallbackImage: topic?.fallbackImage ?? "",
    sortOrder: Number(topic?.sortOrder ?? 0),
    isPublished: topic?.isPublished ?? true,
    learnItemCount: Number(topic?.learnItemCount ?? learnItems.length),
    quizQuestionCount: Number(topic?.quizQuestionCount ?? quizQuestions.length),
    learnItems,
    quizQuestions
  };
}

function normalizeTopics(topics) {
  return sortBySortOrder(topics).map(normalizeTopic);
}

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  const roles = Array.isArray(user.roles) ? user.roles.map((role) => String(role).trim().toLowerCase()).filter(Boolean) : [];
  const uniqueRoles = [...new Set(roles)];
  const fullName =
    String(user.fullName ?? "").trim() ||
    `${String(user.firstName ?? "").trim()} ${String(user.lastName ?? "").trim()}`.trim();

  return {
    ...user,
    id: String(user.id ?? ""),
    firstName: String(user.firstName ?? ""),
    lastName: String(user.lastName ?? ""),
    fullName,
    email: String(user.email ?? ""),
    roles: uniqueRoles.length ? uniqueRoles : ["user"],
    isActive: user.isActive ?? true,
    isAdmin: uniqueRoles.includes("admin"),
    isTeacher: uniqueRoles.includes("teacher"),
    avatarUrl: String(user.avatarUrl ?? ""),
    registeredAt: user.registeredAt ?? null,
    lastLoginAt: user.lastLoginAt ?? null
  };
}

function normalizeTopicQuizResult(result) {
  if (!result) {
    return null;
  }

  return {
    ...result,
    id: String(result.id ?? ""),
    topicId: String(result.topicId ?? ""),
    topicTitle: String(result.topicTitle ?? ""),
    answers: result.answers ?? {},
    score: Number(result.score ?? 0),
    total: Number(result.total ?? 0),
    correctCount: Number(result.correctCount ?? 0),
    wrongCount: Number(result.wrongCount ?? 0),
    threshold: Number(result.threshold ?? quizThresholds.topic),
    passed: Boolean(result.passed),
    completedAt: result.completedAt ?? null
  };
}

function normalizeCertificateExamResult(result) {
  if (!result) {
    return null;
  }

  return {
    ...result,
    id: String(result.id ?? ""),
    attemptId: String(result.id ?? ""),
    questionIds: Array.isArray(result.questionIds) ? result.questionIds : [],
    answers: result.answers ?? {},
    score: Number(result.score ?? 0),
    total: Number(result.total ?? 0),
    correctCount: Number(result.correctCount ?? 0),
    wrongCount: Number(result.wrongCount ?? 0),
    threshold: Number(result.threshold ?? 0),
    passed: Boolean(result.passed),
    breakdown: Array.isArray(result.breakdown) ? result.breakdown : [],
    completedAt: result.completedAt ?? null,
    attemptedAt: result.completedAt ?? null
  };
}

function normalizeCertificate(certificate) {
  if (!certificate) {
    return null;
  }

  return {
    ...certificate,
    id: String(certificate.id ?? ""),
    userId: String(certificate.userId ?? ""),
    attemptId: String(certificate.attemptId ?? ""),
    serialNumber: String(certificate.serialNumber ?? ""),
    fullName: String(certificate.fullName ?? ""),
    score: Number(certificate.score ?? 0),
    total: Number(certificate.total ?? 0),
    correctCount: Number(certificate.correctCount ?? 0),
    wrongCount: Number(certificate.wrongCount ?? 0),
    issueDate: certificate.issueDate ?? null,
    achievement: certificate.achievement ?? {},
    breakdown: Array.isArray(certificate.breakdown) ? certificate.breakdown : []
  };
}

function normalizeProgress(progress) {
  const completedLearningItemsByTopic = Object.fromEntries(
    Object.entries(progress?.completedLearningItemsByTopic ?? {}).map(([topicId, itemIds]) => [
      topicId,
      [...new Set(Array.isArray(itemIds) ? itemIds.map((itemId) => String(itemId)) : [])]
    ])
  );

  return {
    reviewedTopics: [...new Set(Array.isArray(progress?.reviewedTopics) ? progress.reviewedTopics.map(String) : [])],
    completedTopics: [...new Set(Array.isArray(progress?.completedTopics) ? progress.completedTopics.map(String) : [])],
    completedLearningItemsByTopic,
    topicQuizResults: Object.fromEntries(
      Object.entries(progress?.topicQuizResults ?? {})
        .map(([topicId, result]) => [topicId, normalizeTopicQuizResult(result)])
        .filter(([, result]) => result)
    ),
    certificateExamResult: normalizeCertificateExamResult(progress?.certificateExamResult),
    generatedCertificate: normalizeCertificate(progress?.generatedCertificate),
    certificateHistory: Array.isArray(progress?.certificateHistory)
      ? progress.certificateHistory.map(normalizeCertificate).filter(Boolean)
      : []
  };
}

function normalizeRegisteredUser(user) {
  const normalized = normalizeUser(user);

  return {
    ...normalized,
    reviewedCount: Number(user?.reviewedTopicCount ?? 0),
    completedCount: Number(user?.completedTopicCount ?? 0),
    certificateCount: Number(user?.certificateCount ?? 0)
  };
}

function normalizeAdminCertificates(certificates, users) {
  const userLookup = Object.fromEntries(users.map((user) => [user.id, user]));

  return certificates.map((certificate) => {
    const owner = userLookup[certificate.userId];

    return {
      ...normalizeCertificate(certificate),
      userFullName: owner?.fullName ?? "",
      userEmail: owner?.email ?? ""
    };
  });
}

export function AppProvider({ children }) {
  const [language, setLanguageState] = useState(() => readStorage(LANGUAGE_STORAGE_KEY, "uz"));
  const [authToken, setAuthToken] = useState(() => readStorage(AUTH_STORAGE_KEY, ""));
  const [user, setUser] = useState(null);
  const [topics, setTopics] = useState([]);
  const [progressState, setProgressState] = useState(defaultProgressState);
  const [adminState, setAdminState] = useState(defaultAdminState);
  const [isAuthPending, setIsAuthPending] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);
  const [isTopicsLoading, setIsTopicsLoading] = useState(false);
  const [isAdminDataLoading, setIsAdminDataLoading] = useState(false);

  const topicLookup = Object.fromEntries(topics.map((topic) => [topic.id, topic]));
  const allCertificateQuestions = topics.flatMap((topic) => topic.quizQuestions);

  async function refreshTopics() {
    setIsTopicsLoading(true);

    try {
      const data = await apiRequest("/topics?includeDetails=true");
      const normalizedTopics = normalizeTopics(data);
      setTopics(normalizedTopics);
      return normalizedTopics;
    } finally {
      setIsTopicsLoading(false);
    }
  }

  async function refreshProgress(nextToken = authToken) {
    if (!nextToken) {
      setProgressState(defaultProgressState);
      return defaultProgressState;
    }

    const data = await apiRequest("/progress/me", { token: nextToken });
    const normalizedProgress = normalizeProgress(data);
    setProgressState(normalizedProgress);
    return normalizedProgress;
  }

  async function refreshAdminData(nextToken = authToken, nextUser = user) {
    if (!nextToken || !nextUser?.isAdmin) {
      setAdminState(defaultAdminState);
      return defaultAdminState;
    }

    setIsAdminDataLoading(true);

    try {
      const [usersPayload, certificatesPayload, adminTopicsPayload] = await Promise.all([
        apiRequest("/admin/users", { token: nextToken }),
        apiRequest("/admin/certificates", { token: nextToken }),
        apiRequest("/admin/topics", { token: nextToken })
      ]);

      const registeredUsers = usersPayload.map(normalizeRegisteredUser);
      const adminTopics = normalizeTopics(adminTopicsPayload);
      const certificateRecords = normalizeAdminCertificates(certificatesPayload.items ?? [], registeredUsers).sort(
        (left, right) => new Date(right.issueDate ?? 0).getTime() - new Date(left.issueDate ?? 0).getTime()
      );

      const nextAdminState = {
        adminTopics,
        registeredUsers,
        certificateRecords
      };

      setAdminState(nextAdminState);
      return nextAdminState;
    } finally {
      setIsAdminDataLoading(false);
    }
  }

  async function hydrateAuthenticatedState(nextToken, baseUser = null) {
    const [userPayload, progressPayload] = await Promise.all([
      baseUser ? Promise.resolve(baseUser) : apiRequest("/auth/me", { token: nextToken }),
      apiRequest("/progress/me", { token: nextToken })
    ]);

    const normalizedUser = normalizeUser(userPayload);
    const normalizedProgress = normalizeProgress(progressPayload);

    setAuthToken(nextToken);
    writeStorage(AUTH_STORAGE_KEY, nextToken);
    setUser(normalizedUser);
    setProgressState(normalizedProgress);

    if (normalizedUser?.isAdmin) {
      await refreshAdminData(nextToken, normalizedUser);
    } else {
      setAdminState(defaultAdminState);
    }

    return {
      user: normalizedUser,
      progress: normalizedProgress
    };
  }

  function clearSession() {
    setAuthToken("");
    setUser(null);
    setProgressState(defaultProgressState);
    setAdminState(defaultAdminState);
    removeStorage(AUTH_STORAGE_KEY);
  }

  useEffect(() => {
    let isCancelled = false;

    async function bootstrap() {
      try {
        await refreshTopics();

        if (authToken) {
          await hydrateAuthenticatedState(authToken);
        }
      } catch (error) {
        if (!isCancelled && authToken) {
          clearSession();
        }
      } finally {
        if (!isCancelled) {
          setIsAppReady(true);
        }
      }
    }

    void bootstrap();

    return () => {
      isCancelled = true;
    };
  }, []);

  const setLanguage = (nextLanguage) => {
    setLanguageState(nextLanguage);
    writeStorage(LANGUAGE_STORAGE_KEY, nextLanguage);
  };

  const registerUser = async (payload) => {
    setIsAuthPending(true);

    try {
      const response = await apiRequest("/auth/register", {
        method: "POST",
        body: payload
      });

      await hydrateAuthenticatedState(response.accessToken, response.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsAuthPending(false);
    }
  };

  const loginUser = async ({ email, password }) => {
    setIsAuthPending(true);

    try {
      const response = await apiRequest("/auth/login", {
        method: "POST",
        body: { email, password }
      });

      await hydrateAuthenticatedState(response.accessToken, response.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsAuthPending(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsAuthPending(true);

    try {
      const googleSession = await signInWithGooglePopup();
      const response = await apiRequest("/auth/google", {
        method: "POST",
        body: { idToken: googleSession.idToken }
      });

      await hydrateAuthenticatedState(response.accessToken, {
        ...response.user,
        avatarUrl: googleSession.photoURL ?? response.user?.avatarUrl ?? ""
      });

      return { success: true };
    } catch (error) {
      await logoutFirebaseSession().catch(() => {});

      if (error?.code === "auth/popup-closed-by-user") {
        return { success: false, error: "Google oynasi yopildi." };
      }

      if (error?.code === "auth/popup-blocked") {
        return { success: false, error: "Brauzer Google oynasini blokladi. Popupga ruxsat bering." };
      }

      return { success: false, error: error.message ?? "Google orqali kirishda xatolik yuz berdi." };
    } finally {
      setIsAuthPending(false);
    }
  };

  const logoutUser = () => {
    void logoutFirebaseSession().catch(() => {});
    clearSession();
  };

  const updateUserRoles = async (userId, roles) => {
    const result = await apiRequest(`/admin/users/${userId}/roles`, {
      method: "PATCH",
      token: authToken,
      body: { roles }
    });

    await refreshAdminData();

    if (user?.id === userId) {
      setUser(normalizeUser(result));
    }

    return result;
  };

  const updateUserStatus = async (userId, isActive) => {
    const result = await apiRequest(`/admin/users/${userId}/status`, {
      method: "PATCH",
      token: authToken,
      body: { isActive }
    });

    await refreshAdminData();

    if (user?.id === userId) {
      setUser(normalizeUser(result));
    }

    return result;
  };

  const deleteUserAccount = async (userId) => {
    await apiRequest(`/admin/users/${userId}`, {
      method: "DELETE",
      token: authToken
    });

    await refreshAdminData();
  };

  const deleteCertificateRecord = async (identifier) => {
    const target =
      adminState.certificateRecords.find((certificate) => certificate.id === identifier) ??
      adminState.certificateRecords.find((certificate) => certificate.serialNumber === identifier);

    if (!target) {
      return;
    }

    await apiRequest(`/admin/certificates/${target.id}`, {
      method: "DELETE",
      token: authToken
    });

    await Promise.all([refreshAdminData(), refreshProgress()]);
  };

  const completeLearningItem = async (topicId, learningItemId) => {
    await apiRequest("/progress/learning-items/complete", {
      method: "POST",
      token: authToken,
      body: { topicId, learningItemId }
    });

    setProgressState((previousState) => {
      const currentItemIds = new Set(previousState.completedLearningItemsByTopic[topicId] ?? []);
      currentItemIds.add(learningItemId);

      return {
        ...previousState,
        reviewedTopics: previousState.reviewedTopics.includes(topicId)
          ? previousState.reviewedTopics
          : [...previousState.reviewedTopics, topicId].sort(),
        completedLearningItemsByTopic: {
          ...previousState.completedLearningItemsByTopic,
          [topicId]: [...currentItemIds]
        }
      };
    });
  };

  const saveTopicQuizResult = async (topicId, answers) => {
    const result = normalizeTopicQuizResult(
      await apiRequest(`/progress/topic-quizzes/${topicId}/submit`, {
        method: "POST",
        token: authToken,
        body: { answers }
      })
    );

    setProgressState((previousState) => ({
      ...previousState,
      completedTopics: result.passed
        ? [...new Set([...previousState.completedTopics, topicId])].sort()
        : previousState.completedTopics,
      topicQuizResults: {
        ...previousState.topicQuizResults,
        [topicId]: result
      }
    }));

    return result;
  };

  const fetchCertificateExamQuestions = async (count = certificateExamConfig.questionCount) => {
    const query = count ? `?count=${count}` : "";
    const response = await apiRequest(`/certificates/exam/questions${query}`, { token: authToken });

    return Array.isArray(response?.questions) ? response.questions.map(normalizeQuestion) : [];
  };

  const saveCertificateExamResult = async ({ questionIds, answers }) => {
    const result = normalizeCertificateExamResult(
      await apiRequest("/certificates/exam/submit", {
        method: "POST",
        token: authToken,
        body: { questionIds, answers }
      })
    );

    setProgressState((previousState) => ({
      ...previousState,
      certificateExamResult: result,
      generatedCertificate: null
    }));

    return result;
  };

  const generateCertificate = async ({ firstName, lastName }) => {
    const attemptId = progressState.certificateExamResult?.attemptId;

    if (!attemptId) {
      return null;
    }

    const createdCertificate = normalizeCertificate(
      await apiRequest("/certificates/generate", {
        method: "POST",
        token: authToken,
        body: {
          attemptId,
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`.trim()
        }
      })
    );

    setProgressState((previousState) => ({
      ...previousState,
      generatedCertificate: createdCertificate,
      certificateHistory: [
        createdCertificate,
        ...previousState.certificateHistory.filter((item) => item.id !== createdCertificate.id)
      ]
    }));

    if (user?.isAdmin) {
      await refreshAdminData();
    }

    return createdCertificate;
  };

  async function refreshAllTopicData() {
    await Promise.all([refreshTopics(), refreshAdminData()]);
  }

  const uploadAdminImage = async (file, scope = "topics") => {
    if (!file) {
      throw new Error("Rasm fayli tanlanmadi.");
    }

    if (!authToken) {
      throw new Error("Admin sessiyasi topilmadi.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("scope", scope);

    const response = await fetch(buildApiUrl("/admin/uploads/image"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`
      },
      body: formData
    });

    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json") ? await response.json() : await response.text();

    if (!response.ok) {
      const message =
        (typeof payload === "object" && payload?.detail) ||
        (typeof payload === "string" && payload) ||
        "Rasmni yuklashda xatolik yuz berdi.";

      throw new ApiError(message, response.status, payload);
    }

    return payload;
  };

  const addTopic = async (payload) => {
    const createdTopic = normalizeTopic(
      await apiRequest("/admin/topics", {
        method: "POST",
        token: authToken,
        body: {
          id: payload.id ?? null,
          title: payload.title,
          description: payload.description ?? "",
          glyph: payload.glyph ?? null,
          image: payload.image ?? null,
          fallbackImage: payload.fallbackImage ?? null,
          palette: payload.palette ?? {},
          sortOrder: payload.sortOrder ?? null,
          isPublished: payload.isPublished ?? true
        }
      })
    );

    await refreshAllTopicData();
    return createdTopic;
  };

  const updateTopic = async (topicId, payload) => {
    const targetTopic = adminState.adminTopics.find((topic) => topic.id === topicId);

    await apiRequest(`/admin/topics/${topicId}`, {
      method: "PUT",
      token: authToken,
      body: {
        id: topicId,
        title: payload.title,
        description: payload.description ?? "",
        glyph: payload.glyph ?? null,
        image: payload.image ?? null,
        fallbackImage: payload.fallbackImage ?? targetTopic?.fallbackImage ?? null,
        palette: payload.palette ?? targetTopic?.palette ?? {},
        sortOrder: payload.sortOrder ?? targetTopic?.sortOrder ?? null,
        isPublished: payload.isPublished ?? targetTopic?.isPublished ?? true
      }
    });

    await refreshAllTopicData();
  };

  const deleteTopic = async (topicId) => {
    await apiRequest(`/admin/topics/${topicId}`, {
      method: "DELETE",
      token: authToken
    });

    await refreshAllTopicData();
  };

  const addLearningItem = async (topicId, payload) => {
    const targetTopic = adminState.adminTopics.find((topic) => topic.id === topicId);

    await apiRequest(`/admin/topics/${topicId}/learning-items`, {
      method: "POST",
      token: authToken,
      body: {
        title: payload.title,
        description: payload.description ?? "",
        quizQuestion: payload.quizQuestion ?? null,
        image: payload.image ?? null,
        fallbackImage: payload.fallbackImage ?? null,
        sortOrder: payload.sortOrder ?? targetTopic?.learnItems.length ?? null
      }
    });

    await refreshAllTopicData();
  };

  const updateLearningItem = async (topicId, itemId, payload) => {
    const targetTopic = adminState.adminTopics.find((topic) => topic.id === topicId);
    const targetItem = targetTopic?.learnItems.find((item) => item.id === itemId);

    await apiRequest(`/admin/learning-items/${itemId}`, {
      method: "PUT",
      token: authToken,
      body: {
        topicId,
        title: payload.title,
        description: payload.description ?? "",
        quizQuestion: payload.quizQuestion ?? null,
        image: payload.image ?? null,
        fallbackImage: payload.fallbackImage ?? targetItem?.fallbackImage ?? null,
        sortOrder: payload.sortOrder ?? targetItem?.sortOrder ?? null
      }
    });

    await refreshAllTopicData();
  };

  const deleteLearningItem = async (_topicId, itemId) => {
    await apiRequest(`/admin/learning-items/${itemId}`, {
      method: "DELETE",
      token: authToken
    });

    await refreshAllTopicData();
  };

  const addQuizQuestion = async (topicId, payload) => {
    const targetTopic = adminState.adminTopics.find((topic) => topic.id === topicId);

    await apiRequest(`/admin/topics/${topicId}/questions`, {
      method: "POST",
      token: authToken,
      body: {
        topicId,
        learningItemId: payload.learningItemId ?? null,
        question: payload.question,
        options: payload.options,
        correctAnswer: payload.correctAnswer,
        sortOrder: payload.sortOrder ?? targetTopic?.quizQuestions.length ?? null
      }
    });

    await refreshAllTopicData();
  };

  const updateQuizQuestion = async (topicId, questionId, payload) => {
    const targetTopic = adminState.adminTopics.find((topic) => topic.id === topicId);
    const targetQuestion = targetTopic?.quizQuestions.find((question) => question.id === questionId);

    await apiRequest(`/admin/questions/${questionId}`, {
      method: "PUT",
      token: authToken,
      body: {
        topicId,
        learningItemId: payload.learningItemId ?? targetQuestion?.learningItemId ?? null,
        question: payload.question,
        options: payload.options,
        correctAnswer: payload.correctAnswer,
        sortOrder: payload.sortOrder ?? targetQuestion?.sortOrder ?? null
      }
    });

    await refreshAllTopicData();
  };

  const deleteQuizQuestion = async (_topicId, questionId) => {
    await apiRequest(`/admin/questions/${questionId}`, {
      method: "DELETE",
      token: authToken
    });

    await refreshAllTopicData();
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        user,
        authToken,
        isAppReady,
        isAuthPending,
        isTopicsLoading,
        isAdminDataLoading,
        topics,
        adminTopics: adminState.adminTopics,
        topicLookup,
        allCertificateQuestions,
        certificateExamConfig,
        quizThresholds,
        reviewedTopics: progressState.reviewedTopics,
        completedTopics: progressState.completedTopics,
        completedLearningItemsByTopic: progressState.completedLearningItemsByTopic,
        topicQuizResults: progressState.topicQuizResults,
        certificateExamResult: progressState.certificateExamResult,
        generatedCertificate: progressState.generatedCertificate,
        certificateHistory: progressState.certificateHistory,
        registeredUsers: adminState.registeredUsers,
        certificateRecords: adminState.certificateRecords,
        registerUser,
        loginUser,
        loginWithGoogle,
        logoutUser,
        refreshTopics,
        refreshProgress,
        refreshAdminData,
        updateUserRoles,
        updateUserStatus,
        deleteUserAccount,
        deleteCertificateRecord,
        completeLearningItem,
        saveTopicQuizResult,
        fetchCertificateExamQuestions,
        saveCertificateExamResult,
        generateCertificate,
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider");
  }

  return context;
}
