import React, { useState } from "react";
import useMQTT from "../../hooks/useMqtt";
import { TrafficStatsProps } from "../../services/interface";

const TrafficStats: React.FC<TrafficStatsProps> = ({ billboardName }) => {
  // Gunakan MQTT hook yang telah diperbaiki untuk mendapatkan data real-time
  const {
    car_down,
    car_up,
    motorcycle_down,
    motorcycle_up,
    big_vehicle_down,
    big_vehicle_up,
    timeUntilReset,
  } = useMQTT(billboardName);

  // State untuk menangani pesan reset manual
  const [resetMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Format waktu hingga reset berikutnya menjadi format yang mudah dibaca
  const formatTimeUntilReset = (): string => {
    const minutes = Math.floor(timeUntilReset / 60000);
    const seconds = Math.floor((timeUntilReset % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  // // Menangani pengiriman data manual
  // const handleManualSubmit = async () => {
  //   try {
  //     setResetMessage(null);

  //     const success = await resetData();

  //     if (success) {
  //       setResetMessage({
  //         type: "success",
  //         text: "Data berhasil disimpan ke database.",
  //       });
  //     } else {
  //       setResetMessage({
  //         type: "error",
  //         text: "Gagal menyimpan data. Silakan coba lagi.",
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error saat simpan manual:", error);
  //     setResetMessage({
  //       type: "error",
  //       text: "Terjadi error saat mengirim data.",
  //     });
  //   }

  //   // Hapus pesan setelah 5 detik
  //   setTimeout(() => {
  //     setResetMessage(null);
  //   }, 5000);
  // };

  // Hitung total kendaraan
  const totalDown = car_down + motorcycle_down + big_vehicle_down;
  const totalUp = car_up + motorcycle_up + big_vehicle_up;
  const totalVehicles = totalDown + totalUp;

  // Hitung persentase (hindari pembagian dengan nol)
  const percentUp = totalVehicles > 0 ? (totalUp / totalVehicles) * 100 : 0;
  const percentDown = totalVehicles > 0 ? (totalDown / totalVehicles) * 100 : 0;

  // Data untuk grafik jenis kendaraan
  const vehicleTypes = [
    { type: "Cars", value: car_down + car_up, color: "bg-blue-500" },
    {
      type: "Motorcycles",
      value: motorcycle_down + motorcycle_up,
      color: "bg-green-500",
    },
    {
      type: "Big Vehicles",
      value: big_vehicle_down + big_vehicle_up,
      color: "bg-yellow-500",
    },
  ];

  // Urutkan berdasarkan jumlah tertinggi
  vehicleTypes.sort((a, b) => b.value - a.value);

  // Data statistik untuk ditampilkan di grid
  const stats = [
    { label: "Car Down", value: car_down, color: "bg-blue-500" },
    { label: "Car Up", value: car_up, color: "bg-green-500" },
    {
      label: "Motorcycle Down",
      value: motorcycle_down,
      color: "bg-yellow-500",
    },
    { label: "Motorcycle Up", value: motorcycle_up, color: "bg-purple-500" },
    {
      label: "Big Vehicle Down",
      value: big_vehicle_down,
      color: "bg-red-500",
    },
    {
      label: "Big Vehicle Up",
      value: big_vehicle_up,
      color: "bg-indigo-500",
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">
            Statistik Trafik untuk Billboard {billboardName}
          </h3>
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium px-2.5 py-1 rounded flex items-center">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Pengiriman otomatis dalam: {formatTimeUntilReset()}
            </div>
            {/* <button
              onClick={handleManualSubmit}
              disabled={isResetting}
              className={`flex items-center px-3 py-1 text-xs font-medium rounded ${
                isResetting
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
                  : "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              }`}
            >
              {isResetting ? (
                <>
                  <svg
                    className="animate-spin mr-1 h-4 w-4 text-white"
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
                  Sedang Memproses...
                </>
              ) : (
                <>
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
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                    />
                  </svg>
                  Simpan Data Sekarang
                </>
              )}
            </button> */}
          </div>
        </div>

        {resetMessage && (
          <div
            className={`mb-3 p-2 text-sm rounded-md ${
              resetMessage.type === "success"
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
            }`}
          >
            {resetMessage.text}
          </div>
        )}

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Data diterima secara real-time dari kamera dan disimpan ke database
          setiap jam.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-100 dark:bg-slate-700 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Kendaraan Terdeteksi
          </p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {totalVehicles}
          </p>

          <div className="mt-2">
            <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2.5 mb-1">
              <div className="flex">
                <div
                  className="bg-green-500 h-2.5 rounded-l-full"
                  style={{ width: `${percentUp}%` }}
                ></div>
                <div
                  className="bg-amber-500 h-2.5 rounded-r-full"
                  style={{ width: `${percentDown}%` }}
                ></div>
              </div>
            </div>
            <div className="flex text-xs justify-between">
              <span className="text-green-600 dark:text-green-400">
                Naik: {totalUp} ({Math.round(percentUp)}%)
              </span>
              <span className="text-amber-600 dark:text-amber-400">
                Turun: {totalDown} ({Math.round(percentDown)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 col-span-2">
          <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
            Jenis Kendaraan
          </p>
          <div className="grid grid-cols-3 gap-3">
            {vehicleTypes.map((item, index) => (
              <div key={index} className="text-center">
                <div className="mb-1">
                  <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full`}
                      style={{
                        width: `${
                          totalVehicles > 0
                            ? (item.value / totalVehicles) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <p className="text-xs text-gray-800 dark:text-gray-300">
                  {item.type}
                </p>
                <p className="text-sm font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg text-white text-center ${stat.color}`}
          >
            <p className="text-sm font-medium mb-1">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-start">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            Data di atas adalah data real-time kumulatif dari kamera. Setiap
            jam, sistem akan menghitung selisih data sejak terakhir disimpan dan
            menyimpannya ke database. Big Vehicle adalah gabungan dari kendaraan
            jenis truck dan bus.
          </span>
        </div>
      </div>
    </div>
  );
};

export default TrafficStats;