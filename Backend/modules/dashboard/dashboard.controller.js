import {
  getAllCalls,
  getCallDetails,
  getAnalytics,
  filterCalls,
  getCallsByProduct,
  getCompetitorAnalysis,
  buildCallReport,
  updateCallMetadata,
} from "./dashboard.service.js";

export const getCalls = async (req, res) => {
  try {
    const calls = await getAllCalls();

    res.status(200).json({
      success: true,
      totalCalls: calls.length,
      calls,
    });
  } catch (error) {
    console.error("Error fetching calls:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getCallDetailsHandler = async (req, res) => {
  try {
    const { callId } = req.params;

    const call = await getCallDetails(callId);

    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call not found",
        callId,
      });
    }

    res.status(200).json({
      success: true,
      call,
    });
  } catch (error) {
    console.error("Error fetching call details:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getAnalyticsHandler = async (req, res) => {
  try {
    const analytics = await getAnalytics();

    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Error generating analytics:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const filterCallsHandler = async (req, res) => {
  try {
    const { product_name, sentiment, call_type } = req.query;

    if (!product_name && !sentiment && !call_type) {
      return res.status(400).json({
        success: false,
        message: "Please provide product_name or sentiment or call_type filter",
      });
    }

    const calls = await filterCalls(product_name, sentiment, call_type);

    res.status(200).json({
      success: true,
      totalResults: calls.length,
      calls,
    });
  } catch (error) {
    console.error("Error filtering calls:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getProductAnalysis = async (req, res) => {
  try {
    const { product_name } = req.query;

    if (!product_name) {
      return res.status(400).json({
        success: false,
        message: "Please provide product_name in query",
      });
    }

    const calls = await getCallsByProduct(product_name);

    res.status(200).json({
      success: true,
      product_name,
      totalCalls: calls.length,
      calls,
    });
  } catch (error) {
    console.error("Error generating product analysis:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getCompetitorInsights = async (req, res) => {
  try {
    const analysis = await getCompetitorAnalysis();

    res.status(200).json({
      success: true,
      competitorInsights: analysis,
    });
  } catch (error) {
    console.error("Error generating competitor insights:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const downloadCallReportHandler = async (req, res) => {
  try {
    const { callId } = req.params;
    const report = await buildCallReport(callId);

    res.setHeader("Content-Type", report.contentType || "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=\"${report.fileName}\"`);
    res.status(200).send(report.buffer);
  } catch (error) {
    console.error("Error generating call report:", error);
    const statusCode = error.message === "Call not found" ? 404 : 500;

    res.status(statusCode).json({
      success: false,
      error: error.message,
    });
  }
};

export const updateCallMetadataHandler = async (req, res) => {
  try {
    const { callId } = req.params;
    const updatedCall = await updateCallMetadata(callId, req.body || {});

    res.status(200).json({
      success: true,
      message: "Metadata updated successfully",
      call: updatedCall,
    });
  } catch (error) {
    console.error("Error updating call metadata:", error);
    const statusCode = error.message === "Call not found" ? 404 : 500;

    res.status(statusCode).json({
      success: false,
      error: error.message,
    });
  }
};
