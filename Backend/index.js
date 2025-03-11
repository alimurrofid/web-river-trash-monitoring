import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import streamingRoutes from "./src/routes/streamingRoutes.js";
import billboardRoutes from "./src/routes/billboardRoutes.js";
import { deleteExpiredLinks } from "./src/controllers/streamingController.js";
import cors from "cors";
dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/api/streaming", streamingRoutes);
app.use("/api/billboard", billboardRoutes);
// Add this new route for stream links
app.use("/stream", streamingRoutes);

// Periodically clean expired links every 1 hour
setInterval(deleteExpiredLinks, 60 * 60 * 1000);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
