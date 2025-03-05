import useMQTT from "../../hooks/useMqtt";

const TrafficStats: React.FC = () => {
  const { going_down, going_up, bike_down, bike_up, truck_down, truck_up } =
    useMQTT();

  const stats = [
    { label: "Car Down", value: going_down, color: "bg-blue-500" },
    { label: "Car Up", value: going_up, color: "bg-green-500" },
    { label: "Bike Down", value: bike_down, color: "bg-yellow-500" },
    { label: "Bike Up", value: bike_up, color: "bg-purple-500" },
    { label: "Truck Down", value: truck_down, color: "bg-red-500" },
    { label: "Truck Up", value: truck_up, color: "bg-indigo-500" },
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