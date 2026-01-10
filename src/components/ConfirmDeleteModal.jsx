import React from "react";
import { AlertTriangle } from "lucide-react";
import "../styles/LogsPage.css";

const ConfirmDeleteModal = ({ onCancel, onConfirm }) => {
  return (
    <div className="confirm-overlay">
      <div className="confirm-modal container-card">
        {/* --- Warning Icon --- */}
        <AlertTriangle className="icon-warning" size={48} color="#ff9800" />

        {/* --- Text Content --- */}
        <h4>Are you sure?</h4>
        <p style={{ color: "#555", marginBottom: "1.2rem" }}>
          This action cannot be undone.
        </p>

        {/* --- Buttons --- */}
        <div className="confirm-buttons">
          <button className="btn gray-btn" onClick={onCancel}>
            No
          </button>
          <button className="btn orange-btn" onClick={onConfirm}>
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
