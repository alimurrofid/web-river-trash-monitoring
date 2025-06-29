// Backend/src/controllers/authController.ts
import { Request, Response } from "express";
import * as userRepository from "../service/userRepository.js";

/**
 * Login endpoint
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    console.log("=== LOGIN DEBUG ===");
    console.log("Headers:", req.headers);
    console.log("Session before login:", req.session);
    console.log("Session ID before:", req.sessionID);

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan password wajib diisi",
      });
    }

    // Validasi password
    const isValid = await userRepository.validatePassword(email, password);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    // Dapatkan user
    const user = await userRepository.findUserByEmail(email);
    
    // Pastikan user tidak null
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    // Simpan user ID ke session
    req.session.userId = user.id;
    req.session.email = user.email;

    // Force save session
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
      } else {
        console.log("Session saved successfully");
      }
    });

    console.log("Session after login:", req.session);
    console.log("Session ID after:", req.sessionID);
    console.log("=== END LOGIN DEBUG ===");

    return res.status(200).json({
      success: true,
      message: "Login berhasil",
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    console.log("=== PROFILE DEBUG ===");
    console.log("Headers:", req.headers);
    console.log("Session:", req.session);
    console.log("Session ID:", req.sessionID);
    console.log("User ID from session:", req.session.userId);
    console.log("=== END PROFILE DEBUG ===");

    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: "Silakan login terlebih dahulu",
      });
    }

    const user = await userRepository.findUserById(req.session.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

/**
 * Register endpoint
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan password wajib diisi",
      });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await userRepository.findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email sudah terdaftar",
      });
    }

    // Validasi format email dengan regex sederhana
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Format email tidak valid",
      });
    }

    // Validasi password minimal 6 karakter
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password minimal 6 karakter",
      });
    }

    // Buat user baru
    const newUser = await userRepository.createUser(email, password);

    if (!newUser) {
      return res.status(500).json({
        success: false,
        message: "Gagal membuat user baru",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Pendaftaran berhasil",
      userId: newUser.id,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

/**
 * Logout endpoint
 */
export const logout = (req: Request, res: Response) => {
  try {
    // Hapus session
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Gagal logout",
        });
      }

      res.clearCookie("connect.sid");

      return res.status(200).json({
        success: true,
        message: "Logout berhasil",
      });
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

/**
 * Check if user is authenticated
 */
export const checkAuth = (req: Request, res: Response) => {
  console.log("=== CHECK AUTH DEBUG ===");
  console.log("Session:", req.session);
  console.log("Session ID:", req.sessionID);
  console.log("=== END CHECK AUTH DEBUG ===");

  if (req.session.userId) {
    return res.status(200).json({
      success: true,
      isAuthenticated: true,
      userId: req.session.userId,
      email: req.session.email,
    });
  } else {
    return res.status(200).json({
      success: true,
      isAuthenticated: false,
    });
  }
};