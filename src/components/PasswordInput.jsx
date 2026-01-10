import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "../styles/PasswordInput.css";

const PasswordInput = ({ value, onChange, placeholder, name, required = false }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="password-input-container">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="password-input"
      />
      <span
        className="toggle-eye"
        onClick={() => setShow((prev) => !prev)}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </span>
    </div>
  );
};

export default PasswordInput;
