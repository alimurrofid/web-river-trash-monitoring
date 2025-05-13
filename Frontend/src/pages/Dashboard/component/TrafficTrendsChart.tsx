import { useMemo } from "react";
import Chart from "react-apexcharts";
import { GroupedTrafficData, TrafficDataExtended, TrafficTrendsChartProps } from "../../../services/interface";
import { ApexOptions } from "apexcharts";

// Komponen Grafik Tren Kendaraan
const TrafficTrendsChart: React.FC<TrafficTrendsChartProps> = ({ data }) => {
  // Fungsi untuk mengelompokkan data berdasarkan tanggal
  const groupDataByDate = (
    data: TrafficDataExtended[]
  ): GroupedTrafficData[] => {
    const groupedData: Record<string, GroupedTrafficData> = {};

    data.forEach((item) => {
      // Ekstrak tanggal dari timestamp (format YYYY-MM-DD)
      const date = item.timestamp.split("T")[0];

      if (!groupedData[date]) {
        groupedData[date] = {
          date,
          car: 0,
          motorcycle: 0,
          big_vehicle: 0,
          total: 0,
        };
      }

      // Jumlahkan data untuk tanggal ini
      groupedData[date].car += item.car_down + item.car_up;
      groupedData[date].motorcycle += item.motorcycle_down + item.motorcycle_up;
      groupedData[date].big_vehicle +=
        item.big_vehicle_down + item.big_vehicle_up;
      groupedData[date].total +=
        item.car_down +
        item.car_up +
        item.motorcycle_down +
        item.motorcycle_up +
        item.big_vehicle_down +
        item.big_vehicle_up;
    });

    // Konversi objek ke array dan urutkan berdasarkan tanggal
    return Object.values(groupedData).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  // Menyiapkan data untuk chart
  const chartData = useMemo(() => groupDataByDate(data), [data]);

  // Menyiapkan data series dan categories untuk ApexCharts
  const { series, categories } = useMemo(() => {
    const categories = chartData.map((item) => {
      // Format tanggal untuk ditampilkan sebagai kategori
      const date = new Date(item.date);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    });

    const series = [
      {
        name: "Mobil",
        data: chartData.map((item) => item.car),
      },
      {
        name: "Motor",
        data: chartData.map((item) => item.motorcycle),
      },
      {
        name: "Kendaraan Besar",
        data: chartData.map((item) => item.big_vehicle),
      },
    ];

    return { series, categories };
  }, [chartData]);

  // Konfigurasi chart options
  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 280,
      type: "area",
      toolbar: {
        show: false, // Sembunyikan toolbar
      },
      stacked: true,
    },
    colors: ["#3B82F6", "#10B981", "#8B5CF6"], // Biru, Hijau, Ungu
    dataLabels: {
      enabled: false, // Nonaktifkan label data
    },
    stroke: {
      curve: "smooth",
      width: [2, 2, 2],
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: {
        colors: ["#6B7280"],
      },
    },
    xaxis: {
      type: "category",
      categories: categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#6B7280",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
        formatter: (value) => {
          return Math.round(value).toString();
        },
      },
    },
    grid: {
      borderColor: "#E5E7EB",
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },
    tooltip: {
      y: {
        formatter: (value) => {
          return `${value} kendaraan`;
        },
      },
    },
  };

  return (
    <div className="h-64">
      {chartData.length > 0 ? (
        <div className="h-full">
          <Chart options={options} series={series} type="area" height="100%" />
        </div>
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
            Tidak ada data tren
          </p>
        </div>
      )}
    </div>
  );
};

export default TrafficTrendsChart;