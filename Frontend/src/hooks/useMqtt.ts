import { useEffect, useState } from "react";
import mqtt from "mqtt";

const MQTT_BROKER_URL = "ws://103.245.38.40:9001/mqtt";
const TOPIC = "vehicle/interactions";

interface TrafficData {
  car_down: number;
  car_up: number;
  motorcycle_down: number;
  motorcycle_up: number;
  truck_down: number;
  truck_up: number;
  bus_down: number;
  bus_up: number;
}

const useMQTT = () => {
  const [trafficData, setTrafficData] = useState<TrafficData>({
    car_down: 0,
    car_up: 0,
    motorcycle_down: 0,
    motorcycle_up: 0,
    truck_down: 0,
    truck_up: 0,
    bus_down: 0,
    bus_up: 0,
  });

  useEffect(() => {
    const client = mqtt.connect(MQTT_BROKER_URL);

    client.on("connect", () => {
      console.log("Connected to MQTT broker");
      client.subscribe(TOPIC, (err) => {
        if (!err) console.log(`Subscribed to ${TOPIC}`);
      });
    });

    client.on("message", (topic, message) => {
      if (topic === TOPIC) {
        try {
          const payload = JSON.parse(message.toString());
          setTrafficData(payload);
        } catch (error) {
          console.error("Error parsing MQTT message:", error);
        }
      }
    });

    return () => {
      client.end();
    };
  }, []);

  return trafficData;
};

export default useMQTT;
