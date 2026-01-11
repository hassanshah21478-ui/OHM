import React from "react";
import { UserCog } from "lucide-react";
import "../styles/AdminInfoCard.css";

const AdminInfoCard = ({ admin }) => {
  if (!admin) return null;

  return (
    <div className="admin-info-card">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-icon">
          <UserCog size={20} />
        </div>
        <h3>Admin Information</h3>
      </div>

      {/* Body */}
      <div className="admin-body">
        {/* Profile Picture - NOW USING FIXED LOGO */}
        <div className="admin-pic">
          <img
            src="/proLogo.png"  // ← Changed to fixed logo
            alt="OHM Logo"
            className="admin-profile-pic"
            onError={(e) => {
              e.target.src = "/proLogo.png";
            }}
          />
        </div>

        {/* Info */}
        <div className="admin-fields">
          <p>
            <strong>Name:</strong> {admin.name || "—"}
          </p>
          <p>
            <strong>ID:</strong> {admin.uId || "—"}
          </p>
          <p>
            <strong>Area / Street:</strong> {admin.area || "—"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminInfoCard;