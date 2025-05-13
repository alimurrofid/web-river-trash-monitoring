import { useEffect, useState } from "react";
import { TrafficDashboardSummaryProps, TrafficDataExtended, TrafficStatistics } from "../../../services/interface";
import { getTrafficByDateRange } from "../../../services/api";

// Komponen Ringkasan Dashboard untuk menampilkan analitik singkat
const TrafficDashboardSummary: React.FC<TrafficDashboardSummaryProps> = ({
  billboardName,
  dateRange,
  timeRange,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<TrafficStatistics>({
    peakHour: "N/A",
    peakDay: "N/A",
    avgVehicles: 0,
    mostCommonType: "N/A",
    growthRate: 0,
  });

  // Dapatkan statistik analitik dari data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        const response = await getTrafficByDateRange(
          dateRange.startDate,
          dateRange.endDate,
          billboardName
        );

        if (response.success && response.data.length > 0) {
          // Filter data berdasarkan waktu jika perlu
          let filteredData = response.data;
          if (timeRange !== "all") {
            filteredData = filteredData.filter((item: TrafficDataExtended) => {
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

          if (filteredData.length > 0) {
            // Analisis jam tersibuk
            const hourCounts: Record<number, number> = {};
            filteredData.forEach((item: TrafficDataExtended) => {
              const hour = new Date(item.timestamp).getHours();
              const totalVehicles =
                item.motorcycle_up +
                item.motorcycle_down +
                item.car_up +
                item.car_down +
                item.big_vehicle_up +
                item.big_vehicle_down;

              if (!hourCounts[hour]) hourCounts[hour] = 0;
              hourCounts[hour] += totalVehicles;
            });

            let peakHour = 0;
            let maxHourCount = 0;
            for (const [hour, count] of Object.entries(hourCounts)) {
              if (count > maxHourCount) {
                maxHourCount = count;
                peakHour = parseInt(hour);
              }
            }

            // Analisis hari tersibuk
            const dayCounts: Record<string, number> = {};
            filteredData.forEach((item: TrafficDataExtended) => {
              const day = new Date(item.timestamp).toLocaleDateString(
                undefined,
                { weekday: "long" }
              );
              const totalVehicles =
                item.motorcycle_up +
                item.motorcycle_down +
                item.car_up +
                item.car_down +
                item.big_vehicle_up +
                item.big_vehicle_down;

              if (!dayCounts[day]) dayCounts[day] = 0;
              dayCounts[day] += totalVehicles;
            });

            let peakDay = "N/A";
            let maxDayCount = 0;
            for (const [day, count] of Object.entries(dayCounts)) {
              if (count > maxDayCount) {
                maxDayCount = count;
                peakDay = day;
              }
            }

            // Hitung rata-rata kendaraan per hari
            const uniqueDates = [
              ...new Set(
                filteredData.map((item: TrafficDataExtended) =>
                  new Date(item.timestamp).toLocaleDateString()
                )
              ),
            ];

            const totalVehicles = filteredData.reduce(
              (sum: number, item: TrafficDataExtended) =>
                sum +
                item.motorcycle_up +
                item.motorcycle_down +
                item.car_up +
                item.car_down +
                item.big_vehicle_up +
                item.big_vehicle_down,
              0
            );

            const avgVehicles =
              uniqueDates.length > 0
                ? Math.round(totalVehicles / uniqueDates.length)
                : 0;

            // Jenis kendaraan paling umum
            const vehicleTypes: Record<string, number> = {
              Mobil: filteredData.reduce(
                (sum: number, item: TrafficDataExtended) =>
                  sum + item.car_up + item.car_down,
                0
              ),
              Motor: filteredData.reduce(
                (sum: number, item: TrafficDataExtended) =>
                  sum + item.motorcycle_up + item.motorcycle_down,
                0
              ),
              "Kendaraan Besar": filteredData.reduce(
                (sum: number, item: TrafficDataExtended) =>
                  sum + item.big_vehicle_up + item.big_vehicle_down,
                0
              ),
            };

            let mostCommonType = "N/A";
            let maxTypeCount = 0;
            for (const [type, count] of Object.entries(vehicleTypes)) {
              if (count > maxTypeCount) {
                maxTypeCount = count;
                mostCommonType = type;
              }
            }

            // Hitung tingkat pertumbuhan (jika ada cukup data)
            let growthRate = 0;
            if (uniqueDates.length >= 2) {
              // Urutkan data berdasarkan tanggal
              const sortedData = [...filteredData].sort(
                (a: TrafficDataExtended, b: TrafficDataExtended) =>
                  new Date(a.timestamp).getTime() -
                  new Date(b.timestamp).getTime()
              );

              // Kelompokkan berdasarkan tanggal
              const dateGroups: Record<string, number> = {};
              sortedData.forEach((item: TrafficDataExtended) => {
                const date = new Date(item.timestamp).toLocaleDateString();
                if (!dateGroups[date]) {
                  dateGroups[date] = 0;
                }
                dateGroups[date] +=
                  item.motorcycle_up +
                  item.motorcycle_down +
                  item.car_up +
                  item.car_down +
                  item.big_vehicle_up +
                  item.big_vehicle_down;
              });

              // Konversi ke array dan urutkan
              const dateArray = Object.entries(dateGroups)
                .map(([date, count]) => ({ date, count }))
                .sort(
                  (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
                );

              // Ambil data awal dan akhir untuk menghitung pertumbuhan
              const firstDay = dateArray[0];
              const lastDay = dateArray[dateArray.length - 1];

              if (firstDay.count > 0) {
                growthRate = Math.round(
                  ((lastDay.count - firstDay.count) / firstDay.count) * 100
                );
              }
            }

            // Format jam puncak
            const formattedPeakHour = `${peakHour}:00 - ${peakHour + 1}:00`;

            // Update statistik
            setStats({
              peakHour: formattedPeakHour,
              peakDay,
              avgVehicles,
              mostCommonType,
              growthRate,
            });
          }
        }
      } catch (err) {
        console.error("Error calculating analytics:", err);
        setError("Failed to calculate analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [billboardName, dateRange, timeRange]);

  return (
    <div className="h-full">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-sm text-red-500 dark:text-red-400 h-64 flex items-center justify-center">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">
              Jam Tersibuk
            </p>
            <p className="text-xl font-bold text-gray-800 dark:text-white">
              {stats.peakHour}
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
            <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">
              Hari Tersibuk
            </p>
            <p className="text-xl font-bold text-gray-800 dark:text-white">
              {stats.peakDay}
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400 mb-1">
              Rata-rata/Hari
            </p>
            <p className="text-xl font-bold text-gray-800 dark:text-white">
              {stats.avgVehicles}
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
            <p className="text-sm text-amber-600 dark:text-amber-400 mb-1">
              Kendaraan Terbanyak
            </p>
            <p className="text-xl font-bold text-gray-800 dark:text-white">
              {stats.mostCommonType}
            </p>
          </div>

          <div className="col-span-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Pertumbuhan
            </p>
            <div className="flex items-center gap-2">
              <p
                className={`text-xl font-bold ${
                  stats.growthRate > 0
                    ? "text-green-600 dark:text-green-400"
                    : stats.growthRate < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {stats.growthRate > 0 ? "+" : ""}
                {stats.growthRate}%
              </p>
              {stats.growthRate !== 0 && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 ${
                    stats.growthRate > 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      stats.growthRate > 0
                        ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        : "M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"
                    }
                  />
                </svg>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {stats.growthRate > 0
                ? "Peningkatan"
                : stats.growthRate < 0
                ? "Penurunan"
                : "Tidak ada perubahan"}{" "}
              sejak awal periode
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrafficDashboardSummary;
