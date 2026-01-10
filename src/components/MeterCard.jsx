import React from "react";
import { Zap, Activity, Gauge, BatteryCharging, Wifi, Cpu } from "lucide-react";
import "../styles/DashboardLayout.css";

const MeterCard = ({ name, id, voltage, current, power, units, status }) => {
  const online = status === "Online" || power > 0;

  return (
    <div className="meter-card">
      {/* 🔹 Header */}
      <div className="meter-header">
        <h5>
          <Cpu className="icon" /> {name}
        </h5>
        <p className="meter-id">ID: {id || "N/A"}</p>
      </div>

      {/* Status */}
      <div className="meter-status">
        <Wifi className={`icon ${online ? "online" : ""}`} />
        <span className={`status-text ${online ? "text-green-600" : "text-red-600"}`}>
          {online ? "Online" : "Offline"}
        </span>
      </div>

      {/* 🔹 Stats */}
      <div className="meter-stats">
        <div className="stat-item">
          <Zap className="icon" />
          <span>{voltage?.toFixed?.(2) || 0} V</span>
          <label>Voltage</label>
        </div>

        <div className="stat-item">
          <Activity className="icon" />
          <span>{current?.toFixed?.(2) || 0} A</span>
          <label>Current</label>
        </div>

        <div className="stat-item">
          <Gauge className="icon" />
          <span>{power?.toFixed?.(2) || 0} W</span>
          <label>Power</label>
        </div>

        <div className="stat-item">
          <BatteryCharging className="icon" />
          <span>{Math.round(units || 0)}</span>
          <label>Units</label>
        </div>
      </div>
    </div>
  );
};

export default MeterCard;
