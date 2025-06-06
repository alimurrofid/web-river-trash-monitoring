
import { useParams } from "react-router-dom";
import ComponentCard from "../../components/common/ComponentCard";
import TrafficStats from "../../components/common/TrafficStats";
import FourIsToThree from "../../components/ui/videos/FourIsToThree";
import { useEffect, useState } from "react";
import { getActiveStreamingLinkByBillboard, validateStreamingLink } from "../../services/api";


interface StreamingParams {
  linkId: string;
}

interface StreamingData {
  billboard_name: string;
  link: string;
  valid: boolean;
}

export default function StreamingPage() {
  const { linkId } = useParams<keyof StreamingParams>();
  const [streamData, setStreamData] = useState<StreamingData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Extract billboard name from linkId
  const getBillboardFromLinkId = (id: string | undefined) => {
    if (!id) return "";
    // Assuming format is like "a-timestamp" or "b-timestamp"
    const parts = id.split("-");
    if (parts.length > 0) {
      return parts[0].toUpperCase();
    }
    return "";
  };

  useEffect(() => {
    const fetchStreamData = async () => {
      try {
        setLoading(true);

        if (!linkId) {
          setError("Invalid streaming link");
          setLoading(false);
          return;
        }

        // Extract billboard name from linkId
        const billboardName = getBillboardFromLinkId(linkId);

        if (!billboardName || !["A", "B", "C"].includes(billboardName)) {
          setError("Invalid billboard identifier in link");
          setLoading(false);
          return;
        }

        // Validate the streaming link
        try {
          const validationResponse = await validateStreamingLink(linkId);

          if (validationResponse && validationResponse.success) {
            setStreamData({
              billboard_name: validationResponse.data.billboard_name,
              link: validationResponse.data.link,
              valid: true,
            });
          } else {
            throw new Error("Link validation failed");
          }
        } catch (err) {
          console.error("Link validation error:", err);

          // Fallback: Try to get active link for this billboard
          try {
            const response = await getActiveStreamingLinkByBillboard(
              billboardName
            );

            if (response && response.success && response.data) {
              // Check if the active link includes our linkId
              if (response.data.link.includes(linkId)) {
                setStreamData({
                  billboard_name: response.data.billboard_name,
                  link: response.data.link,
                  valid: true,
                });
              } else {
                throw new Error("Link mismatch");
              }
            } else {
              throw new Error("No active links found");
            }
          } catch (fallbackErr) {
            console.error("Fallback error:", fallbackErr);
            setError("This streaming link is invalid or not found");
            setStreamData({
              billboard_name: billboardName,
              link: "",
              valid: false,
            });
          }
        }
      } catch (err) {
        console.error("Error fetching streaming data:", err);
        setError("Unable to load stream. The link may be invalid.");
      } finally {
        setLoading(false);
      }
    };

    fetchStreamData();
  }, [linkId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading stream...</p>
      </div>
    );
  }

  if (error || !streamData?.valid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-4 rounded-md mb-4 max-w-md text-center">
          <h2 className="text-lg font-semibold mb-2">Stream Unavailable</h2>
          <p>{error || "This streaming link is invalid or not found"}</p>
        </div>
        <button
          onClick={() => window.close()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300"
        >
          Close Window
        </button>
      </div>
    );
  }

  // Determine the actual streaming URL to use
  // In a production environment, this would come from your streaming server
  // For now, we'll use the test URL or the one from stream data

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Billboard {streamData.billboard_name} - Live Stream
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Viewing live traffic monitoring feed
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FourIsToThree />

        <div className="space-y-6">
          <ComponentCard
            title={`Perhitungan kendaraan - Billboard ${streamData.billboard_name}`}
          >
            <TrafficStats billboardName={streamData.billboard_name} />
          </ComponentCard>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-600 dark:text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  About this stream
                </h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                  <p>
                    This is a live stream of traffic at Billboard{" "}
                    {streamData.billboard_name}. The AI-powered system counts
                    vehicles in real-time and categorizes them by type.
                  </p>
                  <p className="mt-2 text-green-600 dark:text-green-400">
                    This streaming link is permanently active until manually
                    deleted.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}