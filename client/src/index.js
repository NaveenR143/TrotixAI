import React from "react";
import { createRoot } from "react-dom/client";
import ReactDOM from "react-dom";

// Polyfill ReactDOM.findDOMNode for React 19 compatibility with legacy libraries (like react-to-print)
try {
  const rDOM = require("react-dom");
  if (rDOM && !rDOM.findDOMNode) {
    rDOM.findDOMNode = (node) => node;
  }
} catch (e) {
  console.warn("Failed to polyfill react-dom via require:", e);
}

if (ReactDOM && !ReactDOM.findDOMNode) {
  try {
    ReactDOM.findDOMNode = (node) => node;
  } catch (e) {
    console.warn("Failed to polyfill react-dom default export:", e);
  }
}

import App from "./App";
import store from "./redux/Store";
import { Provider } from "react-redux";
import { AuthProvider } from "./authContext";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import axios from "axios";
import { RESET_INITIAL_STATE } from "./redux/constants";
import { API_BASE_URL } from "./config/api.config";

// Set withCredentials to true globally for Axios to handle cookies
axios.defaults.withCredentials = true;

// Global Axios Request Interceptor to attach Authorization header
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    const url = config.url || "";
    // Only attach Authorization header to backend API requests
    const isBackendRequest = !url.startsWith("http") || url.startsWith(API_BASE_URL);
    if (token && isBackendRequest) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global Axios Interceptor for 401 Unauthorized
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    // Only intercept 401 errors for backend API requests to prevent third-party failures (e.g. Geolocation API) from logging out the user
    const isBackendRequest = !url.startsWith("http") || url.startsWith(API_BASE_URL);

    if (error.response && error.response.status === 401 && isBackendRequest) {
      console.warn("Unauthorized access - Clearing session");

      // 1. Clear all web storage
      localStorage.clear();
      sessionStorage.clear();

      // 2. Clear all cookies (best effort)
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // 3. Reset Redux store
      store.dispatch({ type: RESET_INITIAL_STATE });

      // 4. Redirect to login page ONLY if not already on a public path
      const currentPath = window.location.pathname;
      const isPublicPath =
        currentPath === "/" ||
        currentPath === "/login" ||
        currentPath === "/terms" ||
        currentPath.startsWith("/job/") ||
        currentPath === "/processing" ||
        currentPath === "/manual-profile" ||
        currentPath === "/govt-jobs" ||
        currentPath.startsWith("/error");

      if (!isPublicPath) {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

const domNode = document.getElementById("root");
const root = createRoot(domNode);

root.render(
  <Provider store={store}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Provider>
);

serviceWorkerRegistration.register();
