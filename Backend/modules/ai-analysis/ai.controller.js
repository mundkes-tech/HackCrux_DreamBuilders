import CallModel from "../audio/audio.model.js";
import { analyzeConversation } from "./ai.service.js";

export const analyzeCall = async (req, res) => {
  try {
    const { callId } = req.params;

    // Find the call record
    const call = await CallModel.findById(callId);

    if (!call) {
      return res.status(404).json({
        message: "Call not found",
        callId,
      });
    }

    // Check if transcript exists
    if (!call.transcript) {
      return res.status(400).json({
        message: "Transcript not available. Please transcribe the audio first.",
        callId,
      });
    }

    // Analyze conversation using AI
    const aiInsights = await analyzeConversation(call.transcript);

    // Update call record with AI insights and status
    await CallModel.updateOne(callId, {
      aiInsights,
      status: "analyzed",
      product_name: aiInsights.productName || "Unknown",
      call_title: aiInsights.callTitle || "Untitled Call",
      call_type: aiInsights.callType || "other",
      customer_name: aiInsights.customer?.name || "Unknown",
      customer_email: aiInsights.customer?.email || "",
      customer_phone: aiInsights.customer?.phone || "",
      email_subject: aiInsights.emailDraft?.subject || "Follow-up on our call",
      salesperson_rating: aiInsights.salespersonPerformance?.rating || 5,
      salesperson_tone: aiInsights.salespersonTone?.overall || "neutral",
      customer_engagement: aiInsights.conversationAnalysis?.customerEngagementScore || 5,
      urgency_level: aiInsights.conversationAnalysis?.urgencyLevel || "medium",
    });

    res.status(200).json({
      message: "AI analysis completed successfully",
      callId,
      insights: aiInsights,
    });
  } catch (error) {
    console.error("AI analysis error:", error);
    res.status(500).json({
      error: error.message,
      message: "AI analysis failed",
    });
  }
};

export const getInsights = async (req, res) => {
  try {
    const { callId } = req.params;

    const call = await CallModel.findById(callId);

    if (!call) {
      return res.status(404).json({
        message: "Call not found",
        callId,
      });
    }

    if (!call.aiInsights) {
      return res.status(404).json({
        message: "AI insights not found. Please analyze the call first.",
        callId,
      });
    }

    res.status(200).json({
      callId,
      insights: call.aiInsights,
      transcript: call.transcript,
      createdAt: call.createdAt,
    });
  } catch (error) {
    console.error("Error retrieving insights:", error);
    res.status(500).json({
      error: error.message,
      message: "Failed to retrieve insights",
    });
  }
};
