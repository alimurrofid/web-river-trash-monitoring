/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { StreamingLink, TrafficData } from "./interface";


const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Function to save traffic data to the backend
export const saveTrafficData = async (data: TrafficData): Promise<any> => {
  try {
    const response = await api.post("/traffic", data);
    return response.data;
  } catch (error) {
    console.error("Error saving traffic data:", error);
    throw error;
  }
};

// Function to get traffic data by billboard
export const getTrafficByBillboard = async (
  billboard: string,
  _limit: number = 100
): Promise<any> => {
  try {
    const response = await api.get(`/traffic/billboard/${billboard}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error getting traffic data for billboard ${billboard}:`,
      error
    );
    throw error;
  }
};

// Function to get traffic data by date range
export const getTrafficByDateRange = async (
  startDate: string,
  endDate: string,
  billboard?: string
): Promise<any> => {
  try {
    let url = `/traffic/daterange?startDate=${startDate}&endDate=${endDate}`;
    if (billboard) {
      url += `&billboard=${billboard}`;
    }
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Error getting traffic data by date range:", error);
    throw error;
  }
};

// Function to get latest data for all billboards by using date range for today
export const getLatestTrafficData = async (): Promise<any> => {
  try {
    // Use today's date for start and end to get the most recent data
    const today = new Date();
    const startDate = today.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    const endDate = today.toISOString().split("T")[0];

    // Get data for today without specifying billboard to get all
    const response = await getTrafficByDateRange(startDate, endDate);

    // If successful, format the response to match expected structure
    return {
      success: true,
      data: response.data || [],
    };
  } catch (error) {
    console.error("Error getting latest traffic data:", error);
    throw error;
  }
};

// Function to get latest data for a specific billboard
export const getLatestBillboardData = async (
  billboard: string
): Promise<any> => {
  try {
    const response = await getTrafficByBillboard(billboard);

    // Return the most recent entry if available
    if (response.data && response.data.length > 0) {
      return response.data[0]; // Assuming data is sorted by timestamp desc
    }

    return null;
  } catch (error) {
    console.error(
      `Error getting latest data for billboard ${billboard}:`,
      error
    );
    throw error;
  }
};

// Function to export traffic data
export const exportTrafficData = async (
  startDate: string,
  endDate: string,
  format: "csv" | "excel" | "json",
  billboard?: string
): Promise<any> => {
  try {
    let url = `/traffic/export?startDate=${startDate}&endDate=${endDate}&format=${format}`;
    if (billboard) {
      url += `&billboard=${billboard}`;
    }

    const response = await api.get(url, {
      responseType: format === "json" ? "json" : "blob",
    });

    return response.data;
  } catch (error) {
    console.error("Error exporting traffic data:", error);
    throw error;
  }
};

// Function to generate streaming link
export const generateStreamingLink = async (
  billboard: string,
  durationHours: number = 1
): Promise<string> => {
  try {
    const response = await api.post("/streaming", {
      billboard_name: billboard,
      duration_hours: durationHours,
    });

    if (response.data && response.data.success && response.data.data) {
      return response.data.data.link;
    }

    throw new Error("Failed to generate streaming link");
  } catch (error) {
    console.error("Error generating streaming link:", error);
    throw error;
  }
};

// Function to get active streaming links for a billboard
export const getActiveStreamingLinks = async (
  billboard: string
): Promise<StreamingLink[]> => {
  try {
    const response = await api.get(`/streaming/billboard/${billboard}`);
    
    if (response.data && response.data.success && response.data.data) {
      return Array.isArray(response.data.data) 
        ? response.data.data 
        : [response.data.data];
    }
    
    return [];
  } catch (error) {
    console.error("Error getting streaming links:", error);
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      // No active links found - not an error
      return [];
    }
    throw error;
  }
};

// Function to get a specific streaming link by ID
export const getStreamingLinkById = async (
  linkId: string
): Promise<StreamingLink | null> => {
  try {
    const response = await api.get(`/streaming/validate/${linkId}`);
    
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting streaming link:", error);
    return null;
  }
};

// Function to delete a streaming link
export const deleteStreamingLink = async (id: number): Promise<boolean> => {
  try {
    const response = await api.delete(`/streaming/${id}`);
    return response.data && response.data.success;
  } catch (error) {
    console.error("Error deleting streaming link:", error);
    throw error;
  }
};

// Function to get active streaming link by billboard
export const getActiveStreamingLinkByBillboard = async (
  billboard: string
): Promise<any> => {
  try {
    const response = await api.get(`/streaming/billboard/${billboard}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting active streaming link for billboard ${billboard}:`, error);
    throw error;
  }
};

// Function to validate a streaming link
export const validateStreamingLink = async (linkId: string): Promise<any> => {
  try {
    const response = await api.get(`/streaming/validate/${linkId}`);
    return response.data;
  } catch (error) {
    console.error("Error validating streaming link:", error);
    throw error;
  }
};
