import Hls from "hls.js";
import useHLS from "../../../hooks/useHls";

interface FourIsToThreeProps {
  streamUrl?: string;
}

const HLS_STREAM_URL = import.meta.env.VITE_HLS_STREAM_URL;

if (!HLS_STREAM_URL) {
  throw new Error("VITE_HLS_STREAM_URL is not defined in .env");
}

export default function FourIsToThree({ streamUrl = HLS_STREAM_URL }: FourIsToThreeProps) {
  const { videoRef, canPlayHLS } = useHLS(streamUrl);

  return (
    <div className="overflow-hidden bg-gray-100 rounded-lg aspect-video">
      {!canPlayHLS && !Hls.isSupported() ? (
        <div className="flex items-center justify-center w-full h-full">
          <p className="text-gray-600">Your browser doesn't support HLS streaming</p>
        </div>
      ) : (
        <video ref={videoRef} className="w-full h-full" controls playsInline autoPlay muted />
      )}
    </div>
  );
}
