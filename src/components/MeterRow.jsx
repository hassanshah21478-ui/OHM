import React from "react";
import { Zap } from "lucide-react";
import MeterCard from "./MeterCard";
import "../styles/DashboardLayout.css";

const MeterRow = ({ title, cards = [] }) => {
  return (
    <div className="meter-row">
      {title && (
        <h3 className="meter-row-title">
          <Zap className="icon-title" /> {title}
        </h3>
      )}

      <div className="meter-cards">
        {cards.map((card, i) => (
          <MeterCard key={i} {...card} />
        ))}
      </div>
    </div>
  );
};

export default MeterRow;
