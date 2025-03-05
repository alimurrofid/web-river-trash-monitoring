import {jsPDF} from 'jspdf';
import "jspdf-autotable";
import { format } from 'date-fns';
import { VehicleReport } from './useReportFilter';

interface UsePdfGeneratorProps {
  data: VehicleReport[];
  isFilterActive: boolean;
  startDate: Date | null;
  endDate: Date | null;
}

/**
 * Custom hook untuk menghasilkan PDF dari data laporan
 */
export function usePdfGenerator() {
  const generatePdf = ({
    data,
    isFilterActive,
    startDate,
    endDate,
  }: UsePdfGeneratorProps) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text("Laporan Kendaraan", 14, 15);

    // Filter info jika filter aktif
    if (isFilterActive && startDate && endDate) {
      doc.setFontSize(10);
      doc.text(
        `Periode: ${format(startDate, "dd/MM/yyyy")} - ${format(
          endDate,
          "dd/MM/yyyy"
        )}`,
        14,
        25
      );
    }

    // Generate tabel dengan autoTable
    // @ts-expect-error - jsPDF autotable tidak dikenal TypeScript tetapi berfungsi runtime
    doc.autoTable({
      startY: isFilterActive ? 30 : 25,
      head: [
        [
          "Tanggal",
          "Sepeda Motor Kebawah",
          "Sepeda Motor Keatas",
          "Mobil Kebawah",
          "Mobil Keatas",
          "Kendaraan Besar Kebawah",
          "Kendaraan Besar Keatas",
        ],
      ],
      body: data.map((row) => [
        row.tanggal,
        row.bike_down,
        row.bike_up,
        row.car_down,
        row.car_up,
        row.van_down,
        row.van_up,
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [66, 66, 66] },
    });

    doc.save("laporan-kendaraan.pdf");
  };

  return { generatePdf };
}