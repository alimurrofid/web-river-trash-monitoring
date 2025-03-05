import { useState } from "react";
import { generateStreamingLink } from "../services/api";

export const useGenerateLink = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const generateLink = async (billboard_id: number, duration: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateStreamingLink(billboard_id, duration);
      setGeneratedLink(data.link);
    } catch {
      setError("Failed to generate link.");
    } finally {
      setLoading(false);
    }
  };

  return { generateLink, generatedLink, loading, error };
};
