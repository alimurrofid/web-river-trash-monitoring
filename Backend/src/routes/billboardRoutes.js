import express from "express";
import {
  getAllTraffic,
  getTrafficById,
  addTraffic,
} from "../controllers/billboardController.js";

const router = express.Router();

router.get("/", getAllTraffic); // GET all billboard traffic
router.get("/:id", getTrafficById); // GET traffic by ID
router.post("/", addTraffic); // POST new traffic data

export default router;
