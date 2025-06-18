/* eslint-disable @typescript-eslint/no-explicit-any */

// interfaces.ts
// File ini berisi semua interface untuk tipe props komponen yang dibutuhkan

import jsPDF from "jspdf";

export interface TrafficData {
  timestamp: string;
  plastic_makro: number;
  plastic_meso: number;
  nonplastic_makro: number;
  nonplastic_meso: number;
}

export interface MQTTTrafficData {
  plastic_makro: number;
  plastic_meso: number;
  nonplastic_makro: number;
  nonplastic_meso: number;
}

// Extended interface for frontend calculations
export interface ExtendedTrafficData extends MQTTTrafficData {
  totalPlastic: number;
  totalNonPlastic: number;
  totalWastes: number;
}

// API response interface (if needed for manual save)
export interface SaveTrafficDataResponse {
  success: boolean;
  message?: string;
  data?: string;
}

export interface TrafficDataExtended extends TrafficData {
  id?: number;
  created_at?: string;
}

// Interface untuk kolom tabel PDF
export interface PdfTableColumn {
  header: string;
  dataKey: string;
}

// Interface untuk data-data laporan PDF
export interface PdfTableData {
  [key: string]: string | number;
}

export interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
    [key: string]: any;
  };
}