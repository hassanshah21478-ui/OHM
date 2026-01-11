const Meter = require("./models/Meter");
const UsageLog = require("./models/UsageLog");
const LOGGING_INTERVALS = {
  daily: 300 * 1000,    
  monthly: 10 * 60 * 1000 
};

let loggingStarted = false;

const initializeMeters = async () => {
  try {
    const initialMeters = [
      { meterId: "A-001", name: "Street Input", type: "streetInput", status: "Offline" },
      { meterId: "A-003", name: "Orangzaib", type: "house", status: "Offline" },
      { meterId: "A-004", name: "Maliha Bibi", type: "house", status: "Offline" },
      { meterId: "A-005", name: "To Next Street", type: "toNext", status: "Offline" },
    ];

    for (const meterData of initialMeters) {
      await Meter.findOneAndUpdate(
        { meterId: meterData.meterId },
        {
          meterId: meterData.meterId,
          name: meterData.name,
          type: meterData.type,
          watts: 0,
          power: 0,
          voltage: 0,
          current: 0,
          units: 0,
          status: meterData.status,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );
    }

    console.log("✅ Meters initialized in database");
  } catch (err) {
    console.error("❌ Error initializing meters:", err.message);
  }
};

const processRealMeterData = async (meterId, espNowData) => {
  try {
    const meter = await Meter.findOne({ meterId });
    if (!meter) {
      console.error(`❌ Meter ${meterId} not found in database`);
      return null;
    }

    const voltage = espNowData.voltage || 0;
    const current = espNowData.current || 0;
    const apparentPower = espNowData.apparentPower || 0;
    const powerFactor = 1.0;
    const realPower = voltage * current * powerFactor;

    meter.voltage = voltage;
    meter.current = current;
    meter.watts = realPower;
    meter.power = realPower;
    meter.units = apparentPower;
    meter.status = espNowData.online ? "Online" : "Offline";
    meter.lastUpdated = new Date();

    if (espNowData.consumer && espNowData.consumer !== meter.owner) {
      meter.owner = espNowData.consumer;
    }

    await meter.save();
    
    console.log(`📊 Updated ${meterId}: ${voltage}V, ${current}A, ${realPower.toFixed(2)}W`);

    return meter;
  } catch (err) {
    console.error(`❌ Error processing meter ${meterId}:`, err.message);
    return null;
  }
};
async function logUsage(type) {
  try {
    const meters = await Meter.find();
    if (!meters.length) return;

    const streetInput = meters.find((m) => m.meterId === "A-001")?.watts || 0;
    const toNext = meters.find((m) => m.meterId === "A-005")?.watts || 0;
    const houseTotal = meters
      .filter((m) => ["A-003", "A-004"].includes(m.meterId))
      .reduce((sum, h) => sum + (h.watts || 0), 0);

    const totalConsumed = toNext + houseTotal;
    const powerLoss = streetInput - totalConsumed;
    let theftAlert = "No Theft";
    const totalPower = streetInput || 1;
    const lossPercentage = Math.abs((powerLoss / totalPower) * 100);

    if (powerLoss > 0 && lossPercentage > 10) {
      theftAlert = "Theft Detected";
    } else if (powerLoss > 0 && lossPercentage > 5) {
      theftAlert = "System Fault";
    } else if (streetInput === 0) {
      theftAlert = "Light Cut Off";
    }

    const now = new Date();
    const roundedMinute = new Date(now.setSeconds(0, 0));
    const existing = await UsageLog.findOne({ 
      date: roundedMinute, 
      logType: type 
    });
    
    if (existing) {
      // ✅ FIX THIS SECTION ONLY:
      // Use findOneAndUpdate instead of manual save to trigger middleware
      await UsageLog.findOneAndUpdate(
        { _id: existing._id },
        {
          streetInput,
          toNext,
          houseTotal,
          powerLoss,
          theftAlert
        },
        { new: true, runValidators: true }
      );
      
      console.log(`📝 Updated ${type} log: Loss=${powerLoss.toFixed(2)}W (${lossPercentage.toFixed(1)}%)`);
    } else {
      await UsageLog.create({
        date: roundedMinute,
        streetInput,
        toNext,
        houseTotal,
        powerLoss,
        theftAlert,
        logType: type,
      });

      console.log(`📘 ${type} Log Saved: Loss=${powerLoss.toFixed(2)}W (${lossPercentage.toFixed(1)}%), Status=${theftAlert}`);
    }

  } catch (err) {
    console.error(`❌ Error saving ${type} log:`, err.message);
  }
}
function startLoggingIntervals() {
  if (loggingStarted) {
    console.log("⚙️ Logging already running");
    return;
  }
  
  loggingStarted = true;
  console.log("🕒 Real-time logging started for ESP-NOW data");
  setInterval(() => logUsage("daily"), LOGGING_INTERVALS.daily);
  setInterval(() => logUsage("monthly"), LOGGING_INTERVALS.monthly);
}
function startOfflineMonitor() {
  setInterval(async () => {
    try {
      const meters = await Meter.find();
      const now = new Date();
      const OFFLINE_THRESHOLD = 2 * 60 * 1000; 

      for (const meter of meters) {
        if (meter.status === "Online") {
          const timeDiff = now - meter.lastUpdated;
          if (timeDiff > OFFLINE_THRESHOLD) {
            meter.status = "Offline";
            meter.watts = 0;
            meter.current = 0;
            meter.voltage = 0;
            await meter.save();
            console.log(`⚠️ ${meter.meterId} marked OFFLINE (no data for ${Math.floor(timeDiff/1000)}s)`);
          }
        }
      }
    } catch (err) {
      console.error("❌ Error in offline monitor:", err.message);
    }
  }, 30000); 
}

const startRealDataProcessing = async () => {
  try {
    await initializeMeters();
    startLoggingIntervals();
    startOfflineMonitor();
    
    console.log("⚡ Real ESP-NOW data processing ready");
    console.log("📡 Waiting for ESP32 gateway data...");
    
  } catch (err) {
    console.error("❌ Error starting real data processing:", err.message);
  }
};

module.exports = { 
  startRealDataProcessing,
  processRealMeterData,
  logUsage
};
