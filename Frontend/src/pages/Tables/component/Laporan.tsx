import { useEffect, useState } from "react";
import { JsPDFWithAutoTable, PdfTableColumn, PdfTableData, TrafficDataExtended } from "../../../services/interface";
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
  const [filter, setFilter] = useState({
    startDate: getDateXDaysAgo(30),
    endDate: formatDate(new Date()),
  });

  // Fungsi untuk format tanggal
  function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Fungsi untuk format tanggal Indonesia (DD/MM/YYYY)
  function formatDateIndonesia(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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
    // Fungsi untuk mendapatkan end date yang disesuaikan untuk API (tambah 1 hari)
    const getAPIEndDate = (endDate: string): string => {
      const date = new Date(endDate);
      date.setDate(date.getDate() + 1);
      return formatDate(date);
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Gunakan end date yang disesuaikan untuk API call
        const apiEndDate = getAPIEndDate(filter.endDate);
        const response = await getTrafficByDateRange(filter.startDate, apiEndDate);

        if (response.success) {
          // Urutkan data dari yang terbaru
          const sortedData = [...response.data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
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
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1);
  };

  // Handler untuk reset filter
  const handleResetFilter = () => {
    setFilter({
      startDate: getDateXDaysAgo(30),
      endDate: formatDate(new Date()),
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
      const title = `Laporan Traffic Sampah`;
      doc.setFontSize(16);
      doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, {
        align: "center",
      });

      // Menambahkan info filter dengan format tanggal Indonesia
      doc.setFontSize(10);
      doc.text(`Periode: ${formatDateIndonesia(new Date(filter.startDate))} - ${formatDateIndonesia(new Date(filter.endDate))}`, doc.internal.pageSize.getWidth() / 2, 22, { align: "center" });

      // Menambahkan tanggal cetak dengan format Indonesia
      doc.setFontSize(8);
      const currentDate = new Date();
      const formattedCurrentDate = `${formatDateIndonesia(currentDate)}, ${currentDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
      doc.text(`Dicetak pada: ${formattedCurrentDate}`, doc.internal.pageSize.getWidth() - 15, 10, { align: "right" });

      // Definisikan kolom tabel
      const columns: PdfTableColumn[] = [
        { header: "No", dataKey: "no" },
        { header: "Tanggal/Waktu", dataKey: "timestamp" },
        { header: "Plastic Makro", dataKey: "plastic_makro" },
        { header: "Plastic Meso", dataKey: "plastic_meso" },
        { header: "Non Plastic Makro", dataKey: "nonplastic_makro" },
        { header: "Non Plastic Meso", dataKey: "nonplastic_meso" },
        { header: "Total", dataKey: "total" },
      ];

      // Siapkan data untuk tabel
      const tableData: PdfTableData[] = data.map((item, index) => {
        const total = item.plastic_makro + item.plastic_meso + item.nonplastic_makro + item.nonplastic_meso;

        return {
          no: index + 1,
          timestamp: formatTimestamp(item.timestamp),
          plastic_makro: item.plastic_makro,
          plastic_meso: item.plastic_meso,
          nonplastic_makro: item.nonplastic_makro,
          nonplastic_meso: item.nonplastic_meso,
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
          halign: 'center', // Rata tengah untuk semua sel
          valign: 'middle',
        },
        headStyles: {
          fillColor: [59, 130, 246], // Warna header (biru)
          textColor: [255, 255, 255],
          halign: "center",
          valign: "middle",
          fontStyle: 'bold',
        },
        bodyStyles: {
          halign: 'center', // Rata tengah untuk body
          valign: 'middle',
        },
        columnStyles: {
          0: { halign: 'center' }, // No - rata tengah, auto width
          1: { halign: 'center' }, // Timestamp - rata tengah, auto width
          2: { halign: 'center' }, // Plastic Makro - rata tengah, auto width
          3: { halign: 'center' }, // Plastic Meso - rata tengah, auto width
          4: { halign: 'center' }, // Non Plastic Makro - rata tengah, auto width
          5: { halign: 'center' }, // Non Plastic Meso - rata tengah, auto width
          6: { halign: 'center', fontStyle: 'bold' }, // Total - bold, rata tengah, auto width
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245], // Warna abu-abu terang untuk baris selang-seling
        },
      });

      // Tambahkan ringkasan di bagian bawah
      const totalPlastic = data.reduce((sum, item) => sum + item.plastic_makro + item.plastic_meso, 0);
      const totalNonPlastic = data.reduce((sum, item) => sum + item.nonplastic_makro + item.nonplastic_meso, 0);
      const grandTotal = totalPlastic + totalNonPlastic;

      // Gunakan tipe yang benar untuk lastAutoTable.finalY
      const lastY = doc.lastAutoTable.finalY + 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", 'bold');
      doc.text("Ringkasan:", 14, lastY);
      doc.setFont("helvetica", 'normal');
      doc.text(`Total Plastic: ${totalPlastic}`, 14, lastY + 5);
      doc.text(`Total Non Plastic: ${totalNonPlastic}`, 14, lastY + 10);
      doc.setFont("helvetica", 'bold');
      doc.text(`Total Seluruh Sampah: ${grandTotal}`, 14, lastY + 20);

      // Simpan dokumen PDF
      const fileName = `Laporan_Traffic_${filter.startDate}_${filter.endDate}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Gagal membuat file PDF. Silakan coba lagi.");
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white dark:bg-gray-800 px-5 pt-6 pb-2.5 shadow-default dark:border-gray-700 sm:px-7.5 xl:pb-1">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-black dark:text-white">Laporan Data Traffic</h3>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col gap-4 mb-5 md:flex-row">
        <div className="flex-1">
          <label className="block mb-2 text-sm font-medium text-black dark:text-white">Tanggal Mulai</label>
          <input
            type="date"
            name="startDate"
            value={filter.startDate}
            onChange={handleFilterChange}
            className="w-full rounded border-[1.5px] border-stroke dark:border-gray-600 bg-transparent dark:bg-gray-700 px-4 py-2 text-black dark:text-white outline-none transition focus:border-primary dark:focus:border-blue-500 active:border-primary disabled:cursor-default disabled:bg-whiter"
          />
        </div>

        <div className="flex-1">
          <label className="block mb-2 text-sm font-medium text-black dark:text-white">Tanggal Akhir</label>
          <input
            type="date"
            name="endDate"
            value={filter.endDate}
            onChange={handleFilterChange}
            className="w-full rounded border-[1.5px] border-stroke dark:border-gray-600 bg-transparent dark:bg-gray-700 px-4 py-2 text-black dark:text-white outline-none transition focus:border-primary dark:focus:border-blue-500 active:border-primary disabled:cursor-default disabled:bg-whiter"
          />
        </div>

        <div className="flex items-end gap-2">
          <button
            onClick={handleResetFilter}
            className="inline-flex items-center justify-center px-4 py-2 font-medium text-center text-black border rounded-md border-stroke dark:border-gray-600 dark:text-white hover:bg-opacity-90 hover:bg-gray-50 dark:hover:bg-gray-700 lg:px-6 xl:px-7"
          >
            Reset
          </button>

          <button
            onClick={generatePDF}
            className="inline-flex items-center justify-center px-4 py-2 font-medium text-center text-black border rounded-md border-stroke dark:border-gray-600 dark:text-white hover:bg-opacity-90 hover:bg-gray-50 dark:hover:bg-gray-700 lg:px-6 xl:px-7"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Cetak PDF
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="max-w-full overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-10 h-10 border-t-2 border-b-2 rounded-full animate-spin border-primary dark:border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="relative px-4 py-3 text-red-700 border border-red-200 rounded bg-red-50 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-2 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tidak ada data untuk ditampilkan</p>
          </div>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left bg-gray-50 dark:bg-gray-700">
                <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">No</th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Tanggal/Waktu</th>
                <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">Plastic Makro</th>
                <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">Plastic Meso</th>
                <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">Non Plastic Makro</th>
                <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">Non Plastic Meso</th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">Total</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => {
                // Hitung total untuk baris ini
                const rowTotal = item.plastic_makro + item.plastic_meso + item.nonplastic_makro + item.nonplastic_meso;

                return (
                  <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-black dark:text-white">{indexOfFirstItem + index + 1}</td>
                    <td className="px-4 py-3 text-black dark:text-white">{formatTimestamp(item.timestamp)}</td>
                    <td className="px-4 py-3 text-black dark:text-white">{item.plastic_makro}</td>
                    <td className="px-4 py-3 text-black dark:text-white">{item.plastic_meso}</td>
                    <td className="px-4 py-3 text-black dark:text-white">{item.nonplastic_makro}</td>
                    <td className="px-4 py-3 text-black dark:text-white">{item.nonplastic_meso}</td>
                    <td className="px-4 py-3 font-medium text-black dark:text-white">{rowTotal}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && data.length > 0 && (
        <div className="flex items-center justify-between mt-4 mb-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, data.length)} dari {data.length} entri
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  : "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
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
                  : "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
              }`}
            >
              &lsaquo;
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;

              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === pageNumber
                      ? "bg-blue-500 dark:bg-blue-600 text-white border border-blue-500 dark:border-blue-600"
                      : "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
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
                  : "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
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
                  : "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
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