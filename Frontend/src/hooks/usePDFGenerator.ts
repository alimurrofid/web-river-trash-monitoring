import {jsPDF} from 'jspdf';
import "jspdf-autotable";
import { format } from 'date-fns';
import { WasteReport } from './useReportFilter';

interface UsePdfGeneratorProps {
  data: WasteReport[];
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
          "Plastic Makro",
          "Plastic Meso",
          "Non Plastic Makro",
          "Non Plastic Meso",
        ],
      ],
      body: data.map((row) => [
        row.tanggal,
        row.plastic_makro,
        row.plastic_meso,
        row.nonplastic_makro,
        row.nonplastic_meso
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [66, 66, 66] },
    });

    doc.save("laporan-sampah.pdf");
  };

  return { generatePdf };
}