import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "../../authContext";
import Spinner from "./Spinner";
import { CANDIDATE } from "../../redux/constants";

const CandidateRoute = ({ children }) => {
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
  const isCandidate = userrole?.toLowerCase() === CANDIDATE.toLowerCase();

  if (!isCandidate) {
    return <Navigate to="/recruiter-dashboard" replace />;
  }

  return children ? children : <Outlet />;
};

export default CandidateRoute;
