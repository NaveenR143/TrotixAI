import React, { useState, useEffect, useMemo } from "react";
import { makeStyles, styled } from "@mui/styles";
import {
  Box,
  Grid,
  Typography,
  Divider,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Chip,
} from "@mui/material";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../authContext";
import SidebarComp from "./SidebarComp";
import { signOut } from "firebase/auth";
import { Alert } from "@mui/material";
import SignIn from "./SignIn";
import Signup from "./SignUp";
import { auth } from "../../firebase";

const useStyles = makeStyles((theme) => ({
  logo: {
    padding: "10px",
    fontSize: "medium",
    fontWeight: 700,
    color: "#575656",
    lineHeight: "2vh",
    fontFamily: "system-ui",
  },
  logoimg: {
    width: "150px",
    height: "auto",
  },
}));

const HeaderContainerComp = ({ children }) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [openLogin, setOpenLogin] = useState(false);
  const [opensignup, setOpenSignup] = useState(false);

  const [displayname, setDisplayname] = useState("Guest");

  const [notification, setNotification] = useState({
    message: "",
    severity: "",
    show: false,
  });

  const fnSignout = async () => {
    try {
      const response = await signOut(auth);

      // setDisplayname("Guest");

      setNotification({
        ...notification,
        show: true,
        message: "You’ve been logged out. Come back soon!",
        severity: "success",
      });

      window.location.reload(true);
    } catch (error) {
      console.error("Sign Out Error:", error);

      setNotification({
        ...notification,
        show: true,
        message: "Sign-out failed. Please check your connection and try again.",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    if (user) {
      if (user.displayName) {
        setDisplayname(user.displayName);
      } else if (user.email) {
        setDisplayname(user.email.split("@")[0]);
      }
    }
  }, [user]);

  return (
    <>
      <Helmet>
        <title>OilGasGPT</title>
        <meta
          name="description"
          content="Search and explore detailed data on midstream energy infrastructure including gas storage, gas plants, pipelines, power plants, lng facilities, refineries, and more."
        />
      </Helmet>
      <Box sx={{ flexGrow: 1 }}>
        <Grid
          container
          direction="column"
          sx={{
            height: "100%",
          }}
        >
          {/* Header row with logo (left) and user (right) */}
          <Grid
            item
            sx={{
              pl: 2,
              pr: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Logo on the left */}
            <Box
              className={classes?.logo}
              sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
              onClick={() => navigate("/")}

            >
              <img
                className={classes?.logoimg}
                src="/logo.png"
                alt="Logo"
                style={{
                  maxWidth: "150px",
                  height: "auto",
                }}
              />
            </Box>

            {/* User on the right */}
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="body2" color="text.secondary">
                Welcome,&nbsp;<strong>{displayname}</strong>
              </Typography>
            </Box>
          </Grid>

          <Divider />
        </Grid>
      </Box>
      <Box sx={{ display: "flex" }}>
        {/* Sidebar */}
        <Box
          sx={{
            width: "3%", // 👈 smaller than one 12-column unit
            minWidth: "30px",
            backgroundColor: "#f5f5f5",
          }}
        >
          <SidebarComp
            user={user}
            onSignout={fnSignout}
            onOpenLogin={() => setOpenLogin(true)}
            gpt={false}
            dataCoverage={false}
          />
        </Box>

        {/* Main content */}
        <Box sx={{ flexGrow: 1, overflowY: "auto" }}>{children}</Box>
      </Box>
      {notification.show && (
        <Alert
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            zIndex: 5000000,
            margin: "16px",
          }}
          variant="filled"
          severity={notification.severity}
        >
        </Alert>
      )}
      <SignIn
        open={openLogin}
        onClose={() => setOpenLogin(false)}
        openSignUp={() => setOpenSignup(true)}
      />
      <Signup open={opensignup} onClose={() => setOpenSignup(false)} />
    </>
  );
};

export default HeaderContainerComp;
