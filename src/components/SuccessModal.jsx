import React from "react";
import "../styles/SuccessModal.css";

const SuccessModal = ({ message = "Successful", onOk }) => {
  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-modal-title"
    >
      <div className="modal-content">
        <h3 id="success-modal-title">{message}</h3>

        <div className="modal-actions" style={{ justifyContent: "center" }}>
          <button className="btn-save" onClick={onOk}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
