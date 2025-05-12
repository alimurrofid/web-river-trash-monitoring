import { Request, Response } from "express";
import * as streamingRepository from "../service/streamingRepository.js";

/**
 * Membuat link streaming baru
 */
export const createStreamingLink = async (req: Request, res: Response) => {
  try {
    const { link, expired_at, id_traffic_billboard, billboard_name } = req.body;
    
    // Validasi input
    if (!link || !expired_at || !id_traffic_billboard || !billboard_name) {
      return res.status(400).json({ 
        success: false,
        message: "Link, waktu kedaluwarsa, ID traffic billboard, dan nama billboard wajib diisi" 
      });
    }
    
    // Validasi billboard_name (A, B, atau C)
    if (!["A", "B", "C"].includes(billboard_name)) {
      return res.status(400).json({ 
        success: false,
        message: "Billboard name hanya boleh A, B, atau C" 
      });
    }
    
    // Validasi format link (harus dimulai dengan http:// atau https://)
    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      return res.status(400).json({
        success: false,
        message: "Format link tidak valid (harus dimulai dengan http:// atau https://)"
      });
    }
    
    const streamingData = {
      link,
      expired_at: new Date(expired_at),
      id_traffic_billboard,
      billboard_name
    };
    
    const streamingId = await streamingRepository.createStreamingLink(streamingData);
    
    return res.status(201).json({
      success: true,
      message: "Link streaming berhasil dibuat",
      streamingId
    });
    
  } catch (error) {
    console.error("Create streaming link error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Terjadi kesalahan pada server" 
    });
  }
};

/**
 * Mendapatkan semua link streaming yang aktif
 */
export const getActiveStreamingLinks = async (req: Request, res: Response) => {
  try {
    const activeLinks = await streamingRepository.getActiveStreamingLinks();
    
    return res.status(200).json({
      success: true,
      data: activeLinks
    });
    
  } catch (error) {
    console.error("Get active streaming links error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Terjadi kesalahan pada server" 
    });
  }
};

/**
 * Mendapatkan link streaming aktif berdasarkan billboard
 */
export const getActiveStreamingLinkByBillboard = async (req: Request, res: Response) => {
  try {
    const { billboard } = req.params;
    
    // Validasi billboard
    if (!["A", "B", "C"].includes(billboard)) {
      return res.status(400).json({ 
        success: false,
        message: "Billboard hanya boleh A, B, atau C" 
      });
    }
    
    const streamingLink = await streamingRepository.getActiveStreamingLinkByBillboard(billboard);
    
    if (!streamingLink) {
      return res.status(404).json({
        success: false,
        message: `Tidak ada link streaming aktif untuk billboard ${billboard}`
      });
    }
    
    return res.status(200).json({
      success: true,
      data: streamingLink
    });
    
  } catch (error) {
    console.error("Get streaming link by billboard error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Terjadi kesalahan pada server" 
    });
  }
};

/**
 * Memperbarui link streaming
 */
export const updateStreamingLink = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { link, expired_at, billboard_name } = req.body;
    
    // Validasi ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        success: false,
        message: "ID tidak valid" 
      });
    }
    
    // Validasi input
    if (!link && !expired_at && !billboard_name) {
      return res.status(400).json({ 
        success: false,
        message: "Minimal satu field harus diisi untuk update" 
      });
    }
    
    // Validasi billboard_name jika ada
    if (billboard_name && !["A", "B", "C"].includes(billboard_name)) {
      return res.status(400).json({ 
        success: false,
        message: "Billboard name hanya boleh A, B, atau C" 
      });
    }
    
    // Validasi format link jika ada
    if (link && !link.startsWith('http://') && !link.startsWith('https://')) {
      return res.status(400).json({
        success: false,
        message: "Format link tidak valid (harus dimulai dengan http:// atau https://)"
      });
    }
    
    // Buat objek data update
    const updateData: Partial<streamingRepository.StreamingInput> = {};
    
    if (link) updateData.link = link;
    if (expired_at) updateData.expired_at = new Date(expired_at);
    if (billboard_name) updateData.billboard_name = billboard_name;
    
    const updatedLink = await streamingRepository.updateStreamingLink(parseInt(id), updateData);
    
    if (!updatedLink) {
      return res.status(404).json({
        success: false,
        message: "Link streaming tidak ditemukan"
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Link streaming berhasil diperbarui",
      data: updatedLink
    });
    
  } catch (error) {
    console.error("Update streaming link error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Terjadi kesalahan pada server" 
    });
  }
};

/**
 * Menghapus link streaming
 */
export const deleteStreamingLink = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validasi ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        success: false,
        message: "ID tidak valid" 
      });
    }
    
    await streamingRepository.deleteStreamingLink(parseInt(id));
    
    return res.status(200).json({
      success: true,
      message: "Link streaming berhasil dihapus"
    });
    
  } catch (error) {
    console.error("Delete streaming link error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Terjadi kesalahan pada server" 
    });
  }
};