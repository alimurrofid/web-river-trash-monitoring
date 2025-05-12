// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Cek apakah ada session userId
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      message: "Silakan login terlebih dahulu",
    });
  }

  // Lanjut ke handler berikutnya
  next();
};

/**
 * Middleware untuk menangani error
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Server error:", err);

  return res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};

/**
 * Middleware untuk request yang tidak ditemukan
 */
export const notFoundHandler = (req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: "URL tidak ditemukan",
  });
};