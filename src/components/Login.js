import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import PasswordInput from "../components/PasswordInput";
import LoginFooter from "../components/LoginFooter";
import { Users } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showCredits, setShowCredits] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        setError("Invalid email or password.");
      }
    } catch {
      setError("Server error. Please try again later.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin(e);
  };

  return (
    <div className="login-page">
      <img src="/logo.png" alt="Logo" className="logo" />

      <div className="login-container slide-in">
        <h2>Admin Login</h2>

        <form onSubmit={handleLogin} noValidate>
          <div className="input-icon-wrapper">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="username"
              required
            />
          </div>

          <PasswordInput
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 8 chars)"
            required
          />

          {error && <p className="alert-text error-text">{error}</p>}

          <button className="primary-btn" type="submit">
            Login
          </button>

          <p
            onClick={() => navigate("/forgot")}
            className="forgot-link"
            tabIndex={0}
          >
            Forgot Password?
          </p>
        </form>
      </div>

      <button className="credits-btn" onClick={() => setShowCredits(true)}>
        <Users size={16} /> Team OHM
      </button>

      <LoginFooter />

      {showCredits && (
        <div className="credits-modal-overlay" onClick={() => setShowCredits(false)}>
          <div className="credits-modal" onClick={(e) => e.stopPropagation()}>
            <div className="credits-header">
              <img src="/proLogo.png" alt="Project Logo" className="credits-logo" />
              <h3>Team OHM</h3>
              <button className="close-btn" onClick={() => setShowCredits(false)}>×</button>
            </div>
            
            <div className="credits-content">
              <div className="team-member-card">
                <div className="member-role lead">Lead Developer</div>
                <div className="member-name">Syed Hassan</div>
                <div className="member-desc">Responsible for full application implementation, upgrades to backend and frontend systems, and final integration of hardware and software.</div>
              </div>
              
              <div className="team-member-card">
                <div className="member-role software">Software Developer</div>
                <div className="member-name">Orangzaib</div>
                <div className="member-desc">Designed and developed the initial backend structure and frontend interface.</div>
              </div>
              
              <div className="team-member-card">
                <div className="member-role hardware">Hardware Engineer</div>
                <div className="member-name">Maliha</div>
                <div className="member-desc">Built and deployed the hardware components that power the system.</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
