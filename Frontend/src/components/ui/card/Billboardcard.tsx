
import { useNavigate } from "react-router-dom";
import PageMeta from "../../common/PageMeta";
import PageBreadcrumb from "../../common/PageBreadCrumb";
import { useEffect, useState } from "react";
import { getTrafficByBillboard } from "../../../services/api";


interface BillboardCardProps {
  name: string;
  description: string;
  lastUpdate: string;
  vehicleCount: number;
  onClick: () => void;
}

interface TrafficData {
  id: number;
  timestamp: string;
  billboard_name: string;
  created_at: string;
  motorcycle_down: number;
  motorcycle_up: number;
  car_down: number;
  car_up: number;
  big_vehicle_down: number;
  big_vehicle_up: number;
}

const BillboardCard: React.FC<BillboardCardProps> = ({
  name,
  description,
  lastUpdate,
  vehicleCount,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 cursor-pointer 
                hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-slate-700"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Billboard {name}
        </h3>
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>

      <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Total Vehicles
          </span>
          <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
            {vehicleCount}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2.5">
          <div
            className="bg-blue-500 h-2.5 rounded-full"
            style={{ width: `${Math.min(100, (vehicleCount / 1000) * 100)}%` }}
          ></div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {lastUpdate}
        </span>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 
                    transition-colors duration-300 text-sm font-medium"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default function BillboardCards(): React.ReactElement {
  const navigate = useNavigate();
  const billboardNames = ["A", "B", "C"];
  const [billboardData, setBillboardData] = useState<
    Record<string, TrafficData | null>
  >({
    A: null,
    B: null,
    C: null,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBillboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch data for each billboard
        const promises = billboardNames.map(async (name) => {
          try {
            const response = await getTrafficByBillboard(name, 1); // Get only 1 most recent record
            if (response.success && response.data && response.data.length > 0) {
              return { name, data: response.data[0] };
            }
            return { name, data: null };
          } catch (err) {
            console.error(`Error fetching data for billboard ${name}:`, err);
            return { name, data: null };
          }
        });

        const results = await Promise.all(promises);

        // Update state with fetched data
        const newBillboardData = { ...billboardData };
        results.forEach((result) => {
          newBillboardData[result.name] = result.data;
        });

        setBillboardData(newBillboardData);
      } catch (err) {
        console.error("Failed to fetch billboard data:", err);
        setError("Failed to load billboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBillboardData();
  }, []);

  const handleCardClick = (billboardName: string): void => {
    // Navigate to the Videos page with the selected billboard name
    navigate("/videos", { state: { billboard_name: billboardName } });
  };

  const formatLastUpdate = (timestamp: string | undefined): string => {
    if (!timestamp) return "No data yet";

    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    }
  };

  const calculateTotalVehicles = (data: TrafficData | null): number => {
    if (!data) return 0;

    return (
      data.motorcycle_down +
      data.motorcycle_up +
      data.car_down +
      data.car_up +
      data.big_vehicle_down +
      data.big_vehicle_up
    );
  };

  if (loading) {
    return (
      <>
        <PageMeta
          title="AIDA | Billboards"
          description="AIDA Billboards Selection"
        />
        <PageBreadcrumb pageTitle="Billboards" />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageMeta
          title="AIDA | Billboards"
          description="AIDA Billboards Selection"
        />
        <PageBreadcrumb pageTitle="Billboards" />
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300 text-sm font-medium"
        >
          Refresh Page
        </button>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title="AIDA | Billboards"
        description="AIDA Billboards Selection"
      />
      <PageBreadcrumb pageTitle="Billboards" />

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
              Vehicle Counting System
            </h3>
            <div className="mt-1 text-sm text-blue-700 dark:text-blue-400">
              <p>
                Select a billboard to view live traffic data. The system
                automatically records and saves data every hour.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <BillboardCard
          name="A"
          description="Traffic monitoring at location A. View real-time data and analytics for this billboard."
          lastUpdate={formatLastUpdate(billboardData.A?.created_at)}
          vehicleCount={calculateTotalVehicles(billboardData.A)}
          onClick={() => handleCardClick("A")}
        />
        <BillboardCard
          name="B"
          description="Traffic monitoring at location B. View real-time data and analytics for this billboard."
          lastUpdate={formatLastUpdate(billboardData.B?.created_at)}
          vehicleCount={calculateTotalVehicles(billboardData.B)}
          onClick={() => handleCardClick("B")}
        />
        <BillboardCard
          name="C"
          description="Traffic monitoring at location C. View real-time data and analytics for this billboard."
          lastUpdate={formatLastUpdate(billboardData.C?.created_at)}
          vehicleCount={calculateTotalVehicles(billboardData.C)}
          onClick={() => handleCardClick("C")}
        />
      </div>
    </>
  );
}