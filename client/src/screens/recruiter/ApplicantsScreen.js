// screens/recruiter/ApplicantsScreen.js
import React, { useState, useRef } from "react";
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
  CircularProgress,
  Menu,
  MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import StarIcon from "@mui/icons-material/Star";
import SchoolIcon from "@mui/icons-material/School";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useNavigate } from "react-router-dom";
import { fadeSlideUp } from "../../utils/themeUtils";

// Mock applicants data
const MOCK_APPLICANTS = [
  {
    id: 1,
    name: "Alex Johnson",
    location: "San Francisco, CA",
    experience: "6 years",
    jobTitle: "Full Stack Software Engineer",
    company: "TechCorp Inc",
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    matchScore: 94,
    keySkills: ["React", "JavaScript", "Node.js", "PostgreSQL", "AWS"],
    summary: "Experienced full-stack engineer with a passion for building scalable web applications. Led a team of 5 developers in the last role.",
    about: "I'm a full-stack developer passionate about creating efficient, scalable solutions. With 6 years in the industry, I've worked on everything from frontend optimization to backend architecture.",
    education: [
      { degree: "BS Computer Science", school: "UC Berkeley", year: "2018" },
    ],
    workHistory: [
      {
        title: "Senior Frontend Engineer",
        company: "TechCorp Inc",
        duration: "2021 - Present",
        description: "Led frontend development team, mentored junior developers",
      },
      {
        title: "Full Stack Developer",
        company: "StartupXYZ",
        duration: "2018 - 2021",
        description: "Built and maintained full-stack applications",
      },
    ],
    savedAt: Date.now(),
  },
  {
    id: 2,
    name: "Sarah Chen",
    location: "Remote (New York)",
    experience: "5 years",
    jobTitle: "Frontend Developer",
    company: "DesignStudio",
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    matchScore: 88,
    keySkills: ["React", "TypeScript", "CSS", "Material UI", "Next.js"],
    summary: "Creative frontend developer specializing in responsive UI design. Strong design system background with UX expertise.",
    about: "I develop beautiful, user-centric web applications. My background in design helps me bridge the gap between design and development.",
    education: [
      { degree: "BS Design", school: "Parsons School of Design", year: "2019" },
    ],
    workHistory: [
      {
        title: "Frontend Developer",
        company: "DesignStudio",
        duration: "2019 - Present",
        description: "Developed responsive UIs for 50+ projects",
      },
    ],
    savedAt: null,
  },
  {
    id: 3,
    name: "Michael Rodriguez",
    location: "Austin, TX",
    experience: "7 years",
    jobTitle: "Senior React Developer",
    company: "CloudServices Ltd",
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    matchScore: 92,
    keySkills: ["React", "Redux", "TypeScript", "Jest", "GraphQL", "Docker"],
    summary: "Senior React specialist with expertise in state management and testing. Passionate about code quality and best practices.",
    about: "Full-stack specialist with deep expertise in React ecosystem. Strong advocate for testing and clean code.",
    education: [
      { degree: "BS Information Systems", school: "University of Texas", year: "2017" },
    ],
    workHistory: [
      {
        title: "Senior React Developer",
        company: "CloudServices Ltd",
        duration: "2020 - Present",
        description: "Architected React applications for enterprise clients",
      },
      {
        title: "React Developer",
        company: "WebAgency",
        duration: "2017 - 2020",
        description: "Built React applications for agency clients",
      },
    ],
    savedAt: Date.now(),
  },
  {
    id: 4,
    name: "Emma Williams",
    location: "London, UK",
    experience: "4 years",
    jobTitle: "Junior React Developer",
    company: "TechStartup",
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    matchScore: 75,
    keySkills: ["React", "JavaScript", "HTML", "CSS", "Git"],
    summary: "Eager junior developer with strong fundamentals. Quick learner with passion for modern web development and growing expertise.",
    about: "Junior developer with growing expertise in React. I'm eager to learn and take on more complex challenges.",
    education: [
      { degree: "Bootcamp Certification", school: "Coding Bootcamp", year: "2022" },
    ],
    workHistory: [
      {
        title: "Junior React Developer",
        company: "TechStartup",
        duration: "2022 - Present",
        description: "Developed React components and features",
      },
    ],
    savedAt: null,
  },
  {
    id: 5,
    name: "David Kim",
    location: "Seattle, WA",
    experience: "8 years",
    jobTitle: "Principal Software Engineer",
    company: "MegaCorp",
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    matchScore: 96,
    keySkills: ["React", "JavaScript", "System Design", "Leadership", "AWS", "Kubernetes"],
    summary: "Principal engineer with 8+ years experience. Expert in scalable architecture, team leadership, and mentoring. Published contributor to open-source.",
    about: "I build systems that scale. With 8 years of experience, I specialize in architecture, team building, and mentoring senior engineers.",
    education: [
      { degree: "MS Computer Science", school: "Stanford University", year: "2016" },
      { degree: "BS Computer Science", school: "Stanford University", year: "2014" },
    ],
    workHistory: [
      {
        title: "Principal Software Engineer",
        company: "MegaCorp",
        duration: "2021 - Present",
        description: "Led architecture for microservices platform serving 10M+ users",
      },
      {
        title: "Senior Software Engineer",
        company: "TechGiant",
        duration: "2017 - 2021",
        description: "Built and scaled React applications for global audience",
      },
    ],
    savedAt: null,
  },
];

const ApplicantsScreen = ({ jobId, jobTitle, onBack }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  const [applicants, setApplicants] = useState(MOCK_APPLICANTS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedApplicants, setSavedApplicants] = useState(
    new Set(MOCK_APPLICANTS.filter(a => a.savedAt).map(a => a.id))
  );
  const [anchorEl, setAnchorEl] = useState(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const currentApplicant = applicants[currentIndex];

  // Swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swiped left - next applicant
        handleNextApplicant();
      } else {
        // Swiped right - previous applicant
        handlePreviousApplicant();
      }
    }
  };

  const handleNextApplicant = () => {
    if (currentIndex < applicants.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePreviousApplicant = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleToggleSave = () => {
    const newSaved = new Set(savedApplicants);
    if (newSaved.has(currentApplicant.id)) {
      newSaved.delete(currentApplicant.id);
    } else {
      newSaved.add(currentApplicant.id);
    }
    setSavedApplicants(newSaved);
  };

  const handleViewProfile = () => {
    navigate(`/candidate-profile/${currentApplicant.id}`, {
      state: { applicant: currentApplicant, jobId, jobTitle },
    });
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getMatchColor = (score) => {
    if (score >= 90) return { main: "#10b981", bg: "#ecfdf5", border: "#a7f3d0" };
    if (score >= 80) return { main: "#f59e0b", bg: "#fffbeb", border: "#fde68a" };
    if (score >= 70) return { main: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" };
    return { main: "#94a3b8", bg: "#f8fafc", border: "#e2e8f0" };
  };

  const matchColor = getMatchColor(currentApplicant.matchScore);

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
              onClick={onBack}
              sx={{
                color: "#64748b",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": { color: "#0f172a", bgcolor: "transparent" },
              }}
            >
              Back
            </Button>
            <Box sx={{ textAlign: "center" }}>
              <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                Applicants
              </Typography>
              <Typography sx={{ fontSize: "0.8rem", color: "#64748b" }}>
                {jobTitle}
              </Typography>
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

      <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
        {applicants.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: "center",
              bgcolor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 3,
            }}
          >
            <Typography sx={{ fontWeight: 700, color: "#0f172a", mb: 1 }}>
              No applicants yet
            </Typography>
            <Typography sx={{ color: "#64748b" }}>
              Check back later for new applications
            </Typography>
          </Paper>
        ) : (
          <>
            {/* Swipeable Card */}
            <Box
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              sx={{
                position: "relative",
                mb: 4,
                animation: `${fadeSlideUp} 0.5s ease-out`,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  bgcolor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 3,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Match Badge */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    bgcolor: matchColor.bg,
                    border: `2px solid ${matchColor.main}`,
                    borderRadius: 2,
                    p: "6px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <StarIcon
                    sx={{
                      fontSize: 18,
                      color: matchColor.main,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: matchColor.main,
                    }}
                  >
                    {currentApplicant.matchScore}%
                  </Typography>
                </Box>

                {/* Applicant Card Content */}
                <Box sx={{ display: "flex", gap: 3, mb: 3, pt: 1 }}>
                  <Avatar
                    src={currentApplicant.profileImage}
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: 2,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      flexShrink: 0,
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: "1.4rem",
                        color: "#0f172a",
                        mb: 0.5,
                      }}
                    >
                      {currentApplicant.name}
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: "#6366f1",
                        fontSize: "0.95rem",
                        mb: 0.5,
                      }}
                    >
                      {currentApplicant.jobTitle}
                    </Typography>
                    <Typography
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        color: "#64748b",
                        fontSize: "0.9rem",
                        mb: 1,
                      }}
                    >
                      <LocationOnIcon sx={{ fontSize: 16 }} />
                      {currentApplicant.location}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Box>
                        <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          Experience
                        </Typography>
                        <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                          {currentApplicant.experience}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                          Current Role
                        </Typography>
                        <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                          {currentApplicant.company}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Summary */}
                <Typography
                  sx={{
                    color: "#475569",
                    fontSize: "0.95rem",
                    mb: 2.5,
                    fontStyle: "italic",
                  }}
                >
                  "{currentApplicant.summary}"
                </Typography>

                {/* Key Skills */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    sx={{
                      fontSize: "0.85rem",
                      color: "#64748b",
                      fontWeight: 600,
                      mb: 1,
                    }}
                  >
                    Key Skills
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                    {currentApplicant.keySkills.map((skill, idx) => (
                      <Chip
                        key={idx}
                        label={skill}
                        sx={{
                          bgcolor: "#e0e7ff",
                          color: "#4f46e5",
                          fontWeight: 600,
                          fontSize: "0.8rem",
                          borderRadius: 1.5,
                        }}
                      />
                    ))}
                  </Stack>
                </Box>

                {/* Action Buttons */}
                <Stack
                  direction={isMobile ? "column" : "row"}
                  spacing={1.5}
                  sx={{ mt: 3, pt: 2, borderTop: "1px solid #e2e8f0" }}
                >
                  <Button
                    fullWidth={isMobile}
                    variant="contained"
                    onClick={handleViewProfile}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      py: 1,
                      background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #4f46e5, #4338ca)",
                      },
                    }}
                  >
                    View Profile
                  </Button>
                  <Button
                    fullWidth={isMobile}
                    variant="outlined"
                    onClick={handleToggleSave}
                    startIcon={
                      savedApplicants.has(currentApplicant.id) ? (
                        <FavoriteIcon />
                      ) : (
                        <FavoriteBorderIcon />
                      )
                    }
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      color: savedApplicants.has(currentApplicant.id)
                        ? "#ef4444"
                        : "#64748b",
                      borderColor: savedApplicants.has(currentApplicant.id)
                        ? "#ef4444"
                        : "#e2e8f0",
                      "&:hover": {
                        borderColor: "#ef4444",
                        color: "#ef4444",
                        bgcolor: "rgba(239, 68, 68, 0.05)",
                      },
                    }}
                  >
                    {savedApplicants.has(currentApplicant.id) ? "Saved" : "Save"}
                  </Button>
                </Stack>
              </Paper>
            </Box>

            {/* Navigation Controls */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
                mb: 4,
              }}
            >
              <Button
                variant="outlined"
                onClick={handlePreviousApplicant}
                disabled={currentIndex === 0}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderColor: "#e2e8f0",
                }}
              >
                ← Previous
              </Button>

              <Box sx={{ textAlign: "center" }}>
                <Typography sx={{ color: "#0f172a", fontWeight: 700 }}>
                  {currentIndex + 1} of {applicants.length}
                </Typography>
                {/* Progress Bar */}
                <Box
                  sx={{
                    height: 4,
                    bgcolor: "#e2e8f0",
                    borderRadius: 2,
                    mt: 1,
                    overflow: "hidden",
                    width: 200,
                  }}
                >
                  <Box
                    sx={{
                      height: "100%",
                      width: `${((currentIndex + 1) / applicants.length) * 100}%`,
                      bgcolor: "#6366f1",
                      transition: "width 0.3s ease",
                    }}
                  />
                </Box>
              </Box>

              <Button
                variant="outlined"
                onClick={handleNextApplicant}
                disabled={currentIndex === applicants.length - 1}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderColor: "#e2e8f0",
                }}
              >
                Next →
              </Button>
            </Box>

            {/* Swipe Hint */}
            {isMobile && (
              <Box
                sx={{
                  textAlign: "center",
                  color: "#94a3b8",
                  fontSize: "0.8rem",
                  fontStyle: "italic",
                }}
              >
                💡 Swipe left or right to browse applicants
              </Box>
            )}
          </>
        )}
      </Container>

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
          Send Message
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ py: 1.5, fontSize: "0.9rem" }}>
          Schedule Interview
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ py: 1.5, fontSize: "0.9rem" }}>
          Export Resume
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ApplicantsScreen;
