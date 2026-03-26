import React from "react";
import {
  Box, Typography, Paper, Stack, Button, Chip, IconButton, Divider, Grid,
  LinearProgress, Tooltip
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SchoolIcon from "@mui/icons-material/School";
import GroupsIcon from "@mui/icons-material/Groups";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import LaunchIcon from "@mui/icons-material/Launch";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const CareerCoach = ({ profile }) => {
  // Mock suggestions based on skills
  const skills = profile?.skills?.split(',').map(s => s.trim()) || ["React", "JavaScript"];
  const primarySkill = skills[0] || "Software Development";

  const mentorships = [
    { name: "Sarah Chen", role: `Senior ${primarySkill} Architect`, focus: "System Design & Leadership", avatar: "SC" },
    { name: "David Miller", role: "Career Strategist", focus: "Negotiation & Personal Branding", avatar: "DM" }
  ];

  const courses = [
    { title: `Advanced ${primarySkill} Patterns`, platform: "Coursera", duration: "12h", link: "#", level: "Advanced" },
    { title: "Technical Interview Masterclass", platform: "Udemy", duration: "8h", link: "#", level: "All Levels" },
    { title: "Cloud Architecture for Scalable Apps", platform: "LinkedIn Learning", duration: "5h", link: "#", level: "Intermediate" }
  ];

  const tips = [
    `Highlight your ${skills.slice(0, 2).join(' and ')} projects more prominently.`,
    "Consider adding a portfolio link to showcase your system design work.",
    "Your profile matches 90% of senior roles; focus on leadership impact in your bio."
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, height: '100%', overflowY: 'auto', bgcolor: '#fff' }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <AutoAwesomeIcon sx={{ color: '#6366f1' }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>AI Career Coach</Typography>
          </Box>
          <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>
            Personalized guidance to accelerate your career as a {primarySkill} specialist.
          </Typography>
        </Box>

        {/* Career Progress */}
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>Profile Strength</Typography>
            <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#6366f1' }}>85%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={85} sx={{ height: 8, borderRadius: 4, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: '#6366f1' } }} />
          <Typography sx={{ mt: 1.5, fontSize: '0.75rem', color: '#64748b' }}>
            Complete your `About` section to reach 95% and unlock more job matches.
          </Typography>
        </Paper>

        {/* Mentorship */}
        <Box>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupsIcon sx={{ color: '#8b5cf6' }} /> Personalized Mentorship
          </Typography>
          <Stack spacing={2}>
            {mentorships.map((m, i) => (
              <Paper key={i} variant="outlined" sx={{ p: 2, borderRadius: 2, '&:hover': { borderColor: '#8b5cf6', bgcolor: '#f5f3ff' }, transition: '0.2s' }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                    {m.avatar}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{m.name}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mb: 0.5 }}>{m.role}</Typography>
                    <Chip label={m.focus} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#fff', border: '1px solid #e2e8f0' }} />
                  </Box>
                </Box>
              </Paper>
            ))}
          </Stack>
        </Box>

        {/* Recommended Courses */}
        <Box>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SchoolIcon sx={{ color: '#0ea5e9' }} /> Learning Paths
          </Typography>
          <Stack spacing={2}>
            {courses.map((c, i) => (
              <Paper key={i} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', mb: 0.5 }}>{c.title}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>{c.platform}</Typography>
                      <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
                      <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>{c.duration}</Typography>
                      <Chip label={c.level} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.6rem', color: '#0ea5e9', borderColor: '#0ea5e9' }} />
                    </Stack>
                  </Box>
                  <Tooltip title="View Course">
                    <IconButton size="small" sx={{ color: '#64748b' }}><LaunchIcon fontSize="inherit" /></IconButton>
                  </Tooltip>
                </Box>
              </Paper>
            ))}
          </Stack>
        </Box>

        {/* AI Career Tips */}
        <Box>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <LightbulbIcon sx={{ color: '#f59e0b' }} /> Improvement Tips
          </Typography>
          <Stack spacing={1.5}>
            {tips.map((tip, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1.5 }}>
                <TrendingUpIcon sx={{ color: '#10b981', fontSize: 18, mt: 0.2 }} />
                <Typography sx={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>{tip}</Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        <Divider />

        <Button variant="outlined" fullWidth color="primary" sx={{ py: 1, borderRadius: 2, textTransform: 'none' }}>
          Explore Full Career Roadmap
        </Button>
      </Stack>
    </Box>
  );
};

export default CareerCoach;
