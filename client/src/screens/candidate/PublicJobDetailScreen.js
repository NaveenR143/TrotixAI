// screens/candidate/PublicJobDetailScreen.js
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
  CircularProgress,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShareIcon from "@mui/icons-material/Share";
import WorkIcon from "@mui/icons-material/Work";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SchoolIcon from "@mui/icons-material/School";
import BusinessIcon from "@mui/icons-material/Business";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EmailIcon from "@mui/icons-material/Email";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from '@mui/icons-material/Close';
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import GroupsIcon from "@mui/icons-material/Groups";

import { useParams, useNavigate, useLocation } from "react-router-dom";

import { Helmet } from "react-helmet-async";

import { useSelector, useDispatch } from "react-redux";
import { getJobDetailsById, applyJob, generateTailoredJobEmail, generateATSContent, generateATSResume, recordDirectUrlClick } from "../../api/jobpostingAPI";
import MatchBadge from "../../components/jobs/MatchBadge";
import ResumeUpload from "../../components/upload/ResumeUpload";
import * as profileAPI from "../../api/profileAPI";
import { updateUserProfile } from "../../redux/user/Action";
import InsufficientCreditsDialog from "./components/dialogs/InsufficientCreditsDialog";
import MultiPageResumePreview from "../resume_builder/MultiPageResumePreview";
import { mapProfileData } from "../../utils/profileMapping";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PersonIcon from "@mui/icons-material/Person";

const PublicJobDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [applying, setApplying] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [tailoredEmail, setTailoredEmail] = useState({ subject: "", body: "" });
  const [showTailoredEmailDialog, setShowTailoredEmailDialog] = useState(false);
  const [showATSContentDialog, setShowATSContentDialog] = useState(false);
  const [atsContent, setAtsContent] = useState({ project_details: "", experience_details: "", skills: "" });
  const [showProviderDialog, setShowProviderDialog] = useState(false);
  const [emailToOpen, setEmailToOpen] = useState({ to: "", subject: "", body: "" });
  const [showPublicApply, setShowPublicApply] = useState(false);
  const [applyStep, setApplyStep] = useState('choice'); // 'choice', 'resume'

  const [generatingATS, setGeneratingATS] = useState(false);
  const [generatingATSResume, setGeneratingATSResume] = useState(false);
  const [showATSResumeDialog, setShowATSResumeDialog] = useState(false);
  const [atsResumeData, setAtsResumeData] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [insufficientCreditsDialogOpen, setInsufficientCreditsDialogOpen] = useState(false);

  const exportPagesRef = React.useRef(null);

  const dispatch = useDispatch();
  const user = useSelector((state) => state.UserReducer);
  const { userid } = user;
  const userPoints = useSelector((state) => state.UserReducer.points) || 0;
  const profile = useSelector((state) => state.ProfileReducer?.data);

  const handlePrint = useReactToPrint({
    content: () => exportPagesRef.current,
    onBeforePrint: () => {
      const fullName = atsResumeData?.personalDetails?.fullName || "Resume";
      document.title = `Resume - ${fullName.replace(/[^a-z0-9]/gi, "_")}`;
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setDownloading(false);
    },
    pageStyle: `
      @page {
        size: 210mm 297mm;
        margin: 0;
      }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
        box-sizing: border-box;
      }
      body {
        margin: 0;
        padding: 0;
      }
      .resume-pdf-page {
        width: 210mm !important;
        height: 297mm !important;
        overflow: hidden !important;
        page-break-after: always !important;
        break-after: page !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        position: relative;
      }
      .resume-pdf-page:last-child {
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
      [data-pdf-hide="true"] {
        display: none !important;
      }
    `,
  });

  useEffect(() => {
    if (id) {
      fetchJobDetails(id);
    }
  }, [id]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('action') === 'apply' && userid && job && !applying) {
      // Small delay to ensure everything is settled and user sees the page first
      const timer = setTimeout(() => {
        handleApply();
        // Clean up URL to prevent re-applying on refresh
        searchParams.delete('action');
        const newSearch = searchParams.toString();
        navigate(`${location.pathname}${newSearch ? `?${newSearch}` : ''}`, { replace: true });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [location.search, userid, !!job]);


  const fetchJobDetails = async (jobId) => {
    setLoading(true);
    try {
      const result = await getJobDetailsById(jobId);
      if (!result.error) {
        setJob(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to fetch job details");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {


    if (!userid) {
      setShowPublicApply(true);
      return;
    }

    if (job.direct_url) {
      recordDirectUrlClick(job.id, userid).catch(err => console.error("Tracking error:", err));
      window.open(job.direct_url, "_blank");
      return;
    }

    if (job.recruiter_id) {
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
    } else if (job.careers_url) {

      // External Application
      const companyName = (typeof job.company === "object" ? job.company?.name : job.company) || "";
      const searchQuery = `${companyName} jobs careers`;
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
      window.open(searchUrl, "_blank");
    } else if (job.hiring_email) {
      setShowEmailDialog(true);
    } else {
      setSnackbar({
        open: true,
        message: "No application method available for this job.",
        severity: "info",
      });
    }
  };

  const handleApplyWithAI = async () => {
    if (!userid) {
      setShowPublicApply(true);
      return;
    }
    setGeneratingEmail(true);
    try {
      const result = await generateATSContent(job.id, userid);
      if (!result.error) {
        setAtsContent({
          project_details: result.data.project_details || "",
          experience_details: result.data.experience_details || "",
          skills: result.data.skills || ""
        });
        setShowATSContentDialog(true);
      } else {
        setSnackbar({
          open: true,
          message: result.message || "Failed to generate AI content.",
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
      setGeneratingEmail(false);
    }
  };

  const downloadPDFMobile = async () => {
    const container = exportPagesRef.current;
    if (!container) return;

    const pages = container.querySelectorAll(".resume-pdf-page");
    if (pages.length === 0) return;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const canvas = await html2canvas(page, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById("pdf-export-container");
          if (el) {
            el.style.visibility = "visible";
          }
        }
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.8);

      if (i > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, 'FAST');
    }

    const fullName = atsResumeData?.personalDetails?.fullName || "Resume";
    pdf.save(`Resume_${fullName.replace(/[^a-z0-9]/gi, "_")}.pdf`);
  };

  const triggerPrint = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent) || isMobile;

    if (isMobileDevice) {
      try {
        await downloadPDFMobile();
      } catch (err) {
        console.error("Mobile download failed:", err);
        setSnackbar({ open: true, message: "Failed to generate PDF. Please try again.", severity: "error" });
      } finally {
        setDownloading(false);
      }
    } else {
      handlePrint();
    }
  };

  const handleDownloadATSResume = async () => {
    setDownloading(true);
    await triggerPrint();
  };

  const handleGenerateATSResume = async () => {
    if (!userid) {
      setShowPublicApply(true);
      return;
    }

    if (!userPoints || userPoints < 15) {
      setInsufficientCreditsDialogOpen(true);
      return;
    }

    setGeneratingATSResume(true);
    setGeneratingATS(true);
    try {
      const creditResult = await profileAPI.deductFeatureCredits(userid, "apply_with_ai_resume");

      if (!creditResult || creditResult.error || creditResult.success === false) {
        setInsufficientCreditsDialogOpen(true);
        return;
      }

      if (creditResult.balance !== undefined) {
        dispatch(updateUserProfile({ points: creditResult.balance }));
      }

      const result = await generateATSResume(job.id, userid);
      if (!result.error) {
        const mappedData = mapProfileData(result.data);
        setAtsResumeData(mappedData);
        setShowATSResumeDialog(true);
        setSnackbar({ open: true, message: "ATS resume generated successfully!", severity: "success" });

        if (job.direct_url) {
          recordDirectUrlClick(job.id, userid).catch(err => console.error("Tracking error:", err));
          window.open(job.direct_url, "_blank");
        }
      } else {
        setSnackbar({ open: true, message: result.message || "Failed to generate ATS resume.", severity: "error" });
      }
    } catch (error) {
      console.error("Generate ATS resume error:", error);
      setSnackbar({ open: true, message: "An unexpected error occurred.", severity: "error" });
    } finally {
      setGeneratingATSResume(false);
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
      subject: `Application for ${job.title} - ${job.company?.name || job.company}`,
      body: `Dear Hiring Team,\n\nI am interested in applying for the ${job.title} position at ${job.company?.name || job.company}.\n\n(Please remember to attach your resume)`
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !job) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#F8FAFC', p: 3, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#111827' }}>
          {error || "Job not found"}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/dashboard')} sx={{ borderRadius: '12px', textTransform: 'none', px: 4 }}>
          Go Back Home
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", pb: 8 }}>
      <Helmet>
        <title>{job ? `${job.title} at ${job.company?.name || job.company} | RightNxt AI` : 'Job Details | RightNxt AI'}</title>
        <meta name="description" content={job ? `Apply for ${job.title} at ${job.company?.name || job.company}. ${job.description?.substring(0, 150)}...` : 'View job details on RightNxt AI'} />
      </Helmet>

      <Box sx={{ bgcolor: "#FFFFFF", borderBottom: "1px solid #E5E7EB", position: 'sticky', top: 0, zIndex: 1000, mb: 3 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.5 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: '#6B7280' }}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>
                Job Details
              </Typography>
            </Stack>
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
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Grid container spacing={4}>

          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: '20px' }}>
              <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", mb: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    background: `linear-gradient(135deg, #2563EB, #4f46e5)`,
                    fontSize: "2rem",
                    fontWeight: 700,
                    borderRadius: '20px',
                    boxShadow: "0 8px 25px rgba(37, 99, 235, 0.15)",
                  }}
                >
                  {(job.company?.name || job.company)?.[0]}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 800, color: "#111827", fontSize: { xs: "1.5rem", md: "1.8rem" }, letterSpacing: "-0.03em", mb: 0.5 }}>
                    {job.title}
                  </Typography>
                  <Typography sx={{ color: "#2563EB", fontWeight: 600, fontSize: { xs: "1.0rem", md: "1.15rem" }, mb: 2.5 }}>
                    {job.company?.name || job.company}
                  </Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap" gap={1.5}>
                    <Chip
                      icon={<LocationOnIcon sx={{ fontSize: '16px !important' }} />}
                      label={job.location}
                      variant="outlined"
                      sx={{ borderRadius: '10px', fontWeight: 500, color: '#212121', borderColor: '#E5E7EB' }}
                    />
                    <Chip
                      icon={<WorkIcon sx={{ fontSize: '16px !important' }} />}
                      label={job.workMode || job.work_mode}
                      variant="outlined"
                      sx={{ borderRadius: '10px', fontWeight: 500, color: '#212121', borderColor: '#E5E7EB' }}
                    />
                    {((job.experience_min_yrs != null && job.experience_max_yrs != null) || job.experience) && (
                      <Chip
                        icon={<WorkHistoryIcon sx={{ fontSize: '16px !important' }} />}
                        label={
                          job.experience_min_yrs != null && job.experience_max_yrs != null
                            ? (job.experience_min_yrs === job.experience_max_yrs
                              ? `${job.experience_min_yrs} Yrs`
                              : `${job.experience_min_yrs}-${job.experience_max_yrs} Yrs`)
                            : job.experience
                        }
                        variant="outlined"
                        sx={{ borderRadius: '10px', fontWeight: 500, color: '#212121', borderColor: '#E5E7EB' }}
                      />
                    )}
                    {job.salary && <Chip label={job.salary} sx={{ borderRadius: '10px', fontWeight: 700, bgcolor: '#dcfce7', color: '#16a34a' }} />}
                  </Stack>
                </Box>
              </Box>
            </Paper>

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
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={4} sx={{ position: { md: 'sticky' }, top: 100 }}>

              <Paper elevation={0} sx={{ p: 4, borderRadius: '20px' }}>
                <SectionHeader icon={SchoolIcon} title="Skills" accent="#7C3AED" />
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {(job.skills || []).map(s => (
                    <Chip key={s} label={s} sx={{ bgcolor: '#eff6ff', color: '#2563EB', fontWeight: 600, borderRadius: '8px' }} />
                  ))}
                </Stack>
              </Paper>

              <Paper elevation={0} sx={{ p: 4, borderRadius: '20px' }}>
                <Typography sx={{ fontWeight: 700, fontSize: { xs: "1.0rem", md: "1.15rem" }, mb: 3 }}>Job Summary</Typography>
                <Stack spacing={3}>
                  {((job.experience_min_yrs != null && job.experience_max_yrs != null) || job.experience) && (
                    <Box>
                      <Typography variant="caption" sx={{ display: 'block', color: '#6B7280', mb: 0.5, fontWeight: 500 }}>EXPERIENCE</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {job.experience_min_yrs != null && job.experience_max_yrs != null
                          ? (job.experience_min_yrs === job.experience_max_yrs
                            ? `${job.experience_min_yrs} Years`
                            : `${job.experience_min_yrs} - ${job.experience_max_yrs} Years`)
                          : job.experience}
                      </Typography>
                    </Box>
                  )}
                  {(job.type || job.job_type) && (
                    <Box>
                      <Typography variant="caption" sx={{ display: 'block', color: '#6B7280', mb: 0.5, fontWeight: 500 }}>JOB TYPE</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{job.type || job.job_type}</Typography>
                    </Box>
                  )}
                  {(job.workMode || job.work_mode) && (
                    <Box>
                      <Typography variant="caption" sx={{ display: 'block', color: '#6B7280', mb: 0.5, fontWeight: 500 }}>WORK MODE</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{job.workMode || job.work_mode}</Typography>
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
              disabled={applying || generatingEmail || generatingATS || generatingATSResume}
              sx={{
                flex: 1,
                py: 1.5, borderRadius: '12px', fontWeight: 700, fontSize: '1rem',
                bgcolor: '#2563EB',
                boxShadow: '0 10px 25px rgba(37, 99, 235, 0.2)',
                '&:hover': { bgcolor: '#1e40af' },
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
                startIcon={generatingATSResume ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                onClick={handleGenerateATSResume}
                disabled={applying || generatingEmail || generatingATS || generatingATSResume}
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
                {generatingATSResume ? (
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
                onClick={handleApplyWithAI}
                disabled={applying || generatingEmail || generatingATS || generatingATSResume}
                sx={{
                  flex: 1,
                  py: 1.5, borderRadius: '12px', fontWeight: 700, fontSize: '1rem',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
                  '&:hover': { transform: 'translateY(-2px)' },
                  "&.Mui-disabled": {
                    background: "#E2E8F0",
                    color: "#475569"
                  }
                }}
              >
                {generatingEmail ? "Generating..." : "Email with AI"}
              </Button>
            )}
          </Stack>
          {(job.posted || job.posted_at) && (
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2, color: '#94A3B8', fontWeight: 500 }}>
              Posted {job.posted || new Date(job.posted_at).toLocaleDateString()}
            </Typography>
          )}
        </Paper>
      </Container>

      <Dialog
        open={showPublicApply}
        onClose={() => setShowPublicApply(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '28px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <RocketLaunchIcon sx={{ color: '#2563EB' }} />
            Quick Apply
          </Box>
          <IconButton onClick={() => setShowPublicApply(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {applyStep === 'choice' && (
            <Stack spacing={3} sx={{ py: 2 }}>
              <Typography sx={{ color: '#212121', fontWeight: 400 }}>
                You're applying for <strong>{job.title}</strong>. Choose how you'd like to proceed:
              </Typography>

              <Paper
                variant="outlined"
                onClick={() => setApplyStep('resume')}
                sx={{
                  p: 3, borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s',
                  '&:hover': { bgcolor: '#F8FAFC', borderColor: '#2563EB', transform: 'translateY(-2px)' }
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ p: 1.5, bgcolor: '#eff6ff', borderRadius: '12px', color: '#2563EB' }}>
                    <AutoAwesomeIcon />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: '#111827' }}>Upload Resume (Recommended)</Typography>
                    <Typography sx={{ fontSize: '0.85rem', color: '#212121' }}>AI will parse your details and match you instantly.</Typography>
                  </Box>
                </Stack>
              </Paper>

              <Paper
                variant="outlined"
                onClick={() => navigate(`/login?redirect=${encodeURIComponent(location.pathname)}&action=apply`)}
                sx={{
                  p: 3, borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s',
                  '&:hover': { bgcolor: '#F8FAFC', borderColor: '#7C3AED', transform: 'translateY(-2px)' }
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ p: 1.5, bgcolor: '#f5f3ff', borderRadius: '12px', color: '#7C3AED' }}>
                    <GroupsIcon />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: '#111827' }}>Login to Apply</Typography>
                    <Typography sx={{ fontSize: '0.85rem', color: '#212121' }}>Use your existing profile and track application status.</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          )}

          {applyStep === 'resume' && (
            <Box sx={{ py: 2 }}>
              <Typography sx={{ color: '#212121', mb: 3, fontWeight: 400 }}>
                Upload your resume to complete the application.
              </Typography>
              <ResumeUpload
                onSuccess={(data) => {
                  navigate('/processing', { state: { resumeData: data, autoApplyJobId: job.id } });
                }}
              />
              <Button
                onClick={() => setApplyStep('choice')}
                sx={{ mt: 3, fontWeight: 600, color: '#212121' }}
              >
                Back
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* ATS-Optimized Content Dialog */}
      <Dialog
        open={showATSContentDialog}
        onClose={() => setShowATSContentDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AutoAwesomeIcon sx={{ color: '#7C3AED' }} />
          ATS-Optimized Application Content
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, p: 2, bgcolor: '#F0F9FF', borderRadius: '16px', border: '1px solid #BAE6FD', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1, bgcolor: '#0EA5E9', borderRadius: '10px', color: 'white' }}>
              <TrendingUpIcon fontSize="small" />
            </Box>
            <Typography sx={{ color: '#0369A1', fontWeight: 500, fontSize: '0.9rem' }}>
              We've tailored your profile details specifically for this job description to make them highly ATS-friendly. Review, edit, and copy the sections below.
            </Typography>
          </Box>

          <Stack spacing={3}>
            {/* Project Details */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  Project Details
                </Typography>
                <Button
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(atsContent.project_details);
                    setSnackbar({ open: true, message: "Project details copied!", severity: "success" });
                  }}
                  startIcon={<ContentCopyIcon sx={{ fontSize: '14px !important' }} />}
                  sx={{ fontWeight: 600, textTransform: 'none', color: '#2563EB' }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#F8FAFC', fontSize: '0.95rem', lineHeight: 1.6 } }}
              />
            </Box>

            {/* Current Experience Details */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  Current Experience Details
                </Typography>
                <Button
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(atsContent.experience_details);
                    setSnackbar({ open: true, message: "Experience details copied!", severity: "success" });
                  }}
                  startIcon={<ContentCopyIcon sx={{ fontSize: '14px !important' }} />}
                  sx={{ fontWeight: 600, textTransform: 'none', color: '#2563EB' }}
                >
                  Copy
                </Button>
              </Stack>
              <TextField
                fullWidth
                multiline
                rows={6}
                variant="outlined"
                value={atsContent.experience_details}
                onChange={(e) => setAtsContent({ ...atsContent, experience_details: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#F8FAFC', fontSize: '0.95rem', lineHeight: 1.6 } }}
              />
            </Box>

            {/* Skills */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  Skills
                </Typography>
                <Button
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(atsContent.skills);
                    setSnackbar({ open: true, message: "Skills copied!", severity: "success" });
                  }}
                  startIcon={<ContentCopyIcon sx={{ fontSize: '14px !important' }} />}
                  sx={{ fontWeight: 600, textTransform: 'none', color: '#2563EB' }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#F8FAFC', fontSize: '0.95rem', lineHeight: 1.6 } }}
              />
            </Box>
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
      {/* ATS-Optimized Resume Dialog */}
      <Dialog
        open={showATSResumeDialog}
        onClose={() => setShowATSResumeDialog(false)}
        maxWidth="lg"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: {
            borderRadius: '24px',
            p: 1,
            maxHeight: '94vh',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AutoAwesomeIcon sx={{ color: '#10B981' }} />
            ATS-Optimized Resume Preview
          </Box>
          <Button
            variant="contained"
            disabled={downloading}
            startIcon={downloading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : <FileDownloadIcon />}
            onClick={handleDownloadATSResume}
            sx={{
              borderRadius: '12px',
              px: 3,
              py: 1,
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            {downloading ? "Preparing PDF..." : "Download Resume PDF"}
          </Button>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, bgcolor: '#f1f5f9', overflow: 'auto', display: 'flex', justifyContent: 'center' }}>
          {atsResumeData && (
            <Box sx={{
              p: 3,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              minWidth: '850px'
            }}>
              <MultiPageResumePreview templateId="template11p" data={atsResumeData} />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setShowATSResumeDialog(false)}
            sx={{ fontWeight: 600, color: '#475569' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <InsufficientCreditsDialog
        open={insufficientCreditsDialogOpen}
        onClose={() => setInsufficientCreditsDialogOpen(false)}
      />

      {/* Hidden export container for print capture */}
      <div
        id="pdf-export-container"
        style={{
          position: "fixed",
          left: "-9999px",
          top: 0,
          width: "210mm",
          visibility: "hidden",
          pointerEvents: "none",
          zIndex: -9999,
        }}
      >
        {atsResumeData && (
          <MultiPageResumePreview
            templateId="template11p"
            data={atsResumeData}
            isExport={true}
            pagesRef={exportPagesRef}
          />
        )}
      </div>

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
    </Box>
  );
};

export default PublicJobDetailScreen;
