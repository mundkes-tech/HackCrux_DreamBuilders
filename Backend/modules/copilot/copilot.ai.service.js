import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  timeout: 45 * 1000,
});

const SYSTEM_PROMPT = `You are an expert live AI Sales Copilot helping a salesperson respond to customer questions in real time.

Analyze the latest customer statement and return ONLY valid JSON matching this exact schema:
{
  "normalizedStatementEnglish": "customer statement rewritten in clear, grammatically correct English",
  "intent": "pricing_objection|competitor_comparison|feature_inquiry|implementation_concern|timeline_risk|budget_constraint|other",
  "confidence": 0.0,
  "reason": "one sentence explaining why this intent was chosen",
  "suggestedResponse": "A warm, detailed 3-5 sentence response the salesperson should say aloud right now. Be SPECIFIC — if the customer asks about a product (e.g. Hyundai Creta, iPhone 15, AWS pricing), include actual relevant facts, features, price ranges, and benefits. Do NOT give vague filler like 'I will share details'. Give the real answer.",
  "keyPoints": [
    "Specific fact or selling point the salesperson can mention (max 12 words each)",
    "Another concrete detail, spec, feature or benefit",
    "A third relevant point to address the customer concern"
  ],
  "responseStyle": "consultative|reassuring|assertive|technical",
  "nextQuestion": "One sharp follow-up question to deepen the conversation and uncover more needs"
}

Rules:
- suggestedResponse must be 60-120 words. Never give a one-liner. Include specific product details, numbers, and benefits.
- keyPoints must have exactly 3 items — concrete, specific, no filler phrases.
- nextQuestion must be open-ended and relevant to what the customer just said.
- Always return all fields in English, even when input is in another language.
- If customer asks about any specific product, car, phone, software, service — answer with real known facts about it.
- If unclear, set intent=other and confidence below 0.6.
- Output strict valid JSON only. No markdown, no explanation.`;

const fallbackResult = {
  normalizedStatementEnglish: "The customer shared a general concern.",
  intent: "other",
  confidence: 0.5,
  reason: "Low-confidence classification.",
  suggestedResponse:
    "Thank you for that question — I want to make sure I give you the most accurate and helpful answer. Let me walk you through the key details. Our solution is built to address exactly this kind of need, and I can share specific pricing, features, and comparisons that are most relevant to your situation. What matters most to you right now: features, pricing, or timelines?",
  keyPoints: [
    "Comprehensive feature set tailored to your use case",
    "Competitive pricing with flexible plans available",
    "Proven track record with similar customers",
  ],
  responseStyle: "consultative",
  nextQuestion: "Which outcome matters most to you right now?",
};

export const generateCopilotSuggestion = async ({ latestCustomerStatement, transcriptHistory }) => {
  if (!latestCustomerStatement) return fallbackResult;

  const recent = (transcriptHistory || [])
    .slice(-8)
    .map((row) => `${row.speaker}: ${row.text}`)
    .join("\n");

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.35,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: JSON.stringify({
          accountContext: {
            product: "SalesIQ",
            purpose: "AI sales conversation intelligence",
          },
          conversationContext: {
            latestCustomerStatement,
            recentTranscript: recent,
          },
        }),
      },
    ],
  });

  const raw = completion?.choices?.[0]?.message?.content || "{}";
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = fallbackResult;
  }

  const rawPoints = parsed.keyPoints;
  const keyPoints = Array.isArray(rawPoints) && rawPoints.length
    ? rawPoints.slice(0, 4).map((p) => String(p))
    : fallbackResult.keyPoints;

  return {
    normalizedStatementEnglish: String(
      parsed.normalizedStatementEnglish || latestCustomerStatement || fallbackResult.normalizedStatementEnglish
    ),
    intent: String(parsed.intent || fallbackResult.intent),
    confidence: Math.max(0, Math.min(1, Number(parsed.confidence ?? fallbackResult.confidence) || fallbackResult.confidence)),
    reason: String(parsed.reason || fallbackResult.reason),
    suggestedResponse: String(parsed.suggestedResponse || fallbackResult.suggestedResponse),
    keyPoints,
    responseStyle: String(parsed.responseStyle || fallbackResult.responseStyle),
    nextQuestion: String(parsed.nextQuestion || fallbackResult.nextQuestion),
  };
};
