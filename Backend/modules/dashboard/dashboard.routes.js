import express from "express";
import {
  getCalls,
  getCallDetailsHandler,
  getAnalyticsHandler,
  filterCallsHandler,
  getProductAnalysis,
  getCompetitorInsights,
  downloadCallReportHandler,
  updateCallMetadataHandler,
} from "./dashboard.controller.js";

const router = express.Router();

// GET - Retrieve all analyzed calls with summary
router.get("/calls", getCalls);

// GET - Retrieve full details of a specific call
router.get("/call/:callId", getCallDetailsHandler);

// PUT - Update extracted metadata before final save/report
router.put("/call/:callId/metadata", updateCallMetadataHandler);

// GET - Get dashboard analytics and statistics
router.get("/analytics", getAnalyticsHandler);

// GET - Filter calls by product_name and/or sentiment and/or call_type
router.get("/filter", filterCallsHandler);

// GET - Get analysis for a specific product
router.get("/product", getProductAnalysis);

// GET - Get competitor intelligence
router.get("/competitors", getCompetitorInsights);

// GET - Download a full analysis report as HTML
router.get("/report/:callId", downloadCallReportHandler);

export default router;
