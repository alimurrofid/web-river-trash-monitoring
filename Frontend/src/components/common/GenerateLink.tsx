import { useState } from "react";
import { useGenerateLink } from "../../hooks/useGenerateLink";

const GenerateLink = () => {
  const { generateLink, generatedLink, loading, error } = useGenerateLink();
  const [billboardId, setBillboardId] = useState<number>(1);
  const [duration, setDuration] = useState<number>(10);

  return (
    <div className="p-3 border rounded-lg">
      {/* <h3 className="text-lg font-semibold">Generate Streaming Link</h3> */}
      <div className="mt-2">
        <label className="block">Billboard ID:</label>
        <input
          type="number"
          value={billboardId}
          onChange={(e) => setBillboardId(Number(e.target.value))}
          className="p-2 border rounded w-full"
        />
      </div>
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
        onClick={() => generateLink(billboardId, duration)}
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
            href={`http://localhost:5000/stream/${generatedLink}`}
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