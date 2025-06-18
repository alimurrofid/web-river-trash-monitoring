import { useState, useEffect } from "react";

export interface WasteReport {
  id: number;
  tanggal: string;
  plastic_makro: number;
  plastic_meso: number;
  nonplastic_makro: number;
  nonplastic_meso: number;
}

interface UseReportFilterProps {
  data: WasteReport[];
}

interface UseReportFilterReturn {
  filteredData: WasteReport[];
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
  const [filteredData, setFilteredData] = useState<WasteReport[]>(data);
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