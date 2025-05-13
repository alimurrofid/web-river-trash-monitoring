/* eslint-disable @typescript-eslint/no-explicit-any */

// interfaces.ts
// File ini berisi semua interface untuk tipe props komponen yang dibutuhkan

import jsPDF from "jspdf";

export interface TrafficStatsProps {
  billboardName: string;
}

export interface GenerateLinkProps {
  billboardName: string;
}

export interface ValidLinkProps {
  billboardName: string;
}

export interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
}

// Define the shape of traffic data for API
export interface TrafficData {
  timestamp: string;
  billboard_name: string;
  motorcycle_down: number;
  motorcycle_up: number;
  car_down: number;
  car_up: number;
  big_vehicle_down: number;
  big_vehicle_up: number;
}

// Interface untuk data trafik dengan informasi tambahan dari database
export interface TrafficDataExtended extends TrafficData {
  id?: number;
  created_at?: string;
}

// Interface for location state when navigating between pages
export interface BillboardLocationState {
  billboard_name: string;
}

// Interface for streaming link
export interface StreamingLink {
  id: number;
  link: string;
  expired_at: string;
  billboard_name: string;
  id_traffic_billboard: number;
}


// Interface untuk respons API traffic
export interface TrafficAPIResponse {
  success: boolean;
  message?: string;
  data: TrafficDataExtended[];
  billboard?: string;
  startDate?: string;
  endDate?: string;
}

// Interface untuk props VehicleTypesChart
export interface VehicleTypesChartProps {
  data: {
    car: number;
    motorcycle: number;
    big_vehicle: number;
  };
}

// Interface untuk props TrafficTrendsChart
export interface TrafficTrendsChartProps {
  data: TrafficDataExtended[];
}

// Interface untuk props DirectionComparison
export interface DirectionComparisonProps {
  upCount: number;
  downCount: number;
}

// Interface untuk props TrafficTable
export interface TrafficTableProps {
  data: TrafficDataExtended[];
}

// Interface untuk props TrafficDashboardSummary
export interface TrafficDashboardSummaryProps {
  billboardName?: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  timeRange: string;
}

// Interface untuk date range dalam dashboard
export interface DateRangeType {
  startDate: string;
  endDate: string;
}

// Interface untuk statistik dalam TrafficDashboardSummary
export interface TrafficStatistics {
  peakHour: string;
  peakDay: string;
  avgVehicles: number;
  mostCommonType: string;
  growthRate: number;
}

// Interface untuk statistik dashboard utama
export interface DashboardStatistics {
  total_motorcycle: number;
  total_car: number;
  total_big_vehicle: number;
  total_up: number;
  total_down: number;
  total_all: number;
}

// Interface untuk data yang dikelompokkan berdasarkan tanggal
export interface GroupedTrafficData {
  date: string;
  car: number;
  motorcycle: number;
  big_vehicle: number;
  total: number;
}





// Interface untuk state filter di RecentOrders
export interface OrdersFilterState {
  startDate: string;
  endDate: string;
  billboardName: string;
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