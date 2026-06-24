import React from "react";
import { Box, Container, Fade } from "@mui/material";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "../../authContext";
import AuthComponent from "../../components/common/AuthComponent";
import { CANDIDATE, RECRUITER } from "../../redux/constants";
import Spinner from "../../components/common/Spinner";

const LoginWrapper = () => {
  const { user, loading } = useAuth();
  const reduxUser = useSelector((state) => state.UserReducer);
  const location = useLocation();

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          width: '100%'
        }}
      >
        <Spinner />
      </Box>
    );
  }

  if (user) {
    const searchParams = new URLSearchParams(location.search);
    const redirectUrl = searchParams.get('redirect');
    if (redirectUrl) {
      return <Navigate to={redirectUrl} replace />;
    }
    
    if (reduxUser?.role === RECRUITER) {
      return <Navigate to="/recruiter-dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Box 
      sx={{ 
        bgcolor: '#f8fafc', 
        minHeight: 'calc(100vh - 64px)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        px: 2,
        py: 4
      }}
    >
      <Container maxWidth="xs">
        <Fade in timeout={600}>
          <Box>
            <AuthComponent />
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default LoginWrapper;
