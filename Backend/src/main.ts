
import express from "express";
import session from "express-session";
import cors from "cors";
import helmet from "helmet";
import "dotenv/config";
import { connection } from "./drizzle/db.js";
import routes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/authMiddleware.js";
import { initScheduledTrafficService } from "./service/scheduledTraffic.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());

// CORS configuration
// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware with memory store (for development only)
app.use(
  session({
    name: "connect.sid", // Gunakan nama default
    secret: process.env.SESSION_SECRET || "fallback-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // true untuk HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 jam
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Penting untuk cross-origin
    },
  })
);

// Initialize scheduled traffic service
export const trafficService = initScheduledTrafficService();

// Tipe untuk session
declare module "express-session" {
  interface SessionData {
    userId: number;
    email: string;
    role?: string;
  }
}

// Routes
app.use("/api", routes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    connection.end().catch((err) => {
      console.error("Error closing database connection:", err);
    });
    process.exit(0);
  });
});

export default app;