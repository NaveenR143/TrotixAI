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
import { fetchProfile } from "../../api/profileAPI";
import { toTitleCase } from "../../screens/candidate/utils/profileUtils";


const CandidateProfileScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Get initial data from location state
  const { applicant: rawApplicant, jobId, jobTitle } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      const phoneToUse = rawApplicant?.phone || "9789502974";

      if (!phoneToUse) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetchProfile(phoneToUse);
        if (!response.error && response.data) {
          setProfileData(response.data);
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
  }, [rawApplicant]);

  // Normalize applicant data with API data and fallbacks
  const applicant = useMemo(() => {
    if (!rawApplicant) return null;

    // Enrich with API data if available (profileData is a flat object from ProfileRepository)
    const apiData = profileData || {};
    const apiExperience = apiData.experience || [];
    const apiEducation = apiData.education || [];
    const apiProjects = apiData.projects || [];
    const apiSkills = apiData.skills?.map(s => s.name).filter(Boolean) || [];

    return {
      ...rawApplicant,
      name: toTitleCase(apiData.full_name || rawApplicant.name),
      jobTitle: toTitleCase(apiData.headline || rawApplicant.jobTitle),
      location: toTitleCase(apiData.current_location || rawApplicant.location),
      experience: apiData.years_of_experience ? `${apiData.years_of_experience} yrs` : toTitleCase(rawApplicant.experience),
      about: apiData.summary || rawApplicant.summary || "No summary provided.",
      keySkills: apiSkills.length > 0 ? apiSkills.map(toTitleCase) : (rawApplicant.allSkills || rawApplicant.keySkills || rawApplicant.matchedSkills || []).map(toTitleCase),
      company: toTitleCase(apiData.company_name || rawApplicant.company || "Company"),
      phone: apiData.phone || rawApplicant.phone,
      email: apiData.email || `${(apiData.full_name || rawApplicant.name).toLowerCase().replace(/ /g, ".")}@email.com`,
      profileImage: apiData.avatar_url || rawApplicant.profileImage,

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
        degree: toTitleCase(edu.degree),
        school: toTitleCase(edu.institution),
        year: edu.end_year ? edu.end_year.toString() : (edu.start_year ? `${edu.start_year} - Present` : "")
      })) : [
        {
          degree: "Bachelor of Science in Computer Science",
          school: "State University of Technology",
          year: "2018"
        }
      ],

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
  }, [rawApplicant, profileData]);


  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 3 }}>
        <CircularProgress size={50} sx={{ color: '#6366f1' }} />
        <Typography sx={{ color: '#64748b', fontWeight: 500 }}>Fetching candidate profile...</Typography>
      </Box>
    );
  }

  if (error || !applicant) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 2 }}>
        <Typography variant="h6" color="error">{error || "Candidate profile not found"}</Typography>
        <Button variant="contained" onClick={() => navigate(-1)}>Go Back</Button>
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
      <Box sx={{ bgcolor: "#fff", borderBottom: "1px solid #e2e8f0", position: 'sticky', top: 0, zIndex: 100 }}>
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
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
                Candidate Profile
              </Typography>
              {jobTitle && (
                <Typography variant="caption" sx={{ color: '#6366f1', fontWeight: 600 }}>
                  Matching for: {toTitleCase(jobTitle)}
                </Typography>
              )}
            </Box>
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

              <Box sx={{ display: "flex", gap: 3, mb: 3, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-start' } }}>
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
                <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
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
                      justifyContent: { xs: 'center', sm: 'flex-start' },
                      gap: 0.5,
                      color: "#64748b",
                      fontSize: "0.95rem",
                      mb: 1,
                    }}
                  >
                    <LocationOnIcon sx={{ fontSize: 18 }} />
                    {applicant.location}
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 1.5, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
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
              <SectionHeader icon={MessageIcon} title="Professional Summary" />
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
              <SectionHeader icon={StarIcon} title="Skills & Expertise" />
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
                      py: 2,
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
                              fontSize: "1rem",
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
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            mb: 1,
                          }}
                        >
                          {exp.company_name}
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

            {/* Projects */}
            {applicant.projects && applicant.projects.length > 0 && (
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
                <SectionHeader icon={AccountTreeIcon} title="Key Projects" />
                <Stack spacing={3}>
                  {applicant.projects.map((proj, idx) => (
                    <Box key={idx}>
                      {idx > 0 && <Divider sx={{ mb: 3 }} />}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>
                          {proj.title}
                        </Typography>
                        {proj.duration && (
                          <Typography sx={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                            {proj.duration}
                          </Typography>
                        )}
                      </Box>

                      <Typography sx={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.7, mb: 2 }}>
                        {proj.description}
                      </Typography>

                      {proj.skills && proj.skills.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                          {proj.skills.map((skill, sIdx) => (
                            <Chip
                              key={sIdx}
                              label={skill}
                              size="small"
                              sx={{
                                bgcolor: '#f1f5f9',
                                color: '#475569',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />
                          ))}
                        </Box>
                      )}

                      <Stack direction="row" spacing={2}>
                        {proj.url && (
                          <Button
                            size="small"
                            variant="text"
                            href={proj.url}
                            target="_blank"
                            sx={{ textTransform: 'none', fontWeight: 700, color: '#6366f1', p: 0 }}
                          >
                            Live Demo
                          </Button>
                        )}
                        {proj.repo_url && (
                          <Button
                            size="small"
                            variant="text"
                            href={proj.repo_url}
                            target="_blank"
                            sx={{ textTransform: 'none', fontWeight: 700, color: '#6366f1', p: 0 }}
                          >
                            Source Code
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            )}

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
            <Stack spacing={3} sx={{ position: { md: 'sticky' }, top: { md: 100 } }}>
              {/* Action Buttons */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 3,
                }}
              >
                <Stack spacing={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<VideoCallIcon />}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      py: 1.5,
                      background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #4f46e5, #4338ca)",
                      },
                    }}
                  >
                    Download Resume
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
                      py: 1.5,
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
                    <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                      {applicant.email}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mb: 0.5 }}>
                      Phone
                    </Typography>
                    <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                      {applicant.phone || "+1 (555) 123-4567"}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography sx={{ fontSize: "0.75rem", color: "#64748b", mb: 0.5 }}>
                      Location
                    </Typography>
                    <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                      {applicant.location}
                    </Typography>
                  </Box>
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

