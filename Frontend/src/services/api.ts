import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/streaming"; // Ganti dengan URL backend

export const generateStreamingLink = async (
  billboard_id: number,
  duration: number
) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/generate`, {
      billboard_id,
      duration,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to generate link:", error);
    throw error;
  }
};

export const fetchValidLinks = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/valid`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch valid links:", error);
    throw error;
  }
};
