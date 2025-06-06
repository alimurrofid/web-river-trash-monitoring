/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useState } from "react";
import { getActiveStreamingLinks } from "../services/api";


interface Link {
  id: number;
  link: string;
  created_at: string; // Changed from expired_at to created_at
  billboard_name?: string;
}

export const useFetchValidLinks = (billboardName?: string) => {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getLinks = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch links - properly await the API call
        // Using billboardName or empty string as fallback
        const data = await getActiveStreamingLinks(billboardName || "");

        // If billboard name is provided, filter the data
        if (billboardName) {
          const filteredLinks = data.filter(
            (link: Link) => link.billboard_name === billboardName
          );
          setLinks(filteredLinks);
        } else {
          setLinks(data);
        }
      } catch (error) {
        console.error("Error fetching streaming links:", error);
        setError("Failed to fetch streaming links.");
        setLinks([]);
      } finally {
        setLoading(false);
      }
    };

    getLinks();
  }, [billboardName]);

  // Function to refresh links manually
  const refreshLinks = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getActiveStreamingLinks(billboardName || "");

      if (billboardName) {
        const filteredLinks = data.filter(
          (link: Link) => link.billboard_name === billboardName
        );
        setLinks(filteredLinks);
      } else {
        setLinks(data);
      }
    } catch (error) {
      console.error("Error refreshing streaming links:", error);
      setError("Failed to refresh streaming links.");
    } finally {
      setLoading(false);
    }
  };

  return { links, loading, error, refreshLinks };
};