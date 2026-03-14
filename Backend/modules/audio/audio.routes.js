import express from "express";
import upload from "../../middlewares/upload.middleware.js";
import { uploadAudio, uploadText, getAudioByCallId, getAllAudio } from "./audio.controller.js";

const router = express.Router();

// Upload audio file
router.post("/upload", upload.single("audio"), uploadAudio);

// Upload text transcript
router.post("/upload-text", uploadText);

// Get audio by call ID
router.get("/:callId", getAudioByCallId);

// Get all audio records
router.get("/", getAllAudio);

export default router;
