// interfaces.ts
// File ini berisi semua interface untuk tipe props komponen yang dibutuhkan

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
