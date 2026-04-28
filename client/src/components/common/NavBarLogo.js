import React from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(() => ({
  logo: {
    padding: "10px",
    fontSize: "medium",
    fontWeight: 700,
    color: "#575656",
    lineHeight: "2vh",
    fontFamily: "system-ui",
    cursor: "pointer",
  },
  logoimg: {
    width: "150px",
    height: "auto",
    maxWidth: "150px",
  },
}));

/**
 * NavBarLogo — reusable logo component with role-aware navigation.
 * - Jobseeker  → /dashboard
 * - Recruiter  → /recruiter-dashboard
 * - Unauthenticated / unknown role → /
 */
const NavBarLogo = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const reduxUser = useSelector((state) => state.UserReducer);

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (reduxUser?.mobile && reduxUser?.role) {
      if (reduxUser.role === "jobseeker") {
        navigate("/dashboard");
      } else if (reduxUser.role === "recruiter") {
        navigate("/recruiter-dashboard");
      } else {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  };

  return (
    <Box
      className={classes.logo}
      sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
      onClick={handleLogoClick}
    >
      <img
        className={classes.logoimg}
        src="/logo.png"
        alt="Logo"
        style={{ maxWidth: "150px", height: "auto" }}
      />
    </Box>
  );
};

export default NavBarLogo;
