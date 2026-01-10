import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "../styles/ConfirmPasswordModal.css";

const ConfirmPasswordModal = ({ onClose, onSuccess, formData }) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();

      // ✅ Append all form fields safely
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) fd.append(key, value);
      });

      fd.append("password", password);

      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await res.json();

      if (!data.success) {
        setError("Wrong password or update failed.");
        setLoading(false);
        return;
      }

      onSuccess(data.admin);
    } catch (err) {
      console.error("Error updating admin:", err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content">
        <h3>Confirm Password</h3>

        {/* 🔐 Password Field */}
        <div className="password-input-container">
          <input
            type={showPassword ? "text" : "password"}
            className="password-input"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="current-password"
            disabled={loading}
          />
          <span
            className="toggle-eye"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
        </div>


        {/* ⚠️ Error Message */}
        {error && <p className="error-text">{error}</p>}

        {/* 💾 Actions */}
        <div className="modal-actions">
          <button
            className="btn-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Back
          </button>
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPasswordModal;
