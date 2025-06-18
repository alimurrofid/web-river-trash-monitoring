/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { TrafficData } from "./interface";

// === Konfigurasi Axios dengan baseURL dari .env ===
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Fungsi untuk memicu penyimpanan data traffic secara manual (tanpa billboard_name)
export const saveTrafficDataManually = async (): Promise<any> => {
  try {
    const response = await api.post(`/traffic/manual-save`);
    return response.data;
  } catch (error: unknown) {
    const err = error as any;
    console.error("Failed to save traffic data manually:", err?.message || err);
    throw error;
  }
};

// Fungsi untuk menyimpan data traffic ke backend
export const saveTrafficData = async (data: TrafficData): Promise<any> => {
  try {
    const response = await api.post("/traffic", data);
    return response.data;
  } catch (error: unknown) {
    const err = error as any;
    console.error("Error saving traffic data:", err?.message || err);
    throw error;
  }
};

// Fungsi untuk mengambil semua data traffic
export const getTrafficAll = async (_limit: number = 100): Promise<any> => {
  try {
    const response = await api.get(`/traffic/waste`);
    return response.data;
  } catch (error: unknown) {
    const err = error as any;
    console.error("Error getting traffic data waste:", err?.message || err);
    throw error;
  }
};

// Fungsi untuk mengambil data traffic berdasarkan rentang tanggal
export const getTrafficByDateRange = async (
  startDate: string,
  endDate: string,
): Promise<any> => {
  try {
    const url = `/traffic/daterange?startDate=${startDate}&endDate=${endDate}`;
    const response = await api.get(url);
    return response.data;
  } catch (error: unknown) {
    const err = error as any;
    console.error("Error getting traffic data by date range:", err?.message || err);
    throw error;
  }
};

// Fungsi untuk mengambil data traffic terbaru (berdasarkan tanggal hari ini)
export const getLatestTrafficData = async (): Promise<any> => {
  try {
    const today = new Date();
    const startDate = today.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    const endDate = startDate;

    const response = await getTrafficByDateRange(startDate, endDate);

    return {
      success: true,
      data: response?.data ?? [],
    };
  } catch (error: unknown) {
    const err = error as any;
    console.error("Error getting latest traffic data:", err?.message || err);
    throw error;
  }
};

// Fungsi untuk mengekspor data traffic
export const exportTrafficData = async (
  startDate: string,
  endDate: string,
  format: "csv" | "excel" | "json",
): Promise<any> => {
  try {
    const url = `/traffic/export?startDate=${startDate}&endDate=${endDate}&format=${format}`;

    const response = await api.get(url, {
      responseType: format === "json" ? "json" : "blob",
    });

    return response.data;
  } catch (error: unknown) {
    const err = error as any;
    console.error("Error exporting traffic data:", err?.message || err);
    throw error;
  }
};
