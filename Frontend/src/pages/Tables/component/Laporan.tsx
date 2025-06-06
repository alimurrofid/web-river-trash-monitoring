
import { useEffect, useState } from "react";
import { JsPDFWithAutoTable, OrdersFilterState, PdfTableColumn, PdfTableData, TrafficDataExtended } from "../../../services/interface";
import { getTrafficByDateRange } from "../../../services/api";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";

const Laporan: React.FC = () => {
  // State untuk data dan loading
  const [data, setData] = useState<TrafficDataExtended[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);

  // State untuk filter
  const [filter, setFilter] = useState<OrdersFilterState>({
    startDate: getDateXDaysAgo(30), // Default ke 30 hari terakhir
    endDate: formatDate(new Date()),
    billboardName: "all",
  });

  // Fungsi untuk format tanggal
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

  // Fungsi untuk memformat timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fetch data berdasarkan filter
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getTrafficByDateRange(
          filter.startDate,
          filter.endDate,
          filter.billboardName === "all" ? undefined : filter.billboardName
        );

        if (response.success) {
          // Urutkan data dari yang terbaru
          const sortedData = [...response.data].sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setData(sortedData);
        } else {
          setError("Failed to load traffic data");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter]);

  // Handler untuk perubahan filter
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1); // Reset ke halaman pertama saat filter berubah
  };

  // Handler untuk reset filter
  const handleResetFilter = () => {
    setFilter({
      startDate: getDateXDaysAgo(30),
      endDate: formatDate(new Date()),
      billboardName: "all",
    });
    setCurrentPage(1);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Handler untuk ganti halaman
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Generate PDF report
  const generatePDF = () => {
    try {
      // Inisialisasi dokumen PDF dengan tipe yang benar
      const doc = new jsPDF("landscape", "mm", "a4") as JsPDFWithAutoTable;

      // Menambahkan judul
      const title = `Laporan Traffic Kendaraan${
        filter.billboardName !== "all"
          ? ` - Billboard ${filter.billboardName}`
          : ""
      }`;
      doc.setFontSize(16);
      doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, {
        align: "center",
      });

      // Menambahkan info filter
      doc.setFontSize(10);
      doc.text(
        `Periode: ${new Date(
          filter.startDate
        ).toLocaleDateString()} - ${new Date(
          filter.endDate
        ).toLocaleDateString()}`,
        doc.internal.pageSize.getWidth() / 2,
        22,
        { align: "center" }
      );

      // Menambahkan tanggal cetak
      doc.setFontSize(8);
      doc.text(
        `Dicetak pada: ${new Date().toLocaleString()}`,
        doc.internal.pageSize.getWidth() - 15,
        10,
        { align: "right" }
      );

      // Definisikan kolom tabel
      const columns: PdfTableColumn[] = [
        { header: "No", dataKey: "no" },
        { header: "Tanggal/Waktu", dataKey: "timestamp" },
        { header: "Billboard", dataKey: "billboard_name" },
        { header: "Motor (Naik)", dataKey: "motorcycle_up" },
        { header: "Motor (Turun)", dataKey: "motorcycle_down" },
        { header: "Mobil (Naik)", dataKey: "car_up" },
        { header: "Mobil (Turun)", dataKey: "car_down" },
        { header: "Kendaraan Besar (Naik)", dataKey: "big_vehicle_up" },
        { header: "Kendaraan Besar (Turun)", dataKey: "big_vehicle_down" },
        { header: "Total", dataKey: "total" },
      ];

      // Siapkan data untuk tabel
      const tableData: PdfTableData[] = data.map((item, index) => {
        const total =
          item.motorcycle_up +
          item.motorcycle_down +
          item.car_up +
          item.car_down +
          item.big_vehicle_up +
          item.big_vehicle_down;

        return {
          no: index + 1,
          timestamp: formatTimestamp(item.timestamp),
          billboard_name: item.billboard_name,
          motorcycle_up: item.motorcycle_up,
          motorcycle_down: item.motorcycle_down,
          car_up: item.car_up,
          car_down: item.car_down,
          big_vehicle_up: item.big_vehicle_up,
          big_vehicle_down: item.big_vehicle_down,
          total: total,
        };
      });

      // Tambahkan tabel dengan autoTable
      autoTable(doc, {
        startY: 30,
        head: [columns.map((col) => col.header)],
        body: tableData.map((item) => columns.map((col) => item[col.dataKey])),
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [59, 130, 246], // Warna header (biru)
          textColor: [255, 255, 255],
          halign: "center",
          valign: "middle",
        },
        columnStyles: {
          0: { cellWidth: 10 }, // No
          1: { cellWidth: 35 }, // Timestamp
        },
      });

      // Tambahkan ringkasan di bagian bawah
      const totalMotorcycle = data.reduce(
        (sum, item) => sum + item.motorcycle_up + item.motorcycle_down,
        0
      );
      const totalCar = data.reduce(
        (sum, item) => sum + item.car_up + item.car_down,
        0
      );
      const totalBigVehicle = data.reduce(
        (sum, item) => sum + item.big_vehicle_up + item.big_vehicle_down,
        0
      );
      const grandTotal = totalMotorcycle + totalCar + totalBigVehicle;

      // Gunakan tipe yang benar untuk lastAutoTable.finalY
      const lastY = doc.lastAutoTable.finalY + 10;

      doc.setFontSize(10);
      doc.text("Ringkasan:", 14, lastY);
      doc.text(`Total Motor: ${totalMotorcycle}`, 14, lastY + 5);
      doc.text(`Total Mobil: ${totalCar}`, 14, lastY + 10);
      doc.text(`Total Kendaraan Besar: ${totalBigVehicle}`, 14, lastY + 15);
      doc.text(`Total Seluruh Kendaraan: ${grandTotal}`, 14, lastY + 20);

      // Simpan dokumen PDF
      const fileName = `Laporan_Traffic_${
        filter.billboardName !== "all" ? filter.billboardName + "_" : ""
      }${filter.startDate}_${filter.endDate}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Gagal membuat file PDF. Silakan coba lagi.");
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white dark:bg-gray-800 px-5 pt-6 pb-2.5 shadow-default dark:border-gray-700 sm:px-7.5 xl:pb-1">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-black dark:text-white">
          Laporan Data Traffic
        </h3>
      </div>

      {/* Filter Controls */}
      <div className="mb-5 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Tanggal Mulai
          </label>
          <input
            type="date"
            name="startDate"
            value={filter.startDate}
            onChange={handleFilterChange}
            className="w-full rounded border-[1.5px] border-stroke dark:border-gray-600 bg-transparent dark:bg-gray-700 px-4 py-2 text-black dark:text-white outline-none transition focus:border-primary dark:focus:border-blue-500 active:border-primary disabled:cursor-default disabled:bg-whiter"
          />
        </div>

        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Tanggal Akhir
          </label>
          <input
            type="date"
            name="endDate"
            value={filter.endDate}
            onChange={handleFilterChange}
            className="w-full rounded border-[1.5px] border-stroke dark:border-gray-600 bg-transparent dark:bg-gray-700 px-4 py-2 text-black dark:text-white outline-none transition focus:border-primary dark:focus:border-blue-500 active:border-primary disabled:cursor-default disabled:bg-whiter"
          />
        </div>

        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Billboard
          </label>
          <select
            name="billboardName"
            value={filter.billboardName}
            onChange={handleFilterChange}
            className="w-full rounded border-[1.5px] border-stroke dark:border-gray-600 bg-transparent dark:bg-gray-700 px-4 py-2 text-black dark:text-white outline-none transition focus:border-primary dark:focus:border-blue-500 active:border-primary disabled:cursor-default disabled:bg-whiter"
          >
            <option value="all">Semua Billboard</option>
            <option value="A">Billboard A</option>
            <option value="B">Billboard B</option>
            <option value="C">Billboard C</option>
          </select>
        </div>

        <div className="flex items-end gap-2">
          <button
            onClick={handleResetFilter}
            className="inline-flex items-center justify-center rounded-md border border-stroke dark:border-gray-600 py-2 px-4 text-center font-medium text-black dark:text-white hover:bg-opacity-90 hover:bg-gray-50 dark:hover:bg-gray-700 lg:px-6 xl:px-7"
          >
            Reset
          </button>

          <button
            onClick={generatePDF}
            className="inline-flex items-center justify-center rounded-md border border-stroke dark:border-gray-600 py-2 px-4 text-center font-medium text-black dark:text-white hover:bg-opacity-90 hover:bg-gray-50 dark:hover:bg-gray-700 lg:px-6 xl:px-7"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Cetak PDF
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="max-w-full overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary dark:border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
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
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
              />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tidak ada data untuk ditampilkan
            </p>
          </div>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 text-left">
                <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                  No
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Tanggal/Waktu
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Billboard
                </th>
                <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                  Motor (Naik)
                </th>
                <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                  Motor (Turun)
                </th>
                <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                  Mobil (Naik)
                </th>
                <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                  Mobil (Turun)
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Kendaraan Besar (Naik)
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Kendaraan Besar (Turun)
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => {
                // Hitung total untuk baris ini
                const rowTotal =
                  item.motorcycle_up +
                  item.motorcycle_down +
                  item.car_up +
                  item.car_down +
                  item.big_vehicle_up +
                  item.big_vehicle_down;

                return (
                  <tr
                    key={index}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="py-3 px-4 text-black dark:text-white">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="py-3 px-4 text-black dark:text-white">
                      {formatTimestamp(item.timestamp)}
                    </td>
                    <td className="py-3 px-4 text-black dark:text-white">
                      {item.billboard_name}
                    </td>
                    <td className="py-3 px-4 text-black dark:text-white">
                      {item.motorcycle_up}
                    </td>
                    <td className="py-3 px-4 text-black dark:text-white">
                      {item.motorcycle_down}
                    </td>
                    <td className="py-3 px-4 text-black dark:text-white">
                      {item.car_up}
                    </td>
                    <td className="py-3 px-4 text-black dark:text-white">
                      {item.car_down}
                    </td>
                    <td className="py-3 px-4 text-black dark:text-white">
                      {item.big_vehicle_up}
                    </td>
                    <td className="py-3 px-4 text-black dark:text-white">
                      {item.big_vehicle_down}
                    </td>
                    <td className="py-3 px-4 font-medium text-black dark:text-white">
                      {rowTotal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && data.length > 0 && (
        <div className="flex justify-between items-center mt-4 mb-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Menampilkan {indexOfFirstItem + 1} -{" "}
            {Math.min(indexOfLastItem, data.length)} dari {data.length} entri
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              &laquo;
            </button>

            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              &lsaquo;
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;

              if (totalPages <= 5) {
                // If total pages is 5 or less, show all pages
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                // If current page is 1, 2, or 3, show pages 1-5
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                // If current page is near the end, show the last 5 pages
                pageNumber = totalPages - 4 + i;
              } else {
                // Otherwise show 2 pages before and 2 after current page
                pageNumber = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === pageNumber
                      ? "bg-primary dark:bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              &rsaquo;
            </button>

            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              &raquo;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Laporan;
  