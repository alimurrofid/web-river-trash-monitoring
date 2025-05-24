import { Router } from "express";
import * as authController from "../controller/authcontroller.js";
import * as trafficController from "../controller/trafficController.js";
import * as streamingController from "../controller/streamingController.js";
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
router.get("/traffic/billboard/:billboard", isAuthenticated, trafficController.getTrafficByBillboard);
router.get("/traffic/daterange", isAuthenticated, trafficController.getTrafficByDateRange);
router.get("/traffic/dashboard", isAuthenticated, trafficController.getDashboardData);
router.get("/traffic/export", isAuthenticated, trafficController.exportTrafficData);
router.get("/traffic/latest", isAuthenticated, trafficController.getLatestTrafficData);
router.post("/traffic/manual-save", isAuthenticated, trafficController.manualSaveTraffic);
// Streaming routes
// Protected routes - require login
router.post("/streaming", isAuthenticated, streamingController.createStreamingLink);
router.get("/streaming", isAuthenticated, streamingController.getActiveStreamingLinks);
router.get("/streaming/billboard/:billboard", isAuthenticated, streamingController.getActiveStreamingLinkByBillboard);
router.put("/streaming/:id", isAuthenticated, streamingController.updateStreamingLink);
router.delete("/streaming/:id", isAuthenticated, streamingController.deleteStreamingLink);
// Public route - for validating streaming links
// This endpoint can be accessed without authentication
router.get("/streaming/validate/:linkId", streamingController.validateStreamingLink);
export default router;
//# sourceMappingURL=index.js.map