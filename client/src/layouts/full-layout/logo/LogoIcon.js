import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import LogoDark from "../../../assets/images/logos/logo-dark.svg?component";
import LogoLight from "../../../assets/images/logos/logo-white.svg?component";

const LogoIcon = () => {
  const customizer = useSelector((state) => state.CustomizerReducer);
  const user = useSelector((state) => state.UserReducer);
  const navigate = useNavigate();

  const handleLogoClick = (e) => {
    e.preventDefault();
    debugger;

    // If already logged in, redirect to appropriate dashboard
    if (user?.mobile && user?.role) {
      if (user.role === "jobseeker") {
        navigate("/dashboard");
      } else if (user.role === "recruiter") {
        navigate("/recruiter-dashboard");
      } else {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  };

  return (
    <Box sx={{ width: "200px", cursor: "pointer" }} onClick={handleLogoClick}>
      {customizer.activeMode === "dark" ? <LogoLight /> : <LogoDark />}
    </Box>
  );
};

export default LogoIcon;
