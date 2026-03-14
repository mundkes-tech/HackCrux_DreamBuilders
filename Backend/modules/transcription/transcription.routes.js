import express from "express";
import {
  transcribeCall,
  getTranscript,
} from "./transcription.controller.js";

const router = express.Router();

// POST - Transcribe audio
router.post("/transcribe/:callId", transcribeCall);

// GET - Retrieve transcript
router.get("/transcript/:callId", getTranscript);

export default router;
