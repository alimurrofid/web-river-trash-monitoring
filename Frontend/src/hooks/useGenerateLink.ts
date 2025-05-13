import { useState } from "react";
import { generateStreamingLink } from "../services/api";

export const useGenerateLink = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const generateLink = async (
    billboard_id: string, // Changed to string to match API function
    durationHours: number = 1 // Default value provided
  ) => {
    setLoading(true);
    setError(null);
    try {
      // Updated to match the API function signature
      const link = await generateStreamingLink(billboard_id, durationHours);
      setGeneratedLink(link);
    } catch {
      setError("Failed to generate link.");
    } finally {
      setLoading(false);
    }
  };

  return { generateLink, generatedLink, loading, error };
};