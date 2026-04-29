// screens/recruiter/DashboardScreen.js
import React from "react";
import {
    Box, Typography, Container, Paper, Tooltip,
    useMediaQuery, useTheme, Stack, Button, Avatar, IconButton, Badge
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";

import WorkIcon from "@mui/icons-material/Work";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import EventIcon from "@mui/icons-material/Event";
import InsightsIcon from "@mui/icons-material/Insights";
import BusinessIcon from "@mui/icons-material/Business";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AddIcon from "@mui/icons-material/Add";

import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

/* ---------- Reusable Components ---------- */

const DashboardSection = ({ icon: Icon, title, description, accent, onClick, count }) => (
    <Paper
        onClick={onClick}
        elevation={0}
        sx={{
            p: 3,
            cursor: "pointer",
            borderRadius: '20px',
            border: "1px solid #E5E7EB",
            bgcolor: "#FFFFFF",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            position: 'relative',
            overflow: 'hidden',
            "&:hover": {
                transform: "translateY(-6px)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
                borderColor: accent,
                "& .icon-box": { transform: "scale(1.1)", bgcolor: accent },
                "& .arrow-icon": { transform: "translateX(4px)", color: accent }
            },
        }}
    >
        <Stack spacing={2.5}>
            <Box
                className="icon-box"
                sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '16px',
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

            <Box>
                <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#111827", mb: 0.5 }}>
                    {title}
                </Typography>
                <Typography sx={{ fontSize: "0.9rem", color: "#64748B", fontWeight: 500, lineHeight: 1.5 }}>
                    {description}
                </Typography>
            </Box>

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 1 }}>
                {count ? (
                    <Typography sx={{ fontWeight: 800, fontSize: "1.5rem", color: "#111827", letterSpacing: "-0.02em" }}>
                        {count}
                    </Typography>
                ) : <Box />}
                <ArrowForwardIcon className="arrow-icon" sx={{ color: "#94A3B8", transition: "all 0.3s ease", fontSize: 20 }} />
            </Stack>
        </Stack>
    </Paper>
);

const StatCard = ({ label, value, icon: Icon, color }) => (
    <Paper
        elevation={0}
        sx={{
            p: 3,
            borderRadius: '20px',
            bgcolor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            display: 'flex',
            alignItems: 'center',
            gap: 3
        }}
    >
        <Box sx={{
            width: 52, height: 52, borderRadius: '14px', bgcolor: `${color}10`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <Icon sx={{ color, fontSize: 24 }} />
        </Box>
        <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "1.5rem", color: "#111827", lineHeight: 1 }}>
                {value}
            </Typography>
            <Typography sx={{ fontSize: "0.85rem", color: "#64748B", fontWeight: 600, mt: 0.5 }}>
                {label}
            </Typography>
        </Box>
    </Paper>
);

/* ---------- Main Screen ---------- */
const DashboardScreen = () => {
    const navigate = useNavigate();
    const { displayname } = useSelector((state) => state.UserReducer);

    const sections = [
        {
            icon: WorkIcon,
            title: "Manage Job Posts",
            description: "Review, edit and track your active job listings",
            accent: "#2563EB",
            onClick: () => navigate("/posted-jobs"),
            count: "24",
        },
        {
            icon: PeopleIcon,
            title: "Talent Pool",
            description: "Discover and manage potential candidates",
            accent: "#7C3AED",
            onClick: () => navigate("/recruiter/candidates"),
            count: "1.2k",
        },
        {
            icon: AssignmentTurnedInIcon,
            title: "Applications",
            description: "Monitor candidate application status",
            accent: "#06B6D4",
            onClick: () => navigate("/recruiter/applications"),
            count: "320",
        },
        {
            icon: EventIcon,
            title: "Interview Desk",
            description: "Schedule and coordinate hiring sessions",
            accent: "#10B981",
            onClick: () => navigate("/recruiter/interviews"),
        },
        {
            icon: InsightsIcon,
            title: "Recruitment Insights",
            description: "View pipeline data and hiring performance",
            accent: "#F59E0B",
            onClick: () => navigate("/recruiter/analytics"),
        },
        {
            icon: BusinessIcon,
            title: "Company Brand",
            description: "Update your company profile and settings",
            accent: "#475569",
            onClick: () => navigate("/recruiter/company"),
        },
    ];

    return (
        <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", pb: 8 }}>

            {/* Top Navigation Bar */}
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
                                {displayname?.[0] || "R"}
                            </Avatar>
                            <Box>
                                <Typography sx={{ fontWeight: 800, color: "#111827", fontSize: '1rem' }}>
                                    {displayname || "Recruiter"}
                                </Typography>
                                <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                                    Recruiter Dashboard
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
            <Container maxWidth="lg" sx={{ mt: 6, mb: 4 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={3}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: "#111827", letterSpacing: "-0.03em", mb: 1 }}>
                            Welcome back, {displayname?.split(' ')[0] || "Recruiter"}!
                        </Typography>
                        <Typography sx={{ color: "#64748B", fontSize: "1.1rem", fontWeight: 500 }}>
                            Everything you need to manage your hiring pipeline in one place.
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate("/post-job")}
                        sx={{
                            px: 3, py: 1.5, borderRadius: '14px', fontWeight: 800, textTransform: 'none',
                            bgcolor: '#2563EB', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.2)',
                            '&:hover': { bgcolor: '#1e40af', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)' }
                        }}
                    >
                        Post New Job
                    </Button>
                </Stack>
            </Container>

            {/* Quick Stats Grid */}
            <Container maxWidth="lg" sx={{ mb: 6 }}>
                <Grid2 container spacing={3}>
                    <Grid2 size={{ xs: 12, sm: 4 }}>
                        <StatCard label="Active Openings" value="24" icon={WorkIcon} color="#2563EB" />
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 4 }}>
                        <StatCard label="Total Applicants" value="1,240" icon={PeopleIcon} color="#7C3AED" />
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 4 }}>
                        <StatCard label="Interviews" value="18" icon={EventIcon} color="#10B981" />
                    </Grid2>
                </Grid2>
            </Container>

            {/* Main Sections Grid */}
            <Container maxWidth="lg">
                <Typography sx={{ fontWeight: 800, fontSize: "1.2rem", color: "#111827", mb: 3 }}>
                    Management Hub
                </Typography>
                <Grid2 container spacing={3}>
                    {sections.map((s, i) => (
                        <Grid2 key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                            <DashboardSection {...s} />
                        </Grid2>
                    ))}
                </Grid2>
            </Container>

            {/* Bottom CTA Banner */}
            <Container maxWidth="lg" sx={{ mt: 8 }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 4, md: 6 },
                        borderRadius: '24px',
                        bgcolor: "#111827",
                        color: "#FFFFFF",
                        position: 'relative',
                        overflow: 'hidden',
                        backgroundImage: 'radial-gradient(circle at top right, rgba(37, 99, 235, 0.2), transparent)',
                    }}
                >
                    <Grid2 container spacing={4} alignItems="center">
                        <Grid2 size={{ xs: 12, md: 8 }}>
                            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.02em' }}>
                                Scale your team with AI power
                            </Typography>
                            <Typography sx={{ opacity: 0.7, fontSize: '1.1rem', fontWeight: 500 }}>
                                Use our advanced matching algorithms to find the perfect candidates for your open roles in seconds.
                            </Typography>
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 4 }} sx={{ textAlign: { md: 'right' } }}>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate("/post-job")}
                                sx={{
                                    px: 4, py: 2, borderRadius: '14px', fontWeight: 800, textTransform: 'none',
                                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                                    color: '#FFFFFF',
                                    boxShadow: '0 10px 25px rgba(37, 99, 235, 0.25)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
                                        boxShadow: '0 12px 30px rgba(37, 99, 235, 0.35)',
                                        transform: 'translateY(-2px)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Start Hiring Now
                            </Button>
                        </Grid2>
                    </Grid2>
                </Paper>
            </Container>
        </Box>
    );
};

export default DashboardScreen;
