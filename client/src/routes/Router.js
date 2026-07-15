// routes/Router.js
import React, { lazy } from "react";
import { Navigate, useNavigate, useParams, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import ProtectedRoute from "../components/common/ProtectedRoute";
import RecruiterRoute from "../components/common/RecruiterRoute";
import CandidateRoute from "../components/common/CandidateRoute";
import { useAuth } from "../authContext";
import Spinner from "../components/common/Spinner";
import Loadable from "../layouts/full-layout/loadable/Loadable";
import { jobService } from "../services/jobService";
import { profileService } from "../services/profileService";
import { mockJobs, mockProfileData } from "../services/mockData";
import { CANDIDATE, RECRUITER } from "../redux/constants";

const MainLayout = Loadable(lazy(() => import("../components/layout/MainLayout")));

const EntryScreen = Loadable(lazy(() => import("../screens/candidate/EntryScreen")));
const ProcessingScreen = Loadable(lazy(() => import("../screens/candidate/ProcessingScreen")));
const UserProfileScreen = Loadable(lazy(() => import("../screens/candidate/UserProfile")));
const ManualProfileScreen = Loadable(lazy(() => import("../screens/candidate/ManualProfileScreen")));
const JobFeedScreen = Loadable(lazy(() => import("../screens/candidate/JobFeedScreen")));
const JobDetailScreen = Loadable(lazy(() => import("../screens/candidate/JobDetailScreen")));
const PublicJobDetailScreen = Loadable(lazy(() => import("../screens/candidate/PublicJobDetailScreen")));
const MembershipScreen = Loadable(lazy(() => import("../screens/candidate/MembershipScreen")));
const LoginScreen = Loadable(lazy(() => import("../screens/candidate/LoginWrapper")));
const DashboardScreen = Loadable(lazy(() => import("../screens/candidate/DashboardScreen")));
const RecruiterDashboardScreen = Loadable(lazy(() => import("../screens/recruiter/DashboardScreen")));
const RecruitersScreen = Loadable(lazy(() => import("../screens/candidate/RecruitersScreen")));
const GovtJobsScreen = Loadable(lazy(() => import("../screens/candidate/GovtJobsScreen")));
const GovtJobDetailScreen = Loadable(lazy(() => import("../screens/candidate/GovtJobDetailScreen")));
const ConsultantsScreen = Loadable(lazy(() => import("../screens/consultants/ConsultantsScreen")));
const PostJobScreen = Loadable(lazy(() => import("../screens/recruiter/PostJobScreen")));
const PostedJobsScreen = Loadable(lazy(() => import("../screens/recruiter/PostedJobsScreen")));
const TemplateSelectorScreen = Loadable(lazy(() => import("../screens/resume_builder/TemplateSelectorScreen")));
const ResumeBuilderScreen = Loadable(lazy(() => import("../screens/resume_builder/ResumeBuilderScreen")));
const CareerAdvisorScreen = Loadable(lazy(() => import("../screens/career_advisor/CareerAdvisorScreen")));
const SkillDevelopmentScreen = Loadable(lazy(() => import("../screens/skill_development/SkillDevelopmentScreen")));
const CandidateFeedScreen = Loadable(lazy(() => import("../screens/recruiter/CandidateFeedScreen")));
const CandidateProfileScreen = Loadable(lazy(() => import("../screens/recruiter/CandidateProfileScreen")));



const TermsOfUseLayout = Loadable(lazy(() => import("../components/others/TermsOfUseLayoutComp")));


/* ***Layouts**** */
const BlankLayout = Loadable(lazy(() => import("../layouts/blank-layout/BlankLayout")));

/* ***Route Wrappers*** */
const HomeRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100%'
      }}>
        <Spinner />
      </div>
    );
  }

  return <EntryRoute />;
};

const EntryRoute = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.UserReducer);

  if (user?.mobile && user?.role) {
    const searchParams = new URLSearchParams(location.search);
    const redirectUrl = searchParams.get('redirect');
    if (redirectUrl) {
      return <Navigate to={redirectUrl} replace />;
    }
    // Removed unnecessary default redirects, letting logged-in users stay on landing page
  }

  return (
    <EntryScreen
      onUpload={(data) => {
        // Navigate to processing and pass resume data
        navigate('/processing', { state: data });
      }}
      onDirectSearch={() => {
        if (user?.mobile && user?.role) {
          navigate(user.role === RECRUITER ? '/recruiter-dashboard' : '/dashboard');
        } else {
          navigate({ pathname: '/login', search: location.search });
        }
      }}
      onManualEntry={() => {

        navigate('/manual-profile');
        // if (user?.mobile && user?.role) {
        //   navigate('/manual-profile');
        // } else {
        //   navigate({ pathname: '/login', search: '?redirect=%2Fmanual-profile' });
        // }
      }}
      onPostJob={() => {

        navigate('/post-job');
        // if (user?.mobile && user?.role) {
        //   navigate('/post-job');
        // } else {
        //   navigate({ pathname: '/login', search: '?redirect=%2Fpost-job' });
        // }
      }}
    />
  );
};

const ManualProfileRoute = () => {
  const navigate = useNavigate();
  return <ManualProfileScreen onSave={() => navigate('/dashboard')} onBack={() => navigate('/')} />;
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

  return <JobFeedScreen userId={userId} onOpenDetail={(job) => navigate('/detail/' + job.id)} onGoBack={() => navigate('/dashboard')} onViewProfile={() => navigate('/profile')} />;
};

const DetailRoute = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const job = mockJobs.find(j => j.id.toString() === id);
  if (!job) return <Navigate to="/feed" replace />;
  return <JobDetailScreen job={job} onBack={() => navigate('/feed')} />;
};

const MembershipRoute = () => {
  return <MembershipScreen />;
};

const DashboardRoute = () => {
  // const navigate = useNavigate();
  return <DashboardScreen />;
};

const JobApplicantsScreen = Loadable(lazy(() => import("../screens/recruiter/JobApplicantsScreen")));

const NotFound = Loadable(lazy(() => import("../screens/error/NotFound")));

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
          { index: true, element: <HomeRoute /> },
          { path: "login", element: <LoginScreen /> },
          { path: "terms", element: <TermsOfUseLayout /> },
          { path: "govt-jobs", element: <GovtJobsScreen /> },
          { path: "job/:id", element: <PublicJobDetailScreen /> },
          { path: "processing", element: <ProcessingRoute /> },
          { path: "manual-profile", element: <ManualProfileRoute /> },
          { path: "post-job", element: <PostJobScreen /> },
          {
            element: <ProtectedRoute><Outlet /></ProtectedRoute>,
            children: [

              //Candidate
              {
                element: <CandidateRoute><Outlet /></CandidateRoute>,
                children: [
                  { path: "profile", element: <ProfileRoute /> },
                  { path: "membership", element: <MembershipRoute /> },
                  { path: "dashboard", element: <DashboardRoute /> },
                  { path: "feed", element: <FeedRoute /> },
                  { path: "detail/:id", element: <DetailRoute /> },
                  { path: "recruiters", element: <RecruitersScreen /> },
                  { path: "consultants", element: <ConsultantsScreen /> },
                  { path: "resume-builder", element: <TemplateSelectorScreen /> },
                  { path: "resume-builder/create", element: <ResumeBuilderScreen /> },
                  { path: "career-advice", element: <CareerAdvisorScreen /> },
                  { path: "skill-development", element: <SkillDevelopmentScreen /> },
                  { path: "learning", element: <div>Learning Screen (Coming Soon)</div> },
                  { path: "govt-job-detail/:id", element: <GovtJobDetailScreen /> },
                ]
              },

              //Recruiter
              {
                element: <RecruiterRoute><Outlet /></RecruiterRoute>,
                children: [
                  { path: "candidate-feed/:jobId", element: <CandidateFeedScreen /> },
                  { path: "candidate-profile/:userId", element: <CandidateProfileScreen /> },
                  { path: "job-applicants/:jobId", element: <JobApplicantsScreen /> },
                  { path: "recruiter-dashboard", element: <RecruiterDashboardRoute /> },
                  { path: "posted-jobs", element: <PostedJobsScreen /> },
                ]
              },
            ]
          },
        ]
      },
      { path: "*", element: <Navigate to="/error/404" /> },
    ],
  },
  {
    path: "error",
    children: [
      { path: "404", element: <NotFound /> },
      { path: "*", element: <Navigate to="/error/404" /> },
    ],
  },
];

export default Router;
