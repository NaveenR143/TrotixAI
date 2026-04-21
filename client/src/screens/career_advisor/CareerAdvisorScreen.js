import React, { useState, useEffect } from "react";
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Chip,
    LinearProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Link,
    Divider,
    Button,
    Container,
    Paper,
    Stack,
    Avatar,
    Skeleton,
    IconButton,
    Alert,
    Tooltip,
    useTheme,
    useMediaQuery
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PsychologyIcon from "@mui/icons-material/Psychology";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LaunchIcon from "@mui/icons-material/Launch";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as profileAPI from "../../api/profileAPI";

const SectionTitle = ({ icon, title, subtitle }) => (
    <Box mb={3}>
        <Stack direction="row" spacing={1.5} alignItems="center" mb={0.5}>
            <Avatar sx={{ bgcolor: 'black', width: 32, height: 32 }}>
                {icon}
            </Avatar>
            <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: -0.5 }}>
                {title}
            </Typography>
        </Stack>
        {subtitle && (
            <Typography variant="body2" color="text.secondary">
                {subtitle}
            </Typography>
        )}
    </Box>
);

const CareerAdvisorDashboard = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const navigate = useNavigate();

    const profile = useSelector((state) => state.ProfileReducer.data);
    const user = useSelector((state) => state.UserReducer);

    const [careerAdvice, setCareerAdvice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchCareerAdvice = async (forceRefresh = false) => {
        if (forceRefresh) setRefreshing(true);
        else setLoading(true);

        setError(null);

        try {
            const phone = profile?.personalDetails?.phone || user?.mobile || localStorage.getItem("mobile_number");
            const userId = profile?.id;


            if (!phone && !userId) {
                console.log("Career Advisor: Identifiers missing (phone/userId), skipping fetch.");
                setError("Identifiers missing. Please log in again.");
                setLoading(false);
                setRefreshing(false);
                return;
            }

            console.log(`Career Advisor: Triggering fetch for phone: ${phone}, userId: ${userId}`);

            const result = await profileAPI.fetchCareerAdvice(phone, userId, forceRefresh);

            if (!result.error) {
                setCareerAdvice(result.data);
            } else {
                setError(result.message || "Failed to generate career advice");
            }
        } catch (err) {
            console.error("Error fetching career advice:", err);
            setError("An unexpected error occurred while connecting to the AI advisor.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        // Trigger fetch only if we have identifiers and don't have advice yet
        const hasId = profile?.id || user?.mobile || localStorage.getItem("mobile_number");

        debugger;
        if (hasId) {
            fetchCareerAdvice();
        }
    }, [profile?.id, user?.mobile]);

    // Check if profile is sufficient
    const isProfileIncomplete = !profile?.skills?.length || !profile?.experience?.length;

    if (loading) {
        return (
            <Box p={{ xs: 2, md: 4 }} sx={{ bgcolor: "#f1f5f9", minHeight: "100vh" }}>
                <Container maxWidth="lg">
                    <Stack spacing={3}>
                        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 4 }} />
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={8}>
                                <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} />
                            </Grid>
                        </Grid>
                    </Stack>
                </Container>
            </Box>
        );
    }

    if (isProfileIncomplete && !careerAdvice) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10, px: 2 }}>
                <Paper sx={{ p: 6, textAlign: 'center', maxWidth: 600, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                    <Avatar sx={{ width: 80, height: 80, bgcolor: '#fee2e2', color: '#ef4444', mx: 'auto', mb: 3 }}>
                        <ErrorOutlineIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Typography variant="h5" fontWeight={800} gutterBottom>
                        Insufficient Profile Data
                    </Typography>
                    <Typography variant="body1" color="text.secondary" mb={4}>
                        Our AI Career Advisor needs more information about your skills and experience to provide meaningful roadmap and recommendations.
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate("/resume-builder")}
                        sx={{ bgcolor: 'black', color: 'white', px: 4, borderRadius: 2, "&:hover": { bgcolor: '#333' } }}
                    >
                        Complete My Profile
                    </Button>
                </Paper>
            </Box>
        );
    }

    if (error && !careerAdvice) {
        return (
            <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
                <Alert severity="error" sx={{ borderRadius: 2, mb: 3 }}>
                    {error}
                </Alert>
                <Button
                    startIcon={<RefreshIcon />}
                    variant="outlined"
                    onClick={() => fetchCareerAdvice()}
                    sx={{ borderRadius: 2 }}
                >
                    Retry Connection
                </Button>
            </Container>
        );
    }

    const { career_paths, skill_gaps, recommendations, action_plan } = careerAdvice || {};

    return (
        <Box sx={{ bgcolor: "#f1f5f9", minHeight: "100vh", py: { xs: 2, md: 4 } }}>
            <Container maxWidth="lg">
                <Grid container spacing={3}>

                    {/* Header Card */}
                    <Grid item xs={12}>
                        <Paper
                            sx={{
                                p: { xs: 3, md: 4 },
                                borderRadius: 4,
                                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                                color: "white",
                                position: "relative",
                                overflow: "hidden",
                                boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
                            }}
                        >
                            <Box sx={{ position: "relative", zIndex: 1 }}>
                                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
                                    <Box>
                                        <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 2, fontWeight: 700 }}>
                                            AI-POWERED INSIGHTS
                                        </Typography>
                                        <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: -1.5, mb: 1 }}>
                                            Career Advisor
                                        </Typography>
                                        <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
                                            Your personalized roadmap for professional growth. We've analyzed your {profile?.skills?.length} skills and {profile?.experience?.length} experiences to guide your next move.
                                        </Typography>
                                    </Box>
                                    <Button
                                        variant="contained"
                                        disabled={refreshing}
                                        onClick={() => fetchCareerAdvice(true)}
                                        startIcon={refreshing ? <AutoFixHighIcon className="animate-pulse" /> : <AutoFixHighIcon />}
                                        sx={{
                                            bgcolor: "white",
                                            color: "black",
                                            px: 3,
                                            py: 1.5,
                                            borderRadius: 3,
                                            fontWeight: 800,
                                            "&:hover": { bgcolor: "#f8fafc" }
                                        }}
                                    >
                                        {refreshing ? "Thinking..." : "Regenerate Advice"}
                                    </Button>
                                </Stack>
                            </Box>

                            {/* Decorative background element */}
                            <PsychologyIcon sx={{
                                position: "absolute",
                                right: -20,
                                bottom: -20,
                                fontSize: 200,
                                opacity: 0.05,
                                transform: "rotate(-15deg)"
                            }} />
                        </Paper>
                    </Grid>

                    {/* Career Path Roadmap */}
                    <Grid item xs={12}>
                        <Card sx={{ borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "none" }}>
                            <CardContent sx={{ p: 4 }}>
                                <SectionTitle
                                    icon={<TrendingUpIcon />}
                                    title="Strategic Career Roadmap"
                                    subtitle="The most logical progression path based on your current expertise."
                                />
                                <Box sx={{ mt: 4, position: 'relative' }}>
                                    <Stack
                                        direction={{ xs: 'column', md: 'row' }}
                                        spacing={0}
                                        alignItems={{ xs: 'flex-start', md: 'center' }}
                                        justifyContent="space-between"
                                    >
                                        {[
                                            { label: 'Current', role: career_paths?.current_role, color: '#94a3b8' },
                                            { label: 'Next Mile', role: career_paths?.next_role, color: '#3b82f6' },
                                            { label: 'Future Goal', role: career_paths?.future_role, color: '#10b981' }
                                        ].map((step, index) => (
                                            <React.Fragment key={index}>
                                                <Box sx={{ flex: 1, zIndex: 1, width: '100%' }}>
                                                    <Paper
                                                        elevation={0}
                                                        sx={{
                                                            p: 3,
                                                            borderRadius: 3,
                                                            bgcolor: index === 1 ? '#eff6ff' : '#f8fafc',
                                                            border: `1px solid ${index === 1 ? '#bfdbfe' : '#e2e8f0'}`,
                                                            textAlign: 'center',
                                                            transition: 'all 0.3s',
                                                            "&:hover": { transform: 'translateY(-4px)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }
                                                        }}
                                                    >
                                                        <Typography variant="caption" fontWeight={800} color={step.color} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                                            {step.label}
                                                        </Typography>
                                                        <Typography variant="h6" fontWeight={700} sx={{ mt: 1 }}>
                                                            {step.role || "TBD"}
                                                        </Typography>
                                                    </Paper>
                                                </Box>
                                                {index < 2 && !isMobile && (
                                                    <Box sx={{ width: 60, height: 2, bgcolor: '#e2e8f0', mx: 1 }} />
                                                )}
                                                {index < 2 && isMobile && (
                                                    <Box sx={{ height: 30, width: 2, bgcolor: '#e2e8f0', mx: 'auto' }} />
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </Stack>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Skill Gaps Analysis */}
                    <Grid item xs={12} md={7}>
                        <Card sx={{ height: '100%', borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "none" }}>
                            <CardContent sx={{ p: 4 }}>
                                <SectionTitle
                                    icon={<AssignmentIcon />}
                                    title="Skill Gap Analysis"
                                    subtitle="Critical skills required for your next career jump."
                                />
                                <Stack spacing={3}>
                                    {skill_gaps?.length > 0 ? (
                                        skill_gaps.map((skill, index) => (
                                            <Box key={index}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                                    <Typography variant="subtitle2" fontWeight={700}>{skill.skill}</Typography>
                                                    <Chip
                                                        label={skill.importance >= 4 ? "High Priority" : "Medium Priority"}
                                                        size="small"
                                                        sx={{
                                                            fontSize: '10px',
                                                            height: 20,
                                                            fontWeight: 800,
                                                            bgcolor: skill.importance >= 4 ? '#fee2e2' : '#fef9c3',
                                                            color: skill.importance >= 4 ? '#ef4444' : '#a16207'
                                                        }}
                                                    />
                                                </Stack>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={(skill.importance || 0) * 20}
                                                    sx={{
                                                        height: 8,
                                                        borderRadius: 4,
                                                        bgcolor: '#e2e8f0',
                                                        '& .MuiLinearProgress-bar': {
                                                            bgcolor: skill.importance >= 4 ? '#ef4444' : '#f59e0b',
                                                            borderRadius: 4
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        ))
                                    ) : (
                                        <Typography color="text.secondary">No major skill gaps identified based on your profile.</Typography>
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Quick Resources */}
                    <Grid item xs={12} md={5}>
                        <Card sx={{ height: '100%', borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "none" }}>
                            <CardContent sx={{ p: 4 }}>
                                <SectionTitle
                                    icon={<SchoolIcon />}
                                    title="Recommended Credits"
                                    subtitle="Courses and certifications to close your skill gaps."
                                />
                                <Stack spacing={2}>
                                    {[...(recommendations?.courses || []), ...(recommendations?.certifications || [])].slice(0, 4).map((item, i) => (
                                        <Paper
                                            key={i}
                                            elevation={0}
                                            sx={{
                                                p: 2,
                                                borderRadius: 3,
                                                bgcolor: '#f8fafc',
                                                border: '1px solid #e2e8f0',
                                                transition: 'border-color 0.2s',
                                                '&:hover': { borderColor: '#94a3b8' }
                                            }}
                                        >
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar sx={{ bgcolor: 'white', border: '1px solid #e2e8f0', color: 'black' }}>
                                                    {item.title ? <SchoolIcon fontSize="small" /> : <AssignmentIcon fontSize="small" />}
                                                </Avatar>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ maxWidth: 200 }}>
                                                        {item.title || item.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {item.provider}
                                                    </Typography>
                                                </Box>
                                                <IconButton size="small" component="a" href={item.url} target="_blank">
                                                    <LaunchIcon fontSize="small" />
                                                </IconButton>
                                            </Stack>
                                        </Paper>
                                    ))}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Action Plan */}
                    <Grid item xs={12}>
                        <Card sx={{ borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "none" }}>
                            <CardContent sx={{ p: 4 }}>
                                <SectionTitle
                                    icon={<WorkIcon />}
                                    title="Deployment Strategy"
                                    subtitle="Chronological steps to reach your future career goal."
                                />
                                <Box sx={{ mt: 2 }}>
                                    {action_plan?.map((item, i) => (
                                        <Accordion
                                            key={i}
                                            disableGutters
                                            elevation={0}
                                            sx={{
                                                mb: 1.5,
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                border: '1px solid #e2e8f0',
                                                '&:before': { display: 'none' }
                                            }}
                                        >
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon />}
                                                sx={{
                                                    bgcolor: '#f8fafc',
                                                    '&.Mui-expanded': { borderBottom: '1px solid #e2e8f0' }
                                                }}
                                            >
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Avatar sx={{ width: 24, height: 24, bgcolor: 'black', fontSize: 12 }}>
                                                        {i + 1}
                                                    </Avatar>
                                                    <Typography fontWeight={700}>{item.phase}</Typography>
                                                </Stack>
                                            </AccordionSummary>
                                            <AccordionDetails sx={{ p: 3 }}>
                                                <Typography variant="body2" sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
                                                    {item.action}
                                                </Typography>
                                            </AccordionDetails>
                                        </Accordion>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Footer Info */}
                    <Grid item xs={12} textAlign="center">
                        <Typography variant="caption" color="text.secondary">
                            Generated by TrotixAI Career Engine. Recommendations are based on your professional profile and market trends.
                        </Typography>
                    </Grid>

                </Grid>
            </Container>
        </Box>
    );
};

export default CareerAdvisorDashboard;