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
      
      // ✅ FIRST verify password
      const verifyRes = await fetch(
        `${process.env.REACT_APP_API_URL}/api/admin/verify-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password }),
        }
      );

      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        setError("Wrong password");
        setLoading(false);
        return;
      }

      // ✅ THEN update admin (send as JSON, not FormData)
      const updateRes = await fetch(
        `${process.env.REACT_APP_API_URL}/api/admin`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            uId: formData.uId,
            email: formData.email,
            designation: formData.designation,
            area: formData.area,
            // NO profilePic field
          }),
        }
      );

      const data = await updateRes.json();

      if (!data.success) {
        setError(data.message || "Update failed");
        setLoading(false);
        return;
      }

      // Success!
      onSuccess(data.admin);
    } catch (err) {
      console.error("Error updating admin:", err);
      setError("Server error. Please try again later.");
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