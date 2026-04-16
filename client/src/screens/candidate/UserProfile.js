import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
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
import { toTitleCase } from "./utils/profileUtils";

// Sections
import PersonalInformationSection from "./sections/PersonalInformationSection";
import WorkExperienceSection from "./sections/WorkExperienceSection";
import EducationSection from "./sections/EducationSection";
import SkillsSection from "./sections/SkillsSection";
import LanguagesSection from "./sections/LanguagesSection";
import ProfessionalSummarySection from "./sections/ProfessionalSummarySection";
import PersonalDetailsSection from "./sections/PersonalDetailsSection";

// AI Components
import AIPoweredActions from "./components/ai/AIPoweredActions";
import AiResultDialog from "./components/ai/AiResultDialog";

const UserProfile = () => {
  const theme = useTheme();
  // eslint-disable-next-line no-unused-vars
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useDispatch();

  const profile = useSelector((state) => state.UserReducer);
  const userPoints = useSelector((state) => state.UserReducer?.points ?? 0);

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

  // Fetch user profile data from API
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // In a real app, phone would come from auth or state
        const phone = profile?.mobile || "9821071111";

        const response = await axios.get(
          `${API_BASE_URL}${API_ENDPOINTS.USER_PROFILE}`,
          {
            params: { phone },
            timeout: 10000,
          }
        );

        if (response.data) {
          const profileData = response.data?.data || response.data;
          setUserId(profileData.id);

          // Map API response to Redux format
          const mappedData = {
            id: profileData.id,
            fullname: toTitleCase(profileData?.full_name) || "",
            email: profileData?.email || "",
            mobile: profileData?.phone || "",
            website: profileData?.portfolio_url || profileData?.github_url || "",
            preferredLocation: toTitleCase(profileData?.preferred_locations?.[0]) || toTitleCase(profileData?.current_location) || "",
            currentLocation: toTitleCase(profileData?.current_location) || "",
            headline: toTitleCase(profileData?.headline) || "",
            about: toTitleCase(profileData?.summary) || "",
            date_of_birth: profileData?.date_of_birth || "",
            maritalStatus: profileData?.marital_status || "",
            experience: profileData?.experience && Array.isArray(profileData.experience)
              ? profileData.experience.map((exp) => ({
                id: exp?.id || null,
                company_name: toTitleCase(exp?.company_name || "") || "",
                role: toTitleCase(exp?.title) || "",
                location: toTitleCase(exp?.location) || "",
                description: toTitleCase(exp?.description) || "",
                startDate: exp?.start_date || "",
                endDate: exp?.end_date || "",
                isCurrent: exp?.is_current || false,
                skills: exp?.skills_used || [],
                achievements: exp?.achievements || [],
              }))
              : [],
            education: profileData?.education && Array.isArray(profileData.education)
              ? profileData.education.map((edu) => ({
                id: edu?.id || null,
                school: toTitleCase(edu?.institution) || "",
                degree: toTitleCase(edu?.degree) || "",
                field: toTitleCase(edu?.field_of_study) || "",
                grade: edu?.grade || "",
                year: edu?.end_year || "",
              }))
              : [],
            skills: profileData?.skills && Array.isArray(profileData.skills)
              ? profileData.skills.map((s) => toTitleCase(typeof s === "string" ? s : s?.name))
              : [],
            languages: profileData?.languages && Array.isArray(profileData.languages)
              ? profileData.languages.map((l) => toTitleCase(typeof l === "string" ? l : l?.language))
              : [],
            gender: toTitleCase(profileData?.gender) || "",
          };

          dispatch(updateUserProfile(mappedData));
        }
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
        setError(err.response?.data?.message || err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [retryCount, dispatch, profile?.mobile]);

  const handleRetryFetch = () => setRetryCount((prev) => prev + 1);

  const handleSuccess = (message) => setSuccessMessage(message);

  // AI Handlers
  const handleAiEnhanceResume = () => {
    if (userPoints < 50) return alert("Not enough credits!");
    setAiLoading((prev) => ({ ...prev, resume: true }));
    setAiDialogs((prev) => ({ ...prev, resume: true }));
    setTimeout(() => {
      const result = `✨ AI-Enhanced Resume Summary:\n\nInnovative professional with strong background in delivering scalable solutions...`;
      setAiResults((prev) => ({ ...prev, resume: result }));
      dispatch(debitPoints(50));
      setAiLoading((prev) => ({ ...prev, resume: false }));
    }, 1500);
  };

  const handleAiIdentifySkills = () => {
    if (userPoints < 20) return alert("Not enough credits!");
    setAiLoading((prev) => ({ ...prev, skills: true }));
    setAiDialogs((prev) => ({ ...prev, skills: true }));
    setTimeout(() => {
      const result = `📊 Market Analysis - Skills Gap Report:\n\nBased on your profile, consider learning: Kubernetes, GraphQL...`;
      setAiResults((prev) => ({ ...prev, skills: result }));
      dispatch(debitPoints(20));
      setAiLoading((prev) => ({ ...prev, skills: false }));
    }, 1500);
  };

  const handleAiSuggestLearning = () => {
    if (userPoints < 20) return alert("Not enough credits!");
    setAiLoading((prev) => ({ ...prev, learning: true }));
    setAiDialogs((prev) => ({ ...prev, learning: true }));
    setTimeout(() => {
      const result = `📚 Personalized Learning Roadmap:\n\n1. Kubernetes Basics (4hrs)\n2. Advanced React Patterns...`;
      setAiResults((prev) => ({ ...prev, learning: result }));
      dispatch(debitPoints(20));
      setAiLoading((prev) => ({ ...prev, learning: false }));
    }, 1500);
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
          <Typography sx={{ fontWeight: 800, fontSize: "1.8rem", color: "#0f172a" }}>My Profile</Typography>
          <Typography sx={{ fontSize: "0.9rem", color: "#64748b", mt: 0.5 }}>
            {loading ? "Loading..." : "Keep your profile updated for better opportunities"}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" size="small" onClick={handleRetryFetch}>Retry</Button>}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Paper sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 2 }}>
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
              userPoints={userPoints}
              aiLoading={aiLoading}
              onEnhance={handleAiEnhanceResume}
              onAnalyze={handleAiIdentifySkills}
              onSuggest={handleAiSuggestLearning}
            />

            {/* Profile Sections */}
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
            />

            <EducationSection
              userId={userId}
              profile={profile}
              initialEducation={profile?.education}
              onSuccess={handleSuccess}
            />

            <SkillsSection
              userId={userId}
              profile={profile}
              initialSkills={profile?.skills}
              onSuccess={handleSuccess}
            />

            <LanguagesSection
              userId={userId}
              profile={profile}
              initialLanguages={profile?.languages}
              onSuccess={handleSuccess}
            />

            <ProfessionalSummarySection
              profile={profile}
              initialAbout={profile?.about}
              onSuccess={handleSuccess}
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
        <AiResultDialog
          open={aiDialogs.resume}
          onClose={() => setAiDialogs(prev => ({ ...prev, resume: false }))}
          title="🚀 AI-Enhanced Resume Summary"
          content={aiResults.resume}
          creditsText="✓ 50 credits debited"
          onAction={() => setAiDialogs(prev => ({ ...prev, resume: false }))}
        />
        <AiResultDialog
          open={aiDialogs.skills}
          onClose={() => setAiDialogs(prev => ({ ...prev, skills: false }))}
          title="📊 Skills Gap Analysis"
          content={aiResults.skills}
          creditsText="✓ 20 credits debited"
          onAction={() => setAiDialogs(prev => ({ ...prev, skills: false }))}
        />
        <AiResultDialog
          open={aiDialogs.learning}
          onClose={() => setAiDialogs(prev => ({ ...prev, learning: false }))}
          title="📚 Learning Roadmap"
          content={aiResults.learning}
          creditsText="✓ 20 credits debited"
          onAction={() => setAiDialogs(prev => ({ ...prev, learning: false }))}
        />
      </Container>
    </Box>
  );
};

export default UserProfile;
