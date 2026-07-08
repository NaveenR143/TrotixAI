import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Stack,
  Grid,
  Alert,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Skeleton,
  Snackbar,
} from "@mui/material";
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../../config/api.config";
import { updateUserProfile, debitPoints } from "../../redux/user/Action";
import { fetchAndStoreProfile, updateProfileData } from "../../redux/profile/ProfileAction";
import { toTitleCase } from "./utils/profileUtils";

// Sections
import * as profileAPI from "../../api/profileAPI";
import PersonalInformationSection from "./sections/PersonalInformationSection";
import IndustriesSection from "./sections/IndustriesSection";
import ProfilePhotoSection from "./sections/ProfilePhotoSection";
import WorkExperienceSection from "./sections/WorkExperienceSection";
import EducationSection from "./sections/EducationSection";
import ProjectsSection from "./sections/ProjectsSection";
import SkillsSection from "./sections/SkillsSection";
import LanguagesSection from "./sections/LanguagesSection";
import ProfessionalSummarySection from "./sections/ProfessionalSummarySection";
import PersonalDetailsSection from "./sections/PersonalDetailsSection";
import AchievementsSection from "./sections/AchievementsSection";

// AI Components
import AIPoweredActions from "./components/ai/AIPoweredActions";
import AiResultDialog from "./components/ai/AiResultDialog";
import InsufficientCreditsDialog from "./components/dialogs/InsufficientCreditsDialog";

const UserProfile = () => {
  const theme = useTheme();
  // eslint-disable-next-line no-unused-vars
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useDispatch();
  const navigate = useNavigate();


  const profile = useSelector((state) => state.UserReducer);
  const { userid, points: userPoints } = useSelector((state) => state.UserReducer);

  // Profile fetching states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [userId, setUserId] = useState(profile?.id || null);

  // Feedback states
  const [successMessage, setSuccessMessage] = useState(null);

  // AI states
  const [aiDialogs, setAiDialogs] = useState({
    resume: false,
    skills: false,
    learning: false,
  });
  const [aiLoading, setAiLoading] = useState({});
  const [aiResults, setAiResults] = useState({
    resume: null,
    skills: null,
    learning: null,
  });
  const [insufficientCreditsDialogOpen, setInsufficientCreditsDialogOpen] = useState(false);

  // Fetch user profile data from API
  useEffect(() => {
    const fetchUserProfileData = async () => {
      setLoading(true);
      setError(null);

      const phone = profile?.mobile || "9789502974"; // Keep existing fallback logic if needed

      const result = await dispatch(fetchAndStoreProfile(phone));

      if (result.success) {
        setUserId(result.data.id);
        
        // If profile has not been viewed, mark it as viewed on first visit
        if (result.data?.personalDetails?.profile_viewed === false) {
          try {
            const updateResult = await profileAPI.updateProfileViewed(result.data.id);
            if (!updateResult.error) {
              // Update Redux state
              dispatch(updateUserProfile({ profile_viewed: true }));
              dispatch(updateProfileData({
                personalDetails: {
                  ...result.data.personalDetails,
                  profile_viewed: true
                }
              }));
              
              // Update Local & Session Storage to keep client state in sync
              localStorage.setItem("profile_viewed", "true");
              sessionStorage.setItem("profile_viewed", "true");
            }
          } catch (updateErr) {
            console.error("Failed to update profile viewed status:", updateErr);
          }
        }
      } else {
        setError(result.message || "Failed to load profile");
      }

      setLoading(false);
    };

    fetchUserProfileData();
  }, [retryCount, dispatch, profile?.mobile]);



  const handleRetryFetch = () => setRetryCount((prev) => prev + 1);

  const handleSuccess = (message, updateData = null) => {
    setSuccessMessage(message);

    // Sync ProfileReducer and UserReducer from API to reflect latest changes in Resume Builder
    const phone = profile?.mobile || "9789502974";
    dispatch(fetchAndStoreProfile(phone));

    if (updateData) {
      dispatch(updateUserProfile({
        ...profile,
        ...updateData
      }));
    }
  };

  // AI Handlers
  const [enhancedData, setEnhancedData] = useState(null);

  const handleAiEnhanceResume = async () => {
    if (!userId) return alert("User ID not found. Please refresh.");

    // Step 1: Check balance in Redux store first
    if (!userPoints || userPoints <= 0) {
      setInsufficientCreditsDialogOpen(true);
      return;
    }

    

    setAiLoading((prev) => ({ ...prev, resume: true }));
    try {
      // Step 2: Deduct credits
      const creditResult = await profileAPI.deductFeatureCredits(userId, "enhance_resume");

      // Check if credit deduction was unsuccessful
      if (!creditResult.success) {
        setInsufficientCreditsDialogOpen(true);
        setAiLoading((prev) => ({ ...prev, resume: false }));
        return;
      }

      // Update balance in Redux
      if (creditResult.balance !== undefined) {
        dispatch(updateUserProfile({ points: creditResult.balance }));
      }

      // Step 3: Proceed with resume enhancement
      const result = await profileAPI.fetchEnhanceResume(userId);
      if (result.error) {
        setError(result.message);
      } else {
        setEnhancedData(result.data);
        handleSuccess("Resume enhanced! Please review each section and save.");
      }
    } catch (err) {
      setError("Failed to enhance resume");
    } finally {
      setAiLoading((prev) => ({ ...prev, resume: false }));
    }
  };

  const handleAiIdentifySkills = () => {

    // Step 1: Check balance in Redux store first
    if (!userPoints || userPoints <= 0) {
      setInsufficientCreditsDialogOpen(true);
      return;
    }

    navigate("/skill-development");
  };

  const handleAiSuggestLearning = () => {

    // Step 1: Check balance in Redux store first
    if (!userPoints || userPoints <= 0) {
      setInsufficientCreditsDialogOpen(true);
      return;
    }

    navigate("/career-advice");
  };


  return (
    <Box sx={{ minHeight: "calc(100vh - 64px)", bgcolor: "#f8fafc", py: { xs: 3, md: 6 } }}>
      <Container maxWidth="md">
        {/* Success Snackbar */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={4000}
          onClose={() => setSuccessMessage(null)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert severity="success" sx={{ border: "1px solid #6ee7b7", bgcolor: "#d1fae5" }}>
            {successMessage}
          </Alert>
        </Snackbar>

        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontWeight: 800, fontSize: "1.8rem", textTransform: "uppercase", letterSpacing: "1px", color: "#0f172a" }}>My Profile</Typography>
          <Typography sx={{ fontSize: "0.9rem", color: "text.secondary", mt: 0.5 }}>
            {loading ? "Loading..." : "Keep your profile updated for better opportunities"}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" size="small" onClick={handleRetryFetch}>Retry</Button>}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Paper sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 3 }}>
            <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {[1, 2, 3, 4].map((i) => (
                <Grid item xs={12} sm={6} key={i}>
                  <Skeleton variant="text" width="30%" />
                  <Skeleton variant="text" width="80%" height={30} />
                </Grid>
              ))}
            </Grid>
          </Paper>
        ) : (
          <Stack spacing={3}>
            {/* AI Section */}
            <AIPoweredActions
              userPoints={userPoints || 0}
              aiLoading={aiLoading}
              onEnhance={handleAiEnhanceResume}
              onAnalyze={handleAiIdentifySkills}
              onSuggest={handleAiSuggestLearning}
            />

            {/* Profile Sections */}
            <IndustriesSection
              userId={userId}
              profile={profile}
              onSuccess={handleSuccess}
            />

            <ProfilePhotoSection
              userId={userId}
              avatarUrl={profile?.avatarUrl}
              onSuccess={handleSuccess}
            />

            <PersonalInformationSection
              userId={userId}
              profile={profile}
              onSuccess={handleSuccess}
            />

            <WorkExperienceSection
              userId={userId}
              profile={profile}
              initialExperiences={profile?.experience}
              onSuccess={handleSuccess}
              enhancedData={enhancedData?.workExperience}
            />

            <AchievementsSection
              userId={userId}
              profile={profile}
              initialAchievements={profile?.achievements}
              onSuccess={handleSuccess}
            />

            <EducationSection
              userId={userId}
              profile={profile}
              initialEducation={profile?.education}
              onSuccess={handleSuccess}
              enhancedData={enhancedData?.education}
            />

            <ProjectsSection
              userId={userId}
              profile={profile}
              initialProjects={profile?.projects}
              onSuccess={handleSuccess}
              enhancedData={enhancedData?.projects}
            />

            <SkillsSection
              userId={userId}
              profile={profile}
              initialSkills={profile?.skills}
              onSuccess={handleSuccess}
              enhancedData={enhancedData?.skills}
            />

            <LanguagesSection
              userId={userId}
              profile={profile}
              initialLanguages={profile?.languages}
              onSuccess={handleSuccess}
              enhancedData={enhancedData?.languages}
            />

            <ProfessionalSummarySection
              userId={userId}
              profile={profile}
              initialAbout={profile?.summary}
              onSuccess={handleSuccess}
              enhancedData={enhancedData?.summary}
            />

            <PersonalDetailsSection
              userId={userId}
              profile={profile}
              initialData={{
                date_of_birth: profile?.date_of_birth,
                maritalStatus: profile?.maritalStatus,
                gender: profile?.gender,
                currentLocation: profile?.currentLocation
              }}
              onSuccess={handleSuccess}
            />
          </Stack>
        )}

        {/* AI Dialogs */}
        <InsufficientCreditsDialog
          open={insufficientCreditsDialogOpen}
          onClose={() => setInsufficientCreditsDialogOpen(false)}
        />
        <AiResultDialog
          open={aiDialogs.resume}
          onClose={() => setAiDialogs(prev => ({ ...prev, resume: false }))}
          title="🚀 AI-Enhanced Resume Summary"
          content={aiResults.resume}
          onAction={() => setAiDialogs(prev => ({ ...prev, resume: false }))}
        />
        <AiResultDialog
          open={aiDialogs.skills}
          onClose={() => setAiDialogs(prev => ({ ...prev, skills: false }))}
          title="📊 Skills Gap Analysis"
          content={aiResults.skills}
          onAction={() => setAiDialogs(prev => ({ ...prev, skills: false }))}
        />
        <AiResultDialog
          open={aiDialogs.learning}
          onClose={() => setAiDialogs(prev => ({ ...prev, learning: false }))}
          title="📚 Learning Roadmap"
          content={aiResults.learning}
          onAction={() => setAiDialogs(prev => ({ ...prev, learning: false }))}
        />
      </Container>
    </Box>
  );
};

export default UserProfile;
