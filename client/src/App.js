import React, { useEffect, useState } from "react";
import { BrowserRouter, useRoutes } from "react-router-dom";
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

// import { ClearCacheProvider } from "react-clear-cache";

import RTL from "./layouts/full-layout/customizer/RTL";
import ThemeSettings from "./layouts/full-layout/customizer/ThemeSettings";
import Router from "./routes/Router";
import LoadingSpinnerComp from "./components/common/LoadingSpinnerComp";

const AppRoutes = () => {
  return useRoutes(Router);
};

const App = () => {
  const theme = ThemeSettings();
  const customizer = useSelector((state) => state.CustomizerReducer);
  const dispatch = useDispatch();
  const { latitude, longitude } = useSelector((state) => state.UserReducer);

  const [locationError, setLocationError] = useState(null);
  const [showLocationDialog, setShowLocationDialog] = useState(false);

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Geolocation retrieved:", latitude, longitude);
          dispatch({
            type: "UPDATE_USER_PROFILE",
            payload: { latitude, longitude }
          });
          setShowLocationDialog(false);
          setLocationError(null);
        },
        (error) => {
          console.warn("Geolocation access denied or unavailable:", error.message);
          setLocationError(error.message);
          if (error.code === 1) { // PERMISSION_DENIED
            // setShowLocationDialog(true);
          }
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      console.warn("Geolocation is not supported by this browser.");
      setLocationError("Geolocation not supported");
    }
  };

  useEffect(() => {
    // Add Google Material Icons link
    const link = document.createElement("link");
    link.href = encodeURI(
      "https://fonts.googleapis.com/icon?family=Material+Icons"
    );
    link.rel = "stylesheet";
    link.type = "text/css";
    document.head.appendChild(link);

    // Initial check
    if (!latitude || !longitude) {
      requestLocation();
    }
  }, [dispatch, latitude, longitude]);

  return (
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <RTL direction={customizer.activeDir}>
            <CssBaseline />
            <LoadingSpinnerComp />
            <AppRoutes />

            {/* Location Permission Re-prompt Dialog */}
            <Dialog
              open={showLocationDialog}
              onClose={() => setShowLocationDialog(false)}
              PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
            >
              <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 800 }}>
                <LocationOnIcon sx={{ color: '#6366f1' }} /> Enable Location Access
              </DialogTitle>
              <DialogContent>
                <DialogContentText sx={{ color: 'text.primary', mb: 2 }}>
                  TrotixAI uses your location to find the best job matches nearby.
                  It looks like location access was denied.
                </DialogContentText>
                <Box sx={{ bgcolor: '#fff7ed', p: 2, borderRadius: 2, border: '1px solid #ffedd5', display: 'flex', gap: 1.5 }}>
                  <WarningAmberIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: '#92400e', fontWeight: 500 }}>
                    To enable, click the lock icon in your browser's address bar and set Location to "Allow", then click Retry.
                  </Typography>
                </Box>
              </DialogContent>
              <DialogActions sx={{ p: 2.5, pt: 1 }}>
                <Button onClick={() => setShowLocationDialog(false)} sx={{ color: '#64748b', fontWeight: 600 }}>
                  Maybe Later
                </Button>
                <Button
                  onClick={requestLocation}
                  variant="contained"
                  sx={{
                    bgcolor: '#6366f1',
                    '&:hover': { bgcolor: '#4f46e5' },
                    px: 3,
                    borderRadius: 2,
                    fontWeight: 700
                  }}
                >
                  Retry Access
                </Button>
              </DialogActions>
            </Dialog>
          </RTL>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
};

export default withAITracking(reactPlugin, App);
