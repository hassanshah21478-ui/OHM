const mongoose = require("mongoose");

const usageLogSchema = new mongoose.Schema({
  date: { 
    type: Date, 
    default: Date.now,
    index: true 
  },

  streetInput: { 
    type: Number, 
    required: true,
    min: 0
  },
  
  toNext: { 
    type: Number, 
    required: true,
    min: 0
  },
  
  houseTotal: { 
    type: Number, 
    required: true,
    min: 0
  },

  powerLoss: { 
    type: Number, 
    required: true,
  },

  theftAlert: {
    type: String,
    enum: ["No Theft", "Theft Detected", "System Fault", "Light Cut Off"],
    default: "No Theft",
    index: true
  },

  logType: {
    type: String,
    enum: ["daily", "monthly"],
    required: true,
    index: true 
  },

  totalConsumed: {
    type: Number,
    default: function() {
      return this.toNext + this.houseTotal;
    }
  },

  lossPercentage: {
    type: Number,
    default: function() {
      if (this.streetInput === 0) return 0;
      return (Math.abs(this.powerLoss) / this.streetInput) * 100;
    }
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {

  timestamps: true
});

usageLogSchema.pre('save', function(next) {
  this.totalConsumed = this.toNext + this.houseTotal;
  
  if (this.streetInput > 0) {
    this.lossPercentage = (Math.abs(this.powerLoss) / this.streetInput) * 100;
  } else {
    this.lossPercentage = 0;
  }
  
  next();
});

usageLogSchema.index({ logType: 1, date: -1 });
usageLogSchema.index({ theftAlert: 1, date: -1 });
usageLogSchema.index({ powerLoss: -1 });

usageLogSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

usageLogSchema.virtual('hasTheft').get(function() {
  return this.theftAlert === "Theft Detected";
});

module.exports = mongoose.model("UsageLog", usageLogSchema);
