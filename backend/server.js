const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const authMiddleware = require("./middleware/authMiddleware");
const bcrypt = require("bcrypt");
const Admin = require("./models/Admin");
const Meter = require("./models/Meter");
const { startRealDataProcessing } = require("./simulateMeters"); 

dotenv.config();

connectDB();

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    }
  })
);

app.use(express.json());


app.use(
  cors({
    origin: [
      "https://ohm-xi.vercel.app",
      "http://localhost:3000",
      process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://ohm-xi.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

// Handle preflight requests
app.options("*", cors());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts. Please try again later.",
});

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many verification attempts. Try again later.",
});

app.use("/api/login", loginLimiter);
app.use("/api/admin/verify-password", verifyLimiter);
app.use("/api/meters", require("./routes/meterRoutes"));
app.use("/api/email", require("./routes/emailRoutes"));
app.use("/api/logs", require("./routes/logRoutes"));
app.use("/api", require("./routes/authRoutes"));
app.use("/api", require("./routes/passwordRoutes"));
app.use("/api", require("./routes/adminRoutes"));

let espNowData = {
  meters: [
    { meterId: "A-001", lastSeen: 0, online: false, data: null },
    { meterId: "A-003", lastSeen: 0, online: false, data: null },
    { meterId: "A-004", lastSeen: 0, online: false, data: null },
    { meterId: "A-005", lastSeen: 0, online: false, data: null }
  ],
  gateway: {
    cycleNumber: 0,
    lastUpdate: 0,
    wifiConnected: false,
    lastDataReceived: 0
  }
};

async function updateMeterInDatabase(meterId, meterData) {
  try {
    let meter = await Meter.findOne({ meterId });
    
    if (!meter) {
      const meterInfo = {
        "A-001": { name: "Street Input", type: "streetInput" },
        "A-003": { name: "Orangzaib", type: "house" },
        "A-004": { name: "Maliha Bibi", type: "house" },
        "A-005": { name: "To Next Street", type: "toNext" }
      };
      
      const info = meterInfo[meterId] || { name: meterId, type: "house" };
      
      meter = new Meter({
        meterId: meterId,
        name: info.name,
        type: info.type,
        owner: meterData.consumer || info.name,
        watts: 0,
        power: 0,
        voltage: 0,
        current: 0,
        units: 0,
        status: "Offline",
        lastUpdated: new Date()
      });
    }
 
    const voltage = meterData.voltage || 0;
    const current = meterData.current || 0;
    const apparentPower = meterData.apparentPower || 0;
    
    // Calculate real power (P = V × I × PF)
    const powerFactor = 0.95; // Typical power factor for homes
    const realPower = voltage * current * powerFactor;
    
    // Update meter data
    meter.voltage = Number(voltage.toFixed(2));
    meter.current = Number(current.toFixed(3));
    meter.watts = Number(realPower.toFixed(2));
    meter.power = Number(realPower.toFixed(2)); 
    meter.units = Number((apparentPower || 0).toFixed(2)); 
    meter.status = meterData.online ? "Online" : "Offline";
    meter.lastUpdated = new Date();

    if (meterData.consumer) {
      meter.owner = meterData.consumer;
    }
    
    await meter.save();
    
    console.log(`✅ Updated ${meterId}: ${voltage}V, ${current}A, ${realPower.toFixed(2)}W`);
    
    return meter;
  } catch (err) {
    console.error(`❌ Error updating meter ${meterId} in database:`, err.message);
    return null;
  }
}

// ESP-NOW Data Endpoint
app.post("/api/espnow/data", express.json({ limit: '1mb' }), async (req, res) => {
  try {
    const data = req.body;
    const now = Date.now();
    
    console.log(`📡 ESP-NOW Data Received at ${new Date(now).toISOString()}`);
    
    if (!data || !data.meters) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid data format. Expected {meters: []}" 
      });
    }

    let processedCount = 0;
    
    for (const meterData of data.meters) {
      const existingMeter = espNowData.meters.find(m => m.meterId === meterData.meterId);
      if (existingMeter) {
        existingMeter.data = {
          voltage: meterData.voltage || 0,
          current: meterData.current || 0,
          apparentPower: meterData.apparentPower || 0,
          energy: meterData.energy || 0,
          consumer: meterData.consumer || "",
          online: meterData.online || false
        };
        existingMeter.online = meterData.online;
        existingMeter.lastSeen = now;
        existingMeter.packetCount = meterData.packetCount || 0;
        
        await updateMeterInDatabase(meterData.meterId, {
          voltage: meterData.voltage,
          current: meterData.current,
          apparentPower: meterData.apparentPower,
          energy: meterData.energy,
          consumer: meterData.consumer,
          online: meterData.online
        });
        
        processedCount++;
      } else {
        console.log(`⚠️ Unknown meter ID: ${meterData.meterId}`);
      }
    }

    espNowData.gateway = {
      cycleNumber: data.cycleNumber || 0,
      lastUpdate: now,
      lastDataReceived: now,
      wifiConnected: data.wifiConnected || false,
      timestamp: now
    };

    const onlineCount = data.meters.filter(m => m.online).length;
    console.log(`📊 Processed ${processedCount} meters. Online: ${onlineCount}/4`);
    
    res.json({ 
      success: true, 
      message: "Data received successfully", 
      onlineMeters: onlineCount,
      timestamp: now 
    });
  } catch (err) {
    console.error("❌ Error processing ESP-NOW data:", err);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: err.message 
    });
  }
});

// ESP-NOW Status Endpoint
app.get("/api/espnow/status", (req, res) => {
  const now = Date.now();
  const OFFLINE_TIMEOUT = 30000; // 30 seconds
  
  // Update online status based on last seen
  espNowData.meters.forEach(meter => {
    if (meter.lastSeen > 0 && now - meter.lastSeen > OFFLINE_TIMEOUT) {
      if (meter.online) {
        console.log(`⚠️ ${meter.meterId} marked OFFLINE (no data for ${Math.floor((now - meter.lastSeen)/1000)}s)`);
      }
      meter.online = false;
    }
  });
  
  // Calculate gateway uptime
  const gatewayUptime = espNowData.gateway.lastDataReceived > 0 
    ? Math.floor((now - espNowData.gateway.lastDataReceived) / 1000)
    : 0;
  
  res.json({
    ...espNowData,
    gateway: {
      ...espNowData.gateway,
      uptimeSeconds: gatewayUptime,
      status: gatewayUptime < 60 ? "Active" : "Inactive"
    },
    timestamp: now
  });
});

// ESP-NOW Debug Endpoint (for testing)
app.get("/api/espnow/debug", (req, res) => {
  const now = Date.now();
  const debugData = {
    gateway: espNowData.gateway,
    meters: espNowData.meters.map(meter => ({
      meterId: meter.meterId,
      online: meter.online,
      lastSeenSeconds: meter.lastSeen > 0 ? Math.floor((now - meter.lastSeen) / 1000) : -1,
      packetCount: meter.packetCount || 0,
      data: meter.data || null
    })),
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      serverUrl: process.env.SERVER_URL || 'not-set',
      backendUrl: process.env.REACT_APP_API_URL || 'not-set'
    }
  };
  
  res.json(debugData);
});

async function createDefaultAdmin() {
  try {
    const existing = await Admin.findOne({ email: "hassanshah21478@gmail.com" });

    if (!existing) {
      const hashed = await bcrypt.hash("hassan14539", 10);
      await Admin.create({
        name: "Hassan",
        uId: "14539",
        email: "hassanshah21478@gmail.com",
        designation: "Student",
        area: "DHA PHASE 1",
        profilePic: "/uploads/default-avatar.png", // FIXED PATH
        password: hashed,
      });
      console.log("✅ Default admin created: hassanshah21478@gmail.com / hassan14539");
    } else {
      // Update existing admin with correct profile path
      if (existing.profilePic === "/public/proLogo.png") {
        existing.profilePic = "/uploads/default-avatar.png";
        await existing.save();
        console.log("✅ Updated existing admin profile picture path");
      }
      console.log("ℹ️ Default admin already exists");
    }
  } catch (err) {
    console.error("❌ Error creating/updating default admin:", err.message);
  }
}

createDefaultAdmin();
startRealDataProcessing();

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ 
    message: "Backend is running", 
    timestamp: new Date().toISOString(),
    server: "https://ohm-4su2.onrender.com",
    frontend: "https://ohm-xi.vercel.app"
  });
});

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ message: "You have access", user: req.user });
});

app.get("/api/system/health", async (req, res) => {
  try {
    const meters = await Meter.find();
    
    const totalMeters = meters.length;
    const activeMeters = meters.filter(m => m.status === "Online").length;

    const networkStatus = activeMeters === 0 ? "Offline" :
                         activeMeters === totalMeters ? "Online" : "Partial";

    const dataAccuracy = totalMeters > 0 ? ((activeMeters / totalMeters) * 100).toFixed(1) : 0;

    const lastUpdated = meters.length > 0 
      ? new Date(Math.max(...meters.map(m => new Date(m.lastUpdated).getTime()))).toISOString()
      : new Date().toISOString();

    res.json({
      network: networkStatus,
      accuracy: Number(dataAccuracy),
      activeMeters,
      totalMeters: 4, // We always have 4 meters
      lastSync: lastUpdated,
      gateway: {
        cycleNumber: espNowData.gateway.cycleNumber,
        wifiConnected: espNowData.gateway.wifiConnected,
        lastUpdate: new Date(espNowData.gateway.lastUpdate).toISOString(),
        uptime: espNowData.gateway.lastDataReceived > 0 
          ? Math.floor((Date.now() - espNowData.gateway.lastDataReceived) / 1000)
          : 0
      }
    });
  } catch (err) {
    console.error("❌ System health error:", err);
    res.status(500).json({ message: "Failed to fetch system health" });
  }
});

app.get("/api/system/status", async (req, res) => {
  try {
    const meters = await Meter.find();

    const streetInput = meters.find(m => m.meterId === "A-001");
    const toNext = meters.find(m => m.meterId === "A-005");
    const houses = meters.filter(m => ["A-003", "A-004"].includes(m.meterId));

    const streetInputPower = streetInput?.watts || 0;
    const toNextPower = toNext?.watts || 0;
    const houseTotalPower = houses.reduce((sum, h) => sum + (h.watts || 0), 0);

    const totalConsumed = toNextPower + houseTotalPower;
    const powerLoss = streetInputPower - totalConsumed;

    const lossPercent = streetInputPower > 0
      ? (Math.abs(powerLoss) / streetInputPower) * 100
      : 0;

    const theftStatus = powerLoss > 0 && lossPercent > 5 
      ? "Theft Detected" 
      : "No Theft";

    const meterStatus = meters.map((m) => ({
      id: m.meterId,
      name: m.name,
      watts: m.watts || 0,
      voltage: m.voltage || 0, 
      current: m.current || 0, 
      units: m.units || 0, 
      status: m.status || "Offline",
      type: m.type,
      lastUpdated: m.lastUpdated
    }));

    const admin = await Admin.findOne();
    const areaName = admin?.area || "Unknown Area";

    const now = Date.now();
    const onlineFromESPNow = espNowData.meters.filter(m => 
      m.online && now - m.lastSeen < 30000
    ).length;

    res.json({
      area: areaName,
      streetInputPower: Number(streetInputPower.toFixed(2)),
      houseTotalPower: Number(houseTotalPower.toFixed(2)),
      toNextPower: Number(toNextPower.toFixed(2)),
      powerLoss: Number(powerLoss.toFixed(2)),
      lossPercentage: Number(lossPercent.toFixed(1)),
      theftStatus,
      meterStatus,
      gatewayStatus: {
        cycleNumber: espNowData.gateway.cycleNumber,
        lastUpdate: espNowData.gateway.lastUpdate,
        lastDataReceived: espNowData.gateway.lastDataReceived,
        wifiConnected: espNowData.gateway.wifiConnected,
        onlineMeters: onlineFromESPNow,
        uptimeSeconds: espNowData.gateway.lastDataReceived > 0 
          ? Math.floor((now - espNowData.gateway.lastDataReceived) / 1000)
          : 0
      },
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("❌ Failed to fetch system status:", err);
    res.status(500).json({ message: "Failed to fetch system status" });
  }
});

const PORT = process.env.PORT || 5000;
const os = require('os');

function getNetworkIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const HOST = '0.0.0.0';
const serverIP = getNetworkIP();

app.listen(PORT, HOST, () => {
  console.log('='.repeat(60));
  console.log('🚀 SERVER STARTED SUCCESSFULLY');
  console.log('='.repeat(60));
  
  // Clean server URL
  let serverURL = process.env.SERVER_URL || "ohm-4su2.onrender.com";
  serverURL = serverURL.replace(/^https?:\/\//, '');
  
  console.log(`🌐 Local Network: http://${serverIP}:${PORT}`);
  console.log(`📦 Backend URL: https://${serverURL}`);
  console.log(`📡 Frontend URL: https://ohm-xi.vercel.app`);
  console.log('');
  console.log('📡 ESP32 CONFIGURATION:');
  console.log(`   📤 Send Data To: https://${serverURL}/api/espnow/data`);
  console.log(`   📊 Check Status: https://${serverURL}/api/espnow/status`);
  console.log(`   🐛 Debug Info: https://${serverURL}/api/espnow/debug`);
  console.log('');
  console.log('✅ ENDPOINTS:');
  console.log(`   👉 System Health: https://${serverURL}/api/system/health`);
  console.log(`   👉 System Status: https://${serverURL}/api/system/status`);
  console.log(`   👉 Test Endpoint: https://${serverURL}/api/test`);
  console.log('='.repeat(60));
  console.log(`⏰ Server Time: ${new Date().toLocaleString()}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(60));
});