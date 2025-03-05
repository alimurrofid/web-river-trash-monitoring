import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

const useHLS = (streamUrl: string) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [canPlayHLS, setCanPlayHLS] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const canPlayNatively = videoElement.canPlayType(
      "application/vnd.apple.mpegurl"
    );
    setCanPlayHLS(!!canPlayNatively);

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(videoElement);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoElement
          .play()
          .catch((error) => console.error("Error attempting to play", error));
      });

      return () => hls.destroy();
    } else if (canPlayNatively) {
      videoElement.src = streamUrl;
      videoElement.muted = true;
      videoElement.addEventListener("loadedmetadata", () => {
        videoElement
          .play()
          .catch((error) => console.error("Error attempting to play", error));
      });
    } else {
      console.error("Your browser doesn't support HLS");
    }
  }, [streamUrl]);

  return { videoRef, canPlayHLS };
};

export default useHLS;
