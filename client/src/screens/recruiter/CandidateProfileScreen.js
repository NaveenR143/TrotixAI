// screens/recruiter/CandidateProfileScreen.js
import React, { useState } from "react";
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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BusinessIcon from "@mui/icons-material/Business";
import SchoolIcon from "@mui/icons-material/School";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import StarIcon from "@mui/icons-material/Star";
import MessageIcon from "@mui/icons-material/Message";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import DownloadIcon from "@mui/icons-material/Download";
import { useNavigate, useLocation } from "react-router-dom";
import { fadeSlideUp } from "../../utils/themeUtils";

const CandidateProfileScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { applicant, jobId, jobTitle } = location.state || {};

  const [isSaved, setIsSaved] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  if (!applicant) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <Typography>Candidate not found</Typography>
      </Box>
    );
  }

  const getMatchColor = (score) => {
    if (score >= 90) return { main: "#10b981", bg: "#ecfdf5", border: "#a7f3d0" };
    if (score >= 80) return { main: "#f59e0b", bg: "#fffbeb", border: "#fde68a" };
    if (score >= 70) return { main: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" };
    return { main: "#94a3b8", bg: "#f8fafc", border: "#e2e8f0" };
  };

  const matchColor = getMatchColor(applicant.matchScore);

  const SectionHeader = ({ icon: Icon, title }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: "12px",
          background: "linear-gradient(135deg, #6366f1, #4f46e5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon sx={{ color: "#fff", fontSize: 22 }} />
      </Box>
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: "1.1rem",
          color: "#0f172a",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </Typography>
    </Box>
  );

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSendMessage = () => {
    setMessageDialogOpen(true);
  };

  const handleSendMessageConfirm = () => {
    setMessageDialogOpen(false);
    setMessage("");
  };

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 4 }}>
      {/* Header */}
      <Box sx={{ bgcolor: "#fff", borderBottom: "1px solid #e2e8f0" }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 2,
            }}
          >
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              sx={{
                color: "#64748b",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": { color: "#0f172a", bgcolor: "transparent" },
              }}
            >
              Back
            </Button>
            <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
              Candidate Profile
            </Typography>
            <IconButton
              onClick={handleMenuOpen}
              size="small"
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: 1.5,
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {/* Profile Header */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                bgcolor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 3,
                mb: 3,
                animation: `${fadeSlideUp} 0.5s ease-out`,
                position: "relative",
              }}
            >
              {/* Match Badge */}
              <Box
                sx={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  bgcolor: matchColor.bg,
                  border: `2px solid ${matchColor.main}`,
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <StarIcon sx={{ fontSize: 20, color: matchColor.main }} />
                <Typography
                  sx={{
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: matchColor.main,
                  }}
                >
                  {applicant.matchScore}% Match
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
                <Avatar
                  src={applicant.profileImage}
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: 2,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontWeight: 900,
                      fontSize: { xs: "1.6rem", md: "2rem" },
                      color: "#0f172a",
                      mb: 0.5,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {applicant.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "1.1rem",
                      color: "#6366f1",
                      fontWeight: 700,
                      mb: 0.5,
                    }}
                  >
                    {applicant.jobTitle}
                  </Typography>
                  <Typography
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      color: "#64748b",
                      fontSize: "0.95rem",
                      mb: 1,
                    }}
                  >
                    <LocationOnIcon sx={{ fontSize: 18 }} />
                    {applicant.location}
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
                    <Chip
                      icon={<WorkHistoryIcon />}
                      label={applicant.experience}
                      variant="outlined"
                      sx={{
                        borderColor: "#e2e8f0",
                        color: "#475569",
                        fontWeight: 600,
                      }}
                    />
                    <Chip
                      icon={<BusinessIcon />}
                      label={applicant.company}
                      variant="outlined"
                      sx={{
                        borderColor: "#e2e8f0",
                        color: "#475569",
                        fontWeight: 600,
                      }}
                    />
                  </Stack>
                </Box>
              </Box>
            </Paper>

            {/* About */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                bgcolor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 3,
                mb: 3,
              }}
            >
              <SectionHeader icon={MessageIcon} title="About" />
              <Typography
                sx={{
                  color: "#475569",
                  lineHeight: 1.8,
                  fontSize: "0.95rem",
                }}
              >
                {applicant.about}
              </Typography>
            </Paper>

            {/* Skills */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                bgcolor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 3,
                mb: 3,
              }}
            >
              <SectionHeader icon={StarIcon} title="Key Skills" />
              <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ gap: 1.5 }}>
                {applicant.keySkills.map((skill, idx) => (
                  <Chip
                    key={idx}
                    label={skill}
                    sx={{
                      bgcolor: "#e0e7ff",
                      color: "#4f46e5",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      borderRadius: 2,
                      py: 2.5,
                    }}
                  />
                ))}
              </Stack>
            </Paper>

            {/* Experience */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                bgcolor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 3,
                mb: 3,
              }}
            >
              <SectionHeader icon={WorkHistoryIcon} title="Work Experience" />
              <Stack spacing={2.5}>
                {applicant.workHistory.map((exp, idx) => (
                  <Box key={idx}>
                    {idx > 0 && <Divider sx={{ mb: 2.5 }} />}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          bgcolor: "#6366f1",
                          borderRadius: "50%",
                          mt: 1,
                          flexShrink: 0,
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color: "#0f172a",
                              fontSize: "0.95rem",
                            }}
                          >
                            {exp.title}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "0.85rem",
                              color: "#64748b",
                              fontWeight: 600,
                            }}
                          >
                            {exp.duration}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            color: "#6366f1",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            mb: 1,
                          }}
                        >
                          {exp.company}
                        </Typography>
                        <Typography
                          sx={{
                            color: "#475569",
                            fontSize: "0.9rem",
                            lineHeight: 1.6,
                          }}
                        >
                          {exp.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Paper>

            {/* Education */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                bgcolor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 3,
              }}
            >
              <SectionHeader icon={SchoolIcon} title="Education" />
              <Stack spacing={2}>
                {applicant.education.map((edu, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 2,
                      bgcolor: "#f8fafc",
                      borderRadius: 2,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: "#0f172a",
                          fontSize: "0.95rem",
                        }}
                      >
                        {edu.degree}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.8rem",
                          color: "#64748b",
                          fontWeight: 600,
                        }}
                      >
                        {edu.year}
                      </Typography>
                    </Box>
                    <Typography sx={{ color: "#6366f1", fontWeight: 600, fontSize: "0.9rem" }}>
                      {edu.school}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Action Buttons */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 3,
                mb: 3,
                position: { xs: "fixed", md: "relative" },
                bottom: { xs: 0, md: "auto" },
                left: { xs: 0, md: "auto" },
                right: { xs: 0, md: "auto" },
                width: { xs: "100%", md: "auto" },
                borderRadius: { xs: "24px 24px 0 0", md: 3 },
                zIndex: 20,
              }}
            >
              <Stack spacing={2.5}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<VideoCallIcon />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    py: isMobile ? 1.5 : 1,
                    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #4f46e5, #4338ca)",
                    },
                  }}
                >
                  Schedule Interview
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<MessageIcon />}
                  onClick={handleSendMessage}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    py: isMobile ? 1.5 : 1,
                    borderColor: "#e2e8f0",
                    color: "#475569",
                    "&:hover": {
                      borderColor: "#6366f1",
                      color: "#6366f1",
                    },
                  }}
                >
                  Send Message
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={
                    isSaved ? <FavoriteIcon /> : <FavoriteBorderIcon />
                  }
                  onClick={() => setIsSaved(!isSaved)}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    py: isMobile ? 1.5 : 1,
                    color: isSaved ? "#ef4444" : "#475569",
                    borderColor: isSaved ? "#ef4444" : "#e2e8f0",
                    "&:hover": {
                      borderColor: "#ef4444",
                      color: "#ef4444",
                    },
                  }}
                >
                  {isSaved ? "Saved" : "Save Candidate"}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    py: isMobile ? 1.5 : 1,
                    borderColor: "#e2e8f0",
                    color: "#475569",
                    "&:hover": {
                      borderColor: "#6366f1",
                      color: "#6366f1",
                    },
                  }}
                >
                  Download Resume
                </Button>
              </Stack>
            </Paper>

            {/* Contact Info */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 3,
                mb: { xs: 0, md: 3 },
              }}
            >
              <Typography sx={{ fontWeight: 800, color: "#0f172a", mb: 2 }}>
                Contact Information
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mb: 0.5 }}>
                    Email
                  </Typography>
                  <Typography sx={{ fontWeight: 600, color: "#0f172a" }}>
                    {applicant.name.toLowerCase().replace(" ", ".")}@email.com
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mb: 0.5 }}>
                    Phone
                  </Typography>
                  <Typography sx={{ fontWeight: 600, color: "#0f172a" }}>
                    +1 (555) 123-4567
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mb: 0.5 }}>
                    Location
                  </Typography>
                  <Typography sx={{ fontWeight: 600, color: "#0f172a" }}>
                    {applicant.location}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
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
            onClick={handleSendMessageConfirm}
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
    </Box>
  );
};

export default CandidateProfileScreen;
