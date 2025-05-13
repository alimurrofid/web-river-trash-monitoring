import { VehicleTypesChartProps } from "../../../services/interface";

// Komponen Grafik Jenis Kendaraan menggunakan chart batang sederhana
const VehicleTypesChart: React.FC<VehicleTypesChartProps> = ({ data }) => {
  const { car, motorcycle, big_vehicle } = data;
  const total = car + motorcycle + big_vehicle;

  // Menghitung persentase untuk setiap jenis kendaraan
  const carPercent = total > 0 ? (car / total) * 100 : 0;
  const motorcyclePercent = total > 0 ? (motorcycle / total) * 100 : 0;
  const bigVehiclePercent = total > 0 ? (big_vehicle / total) * 100 : 0;

  // Data untuk chart dalam format array
  const chartData = [
    { type: "Mobil", count: car, percent: carPercent, color: "bg-blue-500" },
    {
      type: "Motor",
      count: motorcycle,
      percent: motorcyclePercent,
      color: "bg-green-500",
    },
    {
      type: "Kendaraan Besar",
      count: big_vehicle,
      percent: bigVehiclePercent,
      color: "bg-purple-500",
    },
  ];

  // Urutkan data dari yang terbesar ke terkecil
  chartData.sort((a, b) => b.count - a.count);

  return (
    <div className="h-64 flex flex-col justify-center">
      {total > 0 ? (
        <>
          <div className="space-y-4">
            {chartData.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.type}
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.count} ({Math.round(item.percent)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className={`${item.color} h-2.5 rounded-full`}
                    style={{ width: `${item.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Legenda */}
          <div className="flex justify-center items-center mt-6 gap-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Mobil
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Motor
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Kendaraan Besar
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tidak ada data kendaraan
          </p>
        </div>
      )}
    </div>
  );
};

export default VehicleTypesChart;
