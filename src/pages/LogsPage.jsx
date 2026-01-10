import React, { useState, useEffect, useCallback } from "react";
import { 
  CalendarDays, 
  CalendarRange, 
  Trash2, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Download,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import "../styles/LogsPage.css";


const API_BASE_URL = `${process.env.REACT_APP_API_URL}`;

const LogsPage = () => {
  const navigate = useNavigate();
  const [dailyLogs, setDailyLogs] = useState([]);
  const [monthlyLogs, setMonthlyLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("daily");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    daily: { total: 0, theft: 0, fault: 0, avgLoss: 0 },
    monthly: { total: 0, theft: 0, fault: 0, avgLoss: 0 }
  });

  const fetchDailyLogs = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/logs/daily/all`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setDailyLogs(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
      setError(null);
    } catch (err) {
      console.error("❌ Failed to fetch daily logs:", err);
      setError("Failed to load daily logs. Please try refreshing.");
    }
  }, []);

  const fetchMonthlyLogs = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/logs/monthly/all`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMonthlyLogs(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
      setError(null);
    } catch (err) {
      console.error("❌ Failed to fetch monthly logs:", err);
      setError("Failed to load monthly logs. Please try refreshing.");
    }
  }, []);

  // Enhanced stats fetch with average power loss
  const fetchStats = useCallback(async () => {
    try {
      const [dailyRes, monthlyRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/logs/stats/daily`),
        fetch(`${API_BASE_URL}/api/logs/stats/monthly`)
      ]);
      
      if (!dailyRes.ok || !monthlyRes.ok) {
        throw new Error("Failed to fetch statistics");
      }
      
      const dailyData = await dailyRes.json();
      const monthlyData = await monthlyRes.json();
      
      setStats({
        daily: {
          total: dailyData.totalDailyLogs || 0,
          theft: dailyData.theftDetectedCount || 0,
          fault: dailyData.systemFaultCount || 0,
          avgLoss: dailyData.averagePowerLoss || 0
        },
        monthly: {
          total: monthlyData.totalMonthlyLogs || 0,
          theft: monthlyData.theftDetectedCount || 0,
          fault: monthlyData.systemFaultCount || 0,
          avgLoss: monthlyData.averagePowerLoss || 0
        }
      });
      setError(null);
    } catch (err) {
      console.error("❌ Failed to fetch stats:", err);
      setError("Failed to load statistics.");
    }
  }, []);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      await Promise.all([
        fetchDailyLogs(),
        fetchMonthlyLogs(),
        fetchStats()
      ]);
    } catch (err) {
      console.error("❌ Error loading data:", err);
      setError("Failed to load data. Please check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchDailyLogs, fetchMonthlyLogs, fetchStats]);

  useEffect(() => {
    loadData();
  }, [loadData]); 


  const renderTheftAlert = (alert) => {
    switch (alert) {
      case "Theft Detected":
        return (
          <span className="theft-alert theft" title="Power theft detected">
            <AlertTriangle color="#ff5252" size={16} /> Theft Detected
          </span>
        );
      case "System Fault":
        return (
          <span className="theft-alert fault" title="System fault detected">
            <AlertTriangle color="#ff9800" size={16} /> System Fault
          </span>
        );
      case "Light Cut Off":
        return (
          <span className="theft-alert cut" title="Power cut off">
            <XCircle color="#607d8b" size={16} /> Light Cut Off
          </span>
        );
      default:
        return (
          <span className="theft-alert normal" title="System normal">
            <CheckCircle color="#43a047" size={16} /> No Theft
          </span>
        );
    }
  };


  const handleDeleteDaily = useCallback(async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/logs/daily/${id}`, { 
        method: "DELETE" 
      });
      
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      
      await Promise.all([fetchDailyLogs(), fetchStats()]);
      
      console.log("✅ Daily log deleted successfully");
    } catch (err) {
      console.error("❌ Failed to delete log:", err);
      setError("Failed to delete log. Please try again.");
    }
  }, [fetchDailyLogs, fetchStats]);

  const handleDeleteAllDaily = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/logs/daily`, { 
        method: "DELETE" 
      });
      
      if (!res.ok) throw new Error(`Delete all failed: ${res.status}`);
      
      await Promise.all([fetchDailyLogs(), fetchStats()]);
      
      console.log("✅ All daily logs deleted successfully");
    } catch (err) {
      console.error("❌ Failed to delete all logs:", err);
      setError("Failed to delete logs. Please try again.");
    }
  }, [fetchDailyLogs, fetchStats]);

  const handleDeleteMonthly = useCallback(async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/logs/monthly/${id}`, { 
        method: "DELETE" 
      });
      
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      
      await Promise.all([fetchMonthlyLogs(), fetchStats()]);
      
      console.log("✅ Monthly log deleted successfully");
    } catch (err) {
      console.error("❌ Failed to delete log:", err);
      setError("Failed to delete log. Please try again.");
    }
  }, [fetchMonthlyLogs, fetchStats]);

  const handleDeleteAllMonthly = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/logs/monthly`, { 
        method: "DELETE" 
      });
      
      if (!res.ok) throw new Error(`Delete all failed: ${res.status}`);
      
      await Promise.all([fetchMonthlyLogs(), fetchStats()]);
      
      console.log("✅ All monthly logs deleted successfully");
    } catch (err) {
      console.error("❌ Failed to delete all logs:", err);
      setError("Failed to delete logs. Please try again.");
    }
  }, [fetchMonthlyLogs, fetchStats]);

  const exportToCSV = useCallback((logs, type) => {
    if (logs.length === 0) {
      alert(`No ${type} logs to export`);
      return;
    }

    const headers = [
      "Date", 
      "Street Input (W)", 
      "To Next (W)", 
      "House Total (W)", 
      "Total Consumed (W)", 
      "Power Loss (W)", 
      "Loss Percentage (%)",
      "Theft Alert"
    ];
    
    const csvContent = [
      headers.join(","),
      ...logs.map(log => {
        const totalConsumed = (log.toNext || 0) + (log.houseTotal || 0);
        const lossPercentage = log.streetInput > 0 
          ? ((Math.abs(log.powerLoss || 0) / log.streetInput) * 100).toFixed(2)
          : "0.00";
        
        return [
          new Date(log.date).toISOString(),
          (log.streetInput || 0).toFixed(2),
          (log.toNext || 0).toFixed(2),
          (log.houseTotal || 0).toFixed(2),
          totalConsumed.toFixed(2),
          (log.powerLoss || 0).toFixed(2),
          lossPercentage,
          `"${log.theftAlert || "No Theft"}"`
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `esp-now-${type}-logs-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const currentLogs = activeTab === "daily" ? dailyLogs : monthlyLogs;
  const currentStats = activeTab === "daily" ? stats.daily : stats.monthly;

  const getPowerLossColor = useCallback((loss) => {
    if (loss > 0) return "#ff5252";
    if (loss < 0) return "#ff9800";
    return "#43a047";
  }, []);

  return (
    <div className="dashboard-wrapper">
      <Header />
      <main className="dashboard-main">
        <div className="logs-page">
          {/* Header with Back Button and Refresh */}
          <div className="logs-header">
            <button className="back-btn" onClick={() => navigate("/dashboard")}>
              <ArrowLeft size={20} /> Back to Dashboard
            </button>
            <h1>
              {activeTab === "daily" ? <CalendarDays size={24} /> : <CalendarRange size={24} />}
              {activeTab === "daily" ? "Daily Logs" : "Monthly Logs"}
            </h1>
            <button 
              className="refresh-btn"
              onClick={() => loadData(true)}
              disabled={refreshing || loading}
              title="Refresh data"
            >
              <RefreshCw size={20} className={refreshing ? "spinning" : ""} />
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="error-banner">
              <AlertCircle size={18} />
              <span>{error}</span>
              <button onClick={() => loadData(true)}>Retry</button>
            </div>
          )}

          {/* Stats Cards - Enhanced with ESP-NOW data */}
          <div className="logs-stats">
            <div className="stat-card">
              <h4>Total Logs</h4>
              <p className="stat-value">{currentStats.total}</p>
              <small>From ESP-NOW system</small>
            </div>
            <div className="stat-card">
              <h4>Theft Detected</h4>
              <p className="stat-value theft">{currentStats.theft}</p>
              <small>Real-time detection</small>
            </div>
            <div className="stat-card">
              <h4>Avg Power Loss</h4>
              <p 
                className="stat-value" 
                style={{ color: getPowerLossColor(currentStats.avgLoss) }}
              >
                {Math.abs(currentStats.avgLoss).toFixed(2)} W
              </p>
              <small>From actual measurements</small>
            </div>
            <div className="stat-card">
              <h4>System Faults</h4>
              <p className="stat-value fault">{currentStats.fault}</p>
              <small>Monitoring issues</small>
            </div>
          </div>

          {/* Tabs */}
          <div className="logs-tabs">
            <button
              className={`tab-btn ${activeTab === "daily" ? "active" : ""}`}
              onClick={() => setActiveTab("daily")}
              disabled={loading}
            >
              <CalendarDays size={18} /> 
              Daily Logs ({stats.daily.total})
              <small>Real-time ESP-NOW data</small>
            </button>
            <button
              className={`tab-btn ${activeTab === "monthly" ? "active" : ""}`}
              onClick={() => setActiveTab("monthly")}
              disabled={loading}
            >
              <CalendarRange size={18} /> 
              Monthly Logs ({stats.monthly.total})
              <small>Aggregated from ESP-NOW</small>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="logs-actions">
            <button
              className="btn export-btn"
              onClick={() => exportToCSV(currentLogs, activeTab)}
              disabled={currentLogs.length === 0 || loading}
            >
              <Download size={16} /> 
              Export {activeTab === "daily" ? "Daily" : "Monthly"} CSV
              <small>Includes ESP-NOW measurements</small>
            </button>
            <button
              className="btn delete-all-btn"
              onClick={() => setConfirmDelete({ type: activeTab, action: "all" })}
              disabled={currentLogs.length === 0 || loading}
            >
              <Trash2 size={16} /> 
              Delete All {activeTab === "daily" ? "Daily" : "Monthly"} Logs
            </button>
          </div>

          {/* Logs Table */}
          <div className="logs-table-container">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading ESP-NOW logs...</p>
              </div>
            ) : error ? (
              <div className="error-container">
                <AlertCircle size={48} color="#ff5252" />
                <p>Unable to load logs. Please check your connection.</p>
                <button className="btn retry-btn" onClick={() => loadData(true)}>
                  Retry
                </button>
              </div>
            ) : currentLogs.length === 0 ? (
              <p className="no-logs">
                No {activeTab} logs found. ESP-NOW data will appear here when available.
              </p>
            ) : (
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Street Input (W)</th>
                    <th>To Next (W)</th>
                    <th>House Total (W)</th>
                    <th>Power Loss (W)</th>
                    <th>Theft Alert</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLogs.map((log) => {
                    const lossColor = getPowerLossColor(log.powerLoss);
                    const totalConsumed = (log.toNext || 0) + (log.houseTotal || 0);
                    
                    return (
                      <tr key={log._id}>
                        <td>
                          <div className="date-cell">
                            <div className="date-main">
                              {activeTab === "daily"
                                ? new Date(log.date).toLocaleString()
                                : new Date(log.date).toLocaleDateString()}
                            </div>
                            {activeTab === "daily" && (
                              <div className="date-ago">
                                {new Date(log.date).toLocaleTimeString()}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="power-value">{log.streetInput?.toFixed(2) || 0}</td>
                        <td className="power-value">{log.toNext?.toFixed(2) || 0}</td>
                        <td className="power-value">{log.houseTotal?.toFixed(2) || 0}</td>
                        <td>
                          <span className="power-loss" style={{ color: lossColor }}>
                            {log.powerLoss?.toFixed(2) || 0} W
                          </span>
                          <div className="power-detail">
                            Total: {totalConsumed.toFixed(2)}W
                          </div>
                        </td>
                        <td>{renderTheftAlert(log.theftAlert)}</td>
                        <td>
                          <button
                            className="delete-btn"
                            onClick={() =>
                              setConfirmDelete({
                                type: activeTab,
                                id: log._id,
                                action: "single",
                              })
                            }
                            title="Delete this log entry"
                            disabled={loading}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Confirmation Modal */}
          {confirmDelete && (
            <ConfirmDeleteModal
              onCancel={() => setConfirmDelete(null)}
              onConfirm={async () => {
                if (confirmDelete.action === "single") {
                  if (confirmDelete.type === "daily") {
                    await handleDeleteDaily(confirmDelete.id);
                  } else {
                    await handleDeleteMonthly(confirmDelete.id);
                  }
                } else {
                  if (confirmDelete.type === "daily") {
                    await handleDeleteAllDaily();
                  } else {
                    await handleDeleteAllMonthly();
                  }
                }
                setConfirmDelete(null);
              }}
              type={confirmDelete.action === "all" ? "All logs" : "This log"}
              logCount={confirmDelete.action === "all" ? currentLogs.length : 1}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LogsPage;
