// screens/candidate/DashboardScreen.js
import React from "react";
import {
  Box, Typography, Container, Paper, Grid, Button, Tooltip, 
  useMediaQuery, useTheme, Stack, Card, Avatar, LinearProgress
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import WorkIcon from "@mui/icons-material/Work";
import PersonIcon from "@mui/icons-material/Person";
import PeopleIcon from "@mui/icons-material/People";
import DescriptionIcon from "@mui/icons-material/Description";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SchoolIcon from "@mui/icons-material/School";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const DashboardSection = ({ icon: Icon, title, description, count, gradient, onClick, delay = 0 }) => {
  return (
    <Tooltip title={`View ${title}`} placement="top" arrow>
      <Paper
        onClick={onClick}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          height: '100%',
          cursor: 'pointer',
          border: '1px solid #e2e8f0',
          borderRadius: { xs: 3, md: 4 },
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          animation: `slideUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}s both`,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: gradient,
            borderRadius: '0 0 12px 0',
          },
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: '0 12px 32px rgba(99, 102, 241, 0.12)',
            borderColor: '#ddd6fe',
            '& .section-icon': {
              transform: 'scale(1.1) rotate(5deg)',
              boxShadow: `0 8px 24px ${gradient.split(',')[0].slice(0, -1)}, 50%)`,
            },
            '& .arrow-icon': {
              transform: 'translateX(4px)',
            },
          },
          '@keyframes slideUp': {
            from: { opacity: 0, transform: 'translateY(20px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
        }}
      >
        {/* Icon Circle */}
        <Box
          className="section-icon"
          sx={{
            width: 72,
            height: 72,
            borderRadius: '16px',
            background: gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: 32,
            transition: 'all 0.3s ease',
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: 32 }} />
        </Box>

        {/* Title and Description */}
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.1rem', md: '1.25rem' },
              color: '#0f172a',
              mb: 0.75,
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              color: '#64748b',
              fontSize: { xs: '0.85rem', md: '0.95rem' },
              lineHeight: 1.5,
            }}
          >
            {description}
          </Typography>
        </Box>

        {/* Count and Arrow */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1.5 }}>
          {count !== undefined && (
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '1.5rem',
                background: gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {count}
            </Typography>
          )}
          <ArrowForwardIcon
            className="arrow-icon"
            sx={{
              fontSize: 16,
              color: '#6366f1',
              transition: 'all 0.3s ease',
              ml: 'auto',
            }}
          />
        </Box>
      </Paper>
    </Tooltip>
  );
};

const StatCard = ({ label, value, icon: Icon, color, delay }) => {
  return (
    <Paper
      sx={{
        p: 2,
        textAlign: 'center',
        border: '1px solid #e2e8f0',
        borderRadius: 2.5,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        animation: `slideUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}s both`,
        '@keyframes slideUp': {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <Box sx={{ color, mb: 1 }}>
        <Icon sx={{ fontSize: 28 }} />
      </Box>
      <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', color: '#0f172a', mb: 0.5 }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>{label}</Typography>
    </Paper>
  );
};

const DashboardScreen = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { mobile, displayname } = useSelector((state) => state.UserReducer);

  const dashboardSections = [
    {
      icon: WorkIcon,
      title: 'Jobs',
      description: 'Discover AI-matched job opportunities',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      onClick: () => navigate('/feed'),
      count: '50k+',
      delay: 0,
    },
    {
      icon: PeopleIcon,
      title: 'Consultants',
      description: 'Connect with career consultants',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
      onClick: () => navigate('/consultants'),
      count: '500+',
      delay: 0.1,
    },
    {
      icon: TrendingUpIcon,
      title: 'Recruiters',
      description: 'Get discovered by top recruiters',
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
      onClick: () => navigate('/recruiters'),
      count: '2k+',
      delay: 0.2,
    },
    {
      icon: PersonIcon,
      title: 'Profile',
      description: 'Manage your professional profile',
      gradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
      onClick: () => navigate('/profile'),
      delay: 0.3,
    },
    {
      icon: DescriptionIcon,
      title: 'Resume Builder',
      description: 'Create AI-optimized resumes',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      onClick: () => navigate('/resume-builder'),
      delay: 0.4,
    },
    {
      icon: SchoolIcon,
      title: 'Learning',
      description: 'Upskill with curated courses',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
      onClick: () => navigate('/learning'),
      delay: 0.5,
    },
  ];

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: 'calc(100vh - 64px)', pb: { xs: 6, md: 8 } }}>
      {/* Hero Section */}
      <Box
        sx={{
          pt: { xs: 3, md: 5 },
          pb: { xs: 4, md: 6 },
          px: { xs: 2, md: 4 },
          background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.04) 100%)',
          borderBottom: '1px solid #e2e8f0',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-40%',
            right: '-10%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-20%',
            left: '-5%',
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Stack spacing={{ xs: 2, md: 3 }} sx={{ alignItems: 'flex-start' }}>
            <Typography
              sx={{
                fontSize: { xs: '2rem', md: '2.75rem' },
                fontWeight: 900,
                letterSpacing: '-0.03em',
                color: '#0f172a',
                lineHeight: 1.1,
              }}
            >
              Welcome back, <Box component="span" sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{displayname || 'Candidate'}</Box>
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                color: '#64748b',
                maxWidth: 600,
                lineHeight: 1.6,
              }}
            >
              Your AI-powered job companion is ready to help you land your dream job faster.
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* Quick Stats */}
      <Container maxWidth="lg" sx={{ mt: { xs: 4, md: 6 }, mb: { xs: 4, md: 6 } }}>
        <Grid2 container spacing={{ xs: 2, md: 3 }}>
          <Grid2 size={{ xs: 4, md: 4 }}>
            <StatCard label="Active Applications" value="12" icon={WorkIcon} color="#6366f1" delay={0} />
          </Grid2>
          <Grid2 size={{ xs: 4, md: 4 }}>
            <StatCard label="Profile Views" value="248" icon={PersonIcon} color="#ec4899" delay={0.1} />
          </Grid2>
          <Grid2 size={{ xs: 4, md: 4 }}>
            <StatCard label="Saved Jobs" value="34" icon={TrendingUpIcon} color="#0ea5e9" delay={0.2} />
          </Grid2>
        </Grid2>
      </Container>

      {/* Main Dashboard Sections */}
      <Container maxWidth="lg" sx={{ pb: 4 }}>
        <Grid2 container spacing={{ xs: 2.5, md: 3, lg: 4 }}>
          {dashboardSections.map((section, index) => (
            <Grid2 key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
              <DashboardSection {...section} />
            </Grid2>
          ))}
        </Grid2>
      </Container>

      {/* Feature Highlight */}
      <Container maxWidth="lg" sx={{ mt: { xs: 4, md: 8 } }}>
        <Paper
          sx={{
            p: { xs: 3, md: 4 },
            border: '1px solid #e2e8f0',
            borderRadius: { xs: 3, md: 4 },
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: '#ffffff',
            textAlign: 'center',
            animation: `slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.6s both`,
            '@keyframes slideUp': {
              from: { opacity: 0, transform: 'translateY(20px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <Stack spacing={2} sx={{ alignItems: 'center' }}>
            <Typography sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, fontWeight: 900, lineHeight: 1.1 }}>
              Ready to find your next opportunity?
            </Typography>
            <Typography sx={{ fontSize: { xs: '0.95rem', md: '1.05rem' }, opacity: 0.9, maxWidth: 500 }}>
              Start your AI-powered job search and get matched with the best roles suited for your skills.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/feed')}
              sx={{
                mt: 1,
                bgcolor: '#ffffff',
                color: '#6366f1',
                fontWeight: 700,
                px: { xs: 3, md: 4 },
                py: 1.2,
                borderRadius: 2.5,
                fontSize: { xs: '0.9rem', md: '1rem' },
                '&:hover': {
                  bgcolor: '#f8fafc',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
                },
              }}
            >
              Explore Jobs Now
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default DashboardScreen;
