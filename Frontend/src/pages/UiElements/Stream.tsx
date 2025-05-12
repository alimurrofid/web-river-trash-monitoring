import ComponentCard from "../../components/common/ComponentCard";
import TrafficStats from "../../components/common/TrafficStats";
import FourIsToThree from "../../components/ui/videos/FourIsToThree";


export default function StreamingPage() {
  // const { streamId } = useParams();
  // const { videoRef, canPlayHLS } = useHLS("http://103.245.38.40/hls/test.m3u8");
  // return (
  //   <div className="grid grid-cols-1 gap-5 sm:gap-6 xl:grid-cols-2">
  //     <h2 className="text-xl font-bold">Streaming Video</h2>
  //     {/* <p>Streaming ID: {streamId}</p> */}
  //     {!canPlayHLS && !Hls.isSupported() ? (
  //       <div className="w-full h-full flex items-center justify-center">
  //         <p className="text-gray-600">
  //           Your browser doesn't support HLS streaming
  //         </p>
  //       </div>
  //     ) : (
  //       <video
  //         ref={videoRef}
  //         className="w-full h-full"
  //         controls
  //         playsInline
  //         autoPlay
  //         muted
  //       />
  //     )}
  //   </div>
  // );
  return (
    <div className="pt-8 mt-6 px-6 mx-4 grid grid-cols-1 gap-5 sm:gap-6 xl:grid-cols-2">
      <div className="space-y-5 sm:space-y-6">
        <FourIsToThree />
      </div>
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title="Perhitungan kendaraan">
          <TrafficStats billboardName={""} />
        </ComponentCard>

      </div>
    </div>
  );
}
