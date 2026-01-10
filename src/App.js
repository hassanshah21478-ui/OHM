import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import EditInfo from "./pages/EditInfo";
import ChangePassword from "./pages/ChangePassword";
import LogsPage from "./pages/LogsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./styles/GlobalTheme.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/ToastStyles.css";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-info"
            element={
              <ProtectedRoute>
                <EditInfo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/logs"
            element={
              <ProtectedRoute>
                <LogsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        className="custom-toast-container"
        toastClassName="custom-toast"
        bodyClassName="custom-toast-body"
      />
    </>
  );
}

export default App;