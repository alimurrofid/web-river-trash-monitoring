import express from "express";
import { createStreamingLink, getValidLinks, getStreamContent } from "../controllers/streamingController.js";

const router = express.Router();


router.post("/generate", createStreamingLink); // Generate new link
router.get("/valid", getValidLinks);
router.get("/:linkId", getStreamContent); // Get valid links

export default router;
