import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ForgotPassword.css";
import "../styles/common-eye-style.css";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showRetype, setShowRetype] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // === Password Strength Function ===
  const checkStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    if (strength <= 2) return "Weak";
    if (strength <= 4) return "Medium";
    return "Strong";
  };

  const handleSendCode = async () => {
    setError("");
    setSuccess("");

    if (!email.trim()) return setError("Please enter your registered email.");

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/forgot-password`, { email });
      if (res.data.success) {
        setStep(2);
        setCountdown(59);
        setSuccess("Verification code sent to your email.");
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else setError(res.data.message || "Email not found.");
    } catch {
      setError("Server error. Please try again later.");
    }
  };

  const handleVerifyCode = async () => {
    setError("");
    setSuccess("");

    if (!code.trim()) return setError("Please enter the verification code.");

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/verify-code`, { email, code });
      if (res.data.success) {
        setStep(3);
        setSuccess("Code verified. You may now reset your password.");
      } else setError(res.data.message || "Invalid verification code.");
    } catch {
      setError("Server error. Please try again later.");
    }
  };

  const handleResetPassword = async () => {
    setError("");
    setSuccess("");

    if (newPassword !== retypePassword)
      return setError("Passwords do not match.");
    if (newPassword.length < 8)
      return setError("Password must be at least 8 characters long.");

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/reset-password`, {
        email,
        password: newPassword,
      });

      if (res.data.success) {
        setSuccess("Password reset successful! Redirecting...");
        setTimeout(() => navigate("/"), 1200);
        setStep(1);
        setEmail("");
        setCode("");
        setNewPassword("");
        setRetypePassword("");
      } else setError(res.data.message || "Password reset failed.");
    } catch {
      setError("Server error. Please try again later.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (step === 1) handleSendCode();
      else if (step === 2) handleVerifyCode();
      else if (step === 3) handleResetPassword();
    }
  };

  return (
    <div className="forgot-page">
      <img src="/logo.png" alt="Logo" className="logo" />

      <div className="forgot-container">
        <h2>Forgot Password</h2>

        {step === 1 && (
          <>
            <div className="input-icon-wrapper">
              <input
                type="email"
                placeholder="Enter registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="username"
              />
            </div>

            {error && <p className="alert-text error-text">{error}</p>}
            {success && <p className="alert-text success-text">{success}</p>}
            <button onClick={handleSendCode}>Get Code</button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="input-icon-wrapper">
              <input
                type="text"
                placeholder="Enter verification code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            {error && <p className="alert-text error-text">{error}</p>}
            {success && <p className="alert-text success-text">{success}</p>}

            <div className="action-row">
              <button onClick={handleVerifyCode} disabled={!code}>
                Next
              </button>
              {countdown <= 0 && (
                <button onClick={handleSendCode}>Resend Code</button>
              )}
            </div>

            {countdown > 0 && (
              <p className="countdown-text">Code expires in {countdown}s</p>
            )}
          </>
        )}

        {step === 3 && (
          <>
            {/* New Password */}
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="new-password"
                className="password-input"
              />
              <span
                className="toggle-eye"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            <p className="strength-text">
              Password Strength: <strong>{checkStrength(newPassword)}</strong>
            </p>

            {/* Retype Password */}
            <div className="password-input-container">
              <input
                type={showRetype ? "text" : "password"}
                placeholder="Retype password"
                value={retypePassword}
                onChange={(e) => setRetypePassword(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="new-password"
                className="password-input"
              />
              <span
                className="toggle-eye"
                onClick={() => setShowRetype((s) => !s)}
                aria-label={showRetype ? "Hide password" : "Show password"}
              >
                {showRetype ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            {error && <p className="alert-text error-text">{error}</p>}
            {success && <p className="alert-text success-text">{success}</p>}

            <button onClick={handleResetPassword}>Reset Password</button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
