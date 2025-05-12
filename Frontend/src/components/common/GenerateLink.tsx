import { useState } from "react";
import { useGenerateLink } from "../../hooks/useGenerateLink";
import { GenerateLinkProps } from "../../services/interface";

const GenerateLink: React.FC<GenerateLinkProps> = ({ billboardName }) => {
  const { generateLink, generatedLink, loading, error } = useGenerateLink();
  // Konversi billboardName ke id yang sesuai (contoh)
  const getBillboardId = (name: string): number => {
    switch (name) {
      case "A":
        return 1;
      case "B":
        return 2;
      case "C":
        return 3;
      default:
        return 1;
    }
  };

  const billboardId = getBillboardId(billboardName);
  const [duration, setDuration] = useState<number>(10);

  return (
    <div className="p-3 border rounded-lg">
      <h3 className="text-lg font-medium mb-3">
        Generate Link for Billboard {billboardName}
      </h3>
      <div className="mt-2">
        <label className="block">Duration (minutes):</label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="p-2 border rounded w-full"
        />
      </div>
      <button
        onClick={() => generateLink(billboardId, duration, billboardName)}
        className="mt-3 p-2 bg-blue-500 text-white rounded-lg w-full"
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate"}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {generatedLink && (
        <p className="mt-2 text-green-500">
          Link:{" "}
          <a
            href={`http://localhost:3000/api/streaming/${generatedLink}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {generatedLink}
          </a>
        </p>
      )}
    </div>
  );
};

export default GenerateLink;
