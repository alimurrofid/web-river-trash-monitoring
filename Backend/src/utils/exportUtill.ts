// src/utils/exportUtils.ts
import ExcelJS from "exceljs";

/**
 * Generate CSV file from traffic data
 */
export function generateCsvFile(data: any[]): string {
  if (data.length === 0) {
    return 'No data available';
  }
  
  // Dapatkan header dari keys pada object pertama
  const headers = Object.keys(data[0]);
  
  // Buat string CSV
  let csvContent = headers.join(',') + '\n';
  
  // Tambahkan rows
  data.forEach(item => {
    const row = headers.map(header => {
      const value = item[header];
      
      // Format date menjadi ISO string jika nilai adalah Date
      if (value instanceof Date) {
        return `"${value.toISOString()}"`;
      }
      
      // Jika string, escape double quotes dan wrap dengan quotes
      if (typeof value === 'string') {
        return `"${value.replace(/"/g, '""')}"`;
      }
      
      return value;
    });
    
    csvContent += row.join(',') + '\n';
  });
  
  return csvContent;
}

/**
 * Generate Excel file from traffic data
 */
export async function generateExcelFile(data: any[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet();
  
  if (data.length === 0) {
    worksheet.addRow(['No data available']);
    return workbook.xlsx.writeBuffer() as Promise<Buffer>;
  }
  
  // Dapatkan header dari keys pada object pertama
  const headers = Object.keys(data[0]);
  
  // Tambahkan header ke worksheet
  worksheet.addRow(headers);
  
  // Format header (bold)
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD3D3D3' }
  };
  
  // Tambahkan data rows
  data.forEach(item => {
    const rowValues = headers.map(header => {
      const value = item[header];
      return value;
    });
    
    worksheet.addRow(rowValues);
  });
  
  // Format timestamp column jika ada
  const timestampIndex = headers.indexOf('timestamp');
  if (timestampIndex !== -1) {
    worksheet.getColumn(timestampIndex + 1).numFmt = 'yyyy-mm-dd hh:mm:ss';
  }
  
  // Auto-fit columns
  worksheet.columns.forEach(column => {
    column.width = 15;
  });
  
  // Hitung total
  const totalRow = worksheet.addRow([]);
  const totalLabelCell = totalRow.getCell(1);
  totalLabelCell.value = 'TOTAL';
  totalLabelCell.font = { bold: true };
  
  // Hitung total untuk setiap kolom angka
  headers.forEach((header, index) => {
    if (['plastic_makro', 'plastic_meso', 'nonplastic_makro', 'nonplastic_meso'].includes(header)) {
      const columnTotal = data.reduce((sum, item) => sum + (item[header] || 0), 0);
      totalRow.getCell(index + 1).value = columnTotal;
      totalRow.getCell(index + 1).font = { bold: true };
    }
  });
  
  // Tambahkan summary
  worksheet.addRow([]);
  
  const WasteTypes = [
    { name: 'Plastic', makro: 'plastic_makro', meso: 'plastic_meso' },
    { name: 'Nonplastic', makro: 'nonplastic_makro', meso: 'nonplastic_meso' }
  ];
  
  // Total per jenis sampah
  WasteTypes.forEach(type => {
    const makroIndex = headers.indexOf(type.makro);
    const mesoIndex = headers.indexOf(type.meso);
    
    if (makroIndex !== -1 && mesoIndex !== -1) {
      const totalMakro = data.reduce((sum, item) => sum + (item[type.makro] || 0), 0);
      const totalMeso = data.reduce((sum, item) => sum + (item[type.meso] || 0), 0);
      const total = totalMakro + totalMeso;
      
      worksheet.addRow([`Total ${type.name}`, total]);
      worksheet.addRow([`- Makro`, totalMakro]);
      worksheet.addRow([`- Meso`, totalMeso]);
    }
  });
  
  // Grand total
  const grandTotal = data.reduce((sum, item) => {
    let rowTotal = 0;
    WasteTypes.forEach(type => {
      rowTotal += (item[type.makro] || 0) + (item[type.meso] || 0);
    });
    return sum + rowTotal;
  }, 0);
  
  const grandTotalRow = worksheet.addRow(['GRAND TOTAL', grandTotal]);
  grandTotalRow.font = { bold: true };
  grandTotalRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFF2CC' }
  };
  
  // Return buffer
  return workbook.xlsx.writeBuffer() as Promise<Buffer>;
}