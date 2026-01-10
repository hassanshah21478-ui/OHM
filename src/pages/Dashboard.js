import React, { useEffect, useState, useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AdminInfoCard from "../components/AdminInfoCard";
import AlertCard from "../components/AlertCard";
import MeterRow from "../components/MeterRow";
import SystemHealth from "../components/SystemHealth";
import "../styles/DashboardLayout.css";
import { useAdmin } from "../context/AdminContext";
import { Zap, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { admin } = useAdmin();
  const [meters, setMeters] = useState({
    streetInput: { meterId: "A-001", name: "Street Input", power: 0 },
    house2: { meterId: "A-003", name: "Orangzaib", power: 0 },
    house3: { meterId: "A-004", name: "Maliha Bibi", power: 0 },
    toNext: { meterId: "A-005", name: "To Next Street", power: 0 },
  });

  const [alertState, setAlertState] = useState({
    type: "No Theft",
    message: "All systems normal",
  });

  // Keep previous units across updates
  const prevUnits = useRef({
    "A-001": 0,
    "A-003": 0,
    "A-004": 0,
    "A-005": 0,
  });

  useEffect(() => {
    const fetchMeters = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/meters");
        const data = await res.json();
        const { meters: apiMeters, analysis } = data;

        const get = (id) => apiMeters.find((m) => m.meterId === id) || {};

        const intervalSec = 5;
        const calcUnits = (id, power) => {
          const addedUnits = (power * intervalSec) / 500;
          prevUnits.current[id] = (prevUnits.current[id] || 0) + addedUnits;
          return Math.round(prevUnits.current[id]);
        };

        const house2 = get("A-003");
        const house3 = get("A-004");
        const toNext = get("A-005");

        const streetInputRaw = get("A-001");
        const streetInput = {
          ...streetInputRaw,
          current:
            (house2.current || 0) +
            (house3.current || 0) +
            (toNext.current || 0),
          power:
            (house2.power || 0) +
            (house3.power || 0) +
            (toNext.power || 0),
        };

        const updatedMeters = {
          streetInput: { ...streetInput, units: calcUnits("A-001", streetInput.power) },
          house2: { ...house2, units: calcUnits("A-003", house2.power) },
          house3: { ...house3, units: calcUnits("A-004", house3.power) },
          toNext: { ...toNext, units: calcUnits("A-005", toNext.power) },
        };

        setMeters(updatedMeters);

        setAlertState({
          type: analysis.status.type,
          message: analysis.status.message,
        });
      } catch (err) {
        console.error("❌ Failed to fetch meters:", err);
      }
    };

    fetchMeters();
    const interval = setInterval(fetchMeters, 5000);
    return () => clearInterval(interval);
  }, []);

  const houseTotal =
    (meters.house2?.power || 0) +
    (meters.house3?.power || 0);

  const totalConsumed = (meters.toNext?.power || 0) + houseTotal;
  const powerLoss = Math.abs((meters.streetInput?.power || 0) - totalConsumed);
  

  // Map meters to MeterRow cards
  const meterCards = [
    meters.streetInput,
    meters.house2,
    meters.house3,
    meters.toNext,
  ].map((m) => ({
    name: m.name,
    id: m.meterId,
    voltage: m.voltage,
    current: m.current,
    power: m.power,
    units: m.units,
    status: m.status || "Offline",
  }));

  return (
    <div className="dashboard-wrapper">
      <Header />
      <main className="dashboard-main">
        <section className="dashboard-section full-width">
          <AdminInfoCard admin={admin} />
        </section>

        <section className="dashboard-section full-width">
          <AlertCard
            alertState={alertState}
            setAlertState={setAlertState}
            streetInput={meters.streetInput}
            toNext={meters.toNext}
            houseTotal={houseTotal}
            powerLoss={powerLoss}
          />
        </section>

        <section className="dashboard-section full-width">
          <h3 className="section-title">
            <Zap size={18} style={{ marginRight: "6px", color: "#ff7f50" }} />
            Street Meters
          </h3>

          <MeterRow title="Live Readings" cards={meterCards} />
        </section>

        <section className="dashboard-section full-width">
          <SystemHealth />
          {/* Logs Page Button */}
          <div className="logs-button-container">
            <Link to="/logs" className="logs-page-btn">
              <FileText size={18} /> View All Logs
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;