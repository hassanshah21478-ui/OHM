const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Meter = require("../models/Meter");

dotenv.config();

async function clearMeters() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const result = await Meter.deleteMany({});
    console.log(`🗑️ Deleted ${result.deletedCount} old meter records`);

    await mongoose.disconnect();
    console.log("✅ Disconnected successfully");
  } catch (error) {
    console.error("❌ Error clearing meters:", error);
  }
}

clearMeters();
