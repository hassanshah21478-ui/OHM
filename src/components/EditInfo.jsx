import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import ConfirmPasswordModal from "./ConfirmPasswordModal";
import SuccessModal from "./SuccessModal";
import "../styles/EditInfo.css";

const EditInfo = () => {
  const { admin, setAdmin } = useAdmin();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: admin?.name || "",
    uId: admin?.uId || "",
    email: admin?.email || "",
    designation: admin?.designation || "",
    area: admin?.area || "",
    profilePic: null,
  });

  const [preview, setPreview] = useState(admin?.profilePic || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // ✅ Handle text input changes
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    setSuccess("");
  };

  // ✅ Handle image upload + live preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, profilePic: file }));
      setPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  // ✅ Validate before showing password modal
  const handleSave = () => {
    if (
      !formData.name.trim() ||
      !formData.uId.trim() ||
      !formData.email.trim() ||
      !formData.designation.trim() ||
      !formData.area.trim()
    ) {
      setError("Please fill out all required fields before saving.");
      return;
    }
    setError("");
    setShowConfirmModal(true);
  };

  // ✅ Enter key handler
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
  };

  // ✅ On successful update
  const handleUpdateSuccess = (updatedAdmin) => {
    setAdmin(updatedAdmin);
    setShowConfirmModal(false);
    setShowSuccessModal(true);
    setSuccess("Information updated successfully.");
  };

  return (
    <div className="edit-info-container">
      <h2>Edit Information</h2>

      {/* === Admin Info Fields === */}
      <div className="form-group">
        <label>Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="form-group">
        <label>ID</label>
        <input
          type="text"
          name="uId"
          value={formData.uId}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="form-group">
        <label>Designation</label>
        <input
          type="text"
          name="designation"
          value={formData.designation}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="form-group">
        <label>Area / Street</label>
        <input
          type="text"
          name="area"
          value={formData.area}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="form-group">
        <label>Profile Picture</label>
        <input
          type="file"
          accept=".jpg,.jpeg,.png"
          onChange={handleFileChange}
        />
        {preview && (
          <img src={preview} alt="Preview" className="preview-img" loading="lazy" />
        )}
      </div>

      {/* === Feedback === */}
      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

      {/* === Save Button === */}
      <div className="form-actions">
        <button className="btn-save" onClick={handleSave}>
          Save
        </button>
      </div>

      {/* === Password Confirmation Modal === */}
      {showConfirmModal && (
        <ConfirmPasswordModal
          onClose={() => setShowConfirmModal(false)}
          onSuccess={handleUpdateSuccess}
          formData={formData}
        />
      )}

      {/* === Success Modal === */}
      {showSuccessModal && (
        <SuccessModal
          message="Information updated successfully!"
          onOk={() => {
            setShowSuccessModal(false);
            navigate("/dashboard");
          }}
        />
      )}
    </div>
  );
};

export default EditInfo;
