import React, { useState, useEffect } from "react";
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Chip,
    LinearProgress,
    CircularProgress,
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
    useMediaQuery,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PsychologyIcon from "@mui/icons-material/Psychology";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SchoolIcon from "@mui/icons-material/School";
import LaunchIcon from "@mui/icons-material/Launch";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LinkIcon from "@mui/icons-material/Link";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import BookIcon from "@mui/icons-material/Book";
import LanguageIcon from "@mui/icons-material/Language";
import EngineeringIcon from "@mui/icons-material/Engineering";
import VerifiedIcon from "@mui/icons-material/Verified";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as profileAPI from "../../api/profileAPI";
import SkillDevelopmentReport from "./SkillDevelopmentReport";

// Helper to format date
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const SectionTitle = ({ icon, title, subtitle }) => (
    <Box mb={3}>
        <Stack direction="row" spacing={1.5} alignItems="center" mb={0.5}>
            <Avatar sx={{ bgcolor: '#6366f1', width: 32, height: 32 }}>
                {icon}
            </Avatar>
            <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: -0.5 }}>
                {title}
            </Typography>
        </Stack>
        {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {subtitle}
            </Typography>
        )}
    </Box>
);

const SkillDevelopmentScreen = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const navigate = useNavigate();

    const profile = useSelector((state) => state.ProfileReducer.data);
    const user = useSelector((state) => state.UserReducer);

    const [fullResponse, setFullResponse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [downloadingPDF, setDownloadingPDF] = useState(false);
    const [error, setError] = useState(null);

    const fetchSkillAnalysis = async (isRegenerating = false) => {
        if (isRegenerating) setRefreshing(true);
        else setLoading(true);

        setError(null);

        try {
            const userId = profile?.id || user?.id || localStorage.getItem("user_id");

            if (!userId) {
                setError("User profile not found. Please log in again.");
                setLoading(false);
                setRefreshing(false);
                return;
            }

            let result = null;

            // Step 1: If not regenerating, try fetching existing analysis first
            if (!isRegenerating) {
                const existingResult = await profileAPI.fetchExistingSkillAnalysis(userId);

                // Check if data is valid
                if (!existingResult.error && existingResult.data && existingResult.data !== "none") {
                    const data = existingResult.data;
                    const innerData = data.data || data;
                    // Heuristic to check if it's actual skill analysis content
                    if (innerData && (innerData.skills_analysis || innerData.industry)) {
                        result = existingResult;
                    }
                }
            }

            // Step 2: If no existing analysis found or if we are regenerating, fetch/generate new analysis
            if (!result) {
                result = await profileAPI.fetchMissingSkills(userId);
            }

            if (!result.error) {
                setFullResponse(result.data);
            } else {
                setError(result.message || "Failed to fetch skill analysis");
            }
        } catch (err) {
            console.error("Error fetching skill analysis:", err);
            setError("An unexpected error occurred while connecting to the AI skills engine.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleDownloadPDF = async () => {
        const reportContainer = document.getElementById("skill-development-report");
        if (!reportContainer) return;

        try {
            setDownloadingPDF(true);

            // Short delay to ensure everything is rendered
            setTimeout(async () => {
                try {
                    const pdf = new jsPDF({
                        orientation: "portrait",
                        unit: "mm",
                        format: "a4"
                    });

                    const sections = reportContainer.querySelectorAll(".report-section");
                    const pageWidth = 210;
                    const pageHeight = 297;
                    const margin = 20;
                    const contentWidth = pageWidth - (margin * 2);

                    let currentY = margin;
                    let firstPage = true;

                    for (let i = 0; i < sections.length; i++) {
                        const section = sections[i];
                        const canvas = await html2canvas(section, {
                            scale: 2,
                            useCORS: true,
                            backgroundColor: "#ffffff",
                            logging: false
                        });

                        const imgData = canvas.toDataURL("image/png", 1.0);
                        const imgHeight = (canvas.height * contentWidth) / canvas.width;

                        if (!firstPage && (currentY + imgHeight > pageHeight - margin)) {
                            pdf.addPage();
                            currentY = margin;
                        }

                        pdf.addImage(imgData, 'PNG', margin, currentY, contentWidth, imgHeight);
                        currentY += imgHeight + 10;
                        firstPage = false;
                    }

                    const name = profile?.personalDetails?.fullName || "Candidate";
                    pdf.save(`SkillEnhancement_${name.replace(/ /g, '_')}.pdf`);
                } catch (err) {
                    console.error("PDF generation error:", err);
                } finally {
                    setDownloadingPDF(false);
                }
            }, 500);
        } catch (error) {
            console.error("PDF process error:", error);
            setDownloadingPDF(false);
        }
    };

    useEffect(() => {
        fetchSkillAnalysis();
    }, [profile?.id, user?.id]);

    if (loading) {
        return (
            <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
                <Container maxWidth="sm">
                    <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, textAlign: 'center', borderRadius: 6, border: '1px solid #e2e8f0', bgcolor: 'white', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.05)' }}>
                        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 4 }}>
                            <CircularProgress size={80} thickness={4} sx={{ color: '#6366f1' }} />
                            <TrendingUpIcon sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 32, color: '#94a3b8' }} />
                        </Box>
                        <Typography variant="h5" fontWeight={900} gutterBottom sx={{ letterSpacing: -0.5 }}>
                            Scanning Market Trends...
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 2, mb: 4, lineHeight: 1.6, fontSize: '1.05rem' }}>
                            We're analyzing {profile?.skills?.length || "your"} current skills against real-time industry demands to identify growth opportunities.
                        </Typography>
                        <LinearProgress sx={{ height: 6, borderRadius: 3, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: '#6366f1', borderRadius: 3 } }} />
                    </Paper>
                </Container>
            </Box>
        );
    }

    if (error && !fullResponse) {
        return (
            <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
                <Alert severity="error" variant="outlined" sx={{ borderRadius: 3, mb: 3, fontWeight: 600 }}>
                    {error}
                </Alert>
                <Button startIcon={<RefreshIcon />} variant="contained" onClick={() => fetchSkillAnalysis()} sx={{ borderRadius: 3, bgcolor: 'black', color: 'white', px: 4 }}>
                    Retry Connection
                </Button>
            </Container>
        );
    }

    const data = fullResponse?.data || fullResponse || {};
    const { skills_analysis, industry, timestamp = new Date().toISOString() } = data;

    return (
        <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", py: { xs: 2, md: 4 } }}>
            <Container maxWidth="lg">
                <Grid container spacing={3}>
                    {/* Header Card */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 6, background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)", color: "white", position: "relative", overflow: "hidden", boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)" }}>
                            <Box sx={{ position: "relative", zIndex: 1 }}>
                                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={3}>
                                    <Box>
                                        <Typography variant="overline" sx={{ opacity: 0.7, letterSpacing: 3, fontWeight: 800 }}>
                                            SKILL DEVELOPMENT ENGINE
                                        </Typography>
                                        <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: -1.5, mb: 1.5, lineHeight: 1 }}>
                                            Skills Enhancement
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <VerifiedIcon sx={{ fontSize: 18, color: '#818cf8' }} />
                                            <Typography variant="body1" sx={{ opacity: 0.85, fontWeight: 300 }}>
                                                Target Industry: <strong>{industry || "IT & Software"}</strong>
                                            </Typography>
                                        </Stack>
                                    </Box>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                        <Button
                                            variant="outlined"
                                            disabled={downloadingPDF}
                                            onClick={handleDownloadPDF}
                                            startIcon={downloadingPDF ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />}
                                            sx={{ color: "white", borderColor: "rgba(255,255,255,0.3)", px: 3, py: 1.5, borderRadius: 4, fontWeight: 700, textTransform: 'none', "&:hover": { bgcolor: "rgba(255,255,255,0.1)", borderColor: "white" } }}
                                        >
                                            {downloadingPDF ? "Exporting..." : "Download Report"}
                                        </Button>
                                        <Button
                                            variant="contained"
                                            disabled={refreshing}
                                            onClick={() => fetchSkillAnalysis(true)}
                                            startIcon={refreshing ? <CircularProgress size={22} color="inherit" /> : <AutoFixHighIcon />}
                                            sx={{ bgcolor: "#6366f1", color: "white", px: 4, py: 1.5, borderRadius: 4, fontWeight: 900, textTransform: 'none', boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.5)', "&:hover": { bgcolor: "#4f46e5", transform: 'translateY(-2px)' } }}
                                        >
                                            {refreshing ? "Refreshing..." : "Analyze Again"}
                                        </Button>
                                    </Stack>
                                </Stack>
                            </Box>
                            <TrendingUpIcon sx={{ position: "absolute", right: -30, bottom: -30, fontSize: 240, opacity: 0.04, transform: "rotate(-10deg)" }} />
                        </Paper>
                    </Grid>

                    {/* Content Section */}
                    <Grid item xs={12}>
                        <SectionTitle
                            icon={<LightbulbIcon />}
                            title="Missing Skills & Recommendations"
                            subtitle={`Identified ${skills_analysis?.length || 0} key areas for development to excel in ${industry}.`}
                        />
                    </Grid>

                    {skills_analysis?.map((item, index) => (
                        <Grid item xs={12} key={index}>
                            <Card sx={{ borderRadius: 5, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", overflow: 'hidden' }}>
                                <Grid container>
                                    {/* Left Side - Skill Info */}
                                    <Grid item xs={12} md={4} sx={{ bgcolor: '#f8fafc', p: 4, borderRight: { md: '1px solid #e2e8f0' } }}>
                                        <Stack spacing={2}>
                                            <Box>
                                                <Typography variant="h5" fontWeight={900} color="#0f172a" gutterBottom>
                                                    {item.skill}
                                                </Typography>
                                                <Stack direction="row" spacing={1}>
                                                    <Chip label={item.category} size="small" sx={{ bgcolor: '#e0e7ff', color: '#4338ca', fontWeight: 700, borderRadius: 1.5 }} />
                                                    <Chip
                                                        label={item.roadmap_priority}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{
                                                            borderColor: item.roadmap_priority === 'short-term' ? '#f59e0b' : '#10b981',
                                                            color: item.roadmap_priority === 'short-term' ? '#b45309' : '#047857',
                                                            fontWeight: 700,
                                                            borderRadius: 1.5
                                                        }}
                                                    />
                                                </Stack>
                                            </Box>
                                            <Divider />
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.75rem', mb: 2, letterSpacing: 1.5 }}>
                                                    The Rationale
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6 }}>
                                                    {item.importance_rationale}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Grid>

                                    {/* Right Side - Suggestions & Resources */}
                                    <Grid item xs={12} md={8} sx={{ p: 4 }}>
                                        <Grid container spacing={4}>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="subtitle2" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.75rem', mb: 2, letterSpacing: 1.5 }}>
                                                    Learning Suggestions
                                                </Typography>
                                                <List dense disablePadding>
                                                    {item.learning_suggestions?.map((suggestion, idx) => (
                                                        <ListItem key={idx} sx={{ px: 0, py: 0.75, alignItems: 'flex-start' }}>
                                                            <ListItemIcon sx={{ minWidth: 28, mt: 0.5 }}>
                                                                <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#10b981' }} />
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary={suggestion}
                                                                primaryTypographyProps={{ variant: 'body2', sx: { color: '#334155', fontWeight: 500 } }}
                                                            />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="subtitle2" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.75rem', mb: 2, letterSpacing: 1.5 }}>
                                                    Recommended Resources
                                                </Typography>
                                                <Stack spacing={2}>
                                                    {item.resources?.map((res, idx) => (
                                                        <Paper
                                                            key={idx}
                                                            variant="outlined"
                                                            sx={{
                                                                p: 1.5,
                                                                borderRadius: 3,
                                                                transition: 'all 0.2s',
                                                                '&:hover': { borderColor: '#6366f1', bgcolor: '#f5f3ff' }
                                                            }}
                                                        >
                                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                                <Avatar sx={{ bgcolor: 'white', border: '1px solid #e2e8f0', color: '#6366f1', width: 32, height: 32 }}>
                                                                    {res.type === 'course' ? <SchoolIcon fontSize="small" /> : res.type === 'book' ? <BookIcon fontSize="small" /> : <LanguageIcon fontSize="small" />}
                                                                </Avatar>
                                                                <Box sx={{ flex: 1 }}>
                                                                    <Typography variant="caption" fontWeight={800} color="text.secondary" display="block">
                                                                        {res.provider} • {res.cost}
                                                                    </Typography>
                                                                    <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                                                                        {res.name}
                                                                    </Typography>
                                                                </Box>
                                                                <IconButton size="small" component="a" href={res.url} target="_blank" sx={{ color: '#6366f1' }}>
                                                                    <LaunchIcon fontSize="small" />
                                                                </IconButton>
                                                            </Stack>
                                                        </Paper>
                                                    ))}
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Card>
                        </Grid>
                    ))}

                    {/* Footer */}
                    <Grid item xs={12} textAlign="center" sx={{ py: 6 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.8, fontWeight: 500 }}>
                            Analyzed by <strong>TrotixAI Skills Engine</strong> • Data as of {formatDate(timestamp)}
                        </Typography>
                    </Grid>
                </Grid>
            </Container>

            {/* Hidden Report for PDF Generation */}
            <SkillDevelopmentReport
                data={data}
                profile={profile}
                timestamp={timestamp}
            />
        </Box>
    );
};

export default SkillDevelopmentScreen;
