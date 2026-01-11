const express = require("express");
const UsageLog = require("../models/UsageLog");
const router = express.Router();

router.get("/daily", async (_req, res) => {
  try {
    const logs = await UsageLog.find({ logType: "daily" })
      .sort({ date: -1 })
      .limit(7)
      .lean({ virtuals: true });
    
    res.json(logs.reverse());
  } catch (err) {
    console.error("❌ Error fetching daily logs:", err);
    res.status(500).json({ message: "Failed to fetch daily logs" });
  }
});

router.get("/daily/all", async (_req, res) => {
  try {
    const logs = await UsageLog.find({ logType: "daily" })
      .sort({ date: -1 })
      .lean({ virtuals: true });
    
    res.json(logs);
  } catch (err) {
    console.error("❌ Error fetching all daily logs:", err);
    res.status(500).json({ message: "Failed to fetch all daily logs" });
  }
});

router.get("/monthly", async (_req, res) => {
  try {
    const logs = await UsageLog.find({ logType: "monthly" })
      .sort({ date: -1 })
      .limit(6)
      .lean({ virtuals: true });
    
    res.json(logs.reverse());
  } catch (err) {
    console.error("❌ Error fetching monthly logs:", err);
    res.status(500).json({ message: "Failed to fetch monthly logs" });
  }
});

router.get("/monthly/all", async (_req, res) => {
  try {
    const logs = await UsageLog.find({ logType: "monthly" })
      .sort({ date: -1 })
      .lean({ virtuals: true });
    
    res.json(logs);
  } catch (err) {
    console.error("❌ Error fetching all monthly logs:", err);
    res.status(500).json({ message: "Failed to fetch all monthly logs" });
  }
});

router.get("/daily/paginated", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const logs = await UsageLog.find({ logType: "daily" })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await UsageLog.countDocuments({ logType: "daily" });

    res.json({
      logs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalLogs: total
    });
  } catch (err) {
    console.error("❌ Error fetching paginated daily logs:", err);
    res.status(500).json({ message: "Failed to fetch paginated daily logs" });
  }
});

router.get("/monthly/paginated", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const logs = await UsageLog.find({ logType: "monthly" })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await UsageLog.countDocuments({ logType: "monthly" });

    res.json({
      logs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalLogs: total
    });
  } catch (err) {
    console.error("❌ Error fetching paginated monthly logs:", err);
    res.status(500).json({ message: "Failed to fetch paginated monthly logs" });
  }
});

router.get("/daily/:id", async (req, res) => {
  try {
    const log = await UsageLog.findOne({
      _id: req.params.id,
      logType: "daily"
    });
    
    if (!log) {
      return res.status(404).json({ message: "Daily log not found" });
    }
    
    res.json(log);
  } catch (err) {
    console.error("❌ Error fetching daily log by ID:", err);
    res.status(500).json({ message: "Failed to fetch daily log" });
  }
});

router.get("/monthly/:id", async (req, res) => {
  try {
    const log = await UsageLog.findOne({
      _id: req.params.id,
      logType: "monthly"
    });
    
    if (!log) {
      return res.status(404).json({ message: "Monthly log not found" });
    }
    
    res.json(log);
  } catch (err) {
    console.error("❌ Error fetching monthly log by ID:", err);
    res.status(500).json({ message: "Failed to fetch monthly log" });
  }
});

router.get("/daily/range", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: "Both startDate and endDate query parameters are required" 
      });
    }

    const logs = await UsageLog.find({
      logType: "daily",
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    })
    .sort({ date: -1 })
    .lean();

    res.json(logs);
  } catch (err) {
    console.error("❌ Error fetching daily logs by range:", err);
    res.status(500).json({ message: "Failed to fetch daily logs by range" });
  }
});

router.get("/monthly/range", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: "Both startDate and endDate query parameters are required" 
      });
    }

    const logs = await UsageLog.find({
      logType: "monthly",
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    })
    .sort({ date: -1 })
    .lean();

    res.json(logs);
  } catch (err) {
    console.error("❌ Error fetching monthly logs by range:", err);
    res.status(500).json({ message: "Failed to fetch monthly logs by range" });
  }
});

router.delete("/daily/:id", async (req, res) => {
  try {
    const deleted = await UsageLog.findOneAndDelete({
      _id: req.params.id,
      logType: "daily"
    });
    
    if (!deleted) {
      return res.status(404).json({ message: "Daily log not found" });
    }
    
    res.json({ 
      message: "Daily log deleted successfully",
      deletedLog: deleted
    });
  } catch (err) {
    console.error("❌ Error deleting daily log:", err);
    res.status(500).json({ message: "Failed to delete daily log" });
  }
});

router.delete("/daily", async (_req, res) => {
  try {
    const result = await UsageLog.deleteMany({ logType: "daily" });
    
    res.json({ 
      message: "All daily logs deleted successfully",
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error("❌ Error deleting daily logs:", err);
    res.status(500).json({ message: "Failed to delete all daily logs" });
  }
});

router.delete("/monthly/:id", async (req, res) => {
  try {
    const deleted = await UsageLog.findOneAndDelete({
      _id: req.params.id,
      logType: "monthly"
    });
    
    if (!deleted) {
      return res.status(404).json({ message: "Monthly log not found" });
    }
    
    res.json({ 
      message: "Monthly log deleted successfully",
      deletedLog: deleted
    });
  } catch (err) {
    console.error("❌ Error deleting monthly log:", err);
    res.status(500).json({ message: "Failed to delete monthly log" });
  }
});

router.delete("/monthly", async (_req, res) => {
  try {
    const result = await UsageLog.deleteMany({ logType: "monthly" });
    
    res.json({ 
      message: "All monthly logs deleted successfully",
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error("❌ Error deleting monthly logs:", err);
    res.status(500).json({ message: "Failed to delete all monthly logs" });
  }
});

router.get("/stats/daily", async (_req, res) => {
  try {
    const totalLogs = await UsageLog.countDocuments({ logType: "daily" });
    const theftCount = await UsageLog.countDocuments({ 
      logType: "daily", 
      theftAlert: "Theft Detected" 
    });
    const faultCount = await UsageLog.countDocuments({ 
      logType: "daily", 
      theftAlert: "System Fault" 
    });
    
    const avgPowerLoss = await UsageLog.aggregate([
      { $match: { logType: "daily" } },
      { $group: { 
        _id: null, 
        avgPowerLoss: { $avg: "$powerLoss" },
        maxPowerLoss: { $max: "$powerLoss" },
        minPowerLoss: { $min: "$powerLoss" }
      } }
    ]);

    const stats = avgPowerLoss[0] || {};

    res.json({
      totalDailyLogs: totalLogs,
      theftDetectedCount: theftCount,
      systemFaultCount: faultCount,
      averagePowerLoss: stats.avgPowerLoss || 0,
      maxPowerLoss: stats.maxPowerLoss || 0,
      minPowerLoss: stats.minPowerLoss || 0
    });
  } catch (err) {
    console.error("❌ Error fetching daily stats:", err);
    res.status(500).json({ message: "Failed to fetch daily statistics" });
  }
});

router.get("/stats/monthly", async (_req, res) => {
  try {
    const totalLogs = await UsageLog.countDocuments({ logType: "monthly" });
    const theftCount = await UsageLog.countDocuments({ 
      logType: "monthly", 
      theftAlert: "Theft Detected" 
    });
    const faultCount = await UsageLog.countDocuments({ 
      logType: "monthly", 
      theftAlert: "System Fault" 
    });
    
    const avgPowerLoss = await UsageLog.aggregate([
      { $match: { logType: "monthly" } },
      { $group: { 
        _id: null, 
        avgPowerLoss: { $avg: "$powerLoss" },
        maxPowerLoss: { $max: "$powerLoss" },
        minPowerLoss: { $min: "$powerLoss" }
      } }
    ]);

    const stats = avgPowerLoss[0] || {};

    res.json({
      totalMonthlyLogs: totalLogs,
      theftDetectedCount: theftCount,
      systemFaultCount: faultCount,
      averagePowerLoss: stats.avgPowerLoss || 0,
      maxPowerLoss: stats.maxPowerLoss || 0,
      minPowerLoss: stats.minPowerLoss || 0
    });
  } catch (err) {
    console.error("❌ Error fetching monthly stats:", err);
    res.status(500).json({ message: "Failed to fetch monthly statistics" });
  }
});

router.get("/chart/daily", async (_req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logs = await UsageLog.find({
      logType: "daily",
      date: { $gte: thirtyDaysAgo }
    })
    .sort({ date: 1 })
    .select("date powerLoss theftAlert")
    .lean();

    res.json(logs);
  } catch (err) {
    console.error("❌ Error fetching daily chart data:", err);
    res.status(500).json({ message: "Failed to fetch daily chart data" });
  }
});

router.get("/chart/monthly", async (_req, res) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const logs = await UsageLog.find({
      logType: "monthly",
      date: { $gte: twelveMonthsAgo }
    })
    .sort({ date: 1 })
    .select("date powerLoss theftAlert")
    .lean();

    res.json(logs);
  } catch (err) {
    console.error("❌ Error fetching monthly chart data:", err);
    res.status(500).json({ message: "Failed to fetch monthly chart data" });
  }
});

router.post("/create", async (req, res) => {
  try {
    const { 
      date, 
      streetInput, 
      toNext, 
      houseTotal, 
      powerLoss, 
      theftAlert, 
      logType 
    } = req.body;
 
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }
    
    if (logType !== "daily" && logType !== "monthly") {
      return res.status(400).json({ 
        message: "logType must be either 'daily' or 'monthly'" 
      });
    }
    
    const existingLog = await UsageLog.findOne({
      date: new Date(date),
      logType: logType
    });
    
    if (existingLog) {
      existingLog.streetInput = streetInput || 0;
      existingLog.toNext = toNext || 0;
      existingLog.houseTotal = houseTotal || 0;
      existingLog.powerLoss = powerLoss || 0;
      existingLog.theftAlert = theftAlert || "No Theft";
      await existingLog.save();
      
      console.log(`📝 Updated existing ${logType} log: ${powerLoss}W loss`);
      return res.json({ 
        success: true, 
        message: "Log updated", 
        log: existingLog 
      });
    }

    const log = await UsageLog.create({
      date: new Date(date),
      streetInput: streetInput || 0,
      toNext: toNext || 0,
      houseTotal: houseTotal || 0,
      powerLoss: powerLoss || 0,
      theftAlert: theftAlert || "No Theft",
      logType: logType
    });
    
    console.log(`📝 Created new ${logType} log: ${powerLoss}W loss, ${theftAlert}`);
    
    res.json({ 
      success: true, 
      message: "Log created successfully", 
      log 
    });
  } catch (err) {
    console.error("❌ Error creating log:", err);
    res.status(500).json({ message: "Failed to create log" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { theftAlert, logType, limit = 50 } = req.query;
    
    if (!theftAlert || !logType) {
      return res.status(400).json({ 
        message: "Both theftAlert and logType query parameters are required" 
      });
    }
    
    const logs = await UsageLog.find({
      logType: logType,
      theftAlert: theftAlert
    })
    .sort({ date: -1 })
    .limit(parseInt(limit))
    .lean();
    
    res.json({
      logs,
      count: logs.length,
      searchParams: { theftAlert, logType }
    });
  } catch (err) {
    console.error("❌ Error searching logs:", err);
    res.status(500).json({ message: "Failed to search logs" });
  }
});

module.exports = router;