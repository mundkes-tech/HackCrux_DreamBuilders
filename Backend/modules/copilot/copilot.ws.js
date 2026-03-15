import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { generateCopilotSuggestion } from "./copilot.ai.service.js";
import {
  clearSession,
  consumeTranscriptChunk,
  getOrCreateSession,
  getTalkRatio,
  updateTalkTime,
} from "./copilot.session.store.js";
import { transcribeChunk } from "./copilot.transcription.service.js";

const MAX_CHUNK_BYTES = 1024 * 1024 * 4;
const COPILOT_MODELS = {
  stt: "whisper-large-v3-turbo",
  ai: "llama-3.1-8b-instant",
};

const parseTokenFromRequest = (request) => {
  const url = new URL(request.url, "http://localhost");
  const queryToken = url.searchParams.get("token");
  if (queryToken) return queryToken;

  const authHeader = request.headers["authorization"] || request.headers["Authorization"];
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length);
  }

  return "";
};

const toJson = (payload) => JSON.stringify(payload);

const safeSend = (ws, payload) => {
  if (ws.readyState === ws.OPEN) {
    ws.send(toJson(payload));
  }
};

const normalizeSpeaker = (speaker) =>
  String(speaker || "customer").toLowerCase() === "salesperson" ? "salesperson" : "customer";

const setupHeartbeat = (ws) => {
  ws.isAlive = true;
  ws.on("pong", () => {
    ws.isAlive = true;
  });
};

export const setupCopilotWs = (httpServer) => {
  const wss = new WebSocketServer({
    server: httpServer,
    path: "/ws/copilot",
  });

  const heartbeatTimer = setInterval(() => {
    for (const ws of wss.clients) {
      if (ws.isAlive === false) {
        ws.terminate();
        continue;
      }
      ws.isAlive = false;
      ws.ping();
    }
  }, 30000);

  wss.on("close", () => clearInterval(heartbeatTimer));

  wss.on("connection", (ws, request) => {
    try {
      const token = parseTokenFromRequest(request);
      if (!token) {
        safeSend(ws, { type: "session_error", message: "Missing auth token." });
        ws.close(4001, "Unauthorized");
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
      const userId = String(decoded.userId || "");
      if (!userId) {
        safeSend(ws, { type: "session_error", message: "Invalid token payload." });
        ws.close(4001, "Unauthorized");
        return;
      }

      ws.userId = userId;
      ws.currentMeetingId = null;
      setupHeartbeat(ws);

      safeSend(ws, {
        type: "session_ready",
        message: "Copilot socket connected.",
        models: COPILOT_MODELS,
      });

      ws.on("message", async (rawMessage) => {
        let message;
        try {
          message = JSON.parse(String(rawMessage));
        } catch {
          safeSend(ws, { type: "session_error", message: "Invalid JSON payload." });
          return;
        }

        const type = String(message.type || "");

        if (type === "start_session") {
          const meetingId = String(message.meetingId || `m-${Date.now()}`);
          ws.currentMeetingId = meetingId;
          getOrCreateSession(ws.userId, meetingId);
          safeSend(ws, { type: "session_started", meetingId });
          return;
        }

        if (type === "stop_session") {
          const meetingId = ws.currentMeetingId || String(message.meetingId || "");
          if (meetingId) clearSession(ws.userId, meetingId);
          ws.currentMeetingId = null;
          safeSend(ws, { type: "session_stopped", meetingId });
          return;
        }

        if (type !== "audio_chunk") {
          safeSend(ws, { type: "session_error", message: `Unsupported message type: ${type}` });
          return;
        }

        const meetingId = ws.currentMeetingId || String(message.meetingId || "");
        if (!meetingId) {
          safeSend(ws, { type: "session_error", message: "Session not started." });
          return;
        }

        const speaker = normalizeSpeaker(message.speaker);
        const mimeType = String(message.audioMime || "audio/webm");
        const audioBase64 = String(message.audioBase64 || "");
        const durationMs = Number(message.durationMs || 2500);

        if (!audioBase64) {
          safeSend(ws, { type: "session_error", message: "Empty audio chunk." });
          return;
        }

        const audioBuffer = Buffer.from(audioBase64, "base64");
        if (!audioBuffer.length || audioBuffer.length > MAX_CHUNK_BYTES) {
          safeSend(ws, { type: "session_error", message: "Invalid audio chunk size." });
          return;
        }

        const { session } = getOrCreateSession(ws.userId, meetingId);
        updateTalkTime(session, speaker, durationMs);

        let transcriptText = "";
        try {
          transcriptText = await transcribeChunk({
            audioBuffer,
            mimeType,
          });
        } catch (error) {
          safeSend(ws, {
            type: "chunk_warning",
            meetingId,
            message: `Transcription warning: ${error.message}`,
          });
          return;
        }

        if (!transcriptText || transcriptText.length < 2) {
          safeSend(ws, {
            type: "copilot_update",
            meetingId,
            latestStatement: session.latestStatement,
            intent: session.latestIntent,
            suggestedResponse: session.latestSuggestion,
            keyPoints: session.latestKeyPoints,
            nextQuestion: session.latestNextQuestion,
            talkTime: getTalkRatio(session),
            ts: Date.now(),
          });
          return;
        }

        const completedStatements = consumeTranscriptChunk(session, speaker, transcriptText);

        if (!completedStatements.length) {
          safeSend(ws, {
            type: "copilot_update",
            meetingId,
            latestStatement: session.latestStatement,
            intent: session.latestIntent,
            suggestedResponse: session.latestSuggestion,
            keyPoints: session.latestKeyPoints,
            nextQuestion: session.latestNextQuestion,
            talkTime: getTalkRatio(session),
            speaker,
            ts: Date.now(),
          });
          return;
        }

        let intentData = session.latestIntent;
        let suggestedResponse = session.latestSuggestion;

        if (speaker === "customer") {
          const latestCustomerStatement = completedStatements[completedStatements.length - 1];
          try {
            const suggestion = await generateCopilotSuggestion({
              latestCustomerStatement,
              transcriptHistory: session.transcriptHistory,
            });
            const normalizedStatement = String(
              suggestion.normalizedStatementEnglish || latestCustomerStatement
            ).trim();
            intentData = {
              label: suggestion.intent,
              confidence: suggestion.confidence,
              reason: suggestion.reason,
              style: suggestion.responseStyle,
              nextQuestion: suggestion.nextQuestion,
            };
            suggestedResponse = suggestion.suggestedResponse;
            session.latestStatement = normalizedStatement;
            session.latestIntent = intentData;
            session.latestSuggestion = suggestedResponse;
            session.latestKeyPoints = suggestion.keyPoints || [];
            session.latestNextQuestion = suggestion.nextQuestion || "";
          } catch (error) {
            safeSend(ws, {
              type: "chunk_warning",
              meetingId,
              message: `Suggestion warning: ${error.message}`,
            });
          }
        }

        safeSend(ws, {
          type: "copilot_update",
          meetingId,
          latestStatement: session.latestStatement,
          intent: intentData,
          suggestedResponse,
          keyPoints: session.latestKeyPoints,
          nextQuestion: session.latestNextQuestion,
          talkTime: getTalkRatio(session),
          speaker,
          ts: Date.now(),
        });
      });

      ws.on("close", () => {
        if (ws.currentMeetingId) {
          clearSession(ws.userId, ws.currentMeetingId);
        }
      });
    } catch (error) {
      safeSend(ws, { type: "session_error", message: `Socket setup failed: ${error.message}` });
      ws.close(1011, "Socket initialization failed");
    }
  });

  return wss;
};
