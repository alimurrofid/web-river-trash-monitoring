/* eslint-disable @typescript-eslint/no-unused-vars */

import PageMeta from "../../components/common/PageMeta";

import { useEffect, useState } from "react";
import { DashboardStatistics, DateRangeType, TrafficDataExtended } from "../../services/interface";
import { getTrafficByDateRange } from "../../services/api";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import VehicleTypesChart from "./component/VehicleTypesChart";
import TrafficTrendsChart from "./component/TrafficTrendsChart";
import DirectionComparison from "./component/DirectionComparison";
import TrafficDashboardSummary from "./component/TrafficDashboardSummary";
import TrafficTable from "./component/TrafficTable";

const Dashboard: React.FC = () => {

  // State untuk filter
  const [selectedBillboard, setSelectedBillboard] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRangeType>({
    startDate: getDateXDaysAgo(7),
    endDate: formatDate(new Date()),
  });
  const [timeRange, setTimeRange] = useState<string>("all"); // 'all', 'morning', 'afternoon', 'evening', 'night'

  // State untuk data
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [trafficData, setTrafficData] = useState<TrafficDataExtended[]>([]);
  const [statistics, setStatistics] = useState<DashboardStatistics>({
    total_motorcycle: 0,
    total_car: 0,
    total_big_vehicle: 0,
    total_up: 0,
    total_down: 0,
    total_all: 0,
  });

  // Fungsi untuk menformat tanggal ke format YYYY-MM-DD
  function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Fungsi untuk mendapatkan tanggal X hari yang lalu
  function getDateXDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return formatDate(date);
  }

  // Fungsi untuk memfilter data berdasarkan rentang waktu
  function filterDataByTimeRange(
    data: TrafficDataExtended[]
  ): TrafficDataExtended[] {
    if (timeRange === "all") return data;

    return data.filter((item) => {
      const hour = new Date(item.timestamp).getHours();

      switch (timeRange) {
        case "morning": // 6:00 - 11:59
          return hour >= 6 && hour < 12;
        case "afternoon": // 12:00 - 17:59
          return hour >= 12 && hour < 18;
        case "evening": // 18:00 - 23:59
          return hour >= 18 && hour < 24;
        case "night": // 00:00 - 5:59
          return hour >= 0 && hour < 6;
        default:
          return true;
      }
    });
  }

  // Fungsi untuk menghitung statistik dari data
  function calculateStatistics(
    data: TrafficDataExtended[]
  ): DashboardStatistics {
    const stats: DashboardStatistics = {
      total_motorcycle: 0,
      total_car: 0,
      total_big_vehicle: 0,
      total_up: 0,
      total_down: 0,
      total_all: 0,
    };

    data.forEach((item) => {
      stats.total_motorcycle += item.motorcycle_down + item.motorcycle_up;
      stats.total_car += item.car_down + item.car_up;
      stats.total_big_vehicle += item.big_vehicle_down + item.big_vehicle_up;

      stats.total_up += item.motorcycle_up + item.car_up + item.big_vehicle_up;
      stats.total_down +=
        item.motorcycle_down + item.car_down + item.big_vehicle_down;
    });

    stats.total_all =
      stats.total_motorcycle + stats.total_car + stats.total_big_vehicle;

    return stats;
  }

  // Efek untuk memuat data ketika filter berubah
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Ambil data dari API berdasarkan filter
        const response = await getTrafficByDateRange(
          dateRange.startDate,
          dateRange.endDate,
          selectedBillboard === "all" ? undefined : selectedBillboard
        );

        if (response.success) {
          // Filter data berdasarkan rentang waktu
          const filteredData = filterDataByTimeRange(response.data);
          setTrafficData(filteredData);

          // Hitung statistik
          const stats = calculateStatistics(filteredData);
          setStatistics(stats);
        } else {
          setError("Failed to fetch traffic data");
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedBillboard, dateRange, timeRange]);

  // Handler untuk perubahan filter billboard
  const handleBillboardChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedBillboard(event.target.value);
  };

  // Handler untuk perubahan filter rentang tanggal
  const handleDateRangeChange = (preset: string) => {
    let startDate: string;
    const endDate = formatDate(new Date());

    switch (preset) {
      case "today":
        startDate = endDate;
        break;
      case "yesterday":
        startDate = getDateXDaysAgo(1);
        break;
      case "week":
        startDate = getDateXDaysAgo(7);
        break;
      case "month":
        startDate = getDateXDaysAgo(30);
        break;
      case "year":
        startDate = getDateXDaysAgo(365);
        break;
      default:
        startDate = getDateXDaysAgo(7);
    }

    setDateRange({ startDate, endDate });
  };

  // Handler untuk input tanggal kustom
  const handleCustomDateChange = (
    field: "startDate" | "endDate",
    value: string
  ) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handler untuk perubahan filter rentang waktu
  const handleTimeRangeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setTimeRange(event.target.value);
  };

  return (
    <>
      <PageMeta
        title="AIDA | Dashboard"
        description="Dashboard analitik untuk penghitungan kendaraan"
      />
      <PageBreadcrumb pageTitle="Dashboard Analitik" />

      {/* Panel Filter */}
      <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          {/* Filter Billboard */}
          <div className="flex-1">
            <label
              htmlFor="billboard-filter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Billboard
            </label>
            <select
              id="billboard-filter"
              value={selectedBillboard}
              onChange={handleBillboardChange}
              className="bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            >
              <option value="all">Semua Billboard</option>
              <option value="A">Billboard A</option>
              <option value="B">Billboard B</option>
              <option value="C">Billboard C</option>
            </select>
          </div>

          {/* Filter Rentang Waktu */}
          <div className="flex-1">
            <label
              htmlFor="time-filter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Waktu Hari
            </label>
            <select
              id="time-filter"
              value={timeRange}
              onChange={handleTimeRangeChange}
              className="bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            >
              <option value="all">Semua Waktu</option>
              <option value="morning">Pagi (06:00 - 11:59)</option>
              <option value="afternoon">Siang (12:00 - 17:59)</option>
              <option value="evening">Malam (18:00 - 23:59)</option>
              <option value="night">Dini Hari (00:00 - 05:59)</option>
            </select>
          </div>

          {/* Filter Preset Tanggal */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rentang Tanggal (Preset)
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleDateRangeChange("today")}
                className="px-3 py-1 text-xs font-medium rounded-md bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
              >
                Hari Ini
              </button>
              <button
                onClick={() => handleDateRangeChange("yesterday")}
                className="px-3 py-1 text-xs font-medium rounded-md bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
              >
                Kemarin
              </button>
              <button
                onClick={() => handleDateRangeChange("week")}
                className="px-3 py-1 text-xs font-medium rounded-md bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
              >
                7 Hari
              </button>
              <button
                onClick={() => handleDateRangeChange("month")}
                className="px-3 py-1 text-xs font-medium rounded-md bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
              >
                30 Hari
              </button>
              <button
                onClick={() => handleDateRangeChange("year")}
                className="px-3 py-1 text-xs font-medium rounded-md bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
              >
                1 Tahun
              </button>
            </div>
          </div>

          {/* Filter Tanggal Kustom */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rentang Tanggal (Kustom)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  handleCustomDateChange("startDate", e.target.value)
                }
                className="bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
              />
              <span className="text-gray-500 dark:text-gray-400">-</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  handleCustomDateChange("endDate", e.target.value)
                }
                className="bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
              />
            </div>
          </div>

          {/* Tombol Refresh */}
          <div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              title="Refresh data"
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
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <>
          {/* Statistik Ringkasan */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Kendaraan
              </p>
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
                {statistics.total_all}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Semua jenis kendaraan
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Mobil
              </p>
              <h3 className="text-3xl font-bold text-blue-500 mt-2">
                {statistics.total_car}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {statistics.total_all > 0
                  ? `${Math.round(
                      (statistics.total_car / statistics.total_all) * 100
                    )}% dari total`
                  : "0% dari total"}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Motor
              </p>
              <h3 className="text-3xl font-bold text-green-500 mt-2">
                {statistics.total_motorcycle}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {statistics.total_all > 0
                  ? `${Math.round(
                      (statistics.total_motorcycle / statistics.total_all) * 100
                    )}% dari total`
                  : "0% dari total"}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Kendaraan Besar
              </p>
              <h3 className="text-3xl font-bold text-purple-500 mt-2">
                {statistics.total_big_vehicle}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {statistics.total_all > 0
                  ? `${Math.round(
                      (statistics.total_big_vehicle / statistics.total_all) *
                        100
                    )}% dari total`
                  : "0% dari total"}
              </p>
            </div>
          </div>

          {/* Grafik dan Visualisasi */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Grafik Jenis Kendaraan */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                Distribusi Jenis Kendaraan
              </h3>
              <VehicleTypesChart
                data={{
                  car: statistics.total_car,
                  motorcycle: statistics.total_motorcycle,
                  big_vehicle: statistics.total_big_vehicle,
                }}
              />
            </div>

            {/* Grafik Tren Kendaraan */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                Tren Kendaraan per Hari
              </h3>
              <TrafficTrendsChart data={trafficData} />
            </div>

            {/* Perbandingan Arah */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                Perbandingan Arah
              </h3>
              <DirectionComparison
                upCount={statistics.total_up}
                downCount={statistics.total_down}
              />
            </div>

            {/* Ringkasan Data */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                Ringkasan Analitik
              </h3>
              <TrafficDashboardSummary
                billboardName={
                  selectedBillboard === "all" ? undefined : selectedBillboard
                }
                dateRange={{
                  startDate: dateRange.startDate,
                  endDate: dateRange.endDate,
                }}
                timeRange={timeRange}
              />
            </div>
          </div>

          {/* Tabel Data */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 mb-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
              Data Kendaraan
            </h3>
            <TrafficTable data={trafficData.slice(0, 10)} />

            {trafficData.length > 10 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    /* Implementasi untuk melihat semua data */
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                >
                  Lihat Semua Data
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Dashboard;