const sessions = new Map();

const defaultSession = (userId, meetingId) => ({
  userId,
  meetingId,
  customerMs: 0,
  salespersonMs: 0,
  pendingBySpeaker: {
    customer: "",
    salesperson: "",
  },
  latestStatement: "",
  latestIntent: { label: "other", confidence: 0 },
  latestSuggestion: "",
  latestKeyPoints: [],
  latestNextQuestion: "",
  transcriptHistory: [],
  updatedAt: Date.now(),
});

export const getOrCreateSession = (userId, meetingId) => {
  const key = `${userId}:${meetingId}`;
  const current = sessions.get(key);
  if (current) {
    current.updatedAt = Date.now();
    return { key, session: current };
  }

  const created = defaultSession(userId, meetingId);
  sessions.set(key, created);
  return { key, session: created };
};

export const clearSession = (userId, meetingId) => {
  sessions.delete(`${userId}:${meetingId}`);
};

export const updateTalkTime = (session, speaker, durationMs) => {
  const safeMs = Math.max(0, Number(durationMs) || 0);
  if (!safeMs) return;

  if (speaker === "salesperson") {
    session.salespersonMs += safeMs;
  } else {
    session.customerMs += safeMs;
  }
  session.updatedAt = Date.now();
};

export const getTalkRatio = (session) => {
  const total = session.customerMs + session.salespersonMs;
  if (!total) {
    return { customerPct: 50, salespersonPct: 50 };
  }

  const customerPct = Math.round((session.customerMs / total) * 100);
  return {
    customerPct,
    salespersonPct: Math.max(0, 100 - customerPct),
  };
};

export const pushTranscript = (session, speaker, text) => {
  const clean = String(text || "").trim();
  if (!clean) return;

  session.transcriptHistory.push({ speaker, text: clean, ts: Date.now() });
  if (session.transcriptHistory.length > 12) {
    session.transcriptHistory = session.transcriptHistory.slice(-12);
  }
  if (speaker === "customer") {
    session.latestStatement = clean;
  }
  session.updatedAt = Date.now();
};

const extractCompletedSentences = (text) => {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  if (!normalized) {
    return { sentences: [], remainder: "" };
  }

  const regex = /[^.!?]+[.!?]+["')\]]*/g;
  const sentences = [];
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(normalized)) !== null) {
    sentences.push(match[0].trim());
    lastIndex = regex.lastIndex;
  }

  let remainder = normalized.slice(lastIndex).trim();

  // Fallback flush for very long unpunctuated text.
  if (!sentences.length && normalized.length >= 180) {
    return { sentences: [normalized], remainder: "" };
  }

  return { sentences, remainder };
};

export const consumeTranscriptChunk = (session, speaker, text) => {
  const clean = String(text || "").trim();
  if (!clean) return [];

  const existing = session.pendingBySpeaker[speaker] || "";
  const combined = [existing, clean].filter(Boolean).join(" ").trim();
  const { sentences, remainder } = extractCompletedSentences(combined);

  session.pendingBySpeaker[speaker] = remainder;
  sentences.forEach((sentence) => pushTranscript(session, speaker, sentence));
  session.updatedAt = Date.now();

  return sentences;
};
