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
        const adminData = {
          ...data.admin,
          profilePic: "/proLogo.png"  
        };
        
        console.log("✅ Admin data loaded:", adminData);
        setAdmin(adminData);
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
  }, []);

 
  const updateAdmin = (newAdminData) => {
    setAdmin(prev => ({
      ...prev,
      ...newAdminData,
      profilePic: "/proLogo.png"  
    }));
  };

  return (
    <AdminContext.Provider value={{ 
      admin, 
      setAdmin: updateAdmin,  
      fetchAdmin, 
      loading 
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);