/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useState } from "react";
import { getActiveStreamingLinks } from "../services/api";


interface Link {
  id: number;
  link: string;
  expired_at: string;
  billboard_name?: string;
}

export const useFetchValidLinks = (billboardName?: string) => {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getLinks = async () => {
      try {
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
        setError("Failed to fetch links.");
      } finally {
        setLoading(false);
      }
    };

    getLinks();
  }, [billboardName]);

  return { links, loading, error };
};