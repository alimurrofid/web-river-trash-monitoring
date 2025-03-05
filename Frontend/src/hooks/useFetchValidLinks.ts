import { useEffect, useState } from "react";
import { fetchValidLinks } from "../services/api";

export const useFetchValidLinks = () => {
  const [links, setLinks] = useState<
    { id: number; link: string; expired_at: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getLinks = async () => {
      try {
        const data = await fetchValidLinks();
        setLinks(data);
      } catch {
        setError("Failed to fetch links.");
      } finally {
        setLoading(false);
      }
    };

    getLinks();
  }, []);

  return { links, loading, error };
};
