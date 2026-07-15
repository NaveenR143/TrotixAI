import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  useMediaQuery,
  useTheme,
  Stack,
  Chip,
  Avatar,
  IconButton,
  Paper,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BusinessIcon from "@mui/icons-material/Business";
import SchoolIcon from "@mui/icons-material/School";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import StarIcon from "@mui/icons-material/Star";
import MessageIcon from "@mui/icons-material/Message";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import DownloadIcon from "@mui/icons-material/Download";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import { useNavigate, useLocation } from "react-router-dom";
import { fadeSlideUp } from "../../utils/themeUtils";
import { fetchProfile, deductFeatureCredits, fetchWalletBalance, downloadResume, unlockCandidate, checkUnlockStatus } from "../../api/profileAPI";
import { toTitleCase, toAllCapitals } from "../../screens/candidate/utils/profileUtils";
import { sanitizeHtml } from "../../utils/htmlSanitizer";
import { useSelector, useDispatch } from "react-redux";
import { updateUserProfile } from "../../redux/user/Action";
import InsufficientCreditsDialog from "../candidate/components/dialogs/InsufficientCreditsDialog";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockIcon from "@mui/icons-material/Lock";


const CandidateProfileScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useDispatch();

  // Get initial data from location state
  const { applicant: rawApplicant, jobId, jobTitle } = location.state || {};
  const candidateId = rawApplicant?.id || rawApplicant?.user_id;

  const { userid: recruiterUserId, points: recruiterPoints } = useSelector((state) => state.UserReducer);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [insufficientCreditsDialogOpen, setInsufficientCreditsDialogOpen] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // Fetch wallet balance on mount
  useEffect(() => {
    const fetchBalance = async () => {
      const userId = recruiterUserId || localStorage.getItem("user_id");
      if (userId) {
        try {
          const result = await fetchWalletBalance(userId);
          if (!result.error && result.data?.balance !== undefined) {
            dispatch(updateUserProfile({ points: result.data.balance }));
          }
        } catch (e) {
          console.error("Error fetching wallet balance:", e);
        }
      }
    };
    fetchBalance();
  }, [recruiterUserId, dispatch]);

  // Load candidate profile and check unlock status on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!candidateId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetchProfile(null, candidateId);
        if (!response.error && response.data) {
          let updatedData = response.data;

          // Check if candidate details are unlocked on the backend
          const userId = recruiterUserId || localStorage.getItem("user_id");
          if (userId) {
            const unlockRes = await checkUnlockStatus(candidateId);
            if (!unlockRes.error && unlockRes.unlocked) {
              setIsUnlocked(true);
              updatedData = {
                ...updatedData,
                phone: unlockRes.phone,
                email: unlockRes.email
              };
            } else {
              setIsUnlocked(false);
            }
          }

          setProfileData(updatedData);
        } else {
          setError(response.message || "Failed to load candidate profile");
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [candidateId, recruiterUserId]);

  const handleUnlockCandidate = async () => {
    if (unlocking) return;
    if (!recruiterUserId || !candidateId) return;

    // if (!recruiterPoints || recruiterPoints < 20) {
    //   setInsufficientCreditsDialogOpen(true);
    //   return;
    // }

    setUnlocking(true);
    try {
      // const creditResult = await deductFeatureCredits(recruiterUserId, "unlock_candidate");
      // if (creditResult.success) {
      // const newBalance = creditResult.balance !== undefined ? creditResult.balance : creditResult.data?.balance;
      // if (newBalance !== undefined) {
      //   dispatch(updateUserProfile({ points: newBalance }));
      // }

      // Call backend API to unlock candidate
      const unlockResult = await unlockCandidate(candidateId);
      if (!unlockResult.error && unlockResult.status === "success") {
        setIsUnlocked(true);
        setProfileData(prev => ({
          ...prev,
          phone: unlockResult.phone,
          email: unlockResult.email
        }));
        setSnackbar({
          open: true,
          message: "Candidate contact details unlocked successfully!",
          severity: "success"
        });
      } else {
        setSnackbar({
          open: true,
          message: unlockResult.message || "Failed to unlock candidate details.",
          severity: "error"
        });
      }
      // } else {
      //   setInsufficientCreditsDialogOpen(true);
      // }
    } catch (err) {
      console.error("Error unlocking candidate details:", err);
      setSnackbar({
        open: true,
        message: "An unexpected error occurred during unlock.",
        severity: "error"
      });
    } finally {
      setUnlocking(false);
    }
  };

  const downloadFile = async (url) => {
    if (!url) {
      setSnackbar({
        open: true,
        message: "No resume file available for this candidate.",
        severity: "warning"
      });
      return;
    }

    try {
      setDownloading(true);
      const response = await downloadResume(candidateId);

      if (response.error) {
        throw new Error(response.message || "Failed to download resume.");
      }

      // Create a temporary object URL from the blob response
      const blob = new Blob([response.data], { type: response.headers["content-type"] });
      const downloadUrl = window.URL.createObjectURL(blob);

      // Get suggested filename from Content-Disposition header
      const disposition = response.headers["content-disposition"];
      let filename = `Resume_${applicant?.name ? applicant.name.replace(/\s+/g, "_") : "Candidate"}.pdf`;
      if (disposition && disposition.indexOf("attachment") !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, "");
        }
      }

      // Trigger browser download via a virtual anchor tag
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setSnackbar({
        open: true,
        message: "Resume download started.",
        severity: "success"
      });
    } catch (err) {
      console.error("Error downloading file:", err);
      setSnackbar({
        open: true,
        message: err.message || "Failed to download resume. Please try again.",
        severity: "error"
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadResume = async () => {
    if (downloading) return;

    if (!isUnlocked) {
      if (unlocking) return;
      if (!recruiterUserId || !candidateId) return;

      if (!recruiterPoints || recruiterPoints < 20) {
        setInsufficientCreditsDialogOpen(true);
        return;
      }

      setUnlocking(true);
      try {
        const creditResult = await deductFeatureCredits(recruiterUserId, "unlock_candidate");
        if (creditResult.success) {
          const newBalance = creditResult.balance !== undefined ? creditResult.balance : creditResult.data?.balance;
          if (newBalance !== undefined) {
            dispatch(updateUserProfile({ points: newBalance }));
          }

          // Call backend API to unlock candidate
          const unlockResult = await unlockCandidate(candidateId);
          if (!unlockResult.error && unlockResult.status === "success") {
            setIsUnlocked(true);
            setProfileData(prev => ({
              ...prev,
              phone: unlockResult.phone,
              email: unlockResult.email
            }));
            setSnackbar({
              open: true,
              message: "Candidate unlocked and resume download starting...",
              severity: "success"
            });

            // Trigger download immediately
            const targetUrl = profileData?.resume_url || applicant?.resume_url;
            downloadFile(targetUrl);
          } else {
            setSnackbar({
              open: true,
              message: unlockResult.message || "Failed to unlock candidate for resume download.",
              severity: "error"
            });
          }
        } else {
          setInsufficientCreditsDialogOpen(true);
        }
      } catch (err) {
        console.error("Error unlocking candidate for resume download:", err);
        setSnackbar({
          open: true,
          message: "An error occurred during unlock. Please try again.",
          severity: "error"
        });
      } finally {
        setUnlocking(false);
      }
    } else {
      // Already unlocked, download directly
      downloadFile(profileData?.resume_url || applicant?.resume_url);
    }
  };

  // Normalize applicant data with API data and fallbacks
  const applicant = useMemo(() => {
    if (!rawApplicant) return null;

    const apiData = profileData || {};
    const apiExperience = apiData.experience || [];
    const apiEducation = apiData.education || [];
    const apiProjects = apiData.projects || [];
    const apiSkills = apiData.skills?.map(s => s.name).filter(Boolean) || [];

    const fullPhone = apiData.phone || rawApplicant.phone;
    const fullEmail = apiData.email || `${(apiData.full_name || rawApplicant.name).toLowerCase().replace(/ /g, ".")}@email.com`;

    return {
      ...rawApplicant,
      name: toTitleCase(apiData.full_name || rawApplicant.name),
      jobTitle: toTitleCase(apiData.headline || rawApplicant.jobTitle),
      location: toTitleCase(apiData.current_location || rawApplicant.location),
      experience: apiData.years_of_experience ? `${apiData.years_of_experience} yrs` : toTitleCase(rawApplicant.experience),
      about: apiData.summary || rawApplicant.summary || "No summary provided.",
      keySkills: apiSkills.length > 0 ? apiSkills.map(toTitleCase) : (rawApplicant.allSkills || rawApplicant.keySkills || rawApplicant.matchedSkills || []).map(toTitleCase),
      company: toTitleCase(apiData.company_name || rawApplicant.company || "Company"),
      phone: isUnlocked ? fullPhone : "••••••••••",
      email: isUnlocked ? fullEmail : "••••••••••@•••••.com",
      profileImage: apiData.avatar_url || rawApplicant.profileImage,
      resume_url: apiData.resume_url || rawApplicant.resume_url || null,

      workHistory: apiExperience.length > 0 ? apiExperience.map(exp => ({
        title: toTitleCase(exp.title),
        company_name: toTitleCase(exp.company_name || "Company"),
        duration: exp.start_date ? `${exp.start_date} - ${exp.is_current ? 'Present' : (exp.end_date || '')}` : exp.duration,
        description: exp.description
      })) : [
        {
          title: toTitleCase(rawApplicant.jobTitle || "Senior Developer"),
          company_name: "Previous Tech Corp",
          duration: rawApplicant.experience || "3 years",
          description: "Leading development teams and architecting scalable solutions using modern web technologies."
        }
      ],

      education: apiEducation.length > 0 ? apiEducation.map(edu => ({
        degree: toAllCapitals(edu.degree),
        school: toAllCapitals(edu.institution),
        year: edu.end_year ? edu.end_year.toString() : (edu.start_year ? `${edu.start_year} - Present` : "")
      })) : [],

      projects: apiProjects.length > 0 ? apiProjects.map(proj => {
        const formatProjDate = (dateStr) => {
          if (!dateStr) return null;
          try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          } catch (e) {
            return dateStr;
          }
        };

        const start = formatProjDate(proj.start_date);
        const end = proj.end_date ? formatProjDate(proj.end_date) : (proj.start_date ? 'Present' : null);

        return {
          title: toTitleCase(proj.title),
          description: proj.description,
          duration: start ? `${start} - ${end}` : "",
          url: proj.url,
          repo_url: proj.repo_url,
          skills: (proj.skills_used || []).map(toTitleCase)
        };
      }) : []
    };
  }, [rawApplicant, profileData, isUnlocked]);


  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 3, bgcolor: '#F8FAFC' }}>
        <CircularProgress size={40} thickness={5} sx={{ color: '#2563EB' }} />
        <Typography sx={{ color: '#6B7280', fontWeight: 600 }}>Fetching profile...</Typography>
      </Box>
    );
  }

  if (error || !applicant) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 2, bgcolor: '#F8FAFC' }}>
        <Typography variant="h5" color="error" sx={{ fontWeight: 800 }}>Profile not found</Typography>
        <Button variant="contained" onClick={() => navigate(-1)} sx={{ borderRadius: '12px' }}>Go Back</Button>
      </Box>
    );
  }

  const SectionHeader = ({ icon: Icon, title, accent }) => (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
        <Icon sx={{ color: '#111827', fontSize: 22 }} />
        <Typography sx={{ fontWeight: 700, fontSize: "1.125rem", color: "#111827" }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ width: 40, height: 3, bgcolor: accent || '#2563EB', borderRadius: 1 }} />
    </Box>
  );

  const MatchScoreRing = ({ score }) => {
    const color = score >= 80 ? '#2563EB' : score >= 60 ? '#7C3AED' : '#6B7280';
    return (
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate"
          value={100}
          size={80}
          thickness={4}
          sx={{ color: '#E5E7EB' }}
        />
        <CircularProgress
          variant="determinate"
          value={score}
          size={80}
          thickness={4}
          sx={{
            color: color,
            position: 'absolute',
            left: 0,
            strokeLinecap: 'round',
          }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h6" component="div" sx={{ fontWeight: 800, color: color }}>
            {score}
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", pb: 6 }}>
      {/* Header - Naukri Style */}
      <Box sx={{ bgcolor: "#FFFFFF", borderBottom: "1px solid #E5E7EB", position: 'sticky', top: 0, zIndex: 1000 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.5 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: '#6B7280' }}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
                RightNxt AI
              </Typography>
            </Stack>

            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography variant="subtitle2" sx={{ color: '#6B7280', fontWeight: 600 }}>
                Candidate Profile • <span style={{ color: '#2563EB' }}>Matching for {toTitleCase(jobTitle || "Role")}</span>
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button size="small" sx={{ color: '#6B7280', fontWeight: 600 }}>Home</Button>
              <Button size="small" sx={{ color: '#6B7280', fontWeight: 600 }} onClick={() => navigate('/membership')}>Credits</Button>
              <IconButton
                size="small"
                sx={{ border: '1px solid #E5E7EB', borderRadius: '10px' }}
                onClick={handleMenuClick}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pt: 4 }}>
        <Grid container spacing={4}>
          {/* Main Left Content */}
          <Grid item xs={12} md={8}>
            {/* Top Profile Card */}
            <Paper elevation={0} sx={{ p: 4, mb: 4, position: 'relative', overflow: 'hidden' }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item>
                  <Avatar
                    src={applicant.profileImage}
                    variant="square"
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: 0,
                      boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                      border: '4px solid #FFFFFF',
                      "& img": {
                        objectFit: "contain"
                      }
                    }}
                  />
                </Grid>
                <Grid item xs>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827' }}>
                      {applicant.name}
                    </Typography>
                    <Box sx={{ bgcolor: '#eff6ff', color: '#2563EB', px: 1, py: 0.2, borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
                      <StarIcon sx={{ fontSize: 14, mr: 0.5 }} />
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }}>Verified</Typography>
                    </Box>
                  </Stack>
                  <Typography variant="h6" sx={{ color: '#2563EB', fontWeight: 700, mb: 1 }}>
                    {applicant.jobTitle}
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationOnIcon sx={{ fontSize: 16, color: '#6B7280' }} />
                      <Typography variant="body2">{applicant.location}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <WorkHistoryIcon sx={{ fontSize: 16, color: '#6B7280' }} />
                      <Typography variant="body2">{applicant.experience}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item>
                  <Stack alignItems="center" spacing={1}>
                    <MatchScoreRing score={applicant.matchScore} />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                      Match Score
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            {/* Professional Summary */}
            <Paper elevation={0} sx={{ p: 4, mb: 4 }}>
              <SectionHeader icon={MessageIcon} title="Professional Summary" accent="#22D3EE" />
              <Typography
                variant="body1"
                sx={{
                  color: '#475569',
                  lineHeight: 1.8,
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere',
                  whiteSpace: 'pre-line',
                  textAlign: { xs: 'justify', md: 'left' }
                }}
              >
                {applicant.about}
              </Typography>
            </Paper>

            {/* Experience Section */}
            <Paper elevation={0} sx={{ p: 4, mb: 4 }}>
              <SectionHeader icon={WorkHistoryIcon} title="Work Experience" />
              <Stack spacing={4}>
                {applicant.workHistory.map((exp, idx) => (
                  <Box key={idx} sx={{ position: 'relative', pl: 3 }}>
                    <Box sx={{
                      position: 'absolute', left: 0, top: 8, bottom: -32, width: '2px',
                      bgcolor: '#E5E7EB', display: idx === applicant.workHistory.length - 1 ? 'none' : 'block'
                    }} />
                    <Box sx={{
                      position: 'absolute', left: -4, top: 8, width: 10, height: 10,
                      borderRadius: '50%', bgcolor: '#2563EB', border: '2px solid #FFFFFF'
                    }} />

                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.2 }}>{exp.title}</Typography>
                        <Typography sx={{ color: '#2563EB', fontWeight: 700, fontSize: '0.95rem', textTransform: "uppercase", letterSpacing: "0.5px" }}>{exp.company_name}</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#6B7280', bgcolor: '#F1F5F9', px: 1.5, py: 0.5, borderRadius: '8px' }}>
                        {exp.duration}
                      </Typography>
                    </Stack>
                    <Typography
                      component="div"
                      variant="body2"
                      sx={{
                        color: "#475569",
                        lineHeight: 1.7,
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                        display: "block",
                        textAlign: { xs: "justify", md: "left" },

                        "& p": {
                          margin: "0 0 12px",
                        },

                        "& ul, & ol": {
                          paddingLeft: "24px",
                          margin: "12px 0",
                        },

                        "& li": {
                          marginBottom: "6px",
                        },

                        "& br": {
                          display: "block",
                          content: '""',
                          marginBottom: "8px",
                        },
                      }}
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(exp.description),
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </Paper>

            {/* Projects Section */}
            {applicant.projects && applicant.projects.length > 0 && (
              <Paper elevation={0} sx={{ p: 4, mb: 4 }}>
                <SectionHeader icon={AccountTreeIcon} title="Key Projects" accent="#7C3AED" />
                <Stack spacing={4}>
                  {applicant.projects.map((proj, idx) => (
                    <Box key={idx} sx={{ p: 3, borderRadius: '12px', border: '1px solid #F1F5F9', '&:hover': { bgcolor: '#F8FAFC' }, transition: '0.2s' }}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>{proj.title}</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#6B7280' }}>{proj.duration}</Typography>
                      </Stack>
                      <Typography
                        component="div"
                        variant="body2"
                        sx={{
                          color: '#475569',
                          mb: 2.5,
                          lineHeight: 1.7,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          textAlign: { xs: 'justify', md: 'left' },
                          "& ul, & ol": { pl: 3, my: 1 },
                          "& li": { mb: 0.5 },
                          "& p": { my: 0.5, textAlign: { xs: 'justify', md: 'left' } }
                        }}
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(proj.description) }}
                      />

                      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
                        {proj.skills.map((skill, sIdx) => (
                          <Chip key={sIdx} label={skill} size="small" sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 600 }} />
                        ))}
                      </Stack>

                      <Stack direction="row" spacing={2}>
                        {proj.url && (
                          <Button size="small" variant="text" sx={{ p: 0, minWidth: 0, fontWeight: 700, color: '#2563EB' }}>Live Demo</Button>
                        )}
                        {proj.repo_url && (
                          <Button size="small" variant="text" sx={{ p: 0, minWidth: 0, fontWeight: 700, color: '#2563EB' }}>View Code</Button>
                        )}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            )}
          </Grid>

          {/* Right Sidebar */}
          <Grid item xs={12} md={4}>
            <Stack spacing={4} sx={{ position: { md: 'sticky' }, top: 100 }}>
              {/* CTA Card */}
              <Paper elevation={0} sx={{ p: 4 }}>
                <Stack spacing={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={downloading || unlocking ? null : <DownloadIcon />}
                    onClick={handleDownloadResume}
                    disabled={downloading || unlocking}
                    sx={{
                      py: 1.5,
                      bgcolor: '#2563EB',
                      '&:hover': { bgcolor: '#1e40af' },
                      '&.Mui-disabled': {
                        bgcolor: '#2563EB',
                        color: 'rgba(255, 255, 255, 0.7)',
                        opacity: 0.7
                      },
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {downloading || unlocking ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : isUnlocked ? (
                      "Download Resume"
                    ) : (
                      "Unlock & Download (20 Credits)"
                    )}
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={isSaved ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    onClick={() => setIsSaved(!isSaved)}
                    sx={{
                      py: 1.5,
                      borderColor: isSaved ? '#ef4444' : '#E5E7EB',
                      color: isSaved ? '#ef4444' : '#111827',
                      '&:hover': { borderColor: '#ef4444', bgcolor: '#fef2f2' }
                    }}
                  >
                    {isSaved ? "Saved" : "Save Candidate"}
                  </Button>
                  <Typography variant="caption" align="center" sx={{ display: 'block', color: '#6B7280' }}>
                    Saved candidates are private to your account
                  </Typography>
                </Stack>
              </Paper>

              {/* Skills Card */}
              <Paper elevation={0} sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Technical Skills</Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {applicant.keySkills.map((skill, idx) => (
                    <Chip
                      key={idx}
                      label={skill}
                      sx={{
                        bgcolor: '#f5f3ff',
                        color: '#7C3AED',
                        fontWeight: 700,
                        border: '1px solid #e5e0fa'
                      }}
                    />
                  ))}
                </Stack>
              </Paper>

              {/* Contact Information */}
              <Paper elevation={0} sx={{ p: 4, position: "relative" }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Contact Info</Typography>
                <Stack spacing={3}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ opacity: isUnlocked ? 1 : 0.4 }}>
                    <Box sx={{ p: 1, bgcolor: '#F8FAFC', borderRadius: '10px' }}>
                      <MessageIcon sx={{ fontSize: 20, color: '#6B7280' }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ display: 'block', color: '#6B7280' }}>Email</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{applicant.email}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ opacity: isUnlocked ? 1 : 0.4 }}>
                    <Box sx={{ p: 1, bgcolor: '#F8FAFC', borderRadius: '10px' }}>
                      <VideoCallIcon sx={{ fontSize: 20, color: '#6B7280' }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ display: 'block', color: '#6B7280' }}>Phone</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{applicant.phone || "Not provided"}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ p: 1, bgcolor: '#F8FAFC', borderRadius: '10px' }}>
                      <LocationOnIcon sx={{ fontSize: 20, color: '#6B7280' }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ display: 'block', color: '#6B7280' }}>Location</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{applicant.location}</Typography>
                    </Box>
                  </Stack>

                  {!isUnlocked && (
                    <Box
                      sx={{
                        mt: 2,
                        p: 2.5,
                        borderRadius: "16px",
                        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                        border: "1px dashed #cbd5e1",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor: "#e0e7ff",
                          color: "#4f46e5",
                          borderRadius: "50%",
                          display: "inline-flex",
                        }}
                      >
                        <LockIcon sx={{ fontSize: 24 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#1e293b", mb: 0.5 }}>
                          Contact Info Locked
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748b", display: "block", px: 1 }}>
                          Unlock candidate's complete profile details for 20 credits.
                        </Typography>
                      </Box>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={handleUnlockCandidate}
                        disabled={unlocking}
                        sx={{
                          py: 1.2,
                          borderRadius: "10px",
                          background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                          fontWeight: 800,
                          fontSize: "0.85rem",
                          textTransform: "none",
                          boxShadow: "0 4px 10px rgba(99, 102, 241, 0.2)",
                          "&:hover": {
                            background: "linear-gradient(135deg, #5568d3 0%, #3e38c5 100%)",
                          },
                        }}
                      >
                        {unlocking ? (
                          <CircularProgress size={18} color="inherit" />
                        ) : (
                          "Show Candidate Details"
                        )}
                      </Button>
                    </Box>
                  )}
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* Send Message Dialog */}
      <Dialog open={messageDialogOpen} onClose={() => setMessageDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: "#0f172a" }}>
          Send Message to {applicant.name}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setMessageDialogOpen(false)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={() => { setMessageDialogOpen(false); setMessage(""); }}
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 700,
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            }}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 1,
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            borderRadius: 2,
          },
        }}
      >
        <MenuItem onClick={handleMenuClose} sx={{ py: 1.5, fontSize: "0.9rem" }}>
          Reject Application
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ py: 1.5, fontSize: "0.9rem", color: "#ef4444" }}>
          Block Candidate
        </MenuItem>
      </Menu>

      {/* Insufficient Credits Dialog */}
      <InsufficientCreditsDialog
        open={insufficientCreditsDialogOpen}
        onClose={() => setInsufficientCreditsDialogOpen(false)}
      />

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%", borderRadius: "10px", fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CandidateProfileScreen;

