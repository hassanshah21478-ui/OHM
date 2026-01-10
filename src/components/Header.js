import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import { UserPen, KeyRound, LogOut } from "lucide-react";
import "../styles/Header.css";

const Header = () => {
  const { admin } = useAdmin();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="header compact-header dark-header">
      <div className="header-left">
        <img
          src="/logo.png"
          alt="Logo"
          className="header-logo"
          onClick={() => navigate("/dashboard")}
        />
      </div>

      <div className="profile-area" ref={dropdownRef}>
        <button
          className="admin-oval"
          onClick={() => setOpen(!open)}
          aria-label="Profile Menu"
        >
          <img
            src={admin?.profilePic || "/default-avatar.png"}
            alt="Admin Avatar"
            className="header-avatar"
          />
          <span className="header-name">{admin?.name || "Admin"}</span>
        </button>

        {open && (
          <div className="dropdown-menu slide-down">
            <button onClick={() => navigate("/edit-info")} className="menu-btn">
              <UserPen size={17} />
              <span>Edit Information</span>
            </button>
            <button
              onClick={() => navigate("/change-password")}
              className="menu-btn"
            >
              <KeyRound size={17} />
              <span>Change Password</span>
            </button>
            <button onClick={logout} className="menu-btn logout-btn">
              <LogOut size={17} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
