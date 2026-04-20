// screens/recruiter/DashboardScreen.js
import React from "react";
import {
    Box, Typography, Container, Paper, Tooltip,
    useMediaQuery, useTheme, Stack, Button
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";

import WorkIcon from "@mui/icons-material/Work";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import EventIcon from "@mui/icons-material/Event";
import InsightsIcon from "@mui/icons-material/Insights";
import BusinessIcon from "@mui/icons-material/Business";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

/* ---------- Reusable Cards (same as yours, trimmed) ---------- */
const DashboardSection = ({ icon: Icon, title, description, gradient, onClick, count, delay = 0 }) => (
    <Tooltip title={`View ${title}`} arrow>
        <Paper
            onClick={onClick}
            sx={{
                p: 3,
                cursor: "pointer",
                borderRadius: 4,
                border: "1px solid #e2e8f0",
                background: "linear-gradient(135deg, #fff 0%, #f8fafc 100%)",
                transition: "0.3s",
                animation: `fadeIn 0.5s ease ${delay}s both`,
                "&:hover": { transform: "translateY(-6px)", boxShadow: 6 },
            }}
        >
            <Stack spacing={2}>
                <Box
                    sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 3,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        background: gradient,
                    }}
                >
                    <Icon />
                </Box>

                <Typography fontWeight={800}>{title}</Typography>
                <Typography fontSize={14} color="#64748b">{description}</Typography>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    {count && (
                        <Typography fontWeight={700} fontSize="1.4rem">
                            {count}
                        </Typography>
                    )}
                    <ArrowForwardIcon />
                </Stack>
            </Stack>
        </Paper>
    </Tooltip>
);

const StatCard = ({ label, value, icon: Icon, color }) => (
    <Paper sx={{ p: 2, textAlign: "center", borderRadius: 3 }}>
        <Icon sx={{ color, fontSize: 28 }} />
        <Typography fontWeight={800} fontSize="1.4rem">{value}</Typography>
        <Typography fontSize={12} color="#64748b">{label}</Typography>
    </Paper>
);

/* ---------- Main Screen ---------- */
const DashboardScreen = () => {
    const navigate = useNavigate();
    const { displayname } = useSelector((state) => state.UserReducer);

    const sections = [
        {
            icon: WorkIcon,
            title: "Job Posts",
            description: "Create and manage job listings",
            gradient: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            onClick: () => navigate("/posted-jobs"),
            count: "24",
        },
        {
            icon: PeopleIcon,
            title: "Candidates",
            description: "Browse and manage talent pool",
            gradient: "linear-gradient(135deg,#ec4899,#f43f5e)",
            onClick: () => navigate("/recruiter/candidates"),
            count: "1.2k",
        },
        {
            icon: AssignmentTurnedInIcon,
            title: "Applications",
            description: "Track candidate applications",
            gradient: "linear-gradient(135deg,#0ea5e9,#06b6d4)",
            onClick: () => navigate("/recruiter/applications"),
            count: "320",
        },
        {
            icon: EventIcon,
            title: "Interviews",
            description: "Schedule & manage interviews",
            gradient: "linear-gradient(135deg,#10b981,#14b8a6)",
            onClick: () => navigate("/recruiter/interviews"),
        },
        {
            icon: InsightsIcon,
            title: "Analytics",
            description: "Hiring insights & performance",
            gradient: "linear-gradient(135deg,#f59e0b,#d97706)",
            onClick: () => navigate("/recruiter/analytics"),
        },
        {
            icon: BusinessIcon,
            title: "Company Profile",
            description: "Manage company branding",
            gradient: "linear-gradient(135deg,#8b5cf6,#6366f1)",
            onClick: () => navigate("/recruiter/company"),
        },
    ];

    return (
        <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh" }}>

            {/* Hero */}
            <Box sx={{ p: 4 }}>
                <Typography fontSize="2.5rem" fontWeight={900}>
                    Welcome back, {displayname || "Recruiter"}
                </Typography>
                <Typography color="#64748b">
                    Manage your hiring pipeline and find the best talent faster.
                </Typography>
            </Box>

            {/* Stats */}
            <Container>
                <Grid2 container spacing={2}>
                    <Grid2 size={4}>
                        <StatCard label="Active Jobs" value="24" icon={WorkIcon} color="#6366f1" />
                    </Grid2>
                    <Grid2 size={4}>
                        <StatCard label="Total Applications" value="320" icon={AssignmentTurnedInIcon} color="#ec4899" />
                    </Grid2>
                    <Grid2 size={4}>
                        <StatCard label="Interviews Scheduled" value="18" icon={EventIcon} color="#0ea5e9" />
                    </Grid2>
                </Grid2>
            </Container>

            {/* Sections */}
            <Container sx={{ mt: 4 }}>
                <Grid2 container spacing={3}>
                    {sections.map((s, i) => (
                        <Grid2 key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                            <DashboardSection {...s} delay={i * 0.1} />
                        </Grid2>
                    ))}
                </Grid2>
            </Container>

            {/* CTA */}
            <Container sx={{ mt: 6 }}>
                <Paper sx={{ p: 4, textAlign: "center", borderRadius: 4, bgcolor: "#6366f1", color: "#fff" }}>
                    <Typography fontWeight={900} fontSize="1.8rem">
                        Ready to hire top talent?
                    </Typography>
                    <Typography sx={{ opacity: 0.9 }}>
                        Post a job and start receiving qualified candidates instantly.
                    </Typography>
                    <Button
                        variant="contained"
                        sx={{ mt: 2, bgcolor: "#fff", color: "#6366f1" }}
                        onClick={() => navigate("/post-job")}
                    >
                        Post a Job
                    </Button>
                </Paper>
            </Container>
        </Box>
    );
};

export default DashboardScreen;