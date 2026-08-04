import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "../../authContext";
import Spinner from "./Spinner";

const AdminRoute = ({ children }) => {
  const { loading } = useAuth();
  const user = useSelector((state) => state.UserReducer);

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

  const userrole = user?.role || user?.userrole;
  const isAdmin = userrole?.toLowerCase() === "recruiter";

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
};

export default AdminRoute;
