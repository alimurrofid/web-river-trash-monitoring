/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";


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
        // Fetch semua link
        const data = useFetchValidLinks();

        // Filter link berdasarkan billboard_name jika tersedia
        if (billboardName) {
          const filteredLinks = data.filter(
            (link: Link) => link.billboard_name === billboardName
          );
          setLinks(filteredLinks);
        } else {
          setLinks(data);
        }
      } catch {
        setError("Failed to fetch links.");
      } finally {
        setLoading(false);
      }
    };

    getLinks();
  }, [billboardName]);

  return { links, loading, error };
};
