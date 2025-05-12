import { useState } from "react";
import { generateStreamingLink } from "../services/api";

export const useGenerateLink = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const generateLink = async (
    billboard_id: number,
    duration: number,
    billboard_name: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      // Mengirim billboard_name ke API
      const data = await generateStreamingLink(
        billboard_id,
        duration,
        billboard_name
      );
      setGeneratedLink(data.link);
    } catch {
      setError("Failed to generate link.");
    } finally {
      setLoading(false);
    }
  };

  return { generateLink, generatedLink, loading, error };
};
