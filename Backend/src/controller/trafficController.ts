// src/controllers/trafficController.ts
import { Request, Response } from "express";
import * as trafficRepository from "../service/trafficRepository.js";
import { generateCsvFile, generateExcelFile } from "../utils/exportUtill.js";
import { trafficService } from "../main.js";

/**
 * Mencatat data traffic baru
 */
export const recordTraffic = async (req: Request, res: Response) => {
  try {
    const { 
      timestamp,
      plastic_makro,
      plastic_meso,
      nonplastic_makro,
      nonplastic_meso,
    } = req.body;
    
    const trafficData = {
      timestamp: new Date(timestamp),
      plastic_makro: plastic_makro || 0,
      plastic_meso: plastic_meso || 0,
      nonplastic_makro: nonplastic_makro || 0,
      nonplastic_meso: nonplastic_meso || 0,
    };
    
    const trafficId = await trafficRepository.recordTraffic(trafficData);
    
    return res.status(201).json({
      success: true,
      message: "Data traffic berhasil disimpan",
      trafficId
    });
    
  } catch (error) {
    console.error("Record traffic error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Terjadi kesalahan pada server" 
    });
  }
};

export const manualSaveTraffic = async (req: Request, res: Response) => {
  try {
    // Trigger manual save dari service
    const trafficId = await trafficService.manualSave();

    if (!trafficId) {
      return res.status(200).json({
        success: true,
        message: "Tidak ada perubahan data untuk disimpan",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Data traffic berhasil disimpan secara manual",
      trafficId,
    });
  } catch (error) {
    console.error("Manual save traffic error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

/**
 * Mendapatkan data traffic
 */
export const getTrafficAll = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    
    const trafficData = await trafficRepository.getTrafficAll(limit);
    
    return res.status(200).json({
      success: true,
      data: trafficData
    });
    
  } catch (error) {
    console.error("Get traffic All error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Terjadi kesalahan pada server" 
    });
  }
};

/**
 * Mendapatkan data traffic berdasarkan rentang tanggal
 */
export const getTrafficByDateRange = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validasi input
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false,
        message: "Start date dan end date wajib diisi" 
      });
    }
    
    const trafficData = await trafficRepository.getTrafficByDateRange(
      new Date(startDate as string),
      new Date(endDate as string)
    );
    
    return res.status(200).json({
      success: true,
      startDate,
      endDate,
      data: trafficData
    });
    
  } catch (error) {
    console.error("Get traffic by date range error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Terjadi kesalahan pada server" 
    });
  }
};

/**
 * Mendapatkan data agregat untuk dashboard
 */
export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const { groupBy } = req.query;
    
    // Validasi groupBy
    if (!groupBy || !["hour", "day", "week", "month"].includes(groupBy as string)) {
      return res.status(400).json({ 
        success: false,
        message: "Group by wajib diisi (hour, day, week, month)" 
      });
    }
    
    const aggregatedData = await trafficRepository.getAggregatedTrafficData(
      groupBy as "hour" | "day" | "week" | "month"
    );
    
    // Ambil juga total statistik
    const statistics = await trafficRepository.getTrafficStatistics();
    
    return res.status(200).json({
      success: true,
      groupBy,
      data: aggregatedData,
      statistics
    });
    
  } catch (error) {
    console.error("Get dashboard data error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Terjadi kesalahan pada server" 
    });
  }
};

/**
 * Mengekspor data traffic
 */
export const exportTrafficData = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, format } = req.query;
    
    // Validasi input
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false,
        message: "Start date dan end date wajib diisi" 
      });
    }
    
    // Validasi format
    if (!format || !["csv", "excel", "json"].includes(format as string)) {
      return res.status(400).json({ 
        success: false,
        message: "Format wajib diisi (csv, excel, json)" 
      });
    }
    
    // Ambil data traffic
    const trafficData = await trafficRepository.getTrafficByDateRange(
      new Date(startDate as string),
      new Date(endDate as string)
    );
    
    // Jika format JSON, langsung return data
    if (format === "json") {
      return res.status(200).json({
        success: true,
        startDate,
        endDate,
        data: trafficData
      });
    }
    
    // Jika format CSV
    if (format === "csv") {
      const fileName = `traffic_data_waste'_${startDate}_${endDate}.csv`;
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
      
      // Generate CSV file
      const csvContent = generateCsvFile(trafficData);
      
      return res.status(200).send(csvContent);
    }
    
    // Jika format Excel
    if (format === "excel") {
      const fileName = `traffic_data_waste_${startDate}_${endDate}.xlsx`;
      
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
      
      // Generate Excel file
      const excelBuffer = await generateExcelFile(trafficData);
      
      return res.status(200).send(excelBuffer);
    }
    
  } catch (error) {
    console.error("Export traffic data error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Terjadi kesalahan pada server" 
    });
  }
};

/**
 * Mendapatkan data traffic terbaru
 */
export const getLatestTrafficData = async (req: Request, res: Response) => {
  try {
    const latestData = await trafficRepository.getLatestTrafficData();
    
    return res.status(200).json({
      success: true,
      data: latestData
    });
    
  } catch (error) {
    console.error("Get latest traffic data error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Terjadi kesalahan pada server" 
    });
  }
};