import { useState } from "react";
import { GenerateLinkProps } from "../../services/interface";
import { generateStreamingLink } from "../../services/api";

const GenerateLink: React.FC<GenerateLinkProps> = ({ billboardName }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    link?: string;
  }>({
    success: false,
    message: "",
  });

  const handleGenerateLink = async () => {
    try {
      setIsLoading(true);
      setResult({ success: false, message: "" });

      // Tidak lagi mengirim duration_hours
      const link = await generateStreamingLink(billboardName);

      setResult({
        success: true,
        message: "Streaming link generated successfully",
        link: link,
      });
    } catch (error) {
      console.error("Error generating streaming link:", error);
      setResult({
        success: false,
        message: "Failed to generate streaming link. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Link copied to clipboard!");
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Generate Streaming Link for Billboard {billboardName}
        </label>
        <div className="flex items-center">
          <button
            onClick={handleGenerateLink}
            disabled={isLoading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium 
                      rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none 
                      focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating...
              </span>
            ) : (
              "Generate Streaming Link"
            )}
          </button>
        </div>
      </div>

      {result.message && (
        <div
          className={`p-4 mb-4 rounded-md ${
            result.success
              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
          }`}
        >
          <p>{result.message}</p>
          {result.link && (
            <div className="mt-2">
              <div className="flex items-center mt-1">
                <input
                  type="text"
                  readOnly
                  value={result.link}
                  className="flex-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm 
                          border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                />
                <button
                  onClick={() => copyToClipboard(result.link!)}
                  className="ml-2 inline-flex items-center p-1.5 border border-transparent rounded-md 
                          shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none 
                          focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-sm mt-1 text-blue-600 dark:text-blue-400">
                This link will be permanently active until manually deleted.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GenerateLink;