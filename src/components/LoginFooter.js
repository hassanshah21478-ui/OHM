import React from "react";
import { MapPin, Phone, Facebook } from "lucide-react";
import "../styles/LoginFooter.css";

const LoginFooter = () => {
  return (
    <footer className="login-footer">

      <div className="footer-center">
        © 2025 <strong>KIET BEEL STUDENTS SP-22</strong>. All Rights Reserved.
      </div>

      <div className="footer-right">
        <a
          href="https://www.google.com/maps/dir/24.8526145,67.1332277/KIET+North+Nazimbad+Campus,+F-103+,+Block+B%D8%8C+North+Nazimabad%D8%8C,+F+99+Allama+Rasheed+Turabi+Rd,+Block+F+Block+B+North+Nazimabad+Town,+Karachi,+74600%E2%80%AD/@24.8854592,67.0186338,12z/data=!3m1!4b1!4m9!4m8!1m1!4e1!1m5!1m1!1s0x3eb33f9b59133921:0xc443b311fafafc9a!2m2!1d67.048253!2d24.9281391?entry=ttu"
          target="_blank"
          rel="noreferrer"
          className="footer-link"
        >
          <MapPin className="footer-icon" />
          <span>Address</span>
        </a>

        <a
          href="https://wa.me/923101221752"
          target="_blank"
          rel="noreferrer"
          className="footer-link"
        >
          <Phone className="footer-icon" />
          <span>Contact</span>
        </a>

        <a
          href="https://www.facebook.com/THEPAFKIET"
          target="_blank"
          rel="noreferrer"
          className="footer-link"
        >
          <Facebook className="footer-icon" />
          <span>Facebook</span>
        </a>
      </div>
    </footer>
  );
};

export default LoginFooter;
