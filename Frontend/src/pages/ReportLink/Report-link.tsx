import { useEffect, useState } from "react";
import { StreamingLink } from "../../services/interface";
import { deleteStreamingLink, getActiveStreamingLinks } from "../../services/api";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

export default function ActiveLinks(): React.ReactElement {
  const [links, setLinks] = useState<StreamingLink[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<StreamingLink[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: "",
    endDate: "",
  });
  const [billboardFilter, setBillboardFilter] = useState<string>("all");

  // Fetch all active links on component mount
  useEffect(() => {
    fetchLinks();
  }, []);

  // Apply filters when links, searchTerm, dateFilter, or billboardFilter change
  useEffect(() => {
    applyFilters();
  }, [links, searchTerm, dateFilter, billboardFilter]);

  const fetchLinks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get active links for each billboard (A, B, C)
      const billboardNames = ["A", "B", "C"];
      let allLinks: StreamingLink[] = [];

      for (const name of billboardNames) {
        try {
          const billboardLinks = await getActiveStreamingLinks(name);
          allLinks = [...allLinks, ...billboardLinks];
        } catch (err) {
          console.error(`Error fetching links for billboard ${name}:`, err);
        }
      }

      // Sort links by creation time (descending - newest first)
      allLinks.sort((a, b) => {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });

      setLinks(allLinks);
      setFilteredLinks(allLinks);
    } catch (err) {
      console.error("Error fetching streaming links:", err);
      setError("Failed to load streaming links. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...links];

    // Apply billboard filter
    if (billboardFilter !== "all") {
      result = result.filter((link) => link.billboard_name === billboardFilter);
    }

    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (link) =>
          link.link.toLowerCase().includes(searchLower) ||
          link.billboard_name.toLowerCase().includes(searchLower)
      );
    }

    // Apply date filter (creation date)
    if (dateFilter.startDate) {
      const startDate = new Date(dateFilter.startDate);
      result = result.filter((link) => new Date(link.created_at) >= startDate);
    }

    if (dateFilter.endDate) {
      const endDate = new Date(dateFilter.endDate);
      endDate.setHours(23, 59, 59, 999); // End of the day
      result = result.filter((link) => new Date(link.created_at) <= endDate);
    }

    setFilteredLinks(result);
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
      setLinks((prevLinks) => prevLinks.filter((link) => link.id !== id));
      alert("Streaming link deleted successfully");
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

  const resetFilters = () => {
    setSearchTerm("");
    setDateFilter({
      startDate: "",
      endDate: "",
    });
    setBillboardFilter("all");
  };

  return (
    <>
      <PageMeta
        title="AIDA | Active Streaming Links"
        description="Manage active streaming links"
      />
      <PageBreadcrumb pageTitle="Active Streaming Links" />

      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
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
              Manage All Streaming Links
            </h3>
            <div className="mt-1 text-sm text-blue-700 dark:text-blue-400">
              <p>
                View and manage all streaming links across all billboards. All
                links are permanent until manually deleted.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Search Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by link or billboard"
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm 
                          border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
            />
          </div>

          {/* Billboard Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Billboard
            </label>
            <select
              value={billboardFilter}
              onChange={(e) => setBillboardFilter(e.target.value)}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm 
                          border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
            >
              <option value="all">All Billboards</option>
              <option value="A">Billboard A</option>
              <option value="B">Billboard B</option>
              <option value="C">Billboard C</option>
            </select>
          </div>

          {/* Date Range Filter - Start (Created After) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Created After
            </label>
            <input
              type="date"
              value={dateFilter.startDate}
              onChange={(e) =>
                setDateFilter({ ...dateFilter, startDate: e.target.value })
              }
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm 
                          border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
            />
          </div>

          {/* Date Range Filter - End (Created Before) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Created Before
            </label>
            <input
              type="date"
              value={dateFilter.endDate}
              onChange={(e) =>
                setDateFilter({ ...dateFilter, endDate: e.target.value })
              }
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm 
                          border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          <button
            onClick={resetFilters}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 
                        shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 
                        bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
          >
            Reset Filters
          </button>
          <button
            onClick={fetchLinks}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 
                        font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
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
            Refresh
          </button>
        </div>
      </div>

      {/* Links Table Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
            <button
              onClick={fetchLinks}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300 text-sm"
            >
              Try Again
            </button>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M15 15l-6-6m0 0l-6 6m6-6v12a6 6 0 0012 0v-3"
              />
            </svg>
            <p className="text-lg">No streaming links found</p>
            <p className="text-sm mt-1">
              {links.length > 0
                ? "Try adjusting your filters"
                : "Generate a new link from any billboard page"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Billboard
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Link
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Created On
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLinks.map((link) => (
                  <tr
                    key={link.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full">
                          {link.billboard_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <input
                          type="text"
                          readOnly
                          value={link.link}
                          className="block w-64 text-sm text-gray-900 dark:text-gray-200 truncate bg-transparent border-0 focus:ring-0"
                        />
                        <button
                          onClick={() => copyToClipboard(link.link)}
                          className="ml-2 p-1 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {link.created_at
                        ? formatCreatedTime(link.created_at)
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">
                        Permanent
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}