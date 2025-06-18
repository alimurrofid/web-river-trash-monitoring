import { useEffect, useRef, useState } from "react";
import mqtt from "mqtt";
import { saveTrafficDataManually } from "../services/api";

const MQTT_BROKER_URL = import.meta.env.VITE_MQTT_BROKER_URL;
const MQTT_TOPIC = import.meta.env.VITE_MQTT_TOPIC;

if (!MQTT_BROKER_URL || !MQTT_TOPIC) {
  throw new Error("MQTT_BROKER_URL or MQTT_TOPIC is not defined in .env");
}

// Simplified MQTT data structure - only the 4 counts
interface MQTTTrafficData {
  plastic_makro: number;
  plastic_meso: number;
  nonplastic_makro: number;
  nonplastic_meso: number;
}

const useMQTT = (billboardName?: string) => {
  // Data MQTT yang diterima
  const [trafficData, setTrafficData] = useState<MQTTTrafficData>({
    plastic_makro: 0,
    plastic_meso: 0,
    nonplastic_makro: 0,
    nonplastic_meso: 0,
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
      const response = await saveTrafficDataManually();

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
      console.log(`Connected to MQTT broker for billboard ${billboardName || "all"}`);
      client.subscribe(MQTT_TOPIC, (err) => {
        if (!err) console.log(`Subscribed to ${MQTT_TOPIC}`);
      });
    });

    client.on("message", (topic, message) => {
      if (topic === MQTT_TOPIC) {
        try {
          const payload = JSON.parse(message.toString()) as MQTTTrafficData;
          
          // Validate that we have the expected structure
          if (
            typeof payload.plastic_makro === 'number' &&
            typeof payload.plastic_meso === 'number' &&
            typeof payload.nonplastic_makro === 'number' &&
            typeof payload.nonplastic_meso === 'number'
          ) {
            setTrafficData(payload);
            console.log("MQTT Data received:", payload);
          } else {
            console.warn("Invalid MQTT payload structure:", payload);
          }
        } catch (error) {
          console.error("Error parsing MQTT message:", error);
        }
      }
    });

    client.on("error", (error) => {
      console.error("MQTT connection error:", error);
    });

    return () => {
      client.end();
      mqttClientRef.current = null;
    };
  }, [billboardName]);

  return {
    // Data sampah dari MQTT (4 kategori)
    plastic_makro: trafficData.plastic_makro,
    plastic_meso: trafficData.plastic_meso,
    nonplastic_makro: trafficData.nonplastic_makro,
    nonplastic_meso: trafficData.nonplastic_meso,

    // Calculated totals (computed on frontend)
    totalPlastic: trafficData.plastic_makro + trafficData.plastic_meso,
    totalNonPlastic: trafficData.nonplastic_makro + trafficData.nonplastic_meso,
    totalWastes: trafficData.plastic_makro + trafficData.plastic_meso + 
                 trafficData.nonplastic_makro + trafficData.nonplastic_meso,

    // Timer dan status
    timeUntilReset: timeUntilNextHour, // Hanya untuk tampilan UI
    isResetting,

    // Fungsi untuk reset manual
    resetData: saveDataManually,
  };
};

export default useMQTT;