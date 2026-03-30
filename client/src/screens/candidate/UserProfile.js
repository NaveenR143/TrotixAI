import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Stack,
  Grid,
  Divider,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
  CircularProgress,
  MenuItem,
  Autocomplete,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SchoolIcon from "@mui/icons-material/School";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LanguageIcon from "@mui/icons-material/Language";
import PublicIcon from "@mui/icons-material/Public";
import BusinessIcon from "@mui/icons-material/Business";
import CakeIcon from "@mui/icons-material/Cake";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import { updateUserProfile, debitPoints } from "../../redux/user/Action";

const SKILLS_OPTIONS = [
  "React", "Node.js", "JavaScript", "TypeScript", "Python", "Java", "C++", "AWS", "Docker",
  "Kubernetes", "Git", "SQL", "NoSQL", "MongoDB", "PostgreSQL", "SEO", "Digital Marketing",
  "Project Management", "Agile", "UI/UX Design", "Figma", "Redux", "GraphQL",
];

const LANGUAGES_OPTIONS = [
  "English (Native)", "English (Professional)", "Hindi", "Spanish", "French", "German",
  "Mandarin", "Japanese", "Bengali", "Portuguese", "Russian", "Arabic",
];

const UserProfile = ({ onNavigate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useDispatch();

  const profile = useSelector((state) => state.UserReducer);
  const userPoints = useSelector((state) => state.UserReducer?.points ?? 0);

  // Editing states for each section
  const [editingSections, setEditingSections] = useState({
    personal: false,
    experience: false,
    education: false,
    skills: false,
    languages: false,
    summary: false,
    personalDetails: false,
  });

  const [editData, setEditData] = useState({
    firstName: profile?.firstName || "",
    lastName: profile?.lastName || "",
    email: profile?.email || "",
    mobile: profile?.mobile || "",
    website: profile?.website || "",
    preferredLocation: profile?.preferredLocation || "",
    experience: profile?.experience || [],
    education: profile?.education || [],
    skills: profile?.skills ? (typeof profile.skills === "string" ? profile.skills.split(",").map((s) => s.trim()) : profile.skills) : [],
    languages: profile?.languages ? (typeof profile.languages === "string" ? profile.languages.split(",").map((l) => l.trim()) : profile.languages) : [],
    about: profile?.about || "",
    dob: profile?.dob || "",
    maritalStatus: profile?.maritalStatus || "",
    currentLocation: profile?.currentLocation || "",
  });

  const [errors, setErrors] = useState({});
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

  // Form validation
  const validateSection = (section) => {
    const newErrors = {};

    if (section === "personal") {
      if (!editData.firstName.trim()) newErrors.firstName = "First name is required";
      if (!editData.lastName.trim()) newErrors.lastName = "Last name is required";
      if (!editData.email.trim()) newErrors.email = "Email is required";
      if (editData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editData.email)) {
        newErrors.email = "Invalid email format";
      }
      if (!editData.mobile.trim()) newErrors.mobile = "Mobile number is required";
      if (editData.mobile.trim() && !/^\d{10}$/.test(editData.mobile.replace(/\D/g, ""))) {
        newErrors.mobile = "Mobile must be 10 digits";
      }
      if (!editData.preferredLocation.trim()) newErrors.preferredLocation = "Preferred location is required";
    } else if (section === "skills") {
      if (editData.skills.length === 0) newErrors.skills = "Add at least one skill";
    } else if (section === "languages") {
      if (editData.languages.length === 0) newErrors.languages = "Add at least one language";
    } else if (section === "summary") {
      if (!editData.about.trim()) newErrors.about = "Professional summary is required";
    } else if (section === "personalDetails") {
      if (!editData.dob) newErrors.dob = "Date of birth is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle skill changes
  const handleSkillChange = (newSkills) => {
    setEditData((prev) => ({ ...prev, skills: newSkills }));
    if (errors.skills) {
      setErrors((prev) => ({ ...prev, skills: "" }));
    }
  };

  // Handle language changes
  const handleLanguageChange = (newLanguages) => {
    setEditData((prev) => ({ ...prev, languages: newLanguages }));
    if (errors.languages) {
      setErrors((prev) => ({ ...prev, languages: "" }));
    }
  };

  // Add experience entry
  const addExperience = () => {
    setEditData((prev) => ({
      ...prev,
      experience: [...prev.experience, { company: "", role: "", duration: "", description: "" }],
    }));
  };

  // Remove experience entry
  const removeExperience = (index) => {
    setEditData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  // Update experience entry
  const updateExperience = (index, field, value) => {
    const newExp = [...editData.experience];
    newExp[index][field] = value;
    setEditData((prev) => ({ ...prev, experience: newExp }));
  };

  // Add education entry
  const addEducation = () => {
    setEditData((prev) => ({
      ...prev,
      education: [...prev.education, { school: "", degree: "", year: "" }],
    }));
  };

  // Remove education entry
  const removeEducation = (index) => {
    setEditData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  // Update education entry
  const updateEducation = (index, field, value) => {
    const newEdu = [...editData.education];
    newEdu[index][field] = value;
    setEditData((prev) => ({ ...prev, education: newEdu }));
  };

  // Toggle section editing
  const toggleSectionEdit = (section) => {
    setEditingSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
    if (editingSections[section]) {
      setErrors({});
    }
  };

  // Cancel section edit
  const cancelSectionEdit = (section) => {
    setEditData({
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      email: profile?.email || "",
      mobile: profile?.mobile || "",
      website: profile?.website || "",
      preferredLocation: profile?.preferredLocation || "",
      experience: profile?.experience || [],
      education: profile?.education || [],
      skills: profile?.skills ? (typeof profile.skills === "string" ? profile.skills.split(",").map((s) => s.trim()) : profile.skills) : [],
      languages: profile?.languages ? (typeof profile.languages === "string" ? profile.languages.split(",").map((l) => l.trim()) : profile.languages) : [],
      about: profile?.about || "",
      dob: profile?.dob || "",
      maritalStatus: profile?.maritalStatus || "",
      currentLocation: profile?.currentLocation || "",
    });
    setErrors({});
    setEditingSections((prev) => ({
      ...prev,
      [section]: false,
    }));
  };

  // Save section
  const saveSection = (section) => {
    if (!validateSection(section)) return;

    const profileToSave = {
      ...profile,
      firstName: editData.firstName,
      lastName: editData.lastName,
      email: editData.email,
      mobile: editData.mobile,
      website: editData.website,
      preferredLocation: editData.preferredLocation,
      experience: editData.experience,
      education: editData.education,
      skills: Array.isArray(editData.skills) ? editData.skills.join(", ") : editData.skills,
      languages: Array.isArray(editData.languages) ? editData.languages.join(", ") : editData.languages,
      about: editData.about,
      dob: editData.dob,
      maritalStatus: editData.maritalStatus,
      currentLocation: editData.currentLocation,
    };

    dispatch(updateUserProfile(profileToSave));
    setEditingSections((prev) => ({
      ...prev,
      [section]: false,
    }));
  };

  // AI Functions
  const handleAiEnhanceResume = () => {
    if (userPoints < 50) {
      alert("Not enough credits! You need 50 credits to enhance your resume.");
      return;
    }
    setAiLoading((prev) => ({ ...prev, resume: true }));
    setAiDialogs((prev) => ({ ...prev, resume: true }));
    setTimeout(() => {
      const enhancedResume = `✨ AI-Enhanced Resume Summary:\n\nInnovative ${editData.firstName} ${editData.lastName} with strong background in delivering scalable solutions. Proven expertise in ${editData.skills.slice(0, 3).join(", ")} with track record of improving system performance by 30-40%. Passionate about creating user-centric applications and mentoring junior developers.\n\nKey Achievements:\n• Led cross-functional teams to deliver enterprise solutions\n• Implemented scalable architecture reducing load time by 35%\n• Mentored 5+ junior developers\n• Improved code quality metrics by 25%`;
      setAiResults((prev) => ({ ...prev, resume: enhancedResume }));
      dispatch(debitPoints(50));
      setAiLoading((prev) => ({ ...prev, resume: false }));
    }, 2000);
  };

  const handleAiIdentifySkills = () => {
    if (userPoints < 20) {
      alert("Not enough credits! You need 20 credits to identify missing skills.");
      return;
    }
    setAiLoading((prev) => ({ ...prev, skills: true }));
    setAiDialogs((prev) => ({ ...prev, skills: true }));
    setTimeout(() => {
      const missingSkills = `📊 Market Analysis - Skills Gap Report:\n\nBased on job openings in ${editData.preferredLocation}:\n\n🔴 Critical Missing Skills (High Demand):\n• Kubernetes - 78% of job postings require this\n• GraphQL - 65% of modern development roles\n• AWS Advanced - 82% of cloud positions\n\n🟡 Recommended Skills to Add:\n• Terraform (Infrastructure as Code) - Growing 45% YoY\n• Machine Learning Basics - 35% of emerging roles\n• Microservices Architecture - 55% of enterprise jobs\n\n💡 Your Current Strengths:\n${editData.skills.slice(0, 3).map((s) => `✓ ${s} - Strong market value`).join("\n")}\n\nRecommended Action: Focus on Kubernetes certification in next 30 days.`;
      setAiResults((prev) => ({ ...prev, skills: missingSkills }));
      dispatch(debitPoints(20));
      setAiLoading((prev) => ({ ...prev, skills: false }));
    }, 2000);
  };

  const handleAiSuggestLearning = () => {
    if (userPoints < 20) {
      alert("Not enough credits! You need 20 credits to get learning suggestions.");
      return;
    }
    setAiLoading((prev) => ({ ...prev, learning: true }));
    setAiDialogs((prev) => ({ ...prev, learning: true }));
    setTimeout(() => {
      const learningResources = `📚 Personalized Learning Roadmap:\n\nBased on your profile and market trends for ${editData.preferredLocation}:\n\n🎯 30-Day Quick Win:\n1. Kubernetes Basics - Google Cloud Skills Boost (4hrs)\n   - Platform: Free with GCP credits\n   - Timeline: 1 week\n\n2. Advanced AWS Architecture - A Cloud Guru\n   - Timeline: 2 weeks\n   - Hands-on labs included\n\n📈 90-Day Comprehensive Path:\n1. Kubernetes + Docker Mastery - Udemy ($14.99)\n2. AWS Solutions Architect - Linux Academy\n3. Terraform for Infrastructure - Pluralsight\n4. Build a project portfolio piece\n\n🏆 Recommended Certifications:\n✓ Certified Kubernetes Administrator (CKA) - $395\n✓ AWS Solutions Architect Associate - $150\n\n💼 Community Resources:\n• Dev.to Kubernetes Series - Free\n• Official Kubernetes Documentation\n• AWS Free Tier - $200 credits/month\n\nEstimated Timeline to Proficiency: 8-12 weeks`;
      setAiResults((prev) => ({ ...prev, learning: learningResources }));
      dispatch(debitPoints(20));
      setAiLoading((prev) => ({ ...prev, learning: false }));
    }, 2000);
  };

  const handleCloseAiDialog = (type) => {
    setAiDialogs((prev) => ({ ...prev, [type]: false }));
  };

  const profileComplete = profile?.firstName && profile?.email && profile?.mobile && profile?.skills && profile?.about;

  return (
    <Box sx={{ minHeight: "calc(100vh - 64px)", bgcolor: "#f8fafc", py: { xs: 3, md: 6 } }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontWeight: 800, fontSize: "1.8rem", color: "#0f172a" }}>
            My Profile
          </Typography>
          <Typography sx={{ fontSize: "0.9rem", color: "#64748b", mt: 0.5 }}>
            {profileComplete ? "✓ Profile Complete" : "Complete your profile to get better job matches"}
          </Typography>
        </Box>

        {/* Credit Status Alert */}
        {userPoints < 50 && (
          <Alert severity="warning" sx={{ mb: 3, bgcolor: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d", "& .MuiAlert-icon": { color: "#f59e0b" } }}>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>Limited Credits Available</Typography>
            <Typography sx={{ fontSize: "0.85rem", mt: 0.5 }}>You have {userPoints} credits. Enhance resume requires 50 credits.</Typography>
          </Alert>
        )}

        {/* AI Powered Actions Section */}
        <Paper elevation={0} sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 2, mb: 3, bgcolor: "linear-gradient(135deg, #f5f3ff 0%, #f8fafc 100%)", boxShadow: "0 4px 24px rgba(15,23,42,0.06)" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <AutoAwesomeIcon sx={{ color: "#6366f1", fontSize: 20 }} />
            <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>AI-Powered Actions</Typography>
          </Box>
          <Grid container spacing={2}>
            {/* Enhance Resume */}
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #e2e8f0", bgcolor: "#fff", cursor: userPoints >= 50 ? "pointer" : "default", opacity: userPoints >= 50 ? 1 : 0.6, transition: "all 0.3s ease", "&:hover": { border: userPoints >= 50 ? "1px solid #c4b5fd" : "1px solid #e2e8f0", boxShadow: userPoints >= 50 ? "0 4px 12px rgba(99,102,241,0.15)" : "none", transform: userPoints >= 50 ? "translateY(-2px)" : "none" } }}>
                <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <AutoAwesomeIcon sx={{ color: "#6366f1", fontSize: 20 }} />
                  </Box>
                  <Chip label="50 Credits" size="small" sx={{ bgcolor: "#fee2e2", color: "#dc2626", fontSize: "0.75rem", fontWeight: 600, height: 20 }} />
                </Box>
                <Typography sx={{ fontWeight: 700, color: "#0f172a", mb: 1, fontSize: "0.95rem" }}>Enhance Resume</Typography>
                <Typography sx={{ fontSize: "0.85rem", color: "#64748b", mb: 2 }}>AI will tailor your resume to match job market trends</Typography>
                <Tooltip title={userPoints < 50 ? `Need ${50 - userPoints} more credits` : "Click to enhance your resume"}>
                  <Button variant="outlined" size="small" fullWidth onClick={handleAiEnhanceResume} disabled={userPoints < 50} sx={{ color: userPoints >= 50 ? "#6366f1" : "#94a3b8", borderColor: userPoints >= 50 ? "#c4b5fd" : "#e2e8f0", "&:hover": { borderColor: userPoints >= 50 ? "#6366f1" : "#e2e8f0", bgcolor: userPoints >= 50 ? "#f5f3ff" : "transparent" } }}>
                    {aiLoading.resume ? <CircularProgress size={16} /> : "Enhance"}
                  </Button>
                </Tooltip>
              </Paper>
            </Grid>

            {/* Identify Missing Skills */}
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #e2e8f0", bgcolor: "#fff", cursor: userPoints >= 20 ? "pointer" : "default", opacity: userPoints >= 20 ? 1 : 0.6, transition: "all 0.3s ease", "&:hover": { border: userPoints >= 20 ? "1px solid #c4b5fd" : "1px solid #e2e8f0", boxShadow: userPoints >= 20 ? "0 4px 12px rgba(99,102,241,0.15)" : "none", transform: userPoints >= 20 ? "translateY(-2px)" : "none" } }}>
                <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <TrendingUpIcon sx={{ color: "#0369a1", fontSize: 20 }} />
                  </Box>
                  <Chip label="20 Credits" size="small" sx={{ bgcolor: "#dbeafe", color: "#0369a1", fontSize: "0.75rem", fontWeight: 600, height: 20 }} />
                </Box>
                <Typography sx={{ fontWeight: 700, color: "#0f172a", mb: 1, fontSize: "0.95rem" }}>Missing Skills</Typography>
                <Typography sx={{ fontSize: "0.85rem", color: "#64748b", mb: 2 }}>Identify skills gaps based on market demand</Typography>
                <Tooltip title={userPoints < 20 ? `Need ${20 - userPoints} more credits` : "Click to identify missing skills"}>
                  <Button variant="outlined" size="small" fullWidth onClick={handleAiIdentifySkills} disabled={userPoints < 20} sx={{ color: userPoints >= 20 ? "#0369a1" : "#94a3b8", borderColor: userPoints >= 20 ? "#dbeafe" : "#e2e8f0", "&:hover": { borderColor: userPoints >= 20 ? "#0369a1" : "#e2e8f0", bgcolor: userPoints >= 20 ? "#f0f9ff" : "transparent" } }}>
                    {aiLoading.skills ? <CircularProgress size={16} /> : "Analyze"}
                  </Button>
                </Tooltip>
              </Paper>
            </Grid>

            {/* Learning Resources */}
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #e2e8f0", bgcolor: "#fff", cursor: userPoints >= 20 ? "pointer" : "default", opacity: userPoints >= 20 ? 1 : 0.6, transition: "all 0.3s ease", "&:hover": { border: userPoints >= 20 ? "1px solid #c4b5fd" : "1px solid #e2e8f0", boxShadow: userPoints >= 20 ? "0 4px 12px rgba(99,102,241,0.15)" : "none", transform: userPoints >= 20 ? "translateY(-2px)" : "none" } }}>
                <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <SchoolIcon sx={{ color: "#059669", fontSize: 20 }} />
                  </Box>
                  <Chip label="20 Credits" size="small" sx={{ bgcolor: "#d1fae5", color: "#059669", fontSize: "0.75rem", fontWeight: 600, height: 20 }} />
                </Box>
                <Typography sx={{ fontWeight: 700, color: "#0f172a", mb: 1, fontSize: "0.95rem" }}>Learning Path</Typography>
                <Typography sx={{ fontSize: "0.85rem", color: "#64748b", mb: 2 }}>Personalized resources to improve your skills</Typography>
                <Tooltip title={userPoints < 20 ? `Need ${20 - userPoints} more credits` : "Click to get learning recommendations"}>
                  <Button variant="outlined" size="small" fullWidth onClick={handleAiSuggestLearning} disabled={userPoints < 20} sx={{ color: userPoints >= 20 ? "#059669" : "#94a3b8", borderColor: userPoints >= 20 ? "#d1fae5" : "#e2e8f0", "&:hover": { borderColor: userPoints >= 20 ? "#059669" : "#e2e8f0", bgcolor: userPoints >= 20 ? "#f0fdf4" : "transparent" } }}>
                    {aiLoading.learning ? <CircularProgress size={16} /> : "Suggest"}
                  </Button>
                </Tooltip>
              </Paper>
            </Grid>
          </Grid>
        </Paper>

        {/* Profile Sections */}
        <Stack spacing={3}>
          {/* PERSONAL INFORMATION SECTION */}
          <Paper elevation={0} sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 2, bgcolor: "#fff", boxShadow: "0 4px 24px rgba(15,23,42,0.06)" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#0f172a" }}>
                Personal Information
              </Typography>
              <Button
                size="small"
                variant={editingSections.personal ? "outlined" : "text"}
                startIcon={editingSections.personal ? <CancelIcon /> : <EditIcon />}
                onClick={() => toggleSectionEdit("personal")}
                sx={{ color: editingSections.personal ? "#ef4444" : "#6366f1" }}
              >
                {editingSections.personal ? "Cancel" : "Edit"}
              </Button>
            </Box>

            {!editingSections.personal ? (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", mb: 0.5, textTransform: "uppercase" }}>First Name</Typography>
                    <Typography sx={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: 500 }}>{profile?.firstName || "—"}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", mb: 0.5, textTransform: "uppercase" }}>Last Name</Typography>
                    <Typography sx={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: 500 }}>{profile?.lastName || "—"}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", mb: 0.5, textTransform: "uppercase" }}>Email</Typography>
                    <Typography sx={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: 500 }}>{profile?.email || "—"}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", mb: 0.5, textTransform: "uppercase" }}>Mobile</Typography>
                    <Typography sx={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: 500 }}>{profile?.mobile || "—"}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", mb: 0.5, textTransform: "uppercase" }}>Preferred Location</Typography>
                    <Typography sx={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: 500 }}>{profile?.preferredLocation || "—"}</Typography>
                  </Box>
                </Grid>
                {profile?.website && (
                  <Grid item xs={12}>
                    <Box>
                      <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", mb: 0.5, textTransform: "uppercase" }}>Website</Typography>
                      <Typography sx={{ fontSize: "0.95rem", color: "#6366f1", fontWeight: 500 }}>
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
                          {profile.website}
                        </a>
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="First Name *" name="firstName" value={editData.firstName} onChange={handleInputChange} error={!!errors.firstName} helperText={errors.firstName} size="small" InputProps={{ startAdornment: <PersonIcon sx={{ mr: 1, fontSize: 18, color: "#64748b" }} /> }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Last Name *" name="lastName" value={editData.lastName} onChange={handleInputChange} error={!!errors.lastName} helperText={errors.lastName} size="small" InputProps={{ startAdornment: <PersonIcon sx={{ mr: 1, fontSize: 18, color: "#64748b" }} /> }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Email *" name="email" type="email" value={editData.email} onChange={handleInputChange} error={!!errors.email} helperText={errors.email} size="small" InputProps={{ startAdornment: <EmailIcon sx={{ mr: 1, fontSize: 18, color: "#64748b" }} /> }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Mobile Number *" name="mobile" value={editData.mobile} onChange={handleInputChange} error={!!errors.mobile} helperText={errors.mobile} size="small" placeholder="10-digit number" />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Preferred Location *" name="preferredLocation" value={editData.preferredLocation} onChange={handleInputChange} error={!!errors.preferredLocation} helperText={errors.preferredLocation} size="small" InputProps={{ startAdornment: <LocationOnIcon sx={{ mr: 1, fontSize: 18, color: "#64748b" }} /> }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Website / Portfolio" name="website" value={editData.website} onChange={handleInputChange} size="small" placeholder="https://..." InputProps={{ startAdornment: <PublicIcon sx={{ mr: 1, fontSize: 18, color: "#64748b" }} /> }} />
                </Grid>
                <Grid item xs={12} sx={{ display: "flex", gap: 1 }}>
                  <Button variant="contained" size="small" onClick={() => saveSection("personal")} startIcon={<SaveIcon />} sx={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
                    Save
                  </Button>
                  <Button variant="outlined" size="small" onClick={() => cancelSectionEdit("personal")} startIcon={<CancelIcon />}>
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            )}
          </Paper>

          {/* WORK EXPERIENCE SECTION */}
          <Paper elevation={0} sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 2, bgcolor: "#fff", boxShadow: "0 4px 24px rgba(15,23,42,0.06)" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <BusinessIcon sx={{ fontSize: 20, color: "#6366f1" }} />
                <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#0f172a" }}>Work Experience</Typography>
              </Box>
              <Button
                size="small"
                variant={editingSections.experience ? "outlined" : "text"}
                startIcon={editingSections.experience ? <CancelIcon /> : <EditIcon />}
                onClick={() => toggleSectionEdit("experience")}
                sx={{ color: editingSections.experience ? "#ef4444" : "#6366f1" }}
              >
                {editingSections.experience ? "Cancel" : "Edit"}
              </Button>
            </Box>

            {!editingSections.experience ? (
              <Box>
                {!editData.experience || editData.experience.length === 0 ? (
                  <Typography sx={{ fontSize: "0.85rem", color: "#94a3b8", fontStyle: "italic" }}>No work experience added yet.</Typography>
                ) : (
                  editData.experience.map((exp, idx) => (
                    <Paper key={idx} variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "#f8fafc", borderStyle: "dashed" }}>
                      <Typography sx={{ fontWeight: 600, color: "#0f172a", mb: 0.5 }}>{exp.role} at {exp.company}</Typography>
                      {exp.duration && <Typography sx={{ fontSize: "0.85rem", color: "#64748b", mb: 1 }}>{exp.duration}</Typography>}
                      {exp.description && <Typography sx={{ fontSize: "0.9rem", color: "#475569" }}>{exp.description}</Typography>}
                    </Paper>
                  ))
                )}
              </Box>
            ) : (
              <Stack spacing={2}>
                {editData.experience.map((exp, idx) => (
                  <Paper key={idx} variant="outlined" sx={{ p: 2, bgcolor: "#f8fafc", borderStyle: "dashed", position: "relative" }}>
                    <IconButton size="small" onClick={() => removeExperience(idx)} sx={{ position: "absolute", top: 8, right: 8, color: "#f43f5e" }}>
                      <DeleteIcon fontSize="inherit" />
                    </IconButton>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Company" value={exp.company} onChange={(e) => updateExperience(idx, "company", e.target.value)} size="small" />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Role" value={exp.role} onChange={(e) => updateExperience(idx, "role", e.target.value)} size="small" />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField fullWidth label="Duration" value={exp.duration} onChange={(e) => updateExperience(idx, "duration", e.target.value)} size="small" placeholder="e.g. 2 years" />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField fullWidth multiline rows={2} label="Description" value={exp.description} onChange={(e) => updateExperience(idx, "description", e.target.value)} size="small" />
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={addExperience} sx={{ color: "#6366f1", borderColor: "#c4b5fd" }}>
                    Add Entry
                  </Button>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button variant="contained" size="small" onClick={() => saveSection("experience")} startIcon={<SaveIcon />} sx={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
                    Save
                  </Button>
                  <Button variant="outlined" size="small" onClick={() => cancelSectionEdit("experience")} startIcon={<CancelIcon />}>
                    Cancel
                  </Button>
                </Box>
              </Stack>
            )}
          </Paper>

          {/* EDUCATION SECTION */}
          <Paper elevation={0} sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 2, bgcolor: "#fff", boxShadow: "0 4px 24px rgba(15,23,42,0.06)" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <SchoolIcon sx={{ fontSize: 20, color: "#0ea5e9" }} />
                <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#0f172a" }}>Education</Typography>
              </Box>
              <Button
                size="small"
                variant={editingSections.education ? "outlined" : "text"}
                startIcon={editingSections.education ? <CancelIcon /> : <EditIcon />}
                onClick={() => toggleSectionEdit("education")}
                sx={{ color: editingSections.education ? "#ef4444" : "#6366f1" }}
              >
                {editingSections.education ? "Cancel" : "Edit"}
              </Button>
            </Box>

            {!editingSections.education ? (
              <Box>
                {!editData.education || editData.education.length === 0 ? (
                  <Typography sx={{ fontSize: "0.85rem", color: "#94a3b8", fontStyle: "italic" }}>No education entries added yet.</Typography>
                ) : (
                  editData.education.map((edu, idx) => (
                    <Paper key={idx} variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "#f8fafc", borderStyle: "dashed" }}>
                      <Typography sx={{ fontWeight: 600, color: "#0f172a", mb: 0.5 }}>{edu.degree}</Typography>
                      <Typography sx={{ fontSize: "0.85rem", color: "#64748b" }}>{edu.school}</Typography>
                      {edu.year && <Typography sx={{ fontSize: "0.85rem", color: "#94a3b8", mt: 0.5 }}>Year: {edu.year}</Typography>}
                    </Paper>
                  ))
                )}
              </Box>
            ) : (
              <Stack spacing={2}>
                {editData.education.map((edu, idx) => (
                  <Paper key={idx} variant="outlined" sx={{ p: 2, bgcolor: "#f8fafc", borderStyle: "dashed", position: "relative" }}>
                    <IconButton size="small" onClick={() => removeEducation(idx)} sx={{ position: "absolute", top: 8, right: 8, color: "#f43f5e" }}>
                      <DeleteIcon fontSize="inherit" />
                    </IconButton>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField fullWidth label="Institution" value={edu.school} onChange={(e) => updateEducation(idx, "school", e.target.value)} size="small" />
                      </Grid>
                      <Grid item xs={12} sm={7}>
                        <TextField fullWidth label="Degree" value={edu.degree} onChange={(e) => updateEducation(idx, "degree", e.target.value)} size="small" />
                      </Grid>
                      <Grid item xs={12} sm={5}>
                        <TextField fullWidth label="Year" value={edu.year} onChange={(e) => updateEducation(idx, "year", e.target.value)} size="small" />
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={addEducation} sx={{ color: "#6366f1", borderColor: "#c4b5fd" }}>
                    Add Entry
                  </Button>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button variant="contained" size="small" onClick={() => saveSection("education")} startIcon={<SaveIcon />} sx={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
                    Save
                  </Button>
                  <Button variant="outlined" size="small" onClick={() => cancelSectionEdit("education")} startIcon={<CancelIcon />}>
                    Cancel
                  </Button>
                </Box>
              </Stack>
            )}
          </Paper>

          {/* SKILLS SECTION */}
          <Paper elevation={0} sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 2, bgcolor: "#fff", boxShadow: "0 4px 24px rgba(15,23,42,0.06)" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AutoAwesomeIcon sx={{ fontSize: 20, color: "#6366f1" }} />
                <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#0f172a" }}>Skills</Typography>
              </Box>
              <Button
                size="small"
                variant={editingSections.skills ? "outlined" : "text"}
                startIcon={editingSections.skills ? <CancelIcon /> : <EditIcon />}
                onClick={() => toggleSectionEdit("skills")}
                sx={{ color: editingSections.skills ? "#ef4444" : "#6366f1" }}
              >
                {editingSections.skills ? "Cancel" : "Edit"}
              </Button>
            </Box>

            {!editingSections.skills ? (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {editData.skills && editData.skills.length > 0 ? (
                  editData.skills.map((skill) => (
                    <Chip key={skill} label={skill} sx={{ bgcolor: "#ede9fe", color: "#4f46e5", fontWeight: 600 }} />
                  ))
                ) : (
                  <Typography sx={{ fontSize: "0.85rem", color: "#94a3b8", fontStyle: "italic" }}>No skills added yet.</Typography>
                )}
              </Box>
            ) : (
              <Stack spacing={2}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, p: 2, borderRadius: 1.5, border: errors.skills ? "1px solid #ef4444" : "1px solid #e2e8f0", bgcolor: "#f8fafc", minHeight: 60 }}>
                  {editData.skills.map((skill) => (
                    <Chip key={skill} label={skill} onDelete={() => handleSkillChange(editData.skills.filter((s) => s !== skill))} sx={{ bgcolor: "#ede9fe", color: "#4f46e5", fontWeight: 600, "& .MuiChip-deleteIcon": { color: "#6366f1" } }} />
                  ))}
                </Box>
                {errors.skills && <Typography sx={{ fontSize: "0.75rem", color: "#ef4444" }}>{errors.skills}</Typography>}
                <Autocomplete
                  freeSolo
                  options={SKILLS_OPTIONS.filter((s) => !editData.skills.includes(s))}
                  onInputChange={() => {}}
                  onChange={(e, value) => {
                    if (value && !editData.skills.includes(value)) {
                      handleSkillChange([...editData.skills, value]);
                    }
                  }}
                  renderInput={(params) => <TextField {...params} placeholder="Add skills..." size="small" />}
                />
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button variant="contained" size="small" onClick={() => saveSection("skills")} startIcon={<SaveIcon />} sx={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
                    Save
                  </Button>
                  <Button variant="outlined" size="small" onClick={() => cancelSectionEdit("skills")} startIcon={<CancelIcon />}>
                    Cancel
                  </Button>
                </Box>
              </Stack>
            )}
          </Paper>

          {/* LANGUAGES SECTION */}
          <Paper elevation={0} sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 2, bgcolor: "#fff", boxShadow: "0 4px 24px rgba(15,23,42,0.06)" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LanguageIcon sx={{ fontSize: 20, color: "#0ea5e9" }} />
                <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#0f172a" }}>Languages</Typography>
              </Box>
              <Button
                size="small"
                variant={editingSections.languages ? "outlined" : "text"}
                startIcon={editingSections.languages ? <CancelIcon /> : <EditIcon />}
                onClick={() => toggleSectionEdit("languages")}
                sx={{ color: editingSections.languages ? "#ef4444" : "#6366f1" }}
              >
                {editingSections.languages ? "Cancel" : "Edit"}
              </Button>
            </Box>

            {!editingSections.languages ? (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {editData.languages && editData.languages.length > 0 ? (
                  editData.languages.map((lang) => (
                    <Chip key={lang} label={lang} sx={{ bgcolor: "#f0f9ff", color: "#0369a1", fontWeight: 600 }} />
                  ))
                ) : (
                  <Typography sx={{ fontSize: "0.85rem", color: "#94a3b8", fontStyle: "italic" }}>No languages added yet.</Typography>
                )}
              </Box>
            ) : (
              <Stack spacing={2}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, p: 2, borderRadius: 1.5, border: errors.languages ? "1px solid #ef4444" : "1px solid #e2e8f0", bgcolor: "#f8fafc", minHeight: 60 }}>
                  {editData.languages.map((lang) => (
                    <Chip key={lang} label={lang} onDelete={() => handleLanguageChange(editData.languages.filter((l) => l !== lang))} sx={{ bgcolor: "#f0f9ff", color: "#0369a1", fontWeight: 600, "& .MuiChip-deleteIcon": { color: "#0ea5e9" } }} />
                  ))}
                </Box>
                {errors.languages && <Typography sx={{ fontSize: "0.75rem", color: "#ef4444" }}>{errors.languages}</Typography>}
                <Autocomplete
                  freeSolo
                  options={LANGUAGES_OPTIONS.filter((l) => !editData.languages.includes(l))}
                  onChange={(e, value) => {
                    if (value && !editData.languages.includes(value)) {
                      handleLanguageChange([...editData.languages, value]);
                    }
                  }}
                  renderInput={(params) => <TextField {...params} placeholder="Add languages..." size="small" />}
                />
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button variant="contained" size="small" onClick={() => saveSection("languages")} startIcon={<SaveIcon />} sx={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
                    Save
                  </Button>
                  <Button variant="outlined" size="small" onClick={() => cancelSectionEdit("languages")} startIcon={<CancelIcon />}>
                    Cancel
                  </Button>
                </Box>
              </Stack>
            )}
          </Paper>

          {/* PROFESSIONAL SUMMARY SECTION */}
          <Paper elevation={0} sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 2, bgcolor: "#fff", boxShadow: "0 4px 24px rgba(15,23,42,0.06)" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#0f172a" }}>Professional Summary</Typography>
              <Button
                size="small"
                variant={editingSections.summary ? "outlined" : "text"}
                startIcon={editingSections.summary ? <CancelIcon /> : <EditIcon />}
                onClick={() => toggleSectionEdit("summary")}
                sx={{ color: editingSections.summary ? "#ef4444" : "#6366f1" }}
              >
                {editingSections.summary ? "Cancel" : "Edit"}
              </Button>
            </Box>

            {!editingSections.summary ? (
              <Typography sx={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.6 }}>
                {editData.about || "—"}
              </Typography>
            ) : (
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="about"
                  value={editData.about}
                  onChange={handleInputChange}
                  error={!!errors.about}
                  helperText={errors.about}
                  placeholder="Tell us about yourself..."
                />
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button variant="contained" size="small" onClick={() => saveSection("summary")} startIcon={<SaveIcon />} sx={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
                    Save
                  </Button>
                  <Button variant="outlined" size="small" onClick={() => cancelSectionEdit("summary")} startIcon={<CancelIcon />}>
                    Cancel
                  </Button>
                </Box>
              </Stack>
            )}
          </Paper>

          {/* PERSONAL DETAILS SECTION */}
          <Paper elevation={0} sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 2, bgcolor: "#fff", boxShadow: "0 4px 24px rgba(15,23,42,0.06)" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PersonIcon sx={{ fontSize: 20, color: "#64748b" }} />
                <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#0f172a" }}>Personal Details</Typography>
              </Box>
              <Button
                size="small"
                variant={editingSections.personalDetails ? "outlined" : "text"}
                startIcon={editingSections.personalDetails ? <CancelIcon /> : <EditIcon />}
                onClick={() => toggleSectionEdit("personalDetails")}
                sx={{ color: editingSections.personalDetails ? "#ef4444" : "#6366f1" }}
              >
                {editingSections.personalDetails ? "Cancel" : "Edit"}
              </Button>
            </Box>

            {!editingSections.personalDetails ? (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", mb: 0.5, textTransform: "uppercase" }}>Date of Birth</Typography>
                    <Typography sx={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: 500 }}>{editData.dob || "—"}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", mb: 0.5, textTransform: "uppercase" }}>Marital Status</Typography>
                    <Typography sx={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: 500 }}>{editData.maritalStatus || "—"}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", mb: 0.5, textTransform: "uppercase" }}>Current Location</Typography>
                    <Typography sx={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: 500 }}>{editData.currentLocation || "—"}</Typography>
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    name="dob"
                    type="date"
                    value={editData.dob}
                    onChange={handleInputChange}
                    error={!!errors.dob}
                    helperText={errors.dob}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ startAdornment: <CakeIcon sx={{ mr: 1, fontSize: 18, color: "#64748b" }} /> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Marital Status"
                    name="maritalStatus"
                    value={editData.maritalStatus}
                    onChange={handleInputChange}
                    size="small"
                    InputProps={{ startAdornment: <FamilyRestroomIcon sx={{ mr: 1, fontSize: 18, color: "#64748b" }} /> }}
                  >
                    <MenuItem value="">Select</MenuItem>
                    <MenuItem value="Single">Single</MenuItem>
                    <MenuItem value="Married">Married</MenuItem>
                    <MenuItem value="Divorced">Divorced</MenuItem>
                    <MenuItem value="Widowed">Widowed</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Location"
                    name="currentLocation"
                    value={editData.currentLocation}
                    onChange={handleInputChange}
                    size="small"
                    InputProps={{ startAdornment: <LocationOnIcon sx={{ mr: 1, fontSize: 18, color: "#64748b" }} /> }}
                  />
                </Grid>
                <Grid item xs={12} sx={{ display: "flex", gap: 1 }}>
                  <Button variant="contained" size="small" onClick={() => saveSection("personalDetails")} startIcon={<SaveIcon />} sx={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
                    Save
                  </Button>
                  <Button variant="outlined" size="small" onClick={() => cancelSectionEdit("personalDetails")} startIcon={<CancelIcon />}>
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            )}
          </Paper>
        </Stack>

        {/* AI Result Dialogs */}
        <Dialog open={aiDialogs.resume} onClose={() => handleCloseAiDialog("resume")} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2, border: "1px solid #e2e8f0" } }}>
          <DialogTitle sx={{ fontWeight: 700, color: "#0f172a", pb: 1 }}>🚀 AI-Enhanced Resume Summary</DialogTitle>
          <DialogContent>
            <Box sx={{ whiteSpace: "pre-wrap", fontSize: "0.9rem", color: "#475569", lineHeight: 1.7, mt: 1 }}>
              {aiResults.resume}
            </Box>
            <Box sx={{ mt: 3, p: 2, bgcolor: "#f0fdf4", borderRadius: 1.5, border: "1px solid #dcfce7" }}>
              <Typography sx={{ fontSize: "0.85rem", color: "#15803d", fontWeight: 600 }}>✓ 50 credits debited from your account</Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button onClick={() => handleCloseAiDialog("resume")}>Close</Button>
            <Button variant="contained" sx={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>Use This</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={aiDialogs.skills} onClose={() => handleCloseAiDialog("skills")} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2, border: "1px solid #e2e8f0" } }}>
          <DialogTitle sx={{ fontWeight: 700, color: "#0f172a", pb: 1 }}>📊 Skills Gap Analysis</DialogTitle>
          <DialogContent>
            <Box sx={{ whiteSpace: "pre-wrap", fontSize: "0.9rem", color: "#475569", lineHeight: 1.7, mt: 1 }}>
              {aiResults.skills}
            </Box>
            <Box sx={{ mt: 3, p: 2, bgcolor: "#f0f9ff", borderRadius: 1.5, border: "1px solid #dbeafe" }}>
              <Typography sx={{ fontSize: "0.85rem", color: "#0369a1", fontWeight: 600 }}>✓ 20 credits debited from your account</Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button onClick={() => handleCloseAiDialog("skills")}>Close</Button>
            <Button variant="contained" sx={{ background: "linear-gradient(135deg, #0ea5e9, #0369a1)" }}>Add These Skills</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={aiDialogs.learning} onClose={() => handleCloseAiDialog("learning")} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2, border: "1px solid #e2e8f0" } }}>
          <DialogTitle sx={{ fontWeight: 700, color: "#0f172a", pb: 1 }}>📚 Personalized Learning Path</DialogTitle>
          <DialogContent>
            <Box sx={{ whiteSpace: "pre-wrap", fontSize: "0.9rem", color: "#475569", lineHeight: 1.7, mt: 1 }}>
              {aiResults.learning}
            </Box>
            <Box sx={{ mt: 3, p: 2, bgcolor: "#f0fdf4", borderRadius: 1.5, border: "1px solid #dcfce7" }}>
              <Typography sx={{ fontSize: "0.85rem", color: "#15803d", fontWeight: 600 }}>✓ 20 credits debited from your account</Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button onClick={() => handleCloseAiDialog("learning")}>Close</Button>
            <Button variant="contained" sx={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>Start Learning</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default UserProfile;
