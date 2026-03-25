import React, { lazy } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import Loadable from "../layouts/full-layout/loadable/Loadable";
import { mockJobs, mockProfileData } from "../components/layout/MainLayout/mockData";

const MainLayout = Loadable(
  lazy(() => import("../components/layout/MainLayout"))
);

const EntryScreen = Loadable(lazy(() => import("../components/layout/MainLayout/components/EntryScreen")));
const ProcessingScreen = Loadable(lazy(() => import("../components/layout/MainLayout/components/ProcessingScreen")));
const ProfileEditScreen = Loadable(lazy(() => import("../components/layout/MainLayout/components/ProfileEditScreen")));
const JobFeedScreen = Loadable(lazy(() => import("../components/layout/MainLayout/components/JobFeedScreen")));
const JobDetailScreen = Loadable(lazy(() => import("../components/layout/MainLayout/components/JobDetailScreen")));

/* ***Layouts**** */
const BlankLayout = Loadable(
  lazy(() => import("../layouts/blank-layout/BlankLayout"))
);
/* ***End Layouts**** */

/* ***Route Wrappers*** */
const EntryRoute = () => {
  const navigate = useNavigate();
  return <EntryScreen onUpload={() => navigate('/processing')} onDirectSearch={() => navigate('/feed')} />;
};

const ProcessingRoute = () => {
  const navigate = useNavigate();
  return <ProcessingScreen onComplete={() => navigate('/profile')} />;
};

const ProfileRoute = () => {
  const navigate = useNavigate();
  return <ProfileEditScreen initialData={mockProfileData} onSave={() => navigate('/feed')} />;
};

const FeedRoute = () => {
  const navigate = useNavigate();
  return <JobFeedScreen jobs={mockJobs} onOpenDetail={(job) => navigate('/detail/' + job.id)} onGoBack={() => navigate('/')} />;
};

const DetailRoute = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const job = mockJobs.find(j => j.id.toString() === id);
  if (!job) return <Navigate to="/feed" replace />;
  return <JobDetailScreen job={job} onBack={() => navigate('/feed')} />;
};

/* ****Routes***** */
const Router = [
  {
    path: "/",
    element: <BlankLayout />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          { index: true, element: <EntryRoute /> },
          { path: "processing", element: <ProcessingRoute /> },
          { path: "profile", element: <ProfileRoute /> },
          { path: "feed", element: <FeedRoute /> },
          { path: "detail/:id", element: <DetailRoute /> },
        ]
      },
      { path: "*", element: <Navigate to="/error/404" /> },
    ],
  },
  {
    path: "error",
    children: [
      { path: "404", element: <div>404 Not Found</div> },
      { path: "*", element: <Navigate to="/error/404" /> },
    ],
  },
];

export default Router;
