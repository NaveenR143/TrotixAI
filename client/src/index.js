import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import store from "./redux/Store";
import { Provider } from "react-redux";
import { AuthProvider } from "./authContext";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import axios from "axios";
import { RESET_INITIAL_STATE } from "./redux/constants";

// Set withCredentials to true globally for Axios to handle cookies
axios.defaults.withCredentials = true;

// Global Axios Interceptor for 401 Unauthorized
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
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

      // 4. Redirect to login page ONLY if not already there or on the landing page
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/") {
        window.location.href = "/login";
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
