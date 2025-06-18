import { Router } from "express";
import * as authController from "../controller/authcontroller.js";
import * as trafficController from "../controller/trafficController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = Router();

// Auth routes (public)
router.post("/auth/login", authController.login);
router.post("/auth/register", authController.register);
router.post("/auth/logout", authController.logout);
router.get("/auth/profile", isAuthenticated, authController.getProfile);
router.get("/auth/check", authController.checkAuth);

// Traffic routes (protected)
router.post("/traffic", isAuthenticated, trafficController.recordTraffic);
router.get(
  "/traffic/waste",
  isAuthenticated,
  trafficController.getTrafficAll
);
router.get(
  "/traffic/daterange",
  isAuthenticated,
  trafficController.getTrafficByDateRange
);
router.get(
  "/traffic/dashboard",
  isAuthenticated,
  trafficController.getDashboardData
);
router.get(
  "/traffic/export",
  isAuthenticated,
  trafficController.exportTrafficData
);
router.get(
  "/traffic/latest",
  isAuthenticated,
  trafficController.getLatestTrafficData
);

router.post(
  "/traffic/manual-save",
  isAuthenticated,
  trafficController.manualSaveTraffic
);
// Streaming routes
// Protected routes - require login


export default router;
