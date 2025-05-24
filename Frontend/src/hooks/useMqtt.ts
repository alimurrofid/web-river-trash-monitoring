import { useEffect, useRef, useState } from "react";
import mqtt from "mqtt";
import { saveTrafficDataManually } from "../services/api";
import { MQTTTrafficData } from "../services/interface";

const MQTT_BROKER_URL = "ws://103.245.38.40:9001/mqtt";
const TOPIC = "vehicle/interactions";

const useMQTT = (billboardName?: string) => {
  // Data MQTT yang diterima
  const [trafficData, setTrafficData] = useState<MQTTTrafficData>({
    car_down: 0,
    car_up: 0,
    motorcycle_down: 0,
    motorcycle_up: 0,
    truck_down: 0,
    truck_up: 0,
    bus_down: 0,
    bus_up: 0,
  });

  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [timeUntilNextHour, setTimeUntilNextHour] = useState<number>(0);

  const mqttClientRef = useRef<mqtt.MqttClient | null>(null);
  // Fungsi untuk menghitung waktu sampai jam berikutnya
  const calculateTimeUntilNextHour = () => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1);
    nextHour.setMinutes(0);
    nextHour.setSeconds(0);
    nextHour.setMilliseconds(0);
    return nextHour.getTime() - now.getTime();
  };

  // Timer untuk menampilkan countdown ke jam berikutnya (hanya untuk tampilan UI)
  useEffect(() => {
    // Hitung waktu awal
    setTimeUntilNextHour(calculateTimeUntilNextHour());

    // Update setiap detik
    const intervalId = setInterval(() => {
      setTimeUntilNextHour(calculateTimeUntilNextHour());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Fungsi untuk memicu penyimpanan data manual
  const saveDataManually = async (): Promise<boolean> => {
    if (!billboardName) return false;

    setIsResetting(true);

    try {
      // Panggil API untuk menyimpan data secara manual
      const response = await saveTrafficDataManually(billboardName);

      return response.success;
    } catch (error) {
      console.error("Failed to save traffic data manually:", error);
      return false;
    } finally {
      setIsResetting(false);
    }
  };

  // Koneksi MQTT dan pemrosesan data
  useEffect(() => {
    const client = mqtt.connect(MQTT_BROKER_URL);
    mqttClientRef.current = client;

    client.on("connect", () => {
      console.log(
        `Connected to MQTT broker for billboard ${billboardName || "all"}`
      );
      client.subscribe(TOPIC, (err) => {
        if (!err) console.log(`Subscribed to ${TOPIC}`);
      });
    });

    client.on("message", (topic, message) => {
      if (topic === TOPIC) {
        try {
          const payload = JSON.parse(message.toString()) as MQTTTrafficData;
          setTrafficData(payload);
        } catch (error) {
          console.error("Error parsing MQTT message:", error);
        }
      }
    });

    return () => {
      client.end();
      mqttClientRef.current = null;
    };
  }, [billboardName]);

  // Menghitung big vehicle dari data MQTT (untuk tampilan UI)
  const big_vehicle_down = trafficData.truck_down + trafficData.bus_down;
  const big_vehicle_up = trafficData.truck_up + trafficData.bus_up;

  return {
    // Data kendaraan dari MQTT
    car_down: trafficData.car_down,
    car_up: trafficData.car_up,
    motorcycle_down: trafficData.motorcycle_down,
    motorcycle_up: trafficData.motorcycle_up,
    truck_down: trafficData.truck_down,
    truck_up: trafficData.truck_up,
    bus_down: trafficData.bus_down,
    bus_up: trafficData.bus_up,

    // Big vehicle (gabungan truck dan bus) untuk UI
    big_vehicle_down,
    big_vehicle_up,

    // Timer dan status
    timeUntilReset: timeUntilNextHour, // Hanya untuk tampilan UI
    isResetting,

    // Fungsi untuk reset manual
    resetData: saveDataManually,
  };
};

export default useMQTT;