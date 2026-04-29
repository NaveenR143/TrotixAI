// screens/candidate/DashboardScreen.js
import React from "react";
import {
  Box, Typography, Container, Paper, Button, Tooltip,
  useMediaQuery, useTheme, Stack, Avatar, IconButton, Badge
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import WorkIcon from "@mui/icons-material/Work";
import PersonIcon from "@mui/icons-material/Person";
import PeopleIcon from "@mui/icons-material/People";
import DescriptionIcon from "@mui/icons-material/Description";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SchoolIcon from "@mui/icons-material/School";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import NotificationsIcon from "@mui/icons-material/Notifications";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const DashboardSection = ({ icon: Icon, title, description, count, accent, onClick }) => {
  return (
    <Paper
      onClick={onClick}
      elevation={0}
      sx={{
        p: 3.5,
        height: '100%',
        cursor: 'pointer',
        borderRadius: '24px',
        border: "1px solid #E5E7EB",
        bgcolor: "#FFFFFF",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
          borderColor: accent,
          "& .icon-box": { transform: "scale(1.1)", bgcolor: accent },
          "& .arrow-icon": { transform: "translateX(4px)", color: accent }
        },
      }}
    >
      <Box
        className="icon-box"
        sx={{
          width: 60,
          height: 60,
          borderRadius: '18px',
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFFFFF",
          bgcolor: accent || "#2563EB",
          transition: "all 0.3s ease",
          boxShadow: `0 8px 16px ${accent}20`,
        }}
      >
        <Icon sx={{ fontSize: 28 }} />
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontWeight: 800, fontSize: "1.15rem", color: "#111827", mb: 0.5, letterSpacing: '-0.01em' }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: "0.95rem", color: "#64748B", fontWeight: 500, lineHeight: 1.6 }}>
          {description}
        </Typography>
      </Box>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        {count ? (
          <Typography sx={{ fontWeight: 800, fontSize: "1.25rem", color: "#111827" }}>
            {count}
          </Typography>
        ) : <Box />}
        <ArrowForwardIcon className="arrow-icon" sx={{ color: "#94A3B8", transition: "all 0.3s ease", fontSize: 20 }} />
      </Stack>
    </Paper>
  );
};

const DashboardScreen = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { mobile, fullname } = useSelector((state) => state.UserReducer);

  const dashboardSections = [
    {
      icon: WorkIcon,
      title: 'Job Feed',
      description: 'Discover AI-matched opportunities tailored to your unique profile.',
      accent: '#2563EB',
      onClick: () => navigate('/feed'),
      count: '50k+',
    },
    {
      icon: PeopleIcon,
      title: 'Expert Network',
      description: 'Connect with top-tier consultants for personalized guidance.',
      accent: '#7C3AED',
      onClick: () => navigate('/consultants'),
      count: '500+',
    },
    {
      icon: PersonIcon,
      title: 'My Profile',
      description: 'Keep your professional details up to date for better matches.',
      accent: '#10B981',
      onClick: () => navigate('/profile'),
    },
    {
      icon: TrendingUpIcon,
      title: 'Career Insights',
      description: 'Get AI-driven advice on how to accelerate your career growth.',
      accent: '#0EA5E9',
      onClick: () => navigate('/career-advice'),
    },
    {
      icon: DescriptionIcon,
      title: 'Resume AI',
      description: 'Create high-converting resumes with our smart builder tools.',
      accent: '#F59E0B',
      onClick: () => navigate('/resume-builder'),
    },
    {
      icon: SchoolIcon,
      title: 'Skill Center',
      description: 'Upskill with curated courses and certifications in your field.',
      accent: '#EC4899',
      onClick: () => navigate('/skill-development'),
    },
  ];

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 8 }}>

      {/* Top Bar */}
      <Box sx={{ bgcolor: "#FFFFFF", borderBottom: "1px solid #E5E7EB", py: 2 }}>
        <Container maxWidth="lg">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  width: 40, height: 40, bgcolor: "#2563EB",
                  fontWeight: 800, fontSize: '0.9rem'
                }}
              >
                {fullname?.[0] || "U"}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 800, color: "#111827", fontSize: '1rem' }}>
                  {fullname || "User"}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                  Candidate Dashboard
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1}>
              <IconButton sx={{ border: '1px solid #E5E7EB', borderRadius: '12px' }}>
                <Badge variant="dot" color="error">
                  <NotificationsIcon sx={{ fontSize: 20, color: '#475569' }} />
                </Badge>
              </IconButton>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Hero Header */}
      <Box sx={{
        pt: 8, pb: 6, mb: 4,
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(37, 99, 235, 0.05) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(124, 58, 237, 0.05) 0%, transparent 50%)'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: 700 }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
              <Box sx={{ px: 1.5, py: 0.5, bgcolor: '#eff6ff', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: 1 }}>
                <RocketLaunchIcon sx={{ fontSize: 16, color: '#2563EB' }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  AI Matching Active
                </Typography>
              </Box>
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 900, color: "#111827", letterSpacing: "-0.04em", lineHeight: 1.1, mb: 2 }}>
              Find your next <Box component="span" sx={{ color: '#2563EB' }}>career leap</Box> with Trotix AI.
            </Typography>
            <Typography sx={{ color: "#64748B", fontSize: "1rem", fontWeight: 500, lineHeight: 1.6 }}>
              Your personalized recruitment companion is ready to match you with top companies.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Main Grid */}
      <Container maxWidth="lg">
        <Grid2 container spacing={3}>
          {dashboardSections.map((section, index) => (
            <Grid2 key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
              <DashboardSection {...section} />
            </Grid2>
          ))}
        </Grid2>
      </Container>

      {/* Premium CTA */}
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 5, md: 8 },
            borderRadius: '32px',
            bgcolor: "#111827",
            color: "#FFFFFF",
            position: 'relative',
            overflow: 'hidden',
            backgroundImage: 'radial-gradient(circle at top right, rgba(37, 99, 235, 0.15), transparent), radial-gradient(circle at bottom left, rgba(124, 58, 237, 0.1), transparent)',
          }}
        >
          <Grid2 container spacing={4} alignItems="center">
            <Grid2 size={{ xs: 12, md: 8 }}>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 2, letterSpacing: '-0.02em' }}>
                Stand out to recruiters
              </Typography>
              <Typography sx={{ opacity: 0.7, fontSize: '1rem', fontWeight: 500, maxWidth: 500 }}>
                Get a detailed analysis of your profile and see how you rank against other candidates for top roles.
              </Typography>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }} sx={{ textAlign: { md: 'right' } }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/profile')}
                sx={{
                  px: 5, py: 2, borderRadius: '16px', fontWeight: 800, textTransform: 'none',
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  color: '#FFFFFF', fontSize: '1.1rem',
                  boxShadow: '0 10px 20px rgba(37, 99, 235, 0.3)',
                  '&:hover': { 
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 24px rgba(37, 99, 235, 0.4)',
                    filter: 'brightness(1.1)'
                  }
                }}
              >
                Optimize My Profile
              </Button>
            </Grid2>
          </Grid2>
        </Paper>
      </Container>
    </Box>
  );
};

export default DashboardScreen;
