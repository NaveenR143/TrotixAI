import React, { useEffect } from "react";
import { BrowserRouter, useRoutes } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { HelmetProvider } from "react-helmet-async";
import { useSelector } from "react-redux";
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

  useEffect(() => {
    const link = document.createElement("link");
    link.href = encodeURI(
      "https://fonts.googleapis.com/icon?family=Material+Icons"
    );
    link.rel = "stylesheet";
    link.type = "text/css";
    document.head.appendChild(link);
  }, []);

  return (
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <RTL direction={customizer.activeDir}>
            <CssBaseline />
            {/* <ClearCacheProvider duration={5000}> */}
            <LoadingSpinnerComp />
            <AppRoutes />
            {/* </ClearCacheProvider> */}
          </RTL>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
};

export default withAITracking(reactPlugin, App);
