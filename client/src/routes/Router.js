// routes/Router.js
import React, { lazy } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Loadable from "../layouts/full-layout/loadable/Loadable";
import { jobService } from "../services/jobService";
import { profileService } from "../services/profileService";
import { mockJobs, mockProfileData } from "../services/mockData";

const MainLayout = Loadable(lazy(() => import("../components/layout/MainLayout")));

const EntryScreen = Loadable(lazy(() => import("../screens/candidate/EntryScreen")));
const ProcessingScreen = Loadable(lazy(() => import("../screens/candidate/ProcessingScreen")));
const UserProfileScreen = Loadable(lazy(() => import("../screens/candidate/UserProfile")));
const ManualProfileScreen = Loadable(lazy(() => import("../screens/candidate/ManualProfileScreen")));
const JobFeedScreen = Loadable(lazy(() => import("../screens/candidate/JobFeedScreen")));
const JobDetailScreen = Loadable(lazy(() => import("../screens/candidate/JobDetailScreen")));
const AddCreditsScreen = Loadable(lazy(() => import("../screens/candidate/AddCreditsScreen")));
const LoginScreen = Loadable(lazy(() => import("../screens/candidate/LoginWrapper")));
const DashboardScreen = Loadable(lazy(() => import("../screens/candidate/DashboardScreen")));
const RecruiterDashboardScreen = Loadable(lazy(() => import("../screens/recruiter/DashboardScreen")));
const RecruitersScreen = Loadable(lazy(() => import("../screens/candidate/RecruitersScreen")));
const ConsultantsScreen = Loadable(lazy(() => import("../screens/consultants/ConsultantsScreen")));
const PostJobScreen = Loadable(lazy(() => import("../screens/recruiter/PostJobScreen")));
const PostedJobsScreen = Loadable(lazy(() => import("../screens/recruiter/PostedJobsScreen")));
const TemplateSelectorScreen = Loadable(lazy(() => import("../screens/resume_builder/TemplateSelectorScreen")));
const ResumeBuilderScreen = Loadable(lazy(() => import("../screens/resume_builder/ResumeBuilderScreen")));

/* ***Layouts**** */
const BlankLayout = Loadable(lazy(() => import("../layouts/blank-layout/BlankLayout")));

/* ***Route Wrappers*** */
const EntryRoute = () => {
  const navigate = useNavigate();
  return <EntryScreen onUpload={(data) => {
    // Navigate to processing and pass resume data
    navigate('/processing', { state: data });
  }} onDirectSearch={() => navigate('/feed')} onManualEntry={() => navigate('/manual-profile')} onPostJob={() => navigate('/post-job')} />;
};

const ManualProfileRoute = () => {
  const navigate = useNavigate();
  return <ManualProfileScreen onSave={() => navigate('/feed')} onBack={() => navigate('/')} />;
};

const RecruiterDashboardRoute = () => {
  const navigate = useNavigate();
  return <RecruiterDashboardScreen onSave={() => navigate('/recruiter-dashboard')} onBack={() => navigate('/')} />;
};

const ProcessingRoute = () => {
  const navigate = useNavigate();
  return <ProcessingScreen onComplete={(verificationData) => {
    // Pass verification data to profile screen if available
    navigate('/profile', { state: { verificationData } });
  }} />;
};

const ProfileRoute = () => {
  const navigate = useNavigate();
  // In a real app, we'd fetch the parsed profile from state/service
  return <UserProfileScreen initialData={mockProfileData} onSave={() => navigate('/feed')} />;
};

const FeedRoute = () => {
  const navigate = useNavigate();
  const profile = useSelector((state) => state.UserReducer);
  const userId = profile?.id || '4bfcd973-7f38-4fd9-80f2-b8c133075fcb';

  return <JobFeedScreen userId={userId} onOpenDetail={(job) => navigate('/detail/' + job.id)} onGoBack={() => navigate('/')} />;
};

const DetailRoute = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const job = mockJobs.find(j => j.id.toString() === id);
  if (!job) return <Navigate to="/feed" replace />;
  return <JobDetailScreen job={job} onBack={() => navigate('/feed')} />;
};

const CreditsRoute = () => {
  return <AddCreditsScreen />;
};

const DashboardRoute = () => {
  const navigate = useNavigate();
  return <DashboardScreen />;
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
          { path: "dashboard", element: <DashboardRoute /> },
          { path: "manual-profile", element: <ManualProfileRoute /> },
          { path: "processing", element: <ProcessingRoute /> },
          { path: "profile", element: <ProfileRoute /> },
          { path: "feed", element: <FeedRoute /> },
          { path: "detail/:id", element: <DetailRoute /> },
          { path: "credits", element: <CreditsRoute /> },
          { path: "login", element: <LoginScreen /> },
          { path: "post-job", element: <PostJobScreen /> },
          { path: "posted-jobs", element: <PostedJobsScreen /> },
          { path: "recruiters", element: <RecruitersScreen /> },
          { path: "consultants", element: <ConsultantsScreen /> },
          { path: "resume-builder", element: <TemplateSelectorScreen /> },
          { path: "resume-builder/create", element: <ResumeBuilderScreen /> },
          { path: "learning", element: <div>Learning Screen (Coming Soon)</div> },
          { path: "recruiter-dashboard", element: <RecruiterDashboardRoute /> },
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
