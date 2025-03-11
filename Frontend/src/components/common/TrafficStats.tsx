import useMQTT from "../../hooks/useMqtt";

const TrafficStats: React.FC = () => {
  const { car_down, car_up, motorcycle_down, motorcycle_up, truck_down, truck_up, bus_down, bus_up } =
    useMQTT();

  const stats = [
    { label: "Car Down", value: car_down, color: "bg-blue-500" },
    { label: "Car Up", value: car_up, color: "bg-green-500" },
    { label: "motorcycle Down", value: motorcycle_down, color: "bg-yellow-500" },
    { label: "motorcycle Up", value: motorcycle_up, color: "bg-purple-500" },
    { label: "Truck Down", value: truck_down, color: "bg-red-500" },
    { label: "Truck Up", value: truck_up, color: "bg-indigo-500" },
    { label: "Bus Down", value: bus_down, color: "bg-pink-500" },
    { label: "Bus Up", value: bus_up, color: "bg-gray-500" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg text-white text-center font-semibold ${stat.color}`}
        >
          <p className="text-sm">{stat.label}</p>
          <p className="text-xl">{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default TrafficStats;