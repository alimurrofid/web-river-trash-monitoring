// src/services/scheduledTraffic.ts
import * as cron from "node-cron";
import mqtt from "mqtt";
import * as trafficRepository from "./trafficRepository.js";
import "dotenv/config";

// Interface untuk data MQTT
interface MQTTTrafficData {
  plastic_makro: number;
  plastic_meso: number;
  nonplastic_makro: number;
  nonplastic_meso: number;
}

// Interface untuk total delta yang tersimpan di database
interface TotalDeltaData {
  plastic_makro: number;
  plastic_meso: number;
  nonplastic_makro: number;
  nonplastic_meso: number;
}

// Inisialisasi total delta tersimpan
let totalSavedDelta: TotalDeltaData = {
  plastic_makro: 0,
  plastic_meso: 0,
  nonplastic_makro: 0,
  nonplastic_meso: 0,
};

// Data MQTT terbaru
let currentTrafficData: MQTTTrafficData = {
  plastic_makro: 0,
  plastic_meso: 0,
  nonplastic_makro: 0,
  nonplastic_meso: 0,
};

// Konfigurasi MQTT
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL;
const MQTT_TOPIC = process.env.MQTT_TOPIC;
if (!MQTT_BROKER_URL || !MQTT_TOPIC) {
  throw new Error("MQTT_BROKER_URL or MQTT_TOPIC is not defined in environment variables.");
}
// Koneksi ke MQTT broker
const connectToMQTT = (): mqtt.MqttClient => {
  console.log("Connecting to MQTT broker...");
  const client = mqtt.connect(MQTT_BROKER_URL);

  client.on("connect", () => {
    console.log("Connected to MQTT broker");
    client.subscribe(MQTT_TOPIC, (err) => {
      if (!err) {
        console.log(`Subscribed to ${MQTT_TOPIC}`);
      } else {
        console.error("Error subscribing to topic:", err);
      }
    });
  });

  client.on("message", (topic, message) => {
    try {
      const payload = JSON.parse(message.toString()) as MQTTTrafficData;
      currentTrafficData = payload;
      console.log("Received MQTT data:", payload);
    } catch (error) {
      console.error("Error parsing MQTT message:", error);
    }
  });

  client.on("error", (error) => {
    console.error("MQTT connection error:", error);
    setTimeout(() => connectToMQTT(), 5000);
  });

  return client;
};

// Fungsi untuk menghitung total delta dari database
const calculateTotalDelta = async (): Promise<TotalDeltaData> => {
  try {
    const allData = await trafficRepository.getTrafficAll(1000);

    let totalDelta: TotalDeltaData = {
      plastic_makro: 0,
      plastic_meso: 0,
      nonplastic_makro: 0,
      nonplastic_meso: 0,
    };

    for (const record of allData) {
      totalDelta.plastic_makro += record.plastic_makro || 0;
      totalDelta.plastic_meso += record.plastic_meso || 0;
      totalDelta.nonplastic_makro += record.nonplastic_makro || 0;
      totalDelta.nonplastic_meso += record.nonplastic_meso || 0;
    }

    return totalDelta;
  } catch (error) {
    console.error("Error calculating total delta:", error);
    return {
      plastic_makro: 0,
      plastic_meso: 0,
      nonplastic_makro: 0,
      nonplastic_meso: 0,
    };
  }
};

// Fungsi untuk menyimpan data ke database
const saveTrafficData = async (): Promise<number | null> => {
  try {
    if (!currentTrafficData) return null;

    const totalDelta = await calculateTotalDelta();

    const newDelta = {
      plastic_makro: currentTrafficData.plastic_makro - totalDelta.plastic_makro,
      plastic_meso: currentTrafficData.plastic_meso - totalDelta.plastic_meso,
      nonplastic_makro: currentTrafficData.nonplastic_makro - totalDelta.nonplastic_makro,
      nonplastic_meso: currentTrafficData.nonplastic_meso - totalDelta.nonplastic_meso,
    };

    if (Object.values(newDelta).every(val => val <= 0)) {
      console.log("No positive changes detected, skipping save.");
      return null;
    }

    const trafficData: trafficRepository.TrafficInput = {
      timestamp: new Date(),
      plastic_makro: Math.max(0, newDelta.plastic_makro),
      plastic_meso: Math.max(0, newDelta.plastic_meso),
      nonplastic_makro: Math.max(0, newDelta.nonplastic_makro),
      nonplastic_meso: Math.max(0, newDelta.nonplastic_meso),
    };

    const trafficId = await trafficRepository.recordTraffic(trafficData);

    console.log(`Saved traffic data ID: ${trafficId} at ${new Date().toISOString()}`);
    console.log("Data:", trafficData);

    totalSavedDelta = {
      plastic_makro: totalDelta.plastic_makro + trafficData.plastic_makro,
      plastic_meso: totalDelta.plastic_meso + trafficData.plastic_meso,
      nonplastic_makro: totalDelta.nonplastic_makro + trafficData.nonplastic_makro,
      nonplastic_meso: totalDelta.nonplastic_meso + trafficData.nonplastic_meso,
    };

    return trafficId;
  } catch (error) {
    console.error("Error saving traffic data:", error);
    return null;
  }
};

// Load delta saat awal aplikasi jalan
const loadTotalDeltaFromDatabase = async () => {
  try {
    console.log("Loading total delta from DB...");
    const totalDelta = await calculateTotalDelta();
    totalSavedDelta = totalDelta;
    console.log("Total delta loaded:", totalDelta);
  } catch (error) {
    console.error("Error loading delta:", error);
  }
};

// Inisialisasi service
export const initScheduledTrafficService = () => {
  console.log("Initializing scheduled traffic service...");

  connectToMQTT();

  // Jadwalkan penyimpanan tiap jam (ubah ke '*/2 * * * *' untuk tiap 2 menit)
  cron.schedule("*/2 * * * *", async () => {
    console.log("Cron running at:", new Date().toISOString());
    await saveTrafficData();
  });

  loadTotalDeltaFromDatabase();

  return {
    manualSave: async (): Promise<number | null> => {
      console.log("Manual save triggered");
      return await saveTrafficData();
    },
  };
};
