import { saveTrafficData } from "./api";
import { TrafficData } from "./interface";

const HOUR_IN_MS = 60 * 60 * 1000; // 1 hour in milliseconds

// Interface for traffic count data
interface TrafficCountData {
  car_down: number;
  car_up: number;
  motorcycle_down: number;
  motorcycle_up: number;
  truck_down: number;
  truck_up: number;
  bus_down: number;
  bus_up: number;
}

// Interface for stored traffic data
interface StoredTrafficData {
  lastResetTime: number;
  data: TrafficCountData;
}

/**
 * Class to handle traffic data scheduling and auto-saving
 */
export class TrafficScheduler {
  private billboardName: string;
  private accumulatedData: TrafficCountData;
  private lastResetTime: number;
  private timer: NodeJS.Timeout | null;
  private storageKey: string;

  constructor(billboardName: string) {
    this.billboardName = billboardName;
    this.storageKey = `traffic_data_${billboardName}`;
    this.accumulatedData = {
      car_down: 0,
      car_up: 0,
      motorcycle_down: 0,
      motorcycle_up: 0,
      truck_down: 0,
      truck_up: 0,
      bus_down: 0,
      bus_up: 0,
    };
    this.lastResetTime = Date.now();
    this.timer = null;

    // Load saved data if available
    this.loadSavedData();
  }

  /**
   * Initialize the scheduler
   */
  public initialize(): void {
    // Schedule next reset based on last reset time
    this.scheduleNextReset();

    console.log(
      `Traffic scheduler initialized for billboard ${this.billboardName}`
    );
  }

  /**
   * Add new traffic data to accumulated counts
   */
  public addTrafficData(data: TrafficCountData): void {
    this.accumulatedData = {
      car_down: this.accumulatedData.car_down + data.car_down,
      car_up: this.accumulatedData.car_up + data.car_up,
      motorcycle_down:
        this.accumulatedData.motorcycle_down + data.motorcycle_down,
      motorcycle_up: this.accumulatedData.motorcycle_up + data.motorcycle_up,
      truck_down: this.accumulatedData.truck_down + data.truck_down,
      truck_up: this.accumulatedData.truck_up + data.truck_up,
      bus_down: this.accumulatedData.bus_down + data.bus_down,
      bus_up: this.accumulatedData.bus_up + data.bus_up,
    };

    // Save the updated data
    this.saveData();
  }

  /**
   * Get current accumulated data
   */
  public getAccumulatedData(): TrafficCountData {
    return { ...this.accumulatedData };
  }

  /**
   * Get time until next reset in milliseconds
   */
  public getTimeUntilNextReset(): number {
    const now = Date.now();
    const timePassedSinceLastReset = now - this.lastResetTime;
    return Math.max(HOUR_IN_MS - timePassedSinceLastReset, 0);
  }

  /**
   * Manually trigger a data reset and send to server
   */
  public async resetAndSendData(): Promise<boolean> {
    try {
      await this.sendDataToServer();
      this.resetData();
      return true;
    } catch (error) {
      console.error(
        `Failed to reset and send data for billboard ${this.billboardName}:`,
        error
      );
      return false;
    }
  }

  /**
   * Clean up and stop the scheduler
   */
  public cleanup(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Schedule the next reset based on the last reset time
   */
  private scheduleNextReset(): void {
    // Clear any existing timer
    if (this.timer) {
      clearTimeout(this.timer);
      clearInterval(this.timer);
    }

    // Calculate time until next reset
    const timeUntilNextReset = this.getTimeUntilNextReset();

    console.log(
      `Next reset for billboard ${this.billboardName} scheduled in ${
        timeUntilNextReset / 1000
      } seconds`
    );

    // Set timer for next reset
    this.timer = setTimeout(async () => {
      await this.resetAndSendData();

      // After the first reset, schedule resets every hour
      this.timer = setInterval(async () => {
        await this.resetAndSendData();
      }, HOUR_IN_MS);
    }, timeUntilNextReset);
  }

  /**
   * Send accumulated data to the server
   */
  private async sendDataToServer(): Promise<void> {
    const timestamp = new Date().toISOString();
    const dataToSend: TrafficData = {
      timestamp,
      billboard_name: this.billboardName,
      motorcycle_down: this.accumulatedData.motorcycle_down,
      motorcycle_up: this.accumulatedData.motorcycle_up,
      car_down: this.accumulatedData.car_down,
      car_up: this.accumulatedData.car_up,
      // Mapping truck and bus to big_vehicle for backend
      big_vehicle_down:
        this.accumulatedData.truck_down + this.accumulatedData.bus_down,
      big_vehicle_up:
        this.accumulatedData.truck_up + this.accumulatedData.bus_up,
    };

    console.log(
      `Sending accumulated data for billboard ${this.billboardName}:`,
      dataToSend
    );

    // Only send if there's actual data
    const hasData = Object.values(dataToSend).some(
      (val) => typeof val === "number" && val > 0
    );

    if (hasData) {
      await saveTrafficData(dataToSend);
      console.log(`Data sent successfully for billboard ${this.billboardName}`);
    } else {
      console.log(`No data to send for billboard ${this.billboardName}`);
    }
  }

  /**
   * Reset the accumulated data
   */
  private resetData(): void {
    this.accumulatedData = {
      car_down: 0,
      car_up: 0,
      motorcycle_down: 0,
      motorcycle_up: 0,
      truck_down: 0,
      truck_up: 0,
      bus_down: 0,
      bus_up: 0,
    };

    this.lastResetTime = Date.now();
    this.saveData();
    console.log(`Data reset for billboard ${this.billboardName}`);
  }

  /**
   * Save the data to localStorage
   */
  private saveData(): void {
    if (typeof window === "undefined") return;

    const dataToSave: StoredTrafficData = {
      lastResetTime: this.lastResetTime,
      data: this.accumulatedData,
    };

    localStorage.setItem(this.storageKey, JSON.stringify(dataToSave));
  }

  /**
   * Load saved data from localStorage
   */
  private loadSavedData(): void {
    if (typeof window === "undefined") return;

    const savedData = localStorage.getItem(this.storageKey);

    if (savedData) {
      try {
        const parsedData: StoredTrafficData = JSON.parse(savedData);
        this.accumulatedData = parsedData.data;
        this.lastResetTime = parsedData.lastResetTime;

        console.log(
          `Loaded saved data for billboard ${this.billboardName}:`,
          parsedData
        );
      } catch (error) {
        console.error("Error parsing saved traffic data:", error);
      }
    }
  }
}

// Singleton schedulers for each billboard
const schedulers: Record<string, TrafficScheduler> = {};

/**
 * Get or create a scheduler for a billboard
 */
export const getSchedulerForBillboard = (
  billboardName: string
): TrafficScheduler => {
  if (!schedulers[billboardName]) {
    schedulers[billboardName] = new TrafficScheduler(billboardName);
    schedulers[billboardName].initialize();
  }

  return schedulers[billboardName];
};

/**
 * Clean up all schedulers (call on component unmount)
 */
export const cleanupAllSchedulers = (): void => {
  Object.values(schedulers).forEach((scheduler) => {
    scheduler.cleanup();
  });
};
