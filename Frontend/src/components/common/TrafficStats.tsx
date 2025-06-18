import React, { useState } from "react";
import useMQTT from "../../hooks/useMqtt";

const TrafficStats: React.FC = () => {
  // Gunakan MQTT hook yang telah diperbaiki untuk mendapatkan data real-time
  const {
    plastic_makro,
    plastic_meso,
    nonplastic_makro,
    nonplastic_meso,
    totalPlastic,
    totalNonPlastic,
    totalWastes,
    timeUntilReset,
  } = useMQTT();

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

  // Data statistik untuk ditampilkan di grid
  const stats = [
    { 
      label: "Plastic Makro", 
      value: plastic_makro, 
      color: "bg-blue-500 hover:bg-blue-600",
      icon: "🔵"
    },
    { 
      label: "Plastic Meso", 
      value: plastic_meso, 
      color: "bg-cyan-500 hover:bg-cyan-600",
      icon: "🔷"
    },
    { 
      label: "Non Plastic Makro", 
      value: nonplastic_makro, 
      color: "bg-green-500 hover:bg-green-600",
      icon: "🟢"
    },
    { 
      label: "Non Plastic Meso", 
      value: nonplastic_meso, 
      color: "bg-emerald-500 hover:bg-emerald-600",
      icon: "💚"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            Statistik Sampah
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center px-3 py-2 text-xs font-medium text-blue-800 bg-blue-100 rounded-lg shadow-sm dark:bg-blue-900/30 dark:text-blue-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 mr-2"
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
              Reset otomatis dalam: {formatTimeUntilReset()}
            </div>
          </div>
        </div>

        {resetMessage && (
          <div
            className={`mb-4 p-3 text-sm rounded-lg shadow-sm ${
              resetMessage.type === "success"
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800"
            }`}
          >
            {resetMessage.text}
          </div>
        )}

        <p className="text-sm text-gray-600 dark:text-gray-400">
          Data diterima secara real-time dari kamera dan disimpan ke database setiap jam.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
        {/* Total Sampah */}
        <div className="p-6 text-center text-white shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
          <div className="flex items-center justify-center mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 mr-2"
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
          </div>
          <p className="mb-1 text-sm font-medium opacity-90">Total Sampah</p>
          <p className="text-3xl font-bold">{totalWastes}</p>
          <p className="mt-1 text-xs opacity-75">Keseluruhan Terdeteksi</p>
        </div>

        {/* Total Plastic */}
        <div className="p-6 text-center text-white shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
          <div className="flex items-center justify-center mb-2">
            <span className="text-2xl">♻️</span>
          </div>
          <p className="mb-1 text-sm font-medium opacity-90">Total Plastik</p>
          <p className="text-3xl font-bold">{totalPlastic}</p>
          <p className="mt-1 text-xs opacity-75">Makro + Meso</p>
        </div>

        {/* Total Non-Plastic */}
        <div className="p-6 text-center text-white shadow-lg bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
          <div className="flex items-center justify-center mb-2">
            <span className="text-2xl">🌱</span>
          </div>
          <p className="mb-1 text-sm font-medium opacity-90">Total Non-Plastik</p>
          <p className="text-3xl font-bold">{totalNonPlastic}</p>
          <p className="mt-1 text-xs opacity-75">Makro + Meso</p>
        </div>
      </div>

      {/* Detail Stats Grid */}
      <div className="p-6 bg-white shadow-lg dark:bg-slate-800 rounded-xl">
        <h4 className="flex items-center mb-4 text-lg font-semibold text-gray-800 dark:text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 mr-2 text-blue-500"
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
          Detail Berdasarkan Kategori
        </h4>
        
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`${stat.color} p-4 rounded-lg text-white text-center shadow-md transform transition-all duration-200 hover:scale-105 cursor-pointer`}
            >
              <div className="mb-2 text-2xl">{stat.icon}</div>
              <p className="mb-2 text-sm font-medium opacity-90">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
              <div className="h-1 mt-2 rounded-full bg-white/20">
                <div 
                  className="h-1 transition-all duration-300 bg-white rounded-full" 
                  style={{ 
                    width: totalWastes > 0 ? `${(stat.value / totalWastes) * 100}%` : '0%' 
                  }}
                ></div>
              </div>
              <p className="mt-1 text-xs opacity-75">
                {totalWastes > 0 ? `${((stat.value / totalWastes) * 100).toFixed(1)}%` : '0%'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Info Panel */}
      <div className="p-4 border border-gray-200 bg-gray-50 dark:bg-slate-700/50 rounded-xl dark:border-slate-600">
        <div className="flex items-start">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0 w-6 h-6 mr-3 text-blue-500 mt-0.5"
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
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="mb-2 font-medium">Informasi Data:</p>
            <ul className="space-y-1 text-xs">
              <li>• Data di atas adalah statistik real-time kumulatif dari sistem kamera</li>
              <li>• Sistem menghitung selisih data setiap jam dan menyimpannya ke database</li>
              <li>• <strong>Makro:</strong> Sampah berukuran besar yang mudah terdeteksi</li>
              <li>• <strong>Meso:</strong> Sampah berukuran sedang hingga kecil</li>
              <li>• Total plastik dan non-plastik dihitung otomatis dari makro + meso</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficStats;