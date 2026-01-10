import React, { useEffect, useState, useRef } from "react";
import {
  BellRing,
  Zap,
  ArrowRightCircle,
  Home,
  AlertTriangle,
  Send,
  XCircle,
  CheckCircle,
  Lightbulb,
  Power,
  Cog,
  BarChart3, 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/AlertCard.css";

const AlertCard = () => {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [powerLoss, setPowerLoss] = useState(0);
  const [showGraph, setShowGraph] = useState(false);
  const [graphData, setGraphData] = useState(null); 

  const [theftAlert, setTheftAlert] = useState({
    icon: null,
    text: "",
    type: "normal",
  });

  const [systemAlert, setSystemAlert] = useState({
    icon: null,
    text: "",
    type: "normal",
  });

  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmType, setConfirmType] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const beepRef = useRef(null);
  const lastTheftState = useRef(false);

  useEffect(() => {
    beepRef.current = new Audio("/alert-beep.mp3");
    beepRef.current.volume = 0.6;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/system/status`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json && typeof json === "object") setData(json);
      } catch (err) {
        console.error("❌ Failed to fetch system status:", err);
        setData(null);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!data) return;

    const totalConsumed = (data.toNextPower || 0) + (data.houseTotalPower || 0);
    const directLoss = (data.streetInputPower || 0) - totalConsumed;
    setPowerLoss(directLoss);

    const streetInput = data.streetInputPower || 0;
    const toNext = data.toNextPower || 0;
    const houseTotal = data.houseTotalPower || 0;
    const totalConsumedPower = toNext + houseTotal;
    const actualPowerLoss = streetInput - totalConsumedPower;
    const threshold = streetInput * 0.05;
    const theftDetected = actualPowerLoss > 0 && Math.abs(actualPowerLoss) > threshold;

    if (theftDetected && !lastTheftState.current) {
      beepRef.current?.play().catch(() => {});

      setTimeout(() => {
        beepRef.current.pause();
        beepRef.current.currentTime = 0;
      }, 5000);
    }
    lastTheftState.current = theftDetected;

    setTheftAlert(
      theftDetected
        ? {
            icon: <AlertTriangle size={22} />,
            text: "Theft Detected",
            type: "theft",
          }
        : {
            icon: <CheckCircle size={22} />,
            text: "No Theft Detected",
            type: "normal",
          }
    );
    const meters = data.meterStatus || [];
    const online = meters.filter((m) => m.status === "Online").length;
    const total = meters.length;

    if (total === 0) {
      setSystemAlert({
        icon: <Power size={22} />,
        text: "No Meters Found",
        type: "fault",
      });
    } else if (online === total) {
      setSystemAlert({
        icon: <Lightbulb size={22} />,
        text: "System Normal",
        type: "normal",
      });
    } else if (online === 0) {
      setSystemAlert({
        icon: <Power size={22} />,
        text: "Power Off",
        type: "fault",
      });
    } else {
      setSystemAlert({
        icon: <Cog size={22} />,
        text: "System Fault (Some Meters Offline)",
        type: "fault",
      });
    }
  }, [data]);

  const sendEmail = async (type) => {
    try {
      setSending(true);
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/email/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          area: data?.area || "Unknown Area",
        }),
      });

      const json = await res.json();
      if (json.success) setShowSuccess(true);
      else alert("⚠️ Failed to send email: " + json.message);
    } catch (err) {
      alert("❌ Failed to send email.");
    } finally {
      setSending(false);
      setShowConfirm(false);
    }
  };

  const handleConfirm = (type) => {
    setConfirmType(type);
    setShowConfirm(true);
  };

  const confirmAction = () => confirmType && sendEmail(confirmType);
  const closeSuccess = () => {
    setShowSuccess(false);
    navigate("/dashboard");
  };

  const handleShowGraph = () => {
    if (!data) return;
    
    // Calculate graph data
    const totalConsumed = (data.toNextPower || 0) + (data.houseTotalPower || 0);
    const streetInput = data.streetInputPower || 0;
    const powerLossValue = streetInput - totalConsumed;
    const percentageLoss = streetInput > 0 ? (powerLossValue / streetInput) * 100 : 0;
    const normalPercentage = streetInput > 0 ? (totalConsumed / streetInput) * 100 : 0;
    const theftPercentage = percentageLoss > 0 ? percentageLoss : 0;
    
    setGraphData({
      normalConsumption: totalConsumed,
      theftAmount: powerLossValue > 0 ? powerLossValue : 0,
      normalPercentage: normalPercentage.toFixed(1),
      theftPercentage: theftPercentage.toFixed(1),
      streetInput: streetInput
    });
    
    setShowGraph(true);
  };

  const closeGraph = () => {
    setShowGraph(false);
    setGraphData(null);
  };

  if (!data) {
    return (
      <div className="container-card full-width alert-card">
        <p>Loading live data...</p>
      </div>
    );
  }

  // Calculate percentage loss for display
  const percentageLoss = data.streetInputPower > 0 
    ? ((powerLoss / data.streetInputPower) * 100).toFixed(1)
    : 0;

  return (
    <div className="container-card full-width alert-card">
      <h3 className="alert-title">
        <BellRing className="icon-title" /> Alerts
      </h3>

      {/* Theft + System Alerts */}
      <div className="alert-box-group">
        <div className={`alert-box ${theftAlert.type}`}>
          {theftAlert.icon}
          <span>{theftAlert.text}</span>
        </div>
        <div className={`alert-box ${systemAlert.type}`}>
          {systemAlert.icon}
          <span>{systemAlert.text}</span>
        </div>
      </div>

      {/* Power Summary */}
      <div className="summary-row">
        <div className="summary-item">
          <Zap />
          <span className="label">Street Input</span>
          <strong className="value">{data.streetInputPower?.toFixed(2)} W</strong>
        </div>
        <div className="summary-item">
          <ArrowRightCircle />
          <span className="label">To Next Street</span>
          <strong className="value">{data.toNextPower?.toFixed(2)} W</strong>
        </div>
        <div className="summary-item">
          <Home />
          <span className="label">House Total</span>
          <strong className="value">{data.houseTotalPower?.toFixed(2)} W</strong>
        </div>
        <div className="summary-item">
          <AlertTriangle />
          <span className="label">Power Loss</span>
          <strong className="value" title={`${percentageLoss}% loss`}>
            {powerLoss.toFixed(2)} W
          </strong>
        </div>
      </div>

      {/* Additional Info */}
      <div className="power-info">
        <p>
          <strong>Total Consumed:</strong> {((data.toNextPower || 0) + (data.houseTotalPower || 0)).toFixed(2)} W
        </p>
        <p className={powerLoss > 0 ? "loss-text" : ""}>
          <strong>Status:</strong> {powerLoss > 0 
            ? `⚠️ Street input (${data.streetInputPower?.toFixed(2)}W) > Total consumed (${((data.toNextPower || 0) + (data.houseTotalPower || 0)).toFixed(2)}W)` 
            : "✅ Balanced"}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="alert-actions">
        <button
          className="btn orange-btn"
          onClick={() => handleConfirm("investigate")}
          disabled={sending || theftAlert.type !== "theft"}
          title={theftAlert.type !== "theft" ? "No theft detected" : "Send investigation email"}
        >
          <Send size={16} /> Investigate
        </button>
        <button
          className="btn gray-btn"
          onClick={() => handleConfirm("fault")}
          disabled={sending}
        >
          <XCircle size={16} /> Fault
        </button>
        {/* Graph Button - Added here */}
        <button
          className="btn blue-btn"
          onClick={handleShowGraph}
          title="View consumption vs theft graph"
        >
          <BarChart3 size={16} /> Graph
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <h4>Are you sure you want to send this email?</h4>
            <p style={{ fontSize: "14px", color: "#666", marginTop: "8px" }}>
              {confirmType === "investigate" 
                ? "This will alert the investigation team about suspected theft."
                : "This will alert the tech team about system faults."}
            </p>
            <div className="confirm-buttons">
              <button
                className="btn gray-btn"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn orange-btn"
                onClick={confirmAction}
                disabled={sending}
              >
                {sending ? "Sending..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <h4>Email Sent Successfully ✅</h4>
            <p style={{ fontSize: "14px", color: "#666", marginTop: "8px" }}>
              Alert has been sent to the relevant team.
            </p>
            <button className="btn orange-btn" onClick={closeSuccess}>
              OK
            </button>
          </div>
        </div>
      )}

      {/* Graph Modal */}
      {showGraph && graphData && (
        <div className="confirm-overlay">
          <div className="confirm-modal" style={{ maxWidth: "500px" }}>
            <h4>Consumption vs Theft Analysis</h4>
            
            <div style={{ margin: "20px 0" }}>
              {/* Bar Chart Visualization */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-end', 
                height: '200px', 
                margin: '20px 0',
                gap: '40px',
                justifyContent: 'center'
              }}>
                {/* Normal Consumption Bar */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    width: '60px', 
                    height: `${Math.min(180, (graphData.normalPercentage / 100) * 180)}px`,
                    backgroundColor: '#10b981',
                    borderRadius: '4px 4px 0 0',
                    position: 'relative'
                  }}>
                    <span style={{
                      position: 'absolute',
                      top: '-25px',
                      left: '0',
                      right: '0',
                      fontWeight: 'bold',
                      color: '#10b981'
                    }}>
                      {graphData.normalPercentage}%
                    </span>
                  </div>
                  <div style={{ marginTop: '10px', fontWeight: 'bold' }}>Normal Consumption</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {graphData.normalConsumption.toFixed(2)} W
                  </div>
                </div>
                
                {/* Theft Bar */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    width: '60px', 
                    height: `${Math.min(180, (graphData.theftPercentage / 100) * 180)}px`,
                    backgroundColor: '#ef4444',
                    borderRadius: '4px 4px 0 0',
                    position: 'relative'
                  }}>
                    <span style={{
                      position: 'absolute',
                      top: '-25px',
                      left: '0',
                      right: '0',
                      fontWeight: 'bold',
                      color: '#ef4444'
                    }}>
                      {graphData.theftPercentage}%
                    </span>
                  </div>
                  <div style={{ marginTop: '10px', fontWeight: 'bold' }}>Theft</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {graphData.theftAmount.toFixed(2)} W
                  </div>
                </div>
              </div>

              {/* Summary Statistics */}
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '15px',
                borderRadius: '8px',
                marginTop: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Total Street Input:</span>
                  <strong>{graphData.streetInput.toFixed(2)} W</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Normal Consumption:</span>
                  <strong style={{ color: '#10b981' }}>
                    {graphData.normalConsumption.toFixed(2)} W ({graphData.normalPercentage}%)
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Power Loss/Theft:</span>
                  <strong style={{ color: graphData.theftAmount > 0 ? '#ef4444' : '#10b981' }}>
                    {graphData.theftAmount.toFixed(2)} W ({graphData.theftPercentage}%)
                  </strong>
                </div>
              </div>
            </div>

            <div className="confirm-buttons">
              <button
                className="btn gray-btn"
                onClick={closeGraph}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertCard;
