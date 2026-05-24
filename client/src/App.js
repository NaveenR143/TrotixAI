import React, { useEffect, useState } from "react";
import { BrowserRouter, useRoutes } from "react-router-dom";
import axios from "axios";
import {
  CssBaseline, ThemeProvider, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Button, Box, Typography
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { HelmetProvider } from "react-helmet-async";
import { useSelector, useDispatch } from "react-redux";
import { withAITracking } from "@microsoft/applicationinsights-react-js";
import { reactPlugin } from "./AppInsights"; // Import the initialized plugin

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// import { ClearCacheProvider } from "react-clear-cache";

import RTL from "./layouts/full-layout/customizer/RTL";
import ThemeSettings from "./layouts/full-layout/customizer/ThemeSettings";
import Router from "./routes/Router";
import LoadingSpinnerComp from "./components/common/LoadingSpinnerComp";

// Global Typography Styles - Open Sans font standardization
import "./assets/css/typography-global.css";

const AppRoutes = () => {
  return useRoutes(Router);
};

// IP Geolocation API Configuration
const API_KEY = "4a791e834ecd4110b3b047da9b5d3ab5"; // Replace with your actual API key

const App = () => {
  const theme = ThemeSettings();
  const customizer = useSelector((state) => state.CustomizerReducer);
  const dispatch = useDispatch();
  const { latitude, longitude } = useSelector((state) => state.UserReducer);


  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const { mobile, city } = useSelector((state) => state.UserReducer);

  useEffect(() => {
    // Call IP Geolocation API only if mobileNumber or city is not available
    const shouldFetchGeolocation = !mobile || !city;

    const fetchIPGeolocation = async () => {
      try {
        const url = `https://api.ipgeolocation.io/v3/ipgeo?apiKey=${API_KEY}`;
        const response = await axios.get(url);

        const user_details = {
          IP: response.data.ip,
          country: response.data.location.country_name,
          state: response.data.location.state_prov,
          city: response.data.location.city,
          district: response.data.location.district,
          latitude: response.data.location.latitude,
          longitude: response.data.location.longitude,
          zipcode: response.data.location.zipcode,
        };

        // Update Redux with geolocation data
        dispatch({
          type: "UPDATE_USER_PROFILE",
          payload: {
            city: user_details.city,
            latitude: user_details.latitude,
            longitude: user_details.longitude,
            state: user_details.state,
            country: user_details.country,
            district: user_details.district,
            zipcode: user_details.zipcode,
          }
        });
        console.log("UserReducer updated with geolocation data");
      } catch (error) {
        console.error("Error fetching IP geolocation:", error.message);
        if (error.response) {
          console.error("Response error:", error.response.data);
        }
      }
    };

    // Only fetch if geolocation data is not available
    if (shouldFetchGeolocation) {
      fetchIPGeolocation();
    }

    // Add Google Material Icons link
    const link = document.createElement("link");
    link.href = encodeURI(
      "https://fonts.googleapis.com/icon?family=Material+Icons"
    );
    link.rel = "stylesheet";
    link.type = "text/css";
    document.head.appendChild(link);


  }, [dispatch, mobile, city, latitude, longitude]);

  return (
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <RTL direction={customizer.activeDir}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <CssBaseline />
              <LoadingSpinnerComp />
              <AppRoutes />
            </LocalizationProvider>
          </RTL>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
};

export default withAITracking(reactPlugin, App);
