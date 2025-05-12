import { useCallback, useEffect, useRef, useState } from "react";
import mqtt from "mqtt";
import { saveTrafficData } from "../services/api";


const MQTT_BROKER_URL = "ws://103.245.38.40:9001/mqtt";
const TOPIC = "vehicle/interactions";
const HOUR_IN_MS = 60 * 60 * 1000; // 1 hour in milliseconds

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

const useMQTT = (billboardName?: string) => {
  // State untuk menampilkan data terakhir yang diterima dari MQTT
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

  // Ref untuk menyimpan data terakumulasi untuk pengiriman ke server
  const accumulatedDataRef = useRef<TrafficData>({
    car_down: 0,
    car_up: 0,
    motorcycle_down: 0,
    motorcycle_up: 0,
    truck_down: 0,
    truck_up: 0,
    bus_down: 0,
    bus_up: 0,
  });

  // Ref untuk waktu reset terakhir
  const lastResetTimeRef = useRef<number>(Date.now());

  // State untuk UI menampilkan waktu hingga reset berikutnya
  const [timeUntilReset, setTimeUntilReset] = useState<number>(HOUR_IN_MS);

  // Refs untuk timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);

  // State untuk status reset
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Mendapatkan storage key berdasarkan nama billboard
  const getStorageKey = useCallback(() => {
    return billboardName ? `traffic_data_${billboardName}` : null;
  }, [billboardName]);

  // Memuat data akumulasi tersimpan dari localStorage
  const loadSavedAccumulatedData = useCallback(() => {
    if (!billboardName || typeof window === "undefined") return false;

    const storageKey = getStorageKey();
    if (!storageKey) return false;

    const savedData = localStorage.getItem(storageKey);
    if (!savedData) return false;

    try {
      const parsedData = JSON.parse(savedData);
      accumulatedDataRef.current = parsedData.data;
      lastResetTimeRef.current = parsedData.lastResetTime;

      console.log(
        `Loaded saved accumulated data for billboard ${billboardName}:`,
        parsedData
      );
      return true;
    } catch (error) {
      console.error("Error parsing saved traffic data:", error);
      return false;
    }
  }, [billboardName, getStorageKey]);

  // Menyimpan data akumulasi ke localStorage
  const saveAccumulatedDataToStorage = useCallback(() => {
    if (!billboardName || typeof window === "undefined") return;

    const storageKey = getStorageKey();
    if (!storageKey) return;

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          lastResetTime: lastResetTimeRef.current,
          data: accumulatedDataRef.current,
        })
      );
    } catch (error) {
      console.error(
        "Error saving accumulated traffic data to localStorage:",
        error
      );
    }
  }, [billboardName, getStorageKey]);

  // Mengirim data terakumulasi ke server dan reset counter
  const sendAndResetData = useCallback(async () => {
    if (!billboardName) return false;

    try {
      setIsResetting(true);

      // Hanya mengirim jika ada data yang terakumulasi
      const hasData = Object.values(accumulatedDataRef.current).some(
        (val) => val > 0
      );

      if (hasData) {
        const timestamp = new Date().toISOString();
        const dataToSend = {
          timestamp,
          billboard_name: billboardName,
          motorcycle_down: accumulatedDataRef.current.motorcycle_down,
          motorcycle_up: accumulatedDataRef.current.motorcycle_up,
          car_down: accumulatedDataRef.current.car_down,
          car_up: accumulatedDataRef.current.car_up,
          // Mapping truck dan bus ke big_vehicle untuk backend
          big_vehicle_down:
            accumulatedDataRef.current.truck_down +
            accumulatedDataRef.current.bus_down,
          big_vehicle_up:
            accumulatedDataRef.current.truck_up +
            accumulatedDataRef.current.bus_up,
        };

        console.log(
          `Sending accumulated data for billboard ${billboardName}:`,
          dataToSend
        );
        await saveTrafficData(dataToSend);
        console.log(`Data saved successfully for billboard ${billboardName}`);
      } else {
        console.log(`No data to send for billboard ${billboardName}`);
      }

      // Reset data terakumulasi
      accumulatedDataRef.current = {
        car_down: 0,
        car_up: 0,
        motorcycle_down: 0,
        motorcycle_up: 0,
        truck_down: 0,
        truck_up: 0,
        bus_down: 0,
        bus_up: 0,
      };

      // Update waktu reset terakhir
      lastResetTimeRef.current = Date.now();

      // Simpan data kosong ke localStorage
      saveAccumulatedDataToStorage();

      console.log(`Accumulated data reset for billboard ${billboardName}`);
      return true;
    } catch (error) {
      console.error("Failed to send accumulated traffic data:", error);
      return false;
    } finally {
      setIsResetting(false);
    }
  }, [billboardName, saveAccumulatedDataToStorage]);

  // Update waktu hingga reset berikutnya
  const updateTimeUntilReset = useCallback(() => {
    const now = Date.now();
    const timePassedSinceLastReset = now - lastResetTimeRef.current;
    const remainingTime = Math.max(HOUR_IN_MS - timePassedSinceLastReset, 0);
    setTimeUntilReset(remainingTime);

    // Jika sudah waktunya untuk reset, lakukan reset
    if (remainingTime === 0 && !isResetting) {
      sendAndResetData();
    }
  }, [sendAndResetData, isResetting]);

  // Set up timer untuk update UI reguler
  useEffect(() => {
    updateTimeUntilReset();

    updateTimerRef.current = setInterval(updateTimeUntilReset, 1000);

    return () => {
      if (updateTimerRef.current) {
        clearInterval(updateTimerRef.current);
        updateTimerRef.current = null;
      }
    };
  }, [updateTimeUntilReset]);

  // Memuat data tersimpan dan mengatur timer perjam
  useEffect(() => {
    if (!billboardName) return;

    // Memuat data akumulasi tersimpan dari localStorage
    loadSavedAccumulatedData();

    // Menghitung waktu hingga reset berikutnya
    const now = Date.now();
    const timePassedSinceLastReset = now - lastResetTimeRef.current;
    const timeUntilNextReset = Math.max(
      HOUR_IN_MS - timePassedSinceLastReset,
      0
    );

    console.log(
      `Time until next reset for billboard ${billboardName}: ${
        timeUntilNextReset / 1000
      } seconds`
    );

    // Membersihkan timer yang ada
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Mengatur timer baru untuk reset berikutnya
    timerRef.current = setTimeout(() => {
      sendAndResetData().then(() => {
        // Setelah reset awal, atur interval untuk reset berikutnya
        timerRef.current = setInterval(sendAndResetData, HOUR_IN_MS);
      });
    }, timeUntilNextReset);

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [billboardName, loadSavedAccumulatedData, sendAndResetData]);

  // Berlangganan MQTT dan menangani pesan
  useEffect(() => {
    if (!billboardName) return;

    const client = mqtt.connect(MQTT_BROKER_URL);

    client.on("connect", () => {
      console.log(`Connected to MQTT broker for billboard ${billboardName}`);
      client.subscribe(TOPIC, (err) => {
        if (!err) console.log(`Subscribed to ${TOPIC}`);
      });
    });

    client.on("message", (topic, message) => {
      if (topic === TOPIC) {
        try {
          const payload = JSON.parse(message.toString()) as TrafficData;
          console.log("Raw MQTT message received:", payload);

          // Update UI dengan data terbaru langsung (tidak diakumulasi untuk UI)
          setTrafficData(payload);

          // Namun, tetap akumulasikan untuk data yang akan dikirim ke server
          accumulatedDataRef.current = {
            car_down: accumulatedDataRef.current.car_down + payload.car_down,
            car_up: accumulatedDataRef.current.car_up + payload.car_up,
            motorcycle_down:
              accumulatedDataRef.current.motorcycle_down +
              payload.motorcycle_down,
            motorcycle_up:
              accumulatedDataRef.current.motorcycle_up + payload.motorcycle_up,
            truck_down:
              accumulatedDataRef.current.truck_down + payload.truck_down,
            truck_up: accumulatedDataRef.current.truck_up + payload.truck_up,
            bus_down: accumulatedDataRef.current.bus_down + payload.bus_down,
            bus_up: accumulatedDataRef.current.bus_up + payload.bus_up,
          };

          // Simpan data akumulasi ke localStorage
          saveAccumulatedDataToStorage();

          console.log(
            `Accumulated traffic data for billboard ${billboardName}:`,
            accumulatedDataRef.current
          );
        } catch (error) {
          console.error("Error parsing MQTT message:", error);
        }
      }
    });

    client.on("error", (error) => {
      console.error(
        `MQTT connection error for billboard ${billboardName}:`,
        error
      );
    });

    return () => {
      client.end();
    };
  }, [billboardName, saveAccumulatedDataToStorage]);

  // Mengembalikan data terbaru untuk UI dan fungsi
  return {
    ...trafficData,
    timeUntilReset,
    isResetting,
    resetData: sendAndResetData,
  };
};

export default useMQTT;