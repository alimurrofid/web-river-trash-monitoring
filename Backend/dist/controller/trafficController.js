import * as trafficRepository from "../service/trafficRepository.js";
import { generateCsvFile, generateExcelFile } from "../utils/exportUtill.js";
import { trafficService } from "../main.js";
/**
 * Mencatat data traffic baru
 */
export const recordTraffic = async (req, res) => {
    try {
        const { timestamp, billboard_name, motorcycle_down, motorcycle_up, car_down, car_up, big_vehicle_down, big_vehicle_up } = req.body;
        // Validasi input
        if (!billboard_name || !timestamp) {
            return res.status(400).json({
                success: false,
                message: "Billboard name dan timestamp wajib diisi"
            });
        }
        // Validasi billboard_name (A, B, atau C)
        if (!["A", "B", "C"].includes(billboard_name)) {
            return res.status(400).json({
                success: false,
                message: "Billboard name hanya boleh A, B, atau C"
            });
        }
        const trafficData = {
            timestamp: new Date(timestamp),
            billboard_name,
            motorcycle_down: motorcycle_down || 0,
            motorcycle_up: motorcycle_up || 0,
            car_down: car_down || 0,
            car_up: car_up || 0,
            big_vehicle_down: big_vehicle_down || 0,
            big_vehicle_up: big_vehicle_up || 0
        };
        const trafficId = await trafficRepository.recordTraffic(trafficData);
        return res.status(201).json({
            success: true,
            message: "Data traffic berhasil disimpan",
            trafficId
        });
    }
    catch (error) {
        console.error("Record traffic error:", error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server"
        });
    }
};
export const manualSaveTraffic = async (req, res) => {
    try {
        const { billboard_name } = req.body;
        // Validasi input
        if (!billboard_name) {
            return res.status(400).json({
                success: false,
                message: "Billboard name wajib diisi",
            });
        }
        // Validasi billboard_name (A, B, atau C)
        if (!["A", "B", "C"].includes(billboard_name)) {
            return res.status(400).json({
                success: false,
                message: "Billboard name hanya boleh A, B, atau C",
            });
        }
        // Trigger manual save dari service
        const trafficId = await trafficService.manualSave(billboard_name);
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
    }
    catch (error) {
        console.error("Manual save traffic error:", error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server",
        });
    }
};
/**
 * Mendapatkan data traffic berdasarkan billboard
 */
export const getTrafficByBillboard = async (req, res) => {
    try {
        const { billboard } = req.params;
        const limit = parseInt(req.query.limit) || 100;
        // Validasi billboard
        if (!["A", "B", "C"].includes(billboard)) {
            return res.status(400).json({
                success: false,
                message: "Billboard hanya boleh A, B, atau C"
            });
        }
        const trafficData = await trafficRepository.getTrafficByBillboard(billboard, limit);
        return res.status(200).json({
            success: true,
            billboard,
            data: trafficData
        });
    }
    catch (error) {
        console.error("Get traffic by billboard error:", error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server"
        });
    }
};
/**
 * Mendapatkan data traffic berdasarkan rentang tanggal
 */
export const getTrafficByDateRange = async (req, res) => {
    try {
        const { startDate, endDate, billboard } = req.query;
        // Validasi input
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Start date dan end date wajib diisi"
            });
        }
        // Validasi billboard jika ada
        if (billboard && !["A", "B", "C"].includes(billboard)) {
            return res.status(400).json({
                success: false,
                message: "Billboard hanya boleh A, B, atau C"
            });
        }
        const trafficData = await trafficRepository.getTrafficByDateRange(new Date(startDate), new Date(endDate), billboard);
        return res.status(200).json({
            success: true,
            startDate,
            endDate,
            billboard: billboard || "All",
            data: trafficData
        });
    }
    catch (error) {
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
export const getDashboardData = async (req, res) => {
    try {
        const { groupBy, billboard } = req.query;
        // Validasi groupBy
        if (!groupBy || !["hour", "day", "week", "month"].includes(groupBy)) {
            return res.status(400).json({
                success: false,
                message: "Group by wajib diisi (hour, day, week, month)"
            });
        }
        // Validasi billboard jika ada
        if (billboard && !["A", "B", "C"].includes(billboard)) {
            return res.status(400).json({
                success: false,
                message: "Billboard hanya boleh A, B, atau C"
            });
        }
        const aggregatedData = await trafficRepository.getAggregatedTrafficData(groupBy, billboard);
        // Ambil juga total statistik
        const statistics = await trafficRepository.getTrafficStatistics(billboard);
        return res.status(200).json({
            success: true,
            groupBy,
            billboard: billboard || "All",
            data: aggregatedData,
            statistics
        });
    }
    catch (error) {
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
export const exportTrafficData = async (req, res) => {
    try {
        const { startDate, endDate, billboard, format } = req.query;
        // Validasi input
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Start date dan end date wajib diisi"
            });
        }
        // Validasi format
        if (!format || !["csv", "excel", "json"].includes(format)) {
            return res.status(400).json({
                success: false,
                message: "Format wajib diisi (csv, excel, json)"
            });
        }
        // Ambil data traffic
        const trafficData = await trafficRepository.getTrafficByDateRange(new Date(startDate), new Date(endDate), billboard);
        // Jika format JSON, langsung return data
        if (format === "json") {
            return res.status(200).json({
                success: true,
                startDate,
                endDate,
                billboard: billboard || "All",
                data: trafficData
            });
        }
        // Jika format CSV
        if (format === "csv") {
            const fileName = `traffic_data_${billboard || 'all'}_${startDate}_${endDate}.csv`;
            res.setHeader("Content-Type", "text/csv");
            res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
            // Generate CSV file
            const csvContent = generateCsvFile(trafficData);
            return res.status(200).send(csvContent);
        }
        // Jika format Excel
        if (format === "excel") {
            const fileName = `traffic_data_${billboard || 'all'}_${startDate}_${endDate}.xlsx`;
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
            // Generate Excel file
            const excelBuffer = await generateExcelFile(trafficData, billboard);
            return res.status(200).send(excelBuffer);
        }
    }
    catch (error) {
        console.error("Export traffic data error:", error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server"
        });
    }
};
/**
 * Mendapatkan data traffic terbaru untuk semua billboard
 */
export const getLatestTrafficData = async (req, res) => {
    try {
        const latestData = await trafficRepository.getLatestTrafficData();
        return res.status(200).json({
            success: true,
            data: latestData
        });
    }
    catch (error) {
        console.error("Get latest traffic data error:", error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server"
        });
    }
};
//# sourceMappingURL=trafficController.js.map