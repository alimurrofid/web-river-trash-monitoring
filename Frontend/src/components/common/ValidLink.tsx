import { useEffect, useState } from "react";
import { StreamingLink, ValidLinkProps } from "../../services/interface";
import { deleteStreamingLink, getActiveStreamingLinks } from "../../services/api";

const ValidLink: React.FC<ValidLinkProps> = ({ billboardName }) => {
  const [links, setLinks] = useState<StreamingLink[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLinks();
  }, [billboardName]);

  const fetchLinks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getActiveStreamingLinks(billboardName);
      setLinks(response || []);
    } catch (err) {
      console.error("Error fetching streaming links:", err);
      setError("Failed to load streaming links");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !window.confirm("Are you sure you want to delete this streaming link?")
    ) {
      return;
    }

    try {
      await deleteStreamingLink(id);
      // Update the list after deletion
      setLinks(links.filter((link) => link.id !== id));
    } catch (err) {
      console.error("Error deleting streaming link:", err);
      alert("Failed to delete streaming link");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Link copied to clipboard!");
  };

  const formatCreatedTime = (createdDate: string) => {
    const created = new Date(createdDate);
    return created.toLocaleString();
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Active Streaming Links
        </h3>
        <button
          onClick={fetchLinks}
          className="inline-flex items-center p-1.5 border border-transparent rounded-md 
                    shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none 
                    focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          title="Refresh"
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      ) : links.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-md text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No streaming links for this billboard.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Generate a new link above to share with others.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {links.map((link) => (
            <div
              key={link.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-1">
                    <div
                      className="h-2.5 w-2.5 rounded-full bg-green-400 mr-2"
                      title="Active"
                    ></div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      Active Link
                    </p>
                  </div>
                  <div className="relative flex items-center mt-2">
                    <input
                      type="text"
                      readOnly
                      value={link.link}
                      className="pr-20 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm 
                               border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                      <button
                        onClick={() => copyToClipboard(link.link)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        title="Copy to clipboard"
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
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(link.id)}
                  className="ml-2 p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  title="Delete link"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Billboard: {link.billboard_name}</span>
                <span>Created: {formatCreatedTime(link.created_at)}</span>
              </div>
              <div className="mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                  Permanent Link
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ValidLink;