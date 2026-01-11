import React from "react";
import { UserCog } from "lucide-react";
import "../styles/AdminInfoCard.css";

const AdminInfoCard = ({ admin }) => {
  if (!admin) return null;

  const profileImage = admin.profilePic 
    ? admin.profilePic 
    : `${process.env.REACT_APP_API_URL || "https://ohm-4su2.onrender.com"}/uploads/default-avatar.png`;

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
        {/* Profile Picture */}
        <div className="admin-pic">
          <img
            src={profileImage}
            alt="Profile"
            className="admin-profile-pic"
            onError={(e) => {
              // Fallback if image fails to load
              e.target.src = `${process.env.REACT_APP_API_URL || "https://ohm-4su2.onrender.com"}/uploads/default-avatar.png`;
              console.log("Image failed to load, using fallback");
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