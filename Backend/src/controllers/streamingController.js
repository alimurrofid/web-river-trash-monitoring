import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
// Generate random streaming link
const generateRandomLink = () => {
  return crypto.randomBytes(16).toString("hex"); // Contoh output: "a3f1b2c4d5e6f7g8h9i0j1k2l3m4n5o6"
};

// Create new streaming link
export const createStreamingLink = async (req, res) => {
  try {
    const { billboard_id, duration } = req.body; // Durasi dalam menit/hari dari frontend
    if (!billboard_id || !duration) {
      return res.status(400).json({ error: "billboard_id and duration are required" });
    }

    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + duration); // Set expired time

    const newLink = await prisma.streamingLink.create({
      data: {
        link: generateRandomLink(),
        expired_at: expirationTime,
        billboard_id: parseInt(billboard_id),
      },
    });

    return res.status(201).json(newLink);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Get all valid streaming links
export const getValidLinks = async (req, res) => {
  try {
    const currentTime = new Date();
    const validLinks = await prisma.streamingLink.findMany({
      where: { expired_at: { gt: currentTime } },
    });
    res.json(validLinks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch links" });
  }
};

// Delete expired links (clean up)
export const deleteExpiredLinks = async () => {
  try {
    await prisma.streamingLink.deleteMany({
      where: { expired_at: { lt: new Date() } },
    });
    console.log("Expired links removed");
  } catch (error) {
    console.error("Failed to delete expired links:", error);
  }
};

export const getStreamContent = async (req, res) => {
  try {
    const { linkId } = req.params;

    // Check if the link exists and is valid
    const streamingLink = await prisma.streamingLink.findFirst({
      where: {
        link: linkId,
        expired_at: { gt: new Date() },
      },
      include: {
        billboard: true, // Include the related billboard data
      },
    });

    if (!streamingLink) {
      return res.status(404).send("Link not found or expired");
    }
    // Option 2: Redirect to frontend with the data
    res.redirect(`http://localhost:5173/stream/${linkId}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};