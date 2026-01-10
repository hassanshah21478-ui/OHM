import React, { useState } from "react";
import EditInfo from "../components/EditInfo";
import ConfirmPasswordModal from "../components/ConfirmPasswordModal";

const EditInfoPage = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState(null);
  const [refreshToggle, setRefreshToggle] = useState(false);

  const handleSaveRequest = (data) => {
    setPendingData(data);
    setShowConfirm(true);
  };

  const refreshAdmin = () => {
    setRefreshToggle(!refreshToggle); // triggers useEffect re-fetch in EditInfo
  };

  return (
    <div>
      <EditInfo onSave={handleSaveRequest} refreshKey={refreshToggle} />
      {showConfirm && (
        <ConfirmPasswordModal
          data={pendingData}
          onClose={() => setShowConfirm(false)}
          refreshAdmin={refreshAdmin}
        />
      )}
    </div>
  );
};

export default EditInfoPage;
