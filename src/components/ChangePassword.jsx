import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PasswordInput from "../components/PasswordInput";
import SuccessModal from "./SuccessModal";
import "../styles/ChangePassword.css";

const ChangePassword = () => {
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const checkStrength = (password) => {
    if (password.length < 8) return "Weak";
    if (/[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password))
      return "Strong";
    return "Medium";
  };

  const handleSave = async () => {
    setError("");

    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim())
      return setError("Please fill in all password fields.");

    if (newPassword.length < 8)
      return setError("Password must be at least 8 characters long.");

    if (newPassword !== confirmPassword)
      return setError("Passwords do not match.");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/admin/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ oldPassword, newPassword }),
        }
      );

      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Failed to change password.");
      } else {
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error("Change password error:", err);
      setError("Server error. Please try again later.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
  };

  return (
    <div className="container-card full-width change-password-container">
      <h2>Change Password</h2>

      {/* Old Password */}
      <div className="form-group">
        <label>Old Password</label>
        <PasswordInput
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          placeholder="Enter old password"
          onKeyDown={handleKeyDown}
          autoComplete="current-password"
          required
        />
      </div>

      {/* New Password */}
      <div className="form-group">
        <label>New Password</label>
        <PasswordInput
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter new password"
          onKeyDown={handleKeyDown}
          autoComplete="new-password"
          required
        />
        {newPassword && (
          <p className={`strength-text ${checkStrength(newPassword).toLowerCase()}`}>
            Strength: {checkStrength(newPassword)}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="form-group">
        <label>Retype New Password</label>
        <PasswordInput
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Retype new password"
          onKeyDown={handleKeyDown}
          autoComplete="new-password"
          required
        />
      </div>

      {error && <p className="alert-text error-text">{error}</p>}

      <div className="form-actions">
        <button className="btn-save" onClick={handleSave}>
          Save
        </button>
      </div>

      {showSuccessModal && (
        <SuccessModal
          message="Password updated successfully!"
          onOk={() => {
            setShowSuccessModal(false);
            navigate("/dashboard");
          }}
        />
      )}
    </div>
  );
};

export default ChangePassword;
