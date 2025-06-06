import { useState } from "react";
import { generateStreamingLink } from "../services/api";

export const useGenerateLink = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const generateLink = async (billboard_id: string) => {
    setLoading(true);
    setError(null);
    setGeneratedLink(null);

    try {
      // Updated to match the new API function signature (without duration)
      const link = await generateStreamingLink(billboard_id);
      setGeneratedLink(link);
    } catch (error) {
      console.error("Error generating streaming link:", error);
      setError("Failed to generate streaming link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to clear the generated link
  const clearGeneratedLink = () => {
    setGeneratedLink(null);
    setError(null);
  };

  // Function to reset all states
  const reset = () => {
    setLoading(false);
    setError(null);
    setGeneratedLink(null);
  };

  return {
    generateLink,
    generatedLink,
    loading,
    error,
    clearGeneratedLink,
    reset,
  };
};