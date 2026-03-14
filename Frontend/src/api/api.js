const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const tryFetchJson = async (path, token = null) => {
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${path}`, { headers });
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
  getCalls: async (token = null) => {
    try {
      const data = await tryFetchJson("/dashboard/calls", token);
      return { calls: normalizeCalls(data.calls || data.data || []) };
    } catch {
      return { calls: [] };
    }
  },

  getCallDetails: async (callId, token = null) => {
    try {
      const data = await tryFetchJson(`/dashboard/call/${callId}`, token);
      return { call: data.call || data.data };
    } catch {
      return { call: null };
    }
  },

  getCompetitors: async (token = null) => {
    try {
      const data = await tryFetchJson("/dashboard/competitors", token);
      return {
        competitorInsights:
          data.competitorInsights || data.data || { competitorsFrequency: [], topAdvantages: [] },
      };
    } catch {
      return { competitorInsights: { competitorsFrequency: [], topAdvantages: [] } };
    }
  },

  getAnalytics: async (token = null) => {
    try {
      const data = await tryFetchJson("/dashboard/analytics", token);
      return { analytics: data.analytics || data.data };
    } catch {
      return { analytics: null };
    }
  },
};
