import { DirectionComparisonProps } from "../../../services/interface";

// Komponen Perbandingan Arah Kendaraan (Up vs Down)
const DirectionComparison: React.FC<DirectionComparisonProps> = ({
  upCount,
  downCount,
}) => {
  const total = upCount + downCount;

  // Menghitung persentase
  const upPercent = total > 0 ? (upCount / total) * 100 : 0;
  const downPercent = total > 0 ? (downCount / total) * 100 : 0;

  return (
    <div className="h-64 flex flex-col justify-center">
      {total > 0 ? (
        <>
          <div className="flex flex-col items-center mb-6">
            <div className="w-full max-w-sm h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="flex h-full">
                <div
                  className="bg-green-500 h-full"
                  style={{ width: `${upPercent}%` }}
                ></div>
                <div
                  className="bg-amber-500 h-full"
                  style={{ width: `${downPercent}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-between w-full max-w-sm mt-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round(upPercent)}%
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round(downPercent)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800 text-center">
              <div className="flex items-center justify-center mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-800 dark:text-white">
                Arah Naik
              </h4>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                {upCount}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Kendaraan
              </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800 text-center">
              <div className="flex items-center justify-center mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-amber-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-800 dark:text-white">
                Arah Turun
              </h4>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
                {downCount}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Kendaraan
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tidak ada data arah
          </p>
        </div>
      )}
    </div>
  );
};

export default DirectionComparison;
