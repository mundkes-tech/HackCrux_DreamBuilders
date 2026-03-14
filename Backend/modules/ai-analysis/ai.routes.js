import express from "express";
import { analyzeCall, getInsights } from "./ai.controller.js";

const router = express.Router();

// POST - Analyze call and generate AI insights
router.post("/analyze/:callId", analyzeCall);

// GET - Retrieve AI insights
router.get("/insights/:callId", getInsights);

export default router;
