import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import store from "./redux/Store";
import { Provider } from "react-redux";
import { AuthProvider } from "./authContext";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
// import { setAssetPath } from "@esri/calcite-components";
// import "leaflet/dist/leaflet.css";
// import "@esri/calcite-components/dist/calcite/calcite.css";

const domNode = document.getElementById("root");
const root = createRoot(domNode);
// setAssetPath("./assets/esri/");

root.render(
  <Provider store={store}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Provider>
);

serviceWorkerRegistration.register();
