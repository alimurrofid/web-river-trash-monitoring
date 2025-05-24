import * as cron from "node-cron";
import mqtt from "mqtt";
import * as trafficRepository from "./trafficRepository.js";
// State untuk menyimpan total delta yang sudah tersimpan per billboard
let totalSavedDelta = {
    'A': {
        car_down: 0, car_up: 0,
        motorcycle_down: 0, motorcycle_up: 0,
        big_vehicle_down: 0, big_vehicle_up: 0
    },
    'B': {
        car_down: 0, car_up: 0,
        motorcycle_down: 0, motorcycle_up: 0,
        big_vehicle_down: 0, big_vehicle_up: 0
    },
    'C': {
        car_down: 0, car_up: 0,
        motorcycle_down: 0, motorcycle_up: 0,
        big_vehicle_down: 0, big_vehicle_up: 0
    }
};
// Data MQTT terbaru
let currentTrafficData = {
    car_down: 0, car_up: 0,
    motorcycle_down: 0, motorcycle_up: 0,
    truck_down: 0, truck_up: 0,
    bus_down: 0, bus_up: 0
};
// Konfigurasi MQTT
const MQTT_BROKER_URL = "mqtt://103.245.38.40:1883";
const MQTT_TOPIC = "vehicle/interactions";
// Koneksi ke MQTT broker
const connectToMQTT = () => {
    console.log('Connecting to MQTT broker...');
    const client = mqtt.connect(MQTT_BROKER_URL);
    client.on('connect', () => {
        console.log('Connected to MQTT broker');
        client.subscribe(MQTT_TOPIC, (err) => {
            if (!err) {
                console.log(`Subscribed to ${MQTT_TOPIC}`);
            }
            else {
                console.error('Error subscribing to topic:', err);
            }
        });
    });
    client.on('message', (topic, message) => {
        try {
            const payload = JSON.parse(message.toString());
            currentTrafficData = payload;
            console.log('Received MQTT data:', payload);
        }
        catch (error) {
            console.error('Error parsing MQTT message:', error);
        }
    });
    client.on('error', (error) => {
        console.error('MQTT connection error:', error);
        setTimeout(() => connectToMQTT(), 5000);
    });
    return client;
};
// Fungsi untuk menghitung total delta dari database
const calculateTotalDelta = async (billboard) => {
    try {
        // Ambil semua data dari database untuk billboard ini
        const allData = await trafficRepository.getTrafficByBillboard(billboard, 1000);
        let totalDelta = {
            car_down: 0, car_up: 0,
            motorcycle_down: 0, motorcycle_up: 0,
            big_vehicle_down: 0, big_vehicle_up: 0
        };
        // Jumlahkan semua delta yang tersimpan
        for (const record of allData) {
            totalDelta.car_down += record.car_down || 0;
            totalDelta.car_up += record.car_up || 0;
            totalDelta.motorcycle_down += record.motorcycle_down || 0;
            totalDelta.motorcycle_up += record.motorcycle_up || 0;
            totalDelta.big_vehicle_down += record.big_vehicle_down || 0;
            totalDelta.big_vehicle_up += record.big_vehicle_up || 0;
        }
        return totalDelta;
    }
    catch (error) {
        console.error(`Error calculating total delta for billboard ${billboard}:`, error);
        return {
            car_down: 0, car_up: 0,
            motorcycle_down: 0, motorcycle_up: 0,
            big_vehicle_down: 0, big_vehicle_up: 0
        };
    }
};
// Fungsi untuk mengirim data ke database dengan perhitungan delta yang benar
const saveTrafficData = async (billboard) => {
    try {
        if (!currentTrafficData || Object.keys(currentTrafficData).length === 0) {
            console.log(`No traffic data available for billboard ${billboard}`);
            return null;
        }
        // Hitung total delta dari database (untuk memastikan data terbaru)
        const totalDelta = await calculateTotalDelta(billboard);
        // Hitung big vehicle dari MQTT saat ini
        const currentBigVehicleDown = currentTrafficData.truck_down + currentTrafficData.bus_down;
        const currentBigVehicleUp = currentTrafficData.truck_up + currentTrafficData.bus_up;
        // Hitung delta baru: Data MQTT Saat Ini - Total Delta Sebelumnya
        const newDelta = {
            car_down: currentTrafficData.car_down - totalDelta.car_down,
            car_up: currentTrafficData.car_up - totalDelta.car_up,
            motorcycle_down: currentTrafficData.motorcycle_down - totalDelta.motorcycle_down,
            motorcycle_up: currentTrafficData.motorcycle_up - totalDelta.motorcycle_up,
            big_vehicle_down: currentBigVehicleDown - totalDelta.big_vehicle_down,
            big_vehicle_up: currentBigVehicleUp - totalDelta.big_vehicle_up
        };
        console.log(`Billboard ${billboard} - MQTT saat ini:`, {
            car_up: currentTrafficData.car_up,
            motorcycle_up: currentTrafficData.motorcycle_up,
            big_vehicle_up: currentBigVehicleUp
        });
        console.log(`Billboard ${billboard} - Total delta sebelumnya:`, {
            car_up: totalDelta.car_up,
            motorcycle_up: totalDelta.motorcycle_up,
            big_vehicle_up: totalDelta.big_vehicle_up
        });
        console.log(`Billboard ${billboard} - Delta yang akan disimpan:`, newDelta);
        // Abaikan jika tidak ada perubahan atau semua nilai negatif/nol
        if (Object.values(newDelta).every(val => val <= 0)) {
            console.log(`No positive changes detected for billboard ${billboard}, skipping save`);
            return null;
        }
        // Siapkan data untuk disimpan (pastikan tidak ada nilai negatif)
        const trafficData = {
            timestamp: new Date(),
            billboard_name: billboard,
            motorcycle_down: Math.max(0, newDelta.motorcycle_down),
            motorcycle_up: Math.max(0, newDelta.motorcycle_up),
            car_down: Math.max(0, newDelta.car_down),
            car_up: Math.max(0, newDelta.car_up),
            big_vehicle_down: Math.max(0, newDelta.big_vehicle_down),
            big_vehicle_up: Math.max(0, newDelta.big_vehicle_up)
        };
        // Simpan ke database
        const trafficId = await trafficRepository.recordTraffic(trafficData);
        console.log(`Saved traffic data for billboard ${billboard} with ID: ${trafficId} at ${new Date().toISOString()}`);
        console.log(`Data saved:`, trafficData);
        // Update totalSavedDelta untuk referensi (optional, karena kita selalu hitung ulang dari database)
        totalSavedDelta[billboard] = {
            car_down: totalDelta.car_down + Math.max(0, newDelta.car_down),
            car_up: totalDelta.car_up + Math.max(0, newDelta.car_up),
            motorcycle_down: totalDelta.motorcycle_down + Math.max(0, newDelta.motorcycle_down),
            motorcycle_up: totalDelta.motorcycle_up + Math.max(0, newDelta.motorcycle_up),
            big_vehicle_down: totalDelta.big_vehicle_down + Math.max(0, newDelta.big_vehicle_down),
            big_vehicle_up: totalDelta.big_vehicle_up + Math.max(0, newDelta.big_vehicle_up)
        };
        return trafficId;
    }
    catch (error) {
        console.error(`Error saving traffic data for billboard ${billboard}:`, error);
        return null;
    }
};
// Fungsi untuk memuat total delta dari database saat inisialisasi
const loadTotalDeltaFromDatabase = async () => {
    try {
        console.log('Loading total delta from database...');
        for (const billboard of ['A', 'B', 'C']) {
            try {
                const totalDelta = await calculateTotalDelta(billboard);
                totalSavedDelta[billboard] = totalDelta;
                console.log(`Total delta for billboard ${billboard}:`, totalDelta);
            }
            catch (error) {
                console.error(`Error loading total delta for billboard ${billboard}:`, error);
            }
        }
        console.log('Finished loading total delta from database');
    }
    catch (error) {
        console.error('Error in loadTotalDeltaFromDatabase:', error);
    }
};
// Initialize service
export const initScheduledTrafficService = () => {
    console.log("Initializing scheduled traffic service...");
    // Connect to MQTT broker
    const mqttClient = connectToMQTT();
    // coba 2 menit '*/2 * * * *'
    cron.schedule("*/2 * * * *", async () => {
        console.log("Running scheduled traffic data save at:", new Date().toISOString());
        for (const billboard of ["A", "B", "C"]) {
            await saveTrafficData(billboard);
        }
    });
    // Load total delta dari database
    loadTotalDeltaFromDatabase();
    return {
        manualSave: async (billboard) => {
            console.log(`Manual save triggered for billboard ${billboard}`);
            return await saveTrafficData(billboard);
        },
    };
};
//# sourceMappingURL=scheduledTraffic.js.map