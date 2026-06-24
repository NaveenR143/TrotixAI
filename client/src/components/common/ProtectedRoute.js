// ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../authContext";
import Spinner from "./Spinner";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100%'
      }}>
        <Spinner />
      </div>
    );
  }

  if (!user) {
    // Save the current location they were trying to access
    return <Navigate to={`/?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return children;
};

export default ProtectedRoute;