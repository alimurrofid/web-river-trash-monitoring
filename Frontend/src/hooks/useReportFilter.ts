import { useState, useEffect } from "react";

export interface VehicleReport {
  id: number;
  tanggal: string;
  bike_down: number;
  bike_up: number;
  car_down: number;
  car_up: number;
  van_down: number;
  van_up: number;
}

interface UseReportFilterProps {
  data: VehicleReport[];
}

interface UseReportFilterReturn {
  filteredData: VehicleReport[];
  isFilterActive: boolean;
  startDate: Date | null;
  endDate: Date | null;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
  resetFilter: () => void;
}

/**
 * Custom hook untuk mengelola filter data berdasarkan rentang tanggal
 */
export function useReportFilter({
  data,
}: UseReportFilterProps): UseReportFilterReturn {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [filteredData, setFilteredData] = useState<VehicleReport[]>(data);
  const [isFilterActive, setIsFilterActive] = useState(false);

  // Proses filter data berdasarkan tanggal
  useEffect(() => {
    if (startDate && endDate) {
      const filtered = data.filter((item) => {
        const itemDate = new Date(item.tanggal);
        return itemDate >= startDate && itemDate <= endDate;
      });
      setFilteredData(filtered);
      setIsFilterActive(true);
    } else {
      setFilteredData(data);
      setIsFilterActive(false);
    }
  }, [startDate, endDate, data]);

  // Reset filter
  const resetFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setIsFilterActive(false);
    setFilteredData(data);
  };

  return {
    filteredData,
    isFilterActive,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    resetFilter,
  };
}