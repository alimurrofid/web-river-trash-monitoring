// src/utils/exportUtils.ts
import ExcelJS from "exceljs";
/**
 * Generate CSV file from traffic data
 */
export function generateCsvFile(data) {
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
export async function generateExcelFile(data, billboardName) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(billboardName ? `Billboard ${billboardName}` : 'All Billboards');
    if (data.length === 0) {
        worksheet.addRow(['No data available']);
        return workbook.xlsx.writeBuffer();
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
        fgColor: { argb: 'FFD3D3D3' } // Light gray
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
        if (['motorcycle_down', 'motorcycle_up', 'car_down', 'car_up', 'big_vehicle_down', 'big_vehicle_up'].includes(header)) {
            const columnTotal = data.reduce((sum, item) => sum + (item[header] || 0), 0);
            totalRow.getCell(index + 1).value = columnTotal;
            totalRow.getCell(index + 1).font = { bold: true };
        }
    });
    // Tambahkan summary
    worksheet.addRow([]);
    const vehicleTypes = [
        { name: 'Motorcycles', up: 'motorcycle_up', down: 'motorcycle_down' },
        { name: 'Cars', up: 'car_up', down: 'car_down' },
        { name: 'Big Vehicles', up: 'big_vehicle_up', down: 'big_vehicle_down' }
    ];
    // Total per jenis kendaraan
    vehicleTypes.forEach(type => {
        const upIndex = headers.indexOf(type.up);
        const downIndex = headers.indexOf(type.down);
        if (upIndex !== -1 && downIndex !== -1) {
            const totalUp = data.reduce((sum, item) => sum + (item[type.up] || 0), 0);
            const totalDown = data.reduce((sum, item) => sum + (item[type.down] || 0), 0);
            const total = totalUp + totalDown;
            worksheet.addRow([`Total ${type.name}`, total]);
            worksheet.addRow([`- Going Up`, totalUp]);
            worksheet.addRow([`- Going Down`, totalDown]);
        }
    });
    // Grand total
    const grandTotal = data.reduce((sum, item) => {
        let rowTotal = 0;
        vehicleTypes.forEach(type => {
            rowTotal += (item[type.up] || 0) + (item[type.down] || 0);
        });
        return sum + rowTotal;
    }, 0);
    const grandTotalRow = worksheet.addRow(['GRAND TOTAL', grandTotal]);
    grandTotalRow.font = { bold: true };
    grandTotalRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFF2CC' } // Light yellow
    };
    // Return buffer
    return workbook.xlsx.writeBuffer();
}
//# sourceMappingURL=exportUtill.js.map