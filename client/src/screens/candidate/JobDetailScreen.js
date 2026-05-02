// screens/candidate/JobDetailScreen.js
import React, { useState } from "react";
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
} from "@mui/material";
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
import MatchBadge from "../../components/jobs/MatchBadge";
import { getWorkModeIcon } from "../../utils/themeUtils";
import { useSelector } from "react-redux";
import { applyJob, generateTailoredJobEmail } from "../../api/jobpostingAPI";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SendIcon from "@mui/icons-material/Send";

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
  const [tailoredEmail, setTailoredEmail] = useState({ subject: "", body: "" });
  const [showTailoredEmailDialog, setShowTailoredEmailDialog] = useState(false);
  const [showProviderDialog, setShowProviderDialog] = useState(false);
  const [emailToOpen, setEmailToOpen] = useState({ to: "", subject: "", body: "" });

  const { userid } = useSelector((state) => state.UserReducer);

  const handleApply = async () => {
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
    } else if (job.careers_url) {
      // External Application
      window.open(job.careers_url, "_blank");

    } else if (job.hiring_email) {
      // Email Contact
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
    setGeneratingEmail(true);
    try {
      const result = await generateTailoredJobEmail(job.id, userid);
      if (!result.error) {
        setTailoredEmail({
          subject: result.data.subject || "",
          body: result.data.body || ""
        });
        setShowTailoredEmailDialog(true);
      } else {
        setSnackbar({
          open: true,
          message: result.message || "Failed to generate AI email.",
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

  // Helper component for section headers with icons
  const SectionHeader = ({ icon: Icon, title, accent = "#2563EB" }) => (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
        <Icon sx={{ color: "#111827", fontSize: 22 }} />
        <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#111827", letterSpacing: "-0.02em" }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ width: 40, height: 3, bgcolor: accent, borderRadius: 1 }} />
    </Box>
  );

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
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
                  Job Details
                </Typography>
              </Stack>
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
              <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", mb: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    background: `linear-gradient(135deg, ${job.logoColor || '#2563EB'}, #4f46e5)`,
                    fontSize: "2rem",
                    fontWeight: 800,
                    borderRadius: '20px',
                    boxShadow: "0 8px 25px rgba(37, 99, 235, 0.15)",
                  }}
                >
                  {job.company?.[0]}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: "#111827", letterSpacing: "-0.03em", mb: 0.5 }}>
                    {job.title}
                  </Typography>
                  <Typography variant="h6" sx={{ color: "#2563EB", fontWeight: 700, mb: 2.5 }}>
                    {job.company}
                  </Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap" gap={1.5}>
                    <MatchBadge score={job.matchScore} size="lg" />
                    <Chip
                      icon={<LocationOnIcon sx={{ fontSize: '16px !important' }} />}
                      label={job.location}
                      variant="outlined"
                      sx={{ borderRadius: '10px', fontWeight: 600, color: '#64748B', borderColor: '#E5E7EB' }}
                    />
                    <Chip
                      icon={<WorkIcon sx={{ fontSize: '16px !important' }} />}
                      label={job.workMode}
                      variant="outlined"
                      sx={{ borderRadius: '10px', fontWeight: 600, color: '#64748B', borderColor: '#E5E7EB' }}
                    />
                    <Chip label={job.salary} sx={{ borderRadius: '10px', fontWeight: 800, bgcolor: '#dcfce7', color: '#16a34a' }} />
                  </Stack>
                </Box>
              </Box>
            </Paper>

            {/* Description Section */}
            <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: '20px' }}>
              <SectionHeader icon={AssignmentIcon} title="Job Description" accent="#22D3EE" />
              <Box
                sx={{
                  color: "#475569",
                  lineHeight: 1.8,
                  fontSize: "1rem",
                  maxHeight: expandedDescription ? 'none' : '400px',
                  overflow: 'hidden',
                  position: 'relative',
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere',
                  '& p': { mb: 2 },
                  '& ul, & ol': { mb: 2, pl: 3 },
                  '& li': { mb: 1 },
                  '& img': { maxWidth: '100%', height: 'auto', borderRadius: '8px' }
                }}
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
              <Button
                onClick={() => setExpandedDescription(!expandedDescription)}
                sx={{ mt: 2, fontWeight: 700, color: '#2563EB', textTransform: 'none' }}
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
                      <Typography sx={{ color: '#475569', fontWeight: 500 }}>{r}</Typography>
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
                        <Typography sx={{ fontWeight: 700, color: "#111827" }}>{b}</Typography>
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
              {/* Apply Card */}
              <Paper elevation={0} sx={{ p: 4, borderRadius: '20px' }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleApply}
                  disabled={applying}
                  sx={{
                    py: 1.5, borderRadius: '12px', fontWeight: 800, fontSize: '1rem',
                    bgcolor: '#2563EB',
                    boxShadow: '0 10px 25px rgba(37, 99, 235, 0.2)',
                    '&:hover': { bgcolor: '#1e40af', boxShadow: '0 12px 30px rgba(37, 99, 235, 0.3)' }
                  }}
                >
                  {applying ? "Applying..." : "Apply Now"}
                </Button>

                {job.hiring_email && (
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<AutoAwesomeIcon />}
                    onClick={handleApplyWithAI}
                    disabled={generatingEmail}
                    sx={{
                      mt: 2,
                      py: 1.5,
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '1rem',
                      background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
                      boxShadow: '0 10px 25px rgba(124, 58, 237, 0.2)',
                      textTransform: 'none',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #6D28D9 0%, #1E40AF 100%)',
                        boxShadow: '0 12px 30px rgba(124, 58, 237, 0.3)',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {generatingEmail ? "Generating..." : "Apply with AI"}
                  </Button>
                )}
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => onToggleSave?.(job.id)}
                  sx={{ mt: 2, py: 1.5, borderRadius: '12px', fontWeight: 700, fontSize: '1rem', color: '#475569', borderColor: '#E5E7EB' }}
                >
                  {isSaved ? "Saved" : "Save for Later"}
                </Button>
                <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2, color: '#94A3B8', fontWeight: 600 }}>
                  Posted {job.posted}
                </Typography>
              </Paper>

              {/* Skills Match Card */}
              <Paper elevation={0} sx={{ p: 4, borderRadius: '20px' }}>
                <SectionHeader icon={SchoolIcon} title="Skills Match" accent="#7C3AED" />
                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" sx={{ display: 'block', color: '#6B7280', mb: 1, fontWeight: 700, textTransform: 'uppercase' }}>Your Matching Skills</Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {job.keySkillsMatched.map(s => (
                      <Chip key={s} label={s} sx={{ bgcolor: '#eff6ff', color: '#2563EB', fontWeight: 700, borderRadius: '8px' }} />
                    ))}
                  </Stack>
                </Box>
                {job.keySkillsMissing?.length > 0 && (
                  <Box>
                    <Typography variant="caption" sx={{ display: 'block', color: '#6B7280', mb: 1, fontWeight: 700, textTransform: 'uppercase' }}>Missing Skills</Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {job.keySkillsMissing.map(s => (
                        <Chip key={s} label={s} variant="outlined" sx={{ borderRadius: '8px', fontWeight: 600, color: '#64748B', borderStyle: 'dashed' }} />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Paper>

              {/* Job Summary */}
              <Paper elevation={0} sx={{ p: 4, borderRadius: '20px' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Job Summary</Typography>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="caption" sx={{ display: 'block', color: '#6B7280', mb: 0.5, fontWeight: 600 }}>EXPERIENCE</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{job.experience}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ display: 'block', color: '#6B7280', mb: 0.5, fontWeight: 600 }}>JOB TYPE</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{job.jobType}</Typography>
                  </Box>
                  {job.teamSize && (
                    <Box>
                      <Typography variant="caption" sx={{ display: 'block', color: '#6B7280', mb: 0.5, fontWeight: 600 }}>TEAM SIZE</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{job.teamSize}</Typography>
                    </Box>
                  )}
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onClose={() => setShowEmailDialog(false)} PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Apply via Email</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#475569', mb: 3 }}>Send your application to the address below:</Typography>
          <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography sx={{ fontWeight: 700 }}>{job.hiring_email}</Typography>
            <IconButton onClick={handleCopyEmail} size="small" sx={{ color: '#2563EB' }}><ContentCopyIcon fontSize="small" /></IconButton>
          </Box>
          <Box sx={{ p: 2, bgcolor: '#FFFBEB', borderRadius: '12px', border: '1px solid #FDE68A' }}>
            <Typography sx={{ color: '#92400E', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 1 }}>
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
            sx={{ py: 1.5, borderRadius: '12px', bgcolor: '#111827', fontWeight: 800 }}
          >
            Compose Email
          </Button>
          <Button
            onClick={() => setShowEmailDialog(false)}
            fullWidth
            variant="text"
            sx={{ color: '#64748B', fontWeight: 700 }}
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
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: '12px', fontWeight: 600 }}>
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
        <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AutoAwesomeIcon sx={{ color: '#7C3AED' }} />
          Tailored Application Email
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, p: 2, bgcolor: '#F0F9FF', borderRadius: '16px', border: '1px solid #BAE6FD', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1, bgcolor: '#0EA5E9', borderRadius: '10px', color: 'white' }}>
              <TrendingUpIcon fontSize="small" />
            </Box>
            <Typography sx={{ color: '#0369A1', fontWeight: 600, fontSize: '0.9rem' }}>
              We've generated a personalized email based on your profile and the job requirements.
            </Typography>
          </Box>

          <Stack spacing={3}>
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Subject Line</Typography>
                <Button
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(tailoredEmail.subject);
                    setSnackbar({ open: true, message: "Subject copied!", severity: "success" });
                  }}
                  startIcon={<ContentCopyIcon sx={{ fontSize: '14px !important' }} />}
                  sx={{ fontWeight: 700, textTransform: 'none' }}
                >
                  Copy
                </Button>
              </Stack>
              <TextField
                fullWidth
                variant="outlined"
                value={tailoredEmail.subject}
                onChange={(e) => setTailoredEmail({ ...tailoredEmail, subject: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#F8FAFC', fontWeight: 600 } }}
              />
            </Box>

            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Email Body</Typography>
                <Button
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(tailoredEmail.body);
                    setSnackbar({ open: true, message: "Body copied!", severity: "success" });
                  }}
                  startIcon={<ContentCopyIcon sx={{ fontSize: '14px !important' }} />}
                  sx={{ fontWeight: 700, textTransform: 'none' }}
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
              <Typography sx={{ color: '#92400E', fontWeight: 900, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                📎 ATTACH YOUR RESUME
              </Typography>
              <Typography sx={{ color: '#B45309', fontWeight: 600, fontSize: '0.95rem' }}>
                Your email client will open shortly. Please ensure you <strong>attach your updated resume</strong> before clicking send in your email app.
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setShowTailoredEmailDialog(false)}
            sx={{ fontWeight: 700, color: '#64748B', px: 3 }}
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
              fontWeight: 800,
              boxShadow: '0 8px 20px rgba(17, 24, 39, 0.2)',
              '&:hover': { bgcolor: '#000000', transform: 'translateY(-2px)' },
              transition: 'all 0.3s ease'
            }}
          >
            Send Email
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email Provider Selection Dialog */}
      <Dialog
        open={showProviderDialog}
        onClose={() => setShowProviderDialog(false)}
        PaperProps={{ sx: { borderRadius: '24px', p: 1, maxWidth: '400px', width: '100%' } }}
      >
        <DialogTitle sx={{ fontWeight: 900, textAlign: 'center', pt: 3, pb: 0, fontSize: '1.4rem' }}>
          Select Email Provider
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography sx={{ textAlign: 'center', color: '#64748B', mb: 3, fontSize: '0.95rem', fontWeight: 500 }}>
            How would you like to compose your application email?
          </Typography>
          <Stack spacing={1.5}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleOpenProvider('gmail')}
              sx={{
                py: 1.5, borderRadius: '12px', justifyContent: 'flex-start', px: 3,
                borderColor: '#E5E7EB', color: '#111827', fontWeight: 700,
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
                borderColor: '#E5E7EB', color: '#111827', fontWeight: 700,
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
                borderColor: '#E5E7EB', color: '#111827', fontWeight: 700,
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
                py: 1.5, borderRadius: '12px', bgcolor: '#111827', fontWeight: 700,
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
          <Button onClick={() => setShowProviderDialog(false)} sx={{ color: '#64748B', fontWeight: 700, textTransform: 'none' }}>
            Cancel
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
};

export default JobDetailScreen;
