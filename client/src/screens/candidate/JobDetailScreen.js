// screens/candidate/JobDetailScreen.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  IconButton,
  Stack,
  Grid,
  Paper,
  Container,
  useMediaQuery,
  useTheme,
  TextField,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import WorkIcon from "@mui/icons-material/Work";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SchoolIcon from "@mui/icons-material/School";
import BusinessIcon from "@mui/icons-material/Business";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MoreTimeIcon from "@mui/icons-material/MoreTime";
import GroupsIcon from "@mui/icons-material/Groups";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EmailIcon from "@mui/icons-material/Email";
import ShareIcon from "@mui/icons-material/Share";
import MatchBadge from "../../components/jobs/MatchBadge";
import { getWorkModeIcon } from "../../utils/themeUtils";
import { useSelector, useDispatch } from "react-redux";
import { applyJob, generateTailoredJobEmail, generateATSContent } from "../../api/jobpostingAPI";
import * as profileAPI from "../../api/profileAPI";
import { updateUserProfile } from "../../redux/user/Action";
import InsufficientCreditsDialog from "./components/dialogs/InsufficientCreditsDialog";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SendIcon from "@mui/icons-material/Send";

const formatEducation = (educationList) => {
  if (!educationList || !Array.isArray(educationList) || educationList.length === 0) return "";
  return educationList
    .map((edu) => {
      const parts = [];
      if (edu.degree) parts.push(edu.degree);
      if (edu.field) parts.push(edu.field);
      if (edu.school) parts.push(`at ${edu.school}`);
      if (edu.year) parts.push(`(${edu.year})`);
      if (edu.grade) parts.push(`Grade: ${edu.grade}`);
      return parts.join(" ");
    })
    .join("\n\n");
};

const JobDetailScreen = ({
  job,
  onBack,
  isEmbedded = false,
  savedJobs = new Set(),
  onToggleSave,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSaved = savedJobs.has(job.id);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [applying, setApplying] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [generatingATS, setGeneratingATS] = useState(false);
  const [tailoredEmail, setTailoredEmail] = useState({ subject: "", body: "" });
  const [showTailoredEmailDialog, setShowTailoredEmailDialog] = useState(false);
  const [showATSContentDialog, setShowATSContentDialog] = useState(false);
  const [atsContent, setAtsContent] = useState({ project_details: "", experience_details: "", skills: "" });
  const [showProviderDialog, setShowProviderDialog] = useState(false);
  const [emailToOpen, setEmailToOpen] = useState({ to: "", subject: "", body: "" });

  const user = useSelector((state) => state.UserReducer);
  const { userid } = user;
  const userPoints = useSelector((state) => state.UserReducer.points) || 0;
  const profile = useSelector((state) => state.ProfileReducer?.data);
  const dispatch = useDispatch();
  const [insufficientCreditsDialogOpen, setInsufficientCreditsDialogOpen] = useState(false);
  const [dialogProfile, setDialogProfile] = useState({ fullName: "", email: "", mobile: "" });
  const [dialogExperiences, setDialogExperiences] = useState([]);
  const [dialogEducation, setDialogEducation] = useState([]);

  useEffect(() => {
    if (showATSContentDialog) {
      setDialogProfile({
        fullName: user?.fullname || profile?.personalDetails?.fullName || "",
        email: user?.email || profile?.personalDetails?.email || "",
        mobile: user?.mobile || profile?.personalDetails?.phone || ""
      });

      // Experience sync
      const sortedExps = [...(profile?.experience || [])].sort((a, b) => {
        if (a.isCurrent && !b.isCurrent) return -1;
        if (!a.isCurrent && b.isCurrent) return 1;
        const dateA = new Date(a.startDate || 0);
        const dateB = new Date(b.startDate || 0);
        return dateB - dateA;
      });

      const mappedExps = sortedExps.map((exp, idx) => {
        const summary = idx === 0 ? (atsContent.experience_details || exp.description) : exp.description;
        return {
          ...exp,
          summary: summary || ""
        };
      });
      setDialogExperiences(mappedExps);

      // Education sync
      const mappedEdus = (profile?.education || []).map((edu) => ({
        ...edu,
        school: (edu.school || "").toUpperCase(),
        degree: (edu.degree || "").toUpperCase(),
        field: (edu.field || "").toUpperCase(),
        year: (edu.year || "").toUpperCase(),
        grade: (edu.grade || "").toUpperCase()
      }));
      setDialogEducation(mappedEdus);
    }
  }, [showATSContentDialog, user, profile, atsContent]);

  const handleExperienceSummaryChange = (index, value) => {
    setDialogExperiences(prev => prev.map((exp, idx) => idx === index ? { ...exp, summary: value } : exp));
  };

  const handleEducationChange = (index, field, value) => {
    setDialogEducation(prev => prev.map((edu, idx) => idx === index ? { ...edu, [field]: value.toUpperCase() } : edu));
  };

  const handleApply = async () => {
    if (job.direct_url) {
      window.open(job.direct_url, "_blank");
      return;
    }
    if (job.recruiter_id) {
      // Internal Application
      setApplying(true);
      try {
        const result = await applyJob({
          job_id: job.id,
          user_id: userid,
        });

        if (!result.error) {
          setSnackbar({
            open: true,
            message: "Application submitted successfully!",
            severity: "success",
          });
        } else {
          setSnackbar({
            open: true,
            message: result.message || "Failed to submit application.",
            severity: "error",
          });
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: "An unexpected error occurred.",
          severity: "error",
        });
      } finally {
        setApplying(false);
      }
    } else {
      const companyName = (typeof job.company === "object" ? job.company?.name : job.company) || "";
      const googleSearch = () => {
        const searchQuery = `${companyName} careers jobs`;
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
        window.open(searchUrl, "_blank");
      };



      if (job.direct_url) {
        window.open(job.direct_url, "_blank");
      }
      else if (!job.is_verified || !job.company_apply) {
        googleSearch();
      } else if (job.is_verified && job.careers_url && job.company_apply) {
        window.open(job.careers_url, "_blank");
      } else if (job.is_verified && !job.careers_url && job.hiring_email) {
        setShowEmailDialog(true);
      } else {
        googleSearch();
      }
    }
  };

  const handleEmailApplyWithAI = async () => {
    // Charge 5 credits for AI email generation (apply_with_ai)
    if (!userid) {
      setSnackbar({ open: true, message: "User ID not found. Please refresh.", severity: "error" });
      return;
    }

    // Check local balance first
    if (!userPoints || userPoints < 5) {
      setInsufficientCreditsDialogOpen(true);
      return;
    }

    setGeneratingEmail(true);
    try {
      const creditResult = await profileAPI.deductFeatureCredits(userid, "apply_with_ai_email");

      if (!creditResult || creditResult.error || creditResult.success === false) {
        // Show insufficient or failed dialog
        setInsufficientCreditsDialogOpen(true);
        setGeneratingEmail(false);
        return;
      }

      // Update local Redux balance if returned
      if (creditResult.balance !== undefined) {
        dispatch(updateUserProfile({ points: creditResult.balance }));
      }

      // Proceed to generate tailored email
      const result = await generateTailoredJobEmail(job.id, userid);
      if (!result.error) {
        setTailoredEmail({
          subject: result.data.subject || "",
          body: result.data.body || ""
        });
        setShowTailoredEmailDialog(true);
      } else {
        setSnackbar({ open: true, message: result.message || "Failed to generate AI email.", severity: "error" });
      }
    } catch (error) {
      console.error("Apply with AI error:", error);
      setSnackbar({ open: true, message: "An unexpected error occurred.", severity: "error" });
    } finally {
      setGeneratingEmail(false);
    }
  };

  const handleApplyWithAI = async () => {
    // Charge 10 credits for ATS optimization (apply_with_ai)
    if (!userid) {
      setSnackbar({ open: true, message: "User ID not found. Please refresh.", severity: "error" });
      return;
    }

    // Check local balance first (10 credits required)
    if (!userPoints || userPoints < 10) {
      setInsufficientCreditsDialogOpen(true);
      return;
    }

    setGeneratingATS(true);
    try {
      const creditResult = await profileAPI.deductFeatureCredits(userid, "apply_with_ai");

      if (!creditResult || creditResult.error || creditResult.success === false) {
        // Show insufficient or failed dialog
        setInsufficientCreditsDialogOpen(true);
        return;
      }

      // Update local Redux balance if returned
      if (creditResult.balance !== undefined) {
        dispatch(updateUserProfile({ points: creditResult.balance }));
      }

      // Proceed to generate tailored ATS content
      const result = await generateATSContent(job.id, userid);
      if (!result.error) {
        setAtsContent({
          project_details: result.data.project_details || "",
          experience_details: result.data.experience_details || "",
          skills: result.data.skills || ""
        });
        setShowATSContentDialog(true);

        if (job.direct_url) {
          window.open(job.direct_url, "_blank");
        } else {
          const companyName = (typeof job.company === "object" ? job.company?.name : job.company) || "";
          const searchQuery = `${companyName} jobs careers`;
          const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
          window.open(searchUrl, "_blank");
        }
      } else {
        setSnackbar({ open: true, message: result.message || "Failed to generate AI content.", severity: "error" });
      }
    } catch (error) {
      console.error("Apply with AI error:", error);
      setSnackbar({ open: true, message: "An unexpected error occurred.", severity: "error" });
    } finally {
      setGeneratingATS(false);
    }
  };

  const handleSendEmail = () => {
    setEmailToOpen({
      to: job.hiring_email,
      subject: tailoredEmail.subject,
      body: tailoredEmail.body
    });
    setShowProviderDialog(true);
    // We don't close the tailored dialog yet, or maybe we do? 
    // Usually it's better to close it once they picked a provider.
  };

  const handleOpenProvider = (provider) => {
    const { to, subject, body } = emailToOpen;
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);

    let url = "";
    switch (provider) {
      case 'gmail':
        url = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${encodedSubject}&body=${encodedBody}`;
        break;
      case 'outlook':
        url = `https://outlook.live.com/mail/0/deeplink/compose?to=${to}&subject=${encodedSubject}&body=${encodedBody}`;
        break;
      case 'yahoo':
        url = `https://compose.mail.yahoo.com/?to=${to}&subject=${encodedSubject}&body=${encodedBody}`;
        break;
      default:
        url = `mailto:${to}?subject=${encodedSubject}&body=${encodedBody}`;
    }

    if (provider === 'default') {
      window.location.href = url;
    } else {
      window.open(url, '_blank');
    }

    setShowProviderDialog(false);
    setShowTailoredEmailDialog(false);
  };

  const handleComposeStandardEmail = () => {
    setEmailToOpen({
      to: job.hiring_email,
      subject: `Application for ${job.title} - ${job.company}`,
      body: `Dear Hiring Team,\n\nI am interested in applying for the ${job.title} position at ${job.company}.\n\n(Please remember to attach your resume)`
    });
    setShowEmailDialog(false);
    setShowProviderDialog(true);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(job.hiring_email);
    setSnackbar({
      open: true,
      message: "Email address copied to clipboard!",
      severity: "success",
    });
  };

  const handleShareLink = () => {
    const publicUrl = `${window.location.origin}/job/${job.id}`;
    navigator.clipboard.writeText(publicUrl);
    setSnackbar({
      open: true,
      message: "Public job link copied to clipboard!",
      severity: "success",
    });
  };

  // Helper component for section headers with icons
  const SectionHeader = ({ icon: Icon, title, accent = "#2563EB" }) => (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
        <Icon sx={{ color: "#111827", fontSize: 22 }} />
        <Typography sx={{ fontWeight: 700, fontSize: { xs: "1.0rem", md: "1.1rem" }, color: "#111827", letterSpacing: "-0.02em" }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ width: 40, height: 3, bgcolor: accent, borderRadius: 1 }} />
    </Box>
  );

  const renderJobDescription = (description) => {
    if (!description) return null;

    // Check if the description contains HTML tags
    const hasHtml = /<[a-z][\s\S]*>/i.test(description);
    if (hasHtml) {
      return (
        <Box
          dangerouslySetInnerHTML={{ __html: description }}
          sx={{
            color: "#475569",
            lineHeight: 1.8,
            fontSize: "1rem",
            textAlign: "justify",
            '& p': { mb: 2, textAlign: "justify" },
            '& ul, & ol': { mb: 2, pl: 3 },
            '& li': { mb: 1 },
            '& img': { maxWidth: '100%', height: 'auto', borderRadius: '8px' }
          }}
        />
      );
    }

    // Split plain text by double newlines for paragraph separation
    const paragraphs = description.split(/\n\s*\n+/);

    return (
      <Box>
        {paragraphs.map((para, index) => {
          const trimmed = para.trim();
          if (!trimmed) return null;
          return (
            <Typography
              key={index}
              sx={{
                mb: 2,
                color: "#475569",
                lineHeight: 1.8,
                fontSize: "1rem",
                whiteSpace: "pre-line",
                textAlign: "justify",
              }}
            >
              {trimmed}
            </Typography>
          );
        })}
      </Box>
    );
  };

  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", pb: 8 }}>
      {/* Top Header */}
      {!isEmbedded && (
        <Box sx={{ bgcolor: "#FFFFFF", borderBottom: "1px solid #E5E7EB", position: 'sticky', top: 0, zIndex: 1000 }}>
          <Container maxWidth="lg">
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.5 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <IconButton onClick={onBack} size="small" sx={{ color: '#6B7280' }}>
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>
                  Job Details
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.5}>
                <IconButton
                  onClick={handleShareLink}
                  sx={{
                    border: "1px solid #E5E7EB",
                    borderRadius: '10px',
                    color: '#6B7280'
                  }}
                >
                  <ShareIcon fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={() => onToggleSave?.(job.id)}
                  sx={{
                    border: "1px solid #E5E7EB",
                    borderRadius: '10px',
                    color: isSaved ? '#f59e0b' : '#6B7280'
                  }}
                >
                  {isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                </IconButton>
              </Stack>
            </Box>
          </Container>
        </Box>
      )}

      <Container maxWidth="lg" sx={{ pt: 4 }}>
        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {/* Job Header Card */}
            <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: '20px' }}>
              <Box>
                <Typography sx={{ fontWeight: 800, color: "#111827", fontSize: { xs: "1.5rem", md: "1.8rem" }, letterSpacing: "-0.03em", mb: 1.5 }}>
                  {job.title}
                </Typography>

                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
                  <Avatar
                    sx={{
                      width: 30,
                      height: 30,
                      background: `linear-gradient(135deg, ${job.logoColor || '#2563EB'}, #4f46e5)`,
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      borderRadius: '8px',
                      boxShadow: "0 4px 12px rgba(37, 99, 235, 0.12)",
                    }}
                  >
                    {job.company?.[0]}
                  </Avatar>
                  <Typography sx={{ color: "#2563EB", fontWeight: 600, fontSize: { xs: "1.0rem", md: "1.15rem" } }}>
                    {job.company}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={2} flexWrap="wrap" gap={1.5}>
                  <MatchBadge score={job.matchScore} size="lg" />
                  <Chip
                    icon={<LocationOnIcon sx={{ fontSize: '16px !important' }} />}
                    label={job.location}
                    variant="outlined"
                    sx={{ borderRadius: '10px', fontWeight: 500, color: '#212121', borderColor: '#E5E7EB' }}
                  />
                  <Chip
                    icon={<WorkIcon sx={{ fontSize: '16px !important' }} />}
                    label={job.workMode}
                    variant="outlined"
                    sx={{ borderRadius: '10px', fontWeight: 500, color: '#212121', borderColor: '#E5E7EB' }}
                  />
                  {job.salary && (
                    <Chip label={job.salary} sx={{ borderRadius: '10px', fontWeight: 700, bgcolor: '#dcfce7', color: '#16a34a' }} />
                  )}
                </Stack>
              </Box>
            </Paper>

            {/* Description Section */}
            <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: '20px' }}>
              <SectionHeader icon={AssignmentIcon} title="Job Description" accent="#22D3EE" />
              <Box
                sx={{
                  maxHeight: expandedDescription ? 'none' : '400px',
                  overflow: 'hidden',
                  position: 'relative',
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere',
                }}
              >
                {renderJobDescription(job.description)}
              </Box>
              <Button
                onClick={() => setExpandedDescription(!expandedDescription)}
                sx={{ mt: 2, fontWeight: 600, color: '#2563EB', textTransform: 'none' }}
              >
                {expandedDescription ? 'Read Less' : 'Read Full Description'}
              </Button>
            </Paper>

            {/* Responsibilities */}
            {job.responsibilities && (
              <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: '20px' }}>
                <SectionHeader icon={CheckCircleIcon} title="Responsibilities" accent="#10B981" />
                <Stack spacing={2}>
                  {(Array.isArray(job.responsibilities) ? job.responsibilities : job.responsibilities.split('\n')).map((r, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 2 }}>
                      <CheckCircleIcon sx={{ color: '#10B981', mt: 0.5, fontSize: 20 }} />
                      <Typography sx={{ color: '#475569', fontWeight: 400 }}>{r}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            )}

            {/* Benefits */}
            {job.benefits && (
              <Paper elevation={0} sx={{ p: 4, borderRadius: '20px' }}>
                <SectionHeader icon={TrendingUpIcon} title="Benefits & Perks" accent="#F59E0B" />
                <Grid container spacing={2}>
                  {(Array.isArray(job.benefits) ? job.benefits : job.benefits.split(',')).map((b, i) => (
                    <Grid item xs={12} sm={6} key={i}>
                      <Box sx={{ p: 2, bgcolor: "#F8FAFC", borderRadius: '12px', border: "1px solid #E5E7EB", display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CheckCircleIcon sx={{ color: "#F59E0B", fontSize: 20 }} />
                        <Typography sx={{ fontWeight: 600, color: "#111827" }}>{b}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Stack spacing={4} sx={{ position: { md: 'sticky' }, top: 100 }}>
              {/* Skills Match Card */}
              <Paper elevation={0} sx={{ p: 4, borderRadius: '20px' }}>
                <SectionHeader icon={SchoolIcon} title="Skills Match" accent="#7C3AED" />
                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" sx={{ display: 'block', color: '#6B7280', mb: 1, fontWeight: 600, textTransform: 'uppercase' }}>Your Matching Skills</Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {job.keySkillsMatched.map(s => (
                      <Chip
                        key={s}
                        label={s
                          .toLowerCase()
                          .replace(/\b\w/g, char => char.toUpperCase())}
                        sx={{
                          bgcolor: '#eff6ff',
                          color: '#2563EB',
                          fontWeight: 600,
                          borderRadius: '8px'
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
                {job.keySkillsMissing?.length > 0 && (
                  <Box>
                    <Typography variant="caption" sx={{ display: 'block', color: '#6B7280', mb: 1, fontWeight: 600, textTransform: 'uppercase' }}>Missing Skills</Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {job.keySkillsMissing.map(s => (
                        <Chip
                          key={s}
                          label={s
                            .toLowerCase()
                            .replace(/[_-]/g, ' ')
                            .replace(/\b\w/g, char => char.toUpperCase())
                          }
                          variant="outlined"
                          sx={{
                            borderRadius: '8px',
                            fontWeight: 500,
                            color: '#212121',
                            borderStyle: 'dashed'
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Paper>

              {/* Job Summary */}
              <Paper elevation={0} sx={{ p: 4, borderRadius: '20px' }}>
                <Typography sx={{ fontWeight: 700, fontSize: { xs: "1.0rem", md: "1.15rem" }, mb: 3 }}>Job Summary</Typography>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="caption" sx={{ display: 'block', color: '#6B7280', mb: 0.5, fontWeight: 500 }}>EXPERIENCE</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {job.experience_min_yrs != null && job.experience_max_yrs != null
                        ? (job.experience_min_yrs === job.experience_max_yrs
                          ? `${job.experience_min_yrs} Years`
                          : `${job.experience_min_yrs} - ${job.experience_max_yrs} Years`)
                        : (job.experience || "Not specified")}
                    </Typography>
                  </Box>
                  {job.jobType && (
                    <Box>
                      <Typography variant="caption" sx={{ display: 'block', color: '#6B7280', mb: 0.5, fontWeight: 500 }}>JOB TYPE</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{job.jobType}</Typography>
                    </Box>
                  )}
                  {job.teamSize && (
                    <Box>
                      <Typography variant="caption" sx={{ display: 'block', color: '#6B7280', mb: 0.5, fontWeight: 500 }}>TEAM SIZE</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{job.teamSize}</Typography>
                    </Box>
                  )}
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>

        {/* Apply Card at the bottom, after all details */}
        <Paper elevation={0} sx={{ p: 4, mt: 4, borderRadius: '20px' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="stretch"
            justifyContent="center"
            sx={{ width: '100%' }}
          >
            <Button
              variant="contained"
              fullWidth
              onClick={handleApply}
              disabled={applying || generatingEmail || generatingATS}
              startIcon={applying ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{
                flex: 1,
                py: 1.5,
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: { xs: '1rem', sm: '0.8rem', md: '0.9rem', lg: '1rem' },
                bgcolor: '#2563EB',
                boxShadow: '0 10px 25px rgba(37, 99, 235, 0.2)',
                '&:hover': { bgcolor: '#1e40af', boxShadow: '0 12px 30px rgba(37, 99, 235, 0.3)' },
                "&.Mui-disabled": {
                  background: "#E2E8F0",
                  color: "#475569"
                }
              }}
            >
              {applying ? "Applying..." : "Apply Now"}
            </Button>
            {job && job.company_apply && job.direct_url && (
              <Button
                variant="contained"
                fullWidth
                startIcon={generatingATS ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                onClick={handleApplyWithAI}
                disabled={applying || generatingEmail || generatingATS}
                sx={{
                  flex: 1,
                  py: 1.5,
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: { xs: '1rem', sm: '0.8rem', md: '0.9rem', lg: '1rem' },
                  background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
                  boxShadow: '0 10px 25px rgba(124, 58, 237, 0.2)',
                  textTransform: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.2,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #6D28D9 0%, #1E40AF 100%)',
                    boxShadow: '0 12px 30px rgba(124, 58, 237, 0.3)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease',
                  "&.Mui-disabled": {
                    background: "#E2E8F0",
                    color: "#475569"
                  }
                }}
              >
                {generatingATS ? (
                  "Generating..."
                ) : (
                  <>
                    <Box
                      component="span"
                      sx={{
                        textAlign: 'center',
                        lineHeight: 1.2,
                        display: 'block',
                        px: { xs: 1, sm: 0.5, md: 1 }
                      }}
                    >
                      Generate with AI for a Higher JD Match Score
                    </Box>
                    <Box
                      component="span"
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.65rem', md: '0.75rem' },
                        fontWeight: 400,
                        opacity: 0.9,
                        mt: 0.5
                      }}
                    >
                      Uses 10 credits
                    </Box>
                  </>
                )}
              </Button>
            )}

            {job.hiring_email && (
              <Button
                variant="contained"
                fullWidth
                startIcon={generatingEmail ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                onClick={handleEmailApplyWithAI}
                disabled={applying || generatingEmail || generatingATS}
                sx={{
                  flex: 1,
                  py: 1.5,
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: { xs: '1rem', sm: '0.8rem', md: '0.9rem', lg: '1rem' },
                  background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
                  boxShadow: '0 10px 25px rgba(124, 58, 237, 0.2)',
                  textTransform: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.2,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #6D28D9 0%, #1E40AF 100%)',
                    boxShadow: '0 12px 30px rgba(124, 58, 237, 0.3)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease',
                  "&.Mui-disabled": {
                    background: "#E2E8F0",
                    color: "#475569"
                  }
                }}
              >
                {generatingEmail ? (
                  "Generating..."
                ) : (
                  <>
                    <Box
                      component="span"
                      sx={{
                        textAlign: 'center',
                        lineHeight: 1.2,
                        display: 'block',
                        px: { xs: 1, sm: 0.5, md: 1 }
                      }}
                    >
                      Email with AI
                    </Box>
                    <Box
                      component="span"
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.65rem', md: '0.75rem' },
                        fontWeight: 400,
                        opacity: 0.9,
                        mt: 0.5
                      }}
                    >
                      Uses 5 credits
                    </Box>
                  </>
                )}
              </Button>
            )}
          </Stack>
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2, color: '#94A3B8', fontWeight: 500 }}>
            Posted {job.posted}
          </Typography>
        </Paper>
      </Container>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onClose={() => setShowEmailDialog(false)} PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Apply via Email</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#475569', mb: 3 }}>Send your application to the address below:</Typography>
          <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography sx={{ fontWeight: 600 }}>{job.hiring_email}</Typography>
            <IconButton onClick={handleCopyEmail} size="small" sx={{ color: '#2563EB' }}><ContentCopyIcon fontSize="small" /></IconButton>
          </Box>
          <Box sx={{ p: 2, bgcolor: '#FFFBEB', borderRadius: '12px', border: '1px solid #FDE68A' }}>
            <Typography sx={{ color: '#92400E', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon sx={{ fontSize: 16 }} />
              Pro Tip: Don't forget to attach your resume!
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, flexDirection: 'column', gap: 1.5 }}>
          <Button
            onClick={handleComposeStandardEmail}
            fullWidth
            variant="contained"
            startIcon={<SendIcon />}
            sx={{ py: 1.5, borderRadius: '12px', bgcolor: '#111827', fontWeight: 700 }}
          >
            Compose Email
          </Button>
          <Button
            onClick={() => setShowEmailDialog(false)}
            fullWidth
            variant="text"
            sx={{ color: '#212121', fontWeight: 600 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: '12px', fontWeight: 500 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Tailored AI Email Dialog */}
      <Dialog
        open={showTailoredEmailDialog}
        onClose={() => setShowTailoredEmailDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AutoAwesomeIcon sx={{ color: '#7C3AED' }} />
          Tailored Application Email
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, p: 2, bgcolor: '#F0F9FF', borderRadius: '16px', border: '1px solid #BAE6FD', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1, bgcolor: '#0EA5E9', borderRadius: '10px', color: 'white' }}>
              <TrendingUpIcon fontSize="small" />
            </Box>
            <Typography sx={{ color: '#0369A1', fontWeight: 500, fontSize: '0.9rem' }}>
              We've generated a personalized email based on your profile and the job requirements.
            </Typography>
          </Box>

          <Stack spacing={3}>
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#212121', textTransform: 'uppercase' }}>Subject Line</Typography>
                <Button
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(tailoredEmail.subject);
                    setSnackbar({ open: true, message: "Subject copied!", severity: "success" });
                  }}
                  startIcon={<ContentCopyIcon sx={{ fontSize: '14px !important' }} />}
                  sx={{ fontWeight: 600, textTransform: 'none' }}
                >
                  Copy
                </Button>
              </Stack>
              <TextField
                fullWidth
                variant="outlined"
                value={tailoredEmail.subject}
                onChange={(e) => setTailoredEmail({ ...tailoredEmail, subject: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#F8FAFC', fontWeight: 500 } }}
              />
            </Box>

            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#212121', textTransform: 'uppercase' }}>Email Body</Typography>
                <Button
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(tailoredEmail.body);
                    setSnackbar({ open: true, message: "Body copied!", severity: "success" });
                  }}
                  startIcon={<ContentCopyIcon sx={{ fontSize: '14px !important' }} />}
                  sx={{ fontWeight: 600, textTransform: 'none' }}
                >
                  Copy
                </Button>
              </Stack>
              <TextField
                fullWidth
                multiline
                rows={10}
                variant="outlined"
                value={tailoredEmail.body}
                onChange={(e) => setTailoredEmail({ ...tailoredEmail, body: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#F8FAFC', lineHeight: 1.6 } }}
              />
            </Box>

            <Box sx={{ p: 2.5, bgcolor: '#FFFBEB', borderRadius: '16px', border: '2px dashed #F59E0B', textAlign: 'center' }}>
              <Typography sx={{ color: '#92400E', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                📎 ATTACH YOUR RESUME
              </Typography>
              <Typography sx={{ color: '#B45309', fontWeight: 500, fontSize: '0.95rem' }}>
                Your email client will open shortly. Please ensure you <strong>attach your updated resume</strong> before clicking send in your email app.
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setShowTailoredEmailDialog(false)}
            sx={{ fontWeight: 600, color: '#212121', px: 3 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSendEmail}
            startIcon={<SendIcon />}
            sx={{
              py: 1.5,
              px: 4,
              borderRadius: '12px',
              bgcolor: '#111827',
              fontWeight: 700,
              boxShadow: '0 8px 20px rgba(17, 24, 39, 0.2)',
              '&:hover': { bgcolor: '#000000', transform: 'translateY(-2px)' },
              transition: 'all 0.3s ease'
            }}
          >
            Send Email
          </Button>
        </DialogActions>
      </Dialog>

      {/* ATS-Optimized Content Dialog */}
      <Dialog
        open={showATSContentDialog}
        onClose={() => setShowATSContentDialog(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: {
            borderRadius: '24px',
            p: 1,
            maxHeight: { xs: '92vh', sm: '88vh' },
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          <AutoAwesomeIcon sx={{ color: '#7C3AED' }} />
          ATS-Optimized Application Content
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Box sx={{ mb: 3, p: 2, bgcolor: '#F0F9FF', borderRadius: '16px', border: '1px solid #BAE6FD', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1, bgcolor: '#0EA5E9', borderRadius: '10px', color: 'white' }}>
              <TrendingUpIcon fontSize="small" />
            </Box>
            <Stack spacing={0.5}>
              <Typography sx={{ color: '#0369A1', fontWeight: 600, fontSize: '0.9rem' }}>
                Job reference is opened in a new tab, please use the below content to copy and paste in the job application form
              </Typography>
              <Typography sx={{ color: '#0369A1', fontWeight: 400, fontSize: '0.85rem', opacity: 0.9 }}>
                We've tailored your profile details specifically for this job description to make them highly ATS-friendly. Review, edit, and copy the sections below.
              </Typography>
            </Stack>
          </Box>

          <Stack spacing={4}>
            {/* Section 1: Contact Details */}
            <Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon sx={{ color: '#2563EB' }} />
                  Contact Information
                </Typography>
              </Box>
              <Grid container spacing={2}>
                {/* Full Name */}
                {dialogProfile.fullName?.trim() && (
                  <Grid item xs={12} sm={4}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#212121', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                          Full Name
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => {
                            navigator.clipboard.writeText(dialogProfile.fullName);
                            setSnackbar({ open: true, message: "Full Name copied!", severity: "success" });
                          }}
                          startIcon={<ContentCopyIcon sx={{ fontSize: '12px !important' }} />}
                          sx={{ fontWeight: 600, textTransform: 'none', color: '#2563EB', minWidth: 'auto', p: 0, fontSize: '0.75rem' }}
                        >
                          Copy
                        </Button>
                      </Stack>
                      <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        value={dialogProfile.fullName}
                        onChange={(e) => setDialogProfile({ ...dialogProfile, fullName: e.target.value })}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#F8FAFC', fontSize: '0.9rem' } }}
                      />
                    </Box>
                  </Grid>
                )}

                {/* Email */}
                {dialogProfile.email?.trim() && (
                  <Grid item xs={12} sm={4}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#212121', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                          Email
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => {
                            navigator.clipboard.writeText(dialogProfile.email);
                            setSnackbar({ open: true, message: "Email copied!", severity: "success" });
                          }}
                          startIcon={<ContentCopyIcon sx={{ fontSize: '12px !important' }} />}
                          sx={{ fontWeight: 600, textTransform: 'none', color: '#2563EB', minWidth: 'auto', p: 0, fontSize: '0.75rem' }}
                        >
                          Copy
                        </Button>
                      </Stack>
                      <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        value={dialogProfile.email}
                        onChange={(e) => setDialogProfile({ ...dialogProfile, email: e.target.value })}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#F8FAFC', fontSize: '0.9rem' } }}
                      />
                    </Box>
                  </Grid>
                )}

                {/* Mobile */}
                {dialogProfile.mobile && (
                  <Grid item xs={12} sm={4}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#212121', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                          Mobile
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => {
                            navigator.clipboard.writeText(dialogProfile.mobile);
                            setSnackbar({ open: true, message: "Mobile copied!", severity: "success" });
                          }}
                          startIcon={<ContentCopyIcon sx={{ fontSize: '12px !important' }} />}
                          sx={{ fontWeight: 600, textTransform: 'none', color: '#2563EB', minWidth: 'auto', p: 0, fontSize: '0.75rem' }}
                        >
                          Copy
                        </Button>
                      </Stack>
                      <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        value={dialogProfile.mobile}
                        onChange={(e) => setDialogProfile({ ...dialogProfile, mobile: e.target.value })}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#F8FAFC', fontSize: '0.9rem' } }}
                      />
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* Section 2: Education Information */}
            <Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SchoolIcon sx={{ color: '#2563EB' }} />
                  Education History
                </Typography>
              </Box>
              {dialogEducation.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#212121', fontStyle: 'italic' }}>
                  No education details found in profile.
                </Typography>
              ) : (
                dialogEducation.map((edu, idx) => (
                  <Paper key={edu.id || idx} variant="outlined" sx={{ p: 2.5, borderRadius: '16px', borderColor: '#E2E8F0', bgcolor: '#F8FAFC', mb: 2 }}>
                    <Grid container spacing={2}>
                      {/* Degree Field */}
                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#212121', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                            Degree & Field
                          </Typography>
                          <Button
                            size="small"
                            onClick={() => {
                              navigator.clipboard.writeText(edu.degree || "");
                              setSnackbar({ open: true, message: "Degree copied!", severity: "success" });
                            }}
                            startIcon={<ContentCopyIcon sx={{ fontSize: '12px !important' }} />}
                            sx={{ fontWeight: 600, textTransform: 'none', color: '#2563EB', minWidth: 'auto', p: 0, fontSize: '0.75rem' }}
                          >
                            Copy
                          </Button>
                        </Stack>
                        <TextField
                          fullWidth
                          size="small"
                          value={edu.degree || ""}
                          onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                          placeholder="Degree (e.g. B.Tech)"
                          inputProps={{ style: { textTransform: 'uppercase' } }}
                          sx={{ mt: 0.5, '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: '#FFFFFF', fontSize: '0.9rem' } }}
                        />
                      </Grid>

                      {/* Field of Study */}
                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#212121', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                            Field of Study
                          </Typography>
                          <Button
                            size="small"
                            onClick={() => {
                              navigator.clipboard.writeText(edu.field || "");
                              setSnackbar({ open: true, message: "Field copied!", severity: "success" });
                            }}
                            startIcon={<ContentCopyIcon sx={{ fontSize: '12px !important' }} />}
                            sx={{ fontWeight: 600, textTransform: 'none', color: '#2563EB', minWidth: 'auto', p: 0, fontSize: '0.75rem' }}
                          >
                            Copy
                          </Button>
                        </Stack>
                        <TextField
                          fullWidth
                          size="small"
                          value={edu.field || ""}
                          onChange={(e) => handleEducationChange(idx, 'field', e.target.value)}
                          placeholder="Field of Study (e.g. Computer Science)"
                          inputProps={{ style: { textTransform: 'uppercase' } }}
                          sx={{ mt: 0.5, '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: '#FFFFFF', fontSize: '0.9rem' } }}
                        />
                      </Grid>

                      {/* School / Institution */}
                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#212121', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                            School / Institution
                          </Typography>
                          <Button
                            size="small"
                            onClick={() => {
                              navigator.clipboard.writeText(edu.school || "");
                              setSnackbar({ open: true, message: "School copied!", severity: "success" });
                            }}
                            startIcon={<ContentCopyIcon sx={{ fontSize: '12px !important' }} />}
                            sx={{ fontWeight: 600, textTransform: 'none', color: '#2563EB', minWidth: 'auto', p: 0, fontSize: '0.75rem' }}
                          >
                            Copy
                          </Button>
                        </Stack>
                        <TextField
                          fullWidth
                          size="small"
                          value={edu.school || ""}
                          onChange={(e) => handleEducationChange(idx, 'school', e.target.value)}
                          placeholder="School Name"
                          inputProps={{ style: { textTransform: 'uppercase' } }}
                          sx={{ mt: 0.5, '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: '#FFFFFF', fontSize: '0.9rem' } }}
                        />
                      </Grid>

                      {/* Year */}
                      <Grid item xs={6} sm={3}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#212121', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                            Year
                          </Typography>
                          <Button
                            size="small"
                            onClick={() => {
                              navigator.clipboard.writeText(edu.year || "");
                              setSnackbar({ open: true, message: "Year copied!", severity: "success" });
                            }}
                            startIcon={<ContentCopyIcon sx={{ fontSize: '12px !important' }} />}
                            sx={{ fontWeight: 600, textTransform: 'none', color: '#2563EB', minWidth: 'auto', p: 0, fontSize: '0.75rem' }}
                          >
                            Copy
                          </Button>
                        </Stack>
                        <TextField
                          fullWidth
                          size="small"
                          value={edu.year || ""}
                          onChange={(e) => handleEducationChange(idx, 'year', e.target.value)}
                          placeholder="Year of passing"
                          inputProps={{ style: { textTransform: 'uppercase' } }}
                          sx={{ mt: 0.5, '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: '#FFFFFF', fontSize: '0.9rem' } }}
                        />
                      </Grid>

                      {/* Grade */}
                      <Grid item xs={6} sm={3}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#212121', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                            Grade / GPA
                          </Typography>
                          <Button
                            size="small"
                            onClick={() => {
                              navigator.clipboard.writeText(edu.grade || "");
                              setSnackbar({ open: true, message: "Grade copied!", severity: "success" });
                            }}
                            startIcon={<ContentCopyIcon sx={{ fontSize: '12px !important' }} />}
                            sx={{ fontWeight: 600, textTransform: 'none', color: '#2563EB', minWidth: 'auto', p: 0, fontSize: '0.75rem' }}
                          >
                            Copy
                          </Button>
                        </Stack>
                        <TextField
                          fullWidth
                          size="small"
                          value={edu.grade || ""}
                          onChange={(e) => handleEducationChange(idx, 'grade', e.target.value)}
                          placeholder="Grade"
                          inputProps={{ style: { textTransform: 'uppercase' } }}
                          sx={{ mt: 0.5, '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: '#FFFFFF', fontSize: '0.9rem' } }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                ))
              )}
            </Box>

            {/* Section 3: Experience Details */}
            <Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WorkIcon sx={{ color: '#2563EB' }} />
                  Work Experience
                </Typography>
              </Box>
              {dialogExperiences.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#212121', fontStyle: 'italic' }}>
                  No experience details found in profile.
                </Typography>
              ) : (
                dialogExperiences.map((exp, idx) => (
                  <Paper key={exp.id || idx} variant="outlined" sx={{ p: 2.5, borderRadius: '16px', borderColor: '#E2E8F0', bgcolor: '#F8FAFC', mb: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                      <Box>
                        {/* Role with Copy */}
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1E293B', lineHeight: 1.2 }}>
                            {exp.role}
                          </Typography>
                          <Button
                            size="small"
                            onClick={() => {
                              navigator.clipboard.writeText(exp.role || "");
                              setSnackbar({ open: true, message: "Role copied!", severity: "success" });
                            }}
                            startIcon={<ContentCopyIcon sx={{ fontSize: '12px !important' }} />}
                            sx={{ fontWeight: 600, textTransform: 'none', color: '#2563EB', minWidth: 'auto', p: 0, fontSize: '0.75rem' }}
                          >
                            Copy
                          </Button>
                        </Stack>

                        {/* Company with Copy */}
                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#2563EB' }}>
                            {exp.company}
                          </Typography>
                          <Button
                            size="small"
                            onClick={() => {
                              navigator.clipboard.writeText(exp.company || "");
                              setSnackbar({ open: true, message: "Company copied!", severity: "success" });
                            }}
                            startIcon={<ContentCopyIcon sx={{ fontSize: '12px !important' }} />}
                            sx={{ fontWeight: 600, textTransform: 'none', color: '#2563EB', minWidth: 'auto', p: 0, fontSize: '0.75rem' }}
                          >
                            Copy
                          </Button>
                        </Stack>

                        {/* Duration with Copy */}
                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 0.5 }}>
                          <Typography variant="caption" sx={{ color: '#212121', fontWeight: 500 }}>
                            {exp.isCurrent ? `${exp.startDate} - Present` : `${exp.startDate} - ${exp.endDate}`}
                          </Typography>
                          <Button
                            size="small"
                            onClick={() => {
                              const duration = exp.isCurrent ? `${exp.startDate} - Present` : `${exp.startDate} - ${exp.endDate}`;
                              navigator.clipboard.writeText(duration);
                              setSnackbar({ open: true, message: "Duration copied!", severity: "success" });
                            }}
                            startIcon={<ContentCopyIcon sx={{ fontSize: '12px !important' }} />}
                            sx={{ fontWeight: 600, textTransform: 'none', color: '#2563EB', minWidth: 'auto', p: 0, fontSize: '0.75rem' }}
                          >
                            Copy
                          </Button>
                        </Stack>

                        {idx === 0 && (
                          <Chip
                            label="Latest Experience (AI Tailored Summary)"
                            size="small"
                            color="secondary"
                            sx={{ mt: 1, fontWeight: 600, height: '20px', fontSize: '0.65rem', background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)', color: '#FFF' }}
                          />
                        )}
                      </Box>
                    </Stack>

                    {/* Summary Header with Copy */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2, mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#212121', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                        {idx === 0 ? "Tailored Summary" : "Experience Description"}
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => {
                          const cleanText = idx === 0
                            ? exp.summary
                            : exp.summary.replace(/<\/p>/gi, "\n").replace(/<li>/gi, "• ").replace(/<\/li>/gi, "\n").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, "").trim();
                          navigator.clipboard.writeText(cleanText || "");
                          setSnackbar({ open: true, message: "Summary copied!", severity: "success" });
                        }}
                        startIcon={<ContentCopyIcon sx={{ fontSize: '12px !important' }} />}
                        sx={{ fontWeight: 600, textTransform: 'none', color: '#2563EB', minWidth: 'auto', p: 0, fontSize: '0.75rem' }}
                      >
                        Copy
                      </Button>
                    </Stack>

                    {idx === 0 ? (
                      <TextField
                        fullWidth
                        multiline
                        rows={5}
                        variant="outlined"
                        value={exp.summary}
                        onChange={(e) => handleExperienceSummaryChange(idx, e.target.value)}
                        placeholder="Summary..."
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#FFFFFF', fontSize: '0.9rem', lineHeight: 1.5 } }}
                      />
                    ) : (
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: '12px',
                          border: '1px solid #E2E8F0',
                          bgcolor: '#FFFFFF',
                          minHeight: '100px',
                          color: '#475569',
                          lineHeight: 1.6,
                          fontSize: '0.9rem',
                          wordBreak: 'break-word',
                          overflowWrap: 'anywhere',
                          '& p': { mb: 1 },
                          '& ul, & ol': { mb: 1, pl: 2 },
                          '& li': { mb: 0.5 }
                        }}
                        dangerouslySetInnerHTML={{ __html: exp.summary }}
                      />
                    )}
                  </Paper>
                ))
              )}
            </Box>

            {/* Section 4: Tailored Resume Content */}
            {(atsContent.project_details?.trim() || atsContent.skills?.trim()) && (
              <Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AutoAwesomeIcon sx={{ color: '#7C3AED' }} />
                    Tailored Resume Content
                  </Typography>
                </Box>

                {/* Project Details */}
                {atsContent.project_details?.trim() && (
                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '16px', borderColor: '#E2E8F0', bgcolor: '#F8FAFC', mb: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                        Project Details (AI Generated)
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => {
                          navigator.clipboard.writeText(atsContent.project_details);
                          setSnackbar({ open: true, message: "Project details copied!", severity: "success" });
                        }}
                        startIcon={<ContentCopyIcon sx={{ fontSize: '14px !important' }} />}
                        sx={{ fontWeight: 600, textTransform: 'none', color: '#2563EB', minWidth: 'auto', p: 0 }}
                      >
                        Copy
                      </Button>
                    </Stack>
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      variant="outlined"
                      value={atsContent.project_details}
                      onChange={(e) => setAtsContent({ ...atsContent, project_details: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#FFFFFF', fontSize: '0.95rem', lineHeight: 1.6 } }}
                    />
                  </Paper>
                )}

                {/* Skills */}
                {atsContent.skills?.trim() && (
                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '16px', borderColor: '#E2E8F0', bgcolor: '#F8FAFC' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                        Skills (AI Generated)
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => {
                          navigator.clipboard.writeText(atsContent.skills);
                          setSnackbar({ open: true, message: "Skills copied!", severity: "success" });
                        }}
                        startIcon={<ContentCopyIcon sx={{ fontSize: '14px !important' }} />}
                        sx={{ fontWeight: 600, textTransform: 'none', color: '#2563EB', minWidth: 'auto', p: 0 }}
                      >
                        Copy
                      </Button>
                    </Stack>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      variant="outlined"
                      value={atsContent.skills}
                      onChange={(e) => setAtsContent({ ...atsContent, skills: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#FFFFFF', fontSize: '0.95rem', lineHeight: 1.6 } }}
                    />
                  </Paper>
                )}
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            variant="contained"
            onClick={() => setShowATSContentDialog(false)}
            sx={{
              py: 1.2,
              px: 4,
              borderRadius: '12px',
              bgcolor: '#111827',
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: '0 8px 20px rgba(17, 24, 39, 0.2)',
              '&:hover': { bgcolor: '#000000', transform: 'translateY(-2px)' },
              transition: 'all 0.3s ease'
            }}
          >
            Done Reviewing
          </Button>
        </DialogActions>
      </Dialog>

      <InsufficientCreditsDialog
        open={insufficientCreditsDialogOpen}
        onClose={() => setInsufficientCreditsDialogOpen(false)}
      />


      {/* Email Provider Selection Dialog */}
      <Dialog
        open={showProviderDialog}
        onClose={() => setShowProviderDialog(false)}
        PaperProps={{ sx: { borderRadius: '24px', p: 1, maxWidth: '400px', width: '100%' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, textAlign: 'center', pt: 3, pb: 0, fontSize: '1.4rem' }}>
          Select Email Provider
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography sx={{ textAlign: 'center', color: '#212121', mb: 3, fontSize: '0.95rem', fontWeight: 400 }}>
            How would you like to compose your application email?
          </Typography>
          <Stack spacing={1.5}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleOpenProvider('gmail')}
              sx={{
                py: 1.5, borderRadius: '12px', justifyContent: 'flex-start', px: 3,
                borderColor: '#E5E7EB', color: '#111827', fontWeight: 600,
                textTransform: 'none', fontSize: '1rem',
                '&:hover': { bgcolor: '#F8FAFC', borderColor: '#2563EB' }
              }}
              startIcon={<Avatar src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" sx={{ width: 24, height: 24, borderRadius: 0 }} />}
            >
              Gmail
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleOpenProvider('outlook')}
              sx={{
                py: 1.5, borderRadius: '12px', justifyContent: 'flex-start', px: 3,
                borderColor: '#E5E7EB', color: '#111827', fontWeight: 600,
                textTransform: 'none', fontSize: '1rem',
                '&:hover': { bgcolor: '#F8FAFC', borderColor: '#2563EB' }
              }}
              startIcon={<Avatar src="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg" sx={{ width: 24, height: 24, borderRadius: 0 }} />}
            >
              Outlook / Hotmail
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleOpenProvider('yahoo')}
              sx={{
                py: 1.5, borderRadius: '12px', justifyContent: 'flex-start', px: 3,
                borderColor: '#E5E7EB', color: '#111827', fontWeight: 600,
                textTransform: 'none', fontSize: '1rem',
                '&:hover': { bgcolor: '#F8FAFC', borderColor: '#2563EB' }
              }}
              startIcon={<Avatar src="https://upload.wikimedia.org/wikipedia/commons/3/3a/Yahoo%21_Mail_logo.svg" sx={{ width: 24, height: 24, borderRadius: 0 }} />}
            >
              Yahoo Mail
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={() => handleOpenProvider('default')}
              sx={{
                py: 1.5, borderRadius: '12px', bgcolor: '#111827', fontWeight: 600,
                textTransform: 'none', fontSize: '1rem',
                '&:hover': { bgcolor: '#000000' }
              }}
              startIcon={<EmailIcon />}
            >
              Default Mail App
            </Button>
          </Stack>
        </DialogContent>
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Button onClick={() => setShowProviderDialog(false)} sx={{ color: '#212121', fontWeight: 600, textTransform: 'none' }}>
            Cancel
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
};

export default JobDetailScreen;
