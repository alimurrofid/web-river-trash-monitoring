import Hls from "hls.js";
import useHLS from "../../../hooks/useHls";

interface FourIsToThreeProps {
  streamUrl?: string;
}

export default function FourIsToThree({
  streamUrl = "http://103.245.38.40/hls/test.m3u8",
}: FourIsToThreeProps) {
  const { videoRef, canPlayHLS } = useHLS(streamUrl);

  return (
    <div className="aspect-4/3 overflow-hidden rounded-lg bg-gray-100">
      {!canPlayHLS && !Hls.isSupported() ? (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-gray-600">
            Your browser doesn't support HLS streaming
          </p>
        </div>
      ) : (
        <video
          ref={videoRef}
          className="w-full h-full"
          controls
          playsInline
          autoPlay
          muted
        />
      )}
    </div>
  );
}