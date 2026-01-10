const express = require("express");
const Meter = require("../models/Meter");
const router = express.Router();

function evaluateSystem(meters = []) {
  if (!Array.isArray(meters) || meters.length === 0) {
    return {
      streetInputPower: 0,
      toNextPower: 0,
      totalHousePower: 0,
      powerLoss: 0,
      status: { type: "No Data", message: "No meters found in database." },
    };
  }

  const streetInput = meters.find((m) => m.meterId === "A-001")?.watts || 0;
  const toNext = meters.find((m) => m.meterId === "A-005")?.watts || 0;
  const houses = meters.filter((m) =>
    ["A-003", "A-004"].includes(m.meterId)
  );
  const totalHousePower = houses.reduce((sum, h) => sum + (h.watts || 0), 0);

  const totalConsumed = toNext + totalHousePower;
  const powerLoss = streetInput - totalConsumed;

  let status = {
    type: "✅ No Theft",
    message: "System normal",
    alert: false
  };


  const threshold = streetInput * 0.10; 
  if (powerLoss > 0 && Math.abs(powerLoss) > threshold) {
    status = {
      type: "🚨 Theft Detected",
      message: `Power loss detected: ${powerLoss.toFixed(2)}W`,
      alert: true
    };
  } else if (streetInput === 0) {
    status = {
      type: "⚠️ Power Off",
      message: "Street input has no power",
      alert: false
    };
  }

  return {
    streetInputPower: Number(streetInput.toFixed(2)),
    toNextPower: Number(toNext.toFixed(2)),
    totalHousePower: Number(totalHousePower.toFixed(2)),
    powerLoss: Number(powerLoss.toFixed(2)),
    status,
    onlineMeters: meters.filter(m => m.status === "Online").length,
    totalMeters: meters.length
  };
}

router.get("/", async (req, res) => {
  try {
    const meters = await Meter.find();
    if (!meters?.length)
      return res.json({ 
        meters: [], 
        analysis: evaluateSystem([]),
        timestamp: new Date().toISOString()
      });

    const analysis = evaluateSystem(meters);

    const processedMeters = meters.map((m) => {
    
      const watts = m.watts || 0;
      const voltage = m.voltage || 0;
      const current = m.current || 0;
      const units = m.units || 0; 
      
      return {
        meterId: m.meterId,
        name: m.name,
        type: m.type,
        owner: m.owner,
        voltage: Number(voltage.toFixed(2)),
        current: Number(current.toFixed(3)),
        power: Number(watts.toFixed(2)),
        units: Number(units.toFixed(2)),
        status: m.status || (voltage > 0 && current > 0 ? "Online" : "Offline"),
        online: m.status === "Online",
        lastUpdated: m.lastUpdated
      };
    });

    res.json({ 
      meters: processedMeters, 
      analysis,
      timestamp: new Date().toISOString(),
      totalMeters: meters.length,
      onlineMeters: processedMeters.filter(m => m.online).length
    });
  } catch (err) {
    console.error("❌ Meter fetch error:", err);
    res.status(500).json({ message: "Internal Server Error in /api/meters" });
  }
});


router.get("/:meterId", async (req, res) => {
  try {
    const meter = await Meter.findOne({ meterId: req.params.meterId });
    if (!meter) {
      return res.status(404).json({ message: "Meter not found" });
    }
   
    res.json({
      meterId: meter.meterId,
      name: meter.name,
      type: meter.type,
      owner: meter.owner,
      voltage: meter.voltage,
      current: meter.current,
      power: meter.watts,
      units: meter.units,
      status: meter.status,
      online: meter.status === "Online",
      lastUpdated: meter.lastUpdated
    });
  } catch (err) {
    console.error("❌ Single meter fetch error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/sync", async (req, res) => {
  try {
    const meters = await Meter.find();
    const onlineMeters = meters.filter(m => m.status === "Online").length;
    
    res.json({
      success: true,
      message: `Meter data synced. ${onlineMeters}/${meters.length} meters online`,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("❌ Meter sync error:", err);
    res.status(500).json({ message: "Failed to sync meter data" });
  }
});

module.exports = router;
