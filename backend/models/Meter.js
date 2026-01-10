const mongoose = require("mongoose");

const meterSchema = new mongoose.Schema({
  meterId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  owner: { type: String },

  type: { 
    type: String,
    enum: ["streetInput", "house", "toNext"],
    required: true
  },

  watts: { type: Number, default: 0 },
  power: { type: Number, default: 0 },
  voltage: { type: Number, default: 0 },
  current: { type: Number, default: 0 },
  units: { type: Number, default: 0 },
  status: { type: String, default: "Online" },
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Meter", meterSchema);
