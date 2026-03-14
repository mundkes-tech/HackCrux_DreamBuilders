const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const demoCalls = [
  {
    callId: "call-101",
    callTitle: "Enterprise Suite Procurement Review",
    callType: "sales",
    productName: "Enterprise Suite",
    summary: "Procurement team liked reporting depth but requested clearer onboarding and pricing clarity.",
    sentiment: "positive",
    dealProbability: 82,
    createdAt: "2026-03-12T09:30:00.000Z",
    urgencyLevel: "medium",
    aiInsights: {
      objections: ["Onboarding speed", "Pricing clarity"],
      buyingSignals: ["Asked for rollout timeline", "Requested commercial proposal"],
      improvementsNeeded: ["Stronger ROI framing"],
      followUpRecommendation: "Send procurement-ready pricing and rollout milestones.",
    },
  },
  {
    callId: "call-102",
    callTitle: "Growth Plan Pilot Discussion",
    callType: "sales",
    productName: "Growth Plan",
    summary: "Champion is positive, but finance wants a smaller pilot and measurable outcomes.",
    sentiment: "neutral",
    dealProbability: 58,
    createdAt: "2026-03-11T14:15:00.000Z",
    urgencyLevel: "medium",
    aiInsights: {
      objections: ["Pilot risk", "Budget caution"],
      buyingSignals: ["Open to pilot pathway"],
      improvementsNeeded: ["Define pilot success criteria"],
      followUpRecommendation: "Send a narrow pilot proposal with KPI targets.",
    },
  },
  {
    callId: "call-103",
    callTitle: "AI Coaching Add-on Evaluation",
    callType: "upsell",
    productName: "AI Coaching Add-on",
    summary: "Buyer engaged strongly and requested technical walkthrough for operations leadership.",
    sentiment: "positive",
    dealProbability: 76,
    createdAt: "2026-03-10T12:05:00.000Z",
    urgencyLevel: "high",
    aiInsights: {
      objections: [],
      buyingSignals: ["Requested next-step demo", "Operations stakeholder interest"],
      improvementsNeeded: [],
      followUpRecommendation: "Book joint technical session and share case study.",
    },
  },
  {
    callId: "call-104",
    callTitle: "Team Analytics Migration Review",
    callType: "sales",
    productName: "Team Analytics",
    summary: "Prospect compared alternatives and raised migration effort concerns.",
    sentiment: "negative",
    dealProbability: 34,
    createdAt: "2026-03-09T16:45:00.000Z",
    urgencyLevel: "high",
    aiInsights: {
      objections: ["Migration effort", "Internal bandwidth"],
      buyingSignals: [],
      improvementsNeeded: ["Implementation confidence"],
      followUpRecommendation: "Provide phased migration plan with low-risk milestone options.",
    },
  },
];

const demoCompetitorInsights = {
  competitorsFrequency: [
    { name: "Clariq", count: 24 },
    { name: "SalesForge", count: 18 },
    { name: "RevPilot", count: 14 },
    { name: "InsightLoop", count: 11 },
  ],
  topAdvantages: [
    { advantage: "Lower implementation cost", count: 19 },
    { advantage: "Faster CRM integration", count: 16 },
    { advantage: "More flexible pricing", count: 9 },
  ],
};

const tryFetchJson = async (path) => {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error("Request failed");
  }
  return response.json();
};

const normalizeCalls = (calls) => {
  return (calls || []).map((call) => {
    const insights = call.aiInsights || {};
    return {
      ...call,
      callId: call.callId || call._id,
      callTitle: call.callTitle || call.call_title || insights.callTitle || "Sales Call",
      callType: call.callType || call.call_type || insights.callType || "other",
      productName: call.productName || call.product_name || insights.productName || "Product",
      summary: call.summary || insights.summary || "No summary available.",
      sentiment: (call.sentiment || insights.sentiment || "neutral").toLowerCase(),
      dealProbability: call.dealProbability ?? insights.dealProbability ?? 0,
      createdAt: call.createdAt || call.created_at,
      aiInsights: {
        ...insights,
        objections: insights.objections || [],
        buyingSignals: insights.buyingSignals || [],
        improvementsNeeded: insights.improvementsNeeded || [],
      },
    };
  });
};

export const dashboardApi = {
  getCalls: async () => {
    try {
      const data = await tryFetchJson("/dashboard/calls");
      return { calls: normalizeCalls(data.calls || data.data || []) };
    } catch {
      return { calls: normalizeCalls(demoCalls) };
    }
  },

  getCompetitors: async () => {
    try {
      const data = await tryFetchJson("/dashboard/competitors");
      return {
        competitorInsights:
          data.competitorInsights || data.data || demoCompetitorInsights,
      };
    } catch {
      return { competitorInsights: demoCompetitorInsights };
    }
  },
};
