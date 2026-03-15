import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import {
  Bot,
  CircleStop,
  MessageSquareText,
  Mic,
  Minimize2,
  Monitor,
  Radio,
  Sparkles,
  X,
} from "lucide-react";

const getWsUrl = (token) => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  const backendBase = apiBase.replace(/\/api\/?$/, "");
  const wsBase = backendBase.replace(/^http/, "ws");
  return `${wsBase}/ws/copilot?token=${encodeURIComponent(token || "")}`;
};

const toBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = String(reader.result || "");
      const base64 = result.split(",")[1] || "";
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const labelForIntent = (intent) => {
  const map = {
    pricing_objection: "Pricing Objection",
    competitor_comparison: "Competitor Comparison",
    feature_inquiry: "Feature Inquiry",
    implementation_concern: "Implementation Concern",
    timeline_risk: "Timeline Risk",
    budget_constraint: "Budget Constraint",
    other: "General Concern",
  };
  return map[intent] || "General Concern";
};

const panelClass =
  "w-[min(96vw,380px)] flex flex-col max-h-[calc(100vh-2.5rem)] rounded-2xl border border-white/10 bg-[#121527]/95 p-4 text-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const qualityMeta = (score) => {
  if (score >= 75) return { label: "Good", className: "text-emerald-300", bar: "bg-emerald-400" };
  if (score >= 45) return { label: "Fair", className: "text-amber-300", bar: "bg-amber-400" };
  return { label: "Poor", className: "text-rose-300", bar: "bg-rose-400" };
};

const CopilotFloatingPanel = forwardRef(function CopilotFloatingPanel({ token }, ref) {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [latestStatement, setLatestStatement] = useState("");
  const [intent, setIntent] = useState({ label: "other", confidence: 0 });
  const [suggestedResponse, setSuggestedResponse] = useState("");
  const [keyPoints, setKeyPoints] = useState([]);
  const [nextQuestion, setNextQuestion] = useState("");
  const [talkTime, setTalkTime] = useState({ customerPct: 50, salespersonPct: 50 });
  const [qualityScore, setQualityScore] = useState(78);
  const [warningCount, setWarningCount] = useState(0);
  const [modelInfo, setModelInfo] = useState({ stt: "", ai: "" });
  const [captureMode, setCaptureMode] = useState("mic");

  const wsRef = useRef(null);
  const recorderRef = useRef(null);
  const recorderLoopStopRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const levelTimerRef = useRef(null);
  const levelSamplesRef = useRef([]);
  const chunkSeqRef = useRef(0);
  const meetingIdRef = useRef("live-session");
  const lastStatementRef = useRef("");

  const wsUrl = useMemo(() => getWsUrl(token), [token]);

  const cleanupMedia = useCallback(() => {
    if (recorderLoopStopRef.current) {
      recorderLoopStopRef.current();
      recorderLoopStopRef.current = null;
    }

    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    recorderRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (levelTimerRef.current) {
      clearInterval(levelTimerRef.current);
      levelTimerRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    levelSamplesRef.current = [];
  }, []);

  const cleanupSocket = useCallback(() => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "stop_session",
          meetingId: meetingIdRef.current,
        })
      );
      ws.close();
    }
    wsRef.current = null;
  }, []);

  const stopCopilot = useCallback(() => {
    setRunning(false);
    setStatus("idle");
    cleanupMedia();
    cleanupSocket();
  }, [cleanupMedia, cleanupSocket]);

  useEffect(() => () => stopCopilot(), [stopCopilot]);

  const startCopilot = useCallback(async () => {
    try {
      setError("");
      setNote("");
      setWarningCount(0);
      setQualityScore(78);

      if (running) {
        setOpen(true);
        return;
      }

      if (!token) {
        setError("Missing auth token. Please log in again.");
        return;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Microphone capture is not supported in this browser.");
        return;
      }

      const isCallMode = captureMode === "call";
      let stream;

      if (isCallMode) {
        if (!navigator.mediaDevices?.getDisplayMedia) {
          setError("Tab audio capture is not supported in this browser. Please use Chrome or Edge.");
          return;
        }
        setNote("A browser dialog will open — select your Google Meet / Zoom tab and tick 'Share tab audio'.");
        let displayStream;
        try {
          displayStream = await navigator.mediaDevices.getDisplayMedia({
            audio: true,
            video: { width: 1, height: 1, frameRate: 1 },
          });
        } catch (e) {
          if (e.name === "NotAllowedError") {
            setError("Screen sharing was cancelled. Please try again and select your call tab.");
          } else {
            setError(e.message || "Could not capture tab audio.");
          }
          return;
        }
        // IMPORTANT: Do NOT stop video tracks here.
        // Chrome ties the getDisplayMedia session to the video track being alive.
        // Stopping it immediately kills the audio track too, producing zero audio.
        const audioTracks = displayStream.getAudioTracks();
        if (!audioTracks.length) {
          setError("No audio captured. When sharing, make sure to tick 'Share tab audio' in the browser dialog.");
          displayStream.getTracks().forEach((t) => t.stop());
          return;
        }
        // Auto-stop copilot if the user ends screen sharing from the browser toolbar
        audioTracks[0].addEventListener("ended", () => {
          setNote("Tab sharing was stopped. Copilot paused.");
          stopCopilot();
        });
        // Keep full displayStream alive (video track must stay active to sustain the session).
        // Only feed audio tracks to the recorder via a new MediaStream.
        streamRef.current = displayStream;
        stream = new MediaStream(audioTracks);
        setNote("Call tab audio active. Copilot is now listening to your Google Meet / Zoom session.");
      } else {
        if (navigator.permissions?.query) {
          try {
            const permission = await navigator.permissions.query({ name: "microphone" });
            if (permission.state === "denied") {
              setError("Microphone access is blocked. Please enable microphone permission in your browser settings.");
              return;
            }
            if (permission.state === "prompt") {
              setNote("Please allow microphone access in the browser permission popup.");
            }
          } catch {
            // Ignore permission API errors and continue with getUserMedia prompt.
          }
        }
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
          },
        });
        streamRef.current = stream;
        setNote("Microphone mode active. Place mic close to the customer.");
      }

      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.45;
        source.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        levelSamplesRef.current = [];

        const sampleBuffer = new Uint8Array(analyser.fftSize);
        levelTimerRef.current = setInterval(() => {
          const node = analyserRef.current;
          if (!node) return;
          node.getByteTimeDomainData(sampleBuffer);

          let sumSq = 0;
          for (let i = 0; i < sampleBuffer.length; i += 1) {
            const centered = (sampleBuffer[i] - 128) / 128;
            sumSq += centered * centered;
          }

          const rms = Math.sqrt(sumSq / sampleBuffer.length);
          const store = levelSamplesRef.current;
          store.push(rms);
          if (store.length > 45) store.shift();
        }, 50);
      } catch {
        setNote("Microphone stream started. Voice quality meter is in fallback mode.");
      }

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus("connected");
        meetingIdRef.current = `live-${Date.now()}`;
        ws.send(
          JSON.stringify({
            type: "start_session",
            meetingId: meetingIdRef.current,
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "session_ready") {
            if (payload.models) {
              setModelInfo({
                stt: payload.models.stt || "",
                ai: payload.models.ai || "",
              });
            }
            return;
          }

          if (payload.type === "chunk_warning") {
            setWarningCount((current) => current + 1);
            setQualityScore((current) => clamp(current - 12, 8, 100));
            setNote("Low audio quality detected for one chunk. Move closer to the speaker and reduce background noise.");
            return;
          }

          if (payload.type === "session_error") {
            setError(payload.message || "Copilot session error.");
            return;
          }

          if (payload.type === "copilot_update") {
            if (payload.latestStatement) {
              setLatestStatement(payload.latestStatement);
              if (payload.latestStatement !== lastStatementRef.current) {
                setQualityScore((current) => clamp(current + 4, 8, 100));
                lastStatementRef.current = payload.latestStatement;
              }
            }
            if (payload.intent) setIntent(payload.intent);
            if (payload.suggestedResponse) setSuggestedResponse(payload.suggestedResponse);
            if (Array.isArray(payload.keyPoints) && payload.keyPoints.length) setKeyPoints(payload.keyPoints);
            if (payload.nextQuestion) setNextQuestion(payload.nextQuestion);
            if (payload.talkTime) setTalkTime(payload.talkTime);
          }
        } catch {
          setError("Invalid realtime payload received.");
        }
      };

      ws.onerror = () => {
        setError("Realtime connection failed.");
      };

      ws.onclose = () => {
        setStatus("disconnected");
      };

      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/webm";
      }

      chunkSeqRef.current = 0;

      let keepRecording = true;
      const CHUNK_MS = 1500;

      const runRecorderCycle = () => {
        if (!keepRecording) return;

        const recorder = new MediaRecorder(stream, { mimeType });
        recorderRef.current = recorder;

        recorder.ondataavailable = async (event) => {
          // Call tab audio is already pre-processed by Google Meet / Zoom — lower byte floor.
          const minBytes = isCallMode ? 500 : 1200;
          if (!event.data || event.data.size < minBytes) return;
          const socket = wsRef.current;
          if (!socket || socket.readyState !== WebSocket.OPEN) return;

          // RMS gate: only apply for raw mic input.
          // Call tab audio has near-zero RMS after Meet's own DSP — gate would reject everything.
          if (!isCallMode) {
            const samples = levelSamplesRef.current.slice();
            levelSamplesRef.current = [];
            if (samples.length > 8) {
              const sorted = [...samples].sort((a, b) => a - b);
              const floor = sorted[Math.floor(sorted.length * 0.2)] || 0.004;
              const avg = samples.reduce((sum, value) => sum + value, 0) / samples.length;
              const peak = sorted[sorted.length - 1] || avg;
              const hasSpeech = avg > floor + 0.012 && peak > floor + 0.02;
              if (!hasSpeech) return;
            }
          } else {
            levelSamplesRef.current = [];
          }

          try {
            const audioBase64 = await toBase64(event.data);
            socket.send(
              JSON.stringify({
                type: "audio_chunk",
                meetingId: meetingIdRef.current,
                chunkSeq: ++chunkSeqRef.current,
                speaker: "customer",
                durationMs: CHUNK_MS,
                audioMime: event.data.type || mimeType,
                audioBase64,
                clientTs: Date.now(),
              })
            );
          } catch {
            setError("Failed to process microphone audio chunk.");
          }
        };

        recorder.onstop = () => {
          if (keepRecording) runRecorderCycle();
        };

        recorder.start();
        setTimeout(() => {
          if (recorder.state !== "inactive") {
            recorder.stop();
          }
        }, CHUNK_MS);
      };

      recorderLoopStopRef.current = () => {
        keepRecording = false;
        if (recorderRef.current && recorderRef.current.state !== "inactive") {
          recorderRef.current.stop();
        }
      };

      runRecorderCycle();
      setRunning(true);
      setOpen(true);
    } catch (e) {
      setError(e.message || "Could not start Copilot.");
      stopCopilot();
    }
  }, [captureMode, running, stopCopilot, token, wsUrl]);

  useImperativeHandle(ref, () => ({
    openPanel: () => setOpen(true),
    openAndStart: () => {
      setOpen(true);
      startCopilot();
    },
    stop: stopCopilot,
  }), [startCopilot, stopCopilot]);

  const quality = qualityMeta(qualityScore);

  return (
    <div className="fixed bottom-4 right-4 z-[400]">
      {!open ? (
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-indigo-400/35 bg-indigo-600/90 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(99,102,241,0.45)] transition hover:bg-indigo-500"
          onClick={() => setOpen(true)}
        >
          <Bot size={16} />
          {running ? "Open Copilot" : "Start Copilot"}
        </button>
      ) : (
        <div className={panelClass}>
          {/* ── Pinned header — never scrolls ── */}
          <div className="mb-2 flex shrink-0 items-center justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-1.5 text-sm font-bold text-white">
                <Sparkles size={14} className="text-indigo-300" />
                Live Sales Copilot
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                {status === "connected" && running ? "Listening and advising in real time" : "Ready to start"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-slate-200"
                onClick={() => setOpen(false)}
                aria-label="Minimize"
              >
                <Minimize2 size={15} />
              </button>
              <button
                type="button"
                className="rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-slate-200"
                onClick={() => {
                  stopCopilot();
                  setOpen(false);
                }}
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* ── Scrollable body ── */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {!running && (
              <div className="mb-2">
                <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-500">Audio Source</p>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCaptureMode("mic")}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-1.5 text-xs font-medium transition ${
                      captureMode === "mic"
                        ? "border-indigo-400/60 bg-indigo-500/20 text-white"
                        : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                    }`}
                  >
                    <Mic size={12} /> Microphone
                  </button>
                  <button
                    type="button"
                    onClick={() => setCaptureMode("call")}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-1.5 text-xs font-medium transition ${
                      captureMode === "call"
                        ? "border-cyan-400/60 bg-cyan-500/15 text-white"
                        : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                    }`}
                  >
                    <Monitor size={12} /> Call Tab
                  </button>
                </div>
              </div>
            )}

            <div className="mb-2 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs">
              <span className="inline-flex items-center gap-1.5 text-slate-300">
                <Radio size={12} className={running ? "text-emerald-400" : "text-slate-500"} />
                {running ? "Copilot Running" : "Copilot Stopped"}
              </span>
              {!running ? (
                <button
                  type="button"
                  className="rounded-md bg-indigo-500 px-2.5 py-1 font-semibold text-white hover:bg-indigo-400"
                  onClick={startCopilot}
                >
                  Start
                </button>
              ) : (
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-2.5 py-1 font-semibold text-white hover:bg-rose-500"
                  onClick={stopCopilot}
                >
                  <CircleStop size={12} /> Stop
                </button>
              )}
            </div>

            <div className="mb-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-200">
              {captureMode === "call"
                ? running
                  ? "Listening to call tab audio (Google Meet / Zoom). Both voices captured."
                  : "Call Tab mode: select your Meet / Zoom tab and tick 'Share tab audio'."
                : "Microphone mode: listens via your mic. Best for in-person or phone calls."}
            </div>

            <div className="mb-2 rounded-xl border border-white/10 bg-[#0f1222] p-2.5">
              <p className="mb-1.5 text-[11px] uppercase tracking-wide text-slate-500">Transcription Quality</p>
              <div className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className={`h-full ${quality.bar}`} style={{ width: `${qualityScore}%` }} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className={quality.className}>{quality.label} ({qualityScore}%)</span>
                <span className="text-slate-400">Warnings: {warningCount}</span>
              </div>
              {(modelInfo.stt || modelInfo.ai) ? (
                <p className="mt-1.5 text-[10px] text-slate-500">
                  {modelInfo.stt ? `STT: ${modelInfo.stt}` : ""}
                  {modelInfo.stt && modelInfo.ai ? " · " : ""}
                  {modelInfo.ai ? `AI: ${modelInfo.ai}` : ""}
                </p>
              ) : null}
            </div>

            {error ? (
              <div className="mb-2 rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-300">
                {error}
              </div>
            ) : null}

            {note ? (
              <div className="mb-2 rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs text-indigo-200">
                {note}
              </div>
            ) : null}

            <div className="space-y-2">
              <div className="rounded-xl border border-white/10 bg-[#0f1222] p-2.5">
                <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-500">Latest Customer Statement</p>
                <p className="text-sm text-slate-200">{latestStatement || "Waiting for customer statement..."}</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#0f1222] p-2.5">
                <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-500">Detected Intent</p>
                <p className="text-sm font-semibold text-amber-300">
                  {labelForIntent(intent?.label)}
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    ({Math.round((Number(intent?.confidence || 0) || 0) * 100)}%)
                  </span>
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#0f1222] p-2.5">
                <p className="mb-1 inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-slate-500">
                  <MessageSquareText size={12} /> Suggested Response
                </p>
                <p className="text-sm text-slate-200">
                  {suggestedResponse || "Copilot suggestion will appear here."}
                </p>
                {keyPoints.length > 0 && (
                  <ul className="mt-2 space-y-1 border-t border-white/10 pt-2">
                    {keyPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-300">
                        <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                        {point}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {nextQuestion ? (
                <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-2.5">
                  <p className="mb-1 text-[11px] uppercase tracking-wide text-violet-400">Smart Follow-up Question</p>
                  <p className="text-sm italic text-violet-200">&ldquo;{nextQuestion}&rdquo;</p>
                </div>
              ) : null}

              <div className="rounded-xl border border-white/10 bg-[#0f1222] p-2.5">
                <p className="mb-1.5 text-[11px] uppercase tracking-wide text-slate-500">Talk-Time Ratio</p>
                <div className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-cyan-400" style={{ width: `${talkTime.customerPct || 50}%` }} />
                </div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Customer: {talkTime.customerPct || 50}%</span>
                  <span>Salesperson: {talkTime.salespersonPct || 50}%</span>
                </div>
              </div>
            </div>

            <p className="mt-2 text-[10px] text-slate-500">
              Talk-time ratio is estimated in MVP mode until full speaker diarization is added.
            </p>
          </div>{/* end scrollable body */}
        </div>
      )}

      {!open && !running ? null : (
        <button
          type="button"
          className="sr-only"
          onClick={() => setOpen((v) => !v)}
        >
          toggle
        </button>
      )}
    </div>
  );
});

export default CopilotFloatingPanel;
