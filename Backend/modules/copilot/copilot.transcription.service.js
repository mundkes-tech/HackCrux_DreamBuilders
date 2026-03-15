import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  timeout: 60 * 1000,
});

export const transcribeChunk = async ({ audioBuffer, mimeType = "audio/webm" }) => {
  if (!audioBuffer || audioBuffer.length < 1200) {
    throw new Error("audio chunk too short");
  }

  const extension =
    mimeType.includes("wav")
      ? "wav"
      : mimeType.includes("ogg")
      ? "ogg"
      : mimeType.includes("mp4") || mimeType.includes("m4a")
      ? "m4a"
      : "webm";

  const file = new File([audioBuffer], `chunk-${Date.now()}.${extension}`, {
    type: mimeType,
  });

  const result = await groq.audio.transcriptions.create({
    file,
    model: "whisper-large-v3-turbo",
  });

  return String(result?.text || "").trim();
};
