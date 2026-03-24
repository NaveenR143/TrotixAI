import React, { lazy } from "react";
import { Navigate } from "react-router-dom";
import Loadable from "../layouts/full-layout/loadable/Loadable";
import ProtectedRoute from "../components/common/ProtectedRoute";
import TermsOfUseLayoutComp from "../components/others/TermsOfUseLayoutComp";

const MainLayout = Loadable(
  lazy(() => import("../components/layout/MainLayout"))
);

/* ***Layouts**** */
const FullLayout = Loadable(
  lazy(() => import("../layouts/full-layout/FullLayout"))
);
const BlankLayout = Loadable(
  lazy(() => import("../layouts/blank-layout/BlankLayout"))
);

/* ***End Layouts**** */

/* ****Routes***** */

const Router = [
  {
    path: "/",
    element: <BlankLayout />,
    children: [
      { path: "/", element: <MainLayout /> },
      { path: "*", element: <Navigate to="/error/404" /> },
    ],
  },
  // {
  //   path: "/naturalgaspipelines",
  //   element: <GasPipelinesLayoutComp />
  // },

  {
    path: "error",
    children: [
      { path: "404", element: <Error /> },
      { path: "*", element: <Navigate to="/error/404" /> },
    ],
  },
];

export default Router;
