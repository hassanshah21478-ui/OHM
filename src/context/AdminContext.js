import React, { createContext, useState, useEffect, useContext } from "react";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdmin = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setAdmin(null);
        setLoading(false);
        return;
      }

      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success && data.admin) {
        // ✅ Backend already gives full URL for profilePic
        setAdmin(data.admin);
      } else {
        setAdmin(null);
      }
    } catch (err) {
      console.error("⚠️ Failed to fetch admin:", err);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AdminContext.Provider value={{ admin, setAdmin, fetchAdmin, loading }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
