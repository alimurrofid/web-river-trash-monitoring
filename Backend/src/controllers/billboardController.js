import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllTraffic = async (req, res) => {
  try {
    const traffic = await prisma.billboardTraffic.findMany();
    res.json(traffic);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve traffic data" });
  }
};

export const getTrafficById = async (req, res) => {
  const { id } = req.params;
  try {
    const traffic = await prisma.billboardTraffic.findUnique({
      where: { id: parseInt(id) },
    });
    if (!traffic) {
      return res.status(404).json({ error: "Traffic data not found" });
    }
    res.json(traffic);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve traffic data" });
  }
};

export const addTraffic = async (req, res) => {
  const {
    car_down,
    car_up,
    bike_down,
    bike_up,
    truck_down,
    truck_up,
    billboard_name,
  } = req.body;
  try {
    const newTraffic = await prisma.billboardTraffic.create({
      data: {
        car_down,
        car_up,
        bike_down,
        bike_up,
        truck_down,
        truck_up,
        billboard_name,
      },
    });
    res.status(201).json(newTraffic);
  } catch (error) {
    res.status(500).json({ error: "Failed to add traffic data" });
  }
};
