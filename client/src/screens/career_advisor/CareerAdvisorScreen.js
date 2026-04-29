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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
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
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LinkIcon from "@mui/icons-material/Link";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as profileAPI from "../../api/profileAPI";
import CareerAdviceReport from "./CareerAdviceReport";

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

// Helper to get clean URL labels
const getUrlLabel = (url) => {
    if (!url) return "View Resource";
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.replace('www.', '');

        // Custom logic for known providers
        if (hostname.includes('coursera')) return "Visit coursera.org";
        if (hostname.includes('udemy')) return "Visit udemy.com";
        if (hostname.includes('udacity')) return "Visit udacity.com";
        if (hostname.includes('linkedin')) return "LinkedIn Profile";
        if (hostname.includes('github')) return "GitHub Repository";

        // Handle docs/official guides
        if (url.includes('docs') || url.includes('guide') || url.includes('documentation')) {
            return `Open ${hostname} docs`;
        }

        return `Visit ${hostname}`;
    } catch (e) {
        return "Open Link";
    }
};

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

    const [fullResponse, setFullResponse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [downloadingPDF, setDownloadingPDF] = useState(false);
    const [error, setError] = useState(null);

    const fetchCareerAdvice = async (isRegenerating = false) => {
        if (isRegenerating) setRefreshing(true);
        else setLoading(true);

        setError(null);

        try {
            const phone = profile?.personalDetails?.phone || user?.mobile || localStorage.getItem("mobile_number");
            const userId = profile?.id;

            if (!phone && !userId) {
                setError("Identifiers missing. Please log in again.");
                setLoading(false);
                setRefreshing(false);
                return;
            }

            let result = null;

            // Step 1: If not regenerating, try fetching existing advice first
            if (!isRegenerating) {
                const existingResult = await profileAPI.fetchExistingCareerAdvice(phone, userId);

                // Check if data is valid and not "none" or null
                if (!existingResult.error && existingResult.data && existingResult.data !== "none") {
                    const data = existingResult.data;
                    const innerData = data.data || data;
                    // Heuristic to check if it's actual career advice content
                    if (innerData && (innerData.career_paths || innerData.skill_gaps || innerData.recommendations)) {
                        result = existingResult;
                    }
                }
            }

            // Step 2: If no existing advice found or if we are regenerating, fetch/generate new advice
            if (!result) {
                result = await profileAPI.fetchCareerAdvice(phone, userId);
            }

            if (!result.error) {
                setFullResponse(result.data);
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

    const handleDownloadPDF = async () => {
        const reportContainer = document.getElementById("career-advice-report");
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
                    const margin = 20; // 20mm margin
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

                        // Check if section fits on current page
                        if (!firstPage && (currentY + imgHeight > pageHeight - margin)) {
                            pdf.addPage();
                            currentY = margin;
                        }

                        pdf.addImage(imgData, 'PNG', margin, currentY, contentWidth, imgHeight);
                        currentY += imgHeight + 10; // 10mm gap between sections
                        firstPage = false;
                    }

                    // Add Footer to the last page if there is space, or a new page
                    const footer = reportContainer.lastElementChild;
                    if (footer && !footer.classList.contains('report-section')) {
                        const footerCanvas = await html2canvas(footer, { scale: 2, backgroundColor: "#ffffff" });
                        const footerImgData = footerCanvas.toDataURL("image/png", 1.0);
                        const footerImgHeight = (footerCanvas.height * contentWidth) / footerCanvas.width;

                        if (currentY + footerImgHeight > pageHeight - margin) {
                            pdf.addPage();
                            currentY = margin;
                        }
                        pdf.addImage(footerImgData, 'PNG', margin, currentY, contentWidth, footerImgHeight);
                    }

                    const name = profile?.personalDetails?.fullName || "Career";
                    pdf.save(`CareerAdvice_${name.replace(/ /g, '_')}.pdf`);
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
        if (profile?.id) {
            fetchCareerAdvice();
        }
    }, [profile?.id, user?.mobile]);

    const isProfileIncomplete = !profile?.skills?.length || !profile?.experience?.length;

    if (loading) {
        return (
            <Box
                sx={{
                    bgcolor: "#f8fafc",
                    minHeight: "100vh",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3
                }}
            >
                <Container maxWidth="sm">
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 4, md: 6 },
                            textAlign: 'center',
                            borderRadius: 6,
                            border: '1px solid #e2e8f0',
                            bgcolor: 'white',
                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.05)'
                        }}
                    >
                        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 4 }}>
                            <CircularProgress
                                size={80}
                                thickness={4}
                                sx={{ color: '#0f172a' }}
                            />
                            <PsychologyIcon
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    fontSize: 32,
                                    color: '#94a3b8'
                                }}
                            />
                        </Box>

                        <Typography variant="h5" fontWeight={900} gutterBottom sx={{ letterSpacing: -0.5 }}>
                            Analyzing Your Potential...
                        </Typography>

                        <Typography variant="body1" color="text.secondary" sx={{ mt: 2, mb: 4, lineHeight: 1.6, fontSize: '1.05rem' }}>
                            Fetching personalized career recommendations and insights based on your profile. This may take a few moments.
                        </Typography>

                        <Box sx={{ width: '100%', mt: 2 }}>
                            <LinearProgress
                                sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    bgcolor: '#f1f5f9',
                                    '& .MuiLinearProgress-bar': {
                                        bgcolor: '#0f172a',
                                        borderRadius: 3
                                    }
                                }}
                            />
                        </Box>

                        <Typography variant="caption" sx={{ display: 'block', mt: 3, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                            🚀 Generating tailored career growth suggestions
                        </Typography>
                    </Paper>
                </Container>
            </Box>
        );
    }

    if (isProfileIncomplete && !fullResponse) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10, px: 2, bgcolor: "#f8fafc", minHeight: "100vh" }}>
                <Paper sx={{ p: 6, textAlign: 'center', maxWidth: 600, borderRadius: 6, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <Avatar sx={{ width: 80, height: 80, bgcolor: '#fee2e2', color: '#ef4444', mx: 'auto', mb: 3 }}>
                        <ErrorOutlineIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Typography variant="h5" fontWeight={800} gutterBottom>
                        Insufficient Profile Data
                    </Typography>
                    <Typography variant="body1" color="text.secondary" mb={4}>
                        Our AI Career Advisor needs more information about your skills and experience to provide a meaningful roadmap and recommendations.
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate("/resume-builder")}
                        sx={{ bgcolor: 'black', color: 'white', px: 4, py: 1.5, borderRadius: 3, fontWeight: 700, "&:hover": { bgcolor: '#333' } }}
                    >
                        Complete My Profile
                    </Button>
                </Paper>
            </Box>
        );
    }

    if (error && !fullResponse) {
        return (
            <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
                <Alert severity="error" variant="outlined" sx={{ borderRadius: 3, mb: 3, fontWeight: 600 }}>
                    {error}
                </Alert>
                <Button
                    startIcon={<RefreshIcon />}
                    variant="contained"
                    onClick={() => fetchCareerAdvice()}
                    sx={{ borderRadius: 3, bgcolor: 'black', color: 'white', px: 4 }}
                >
                    Retry Connection
                </Button>
            </Container>
        );
    }

    // Adapt based on whether fullResponse is the envelope or just the data
    const apiStatus = fullResponse?.status || "Success";
    const timestamp = fullResponse?.timestamp || new Date().toISOString();
    const careerData = fullResponse?.data || fullResponse || {};
    const { career_paths, skill_gaps, recommendations, action_plan } = careerData;

    return (
        <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", py: { xs: 2, md: 4 } }}>
            <Container maxWidth="lg">
                <Grid container spacing={3}>

                    {/* Status & Header */}
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 1 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                {/* <Chip
                                    icon={<CheckCircleOutlineIcon style={{ fontSize: 16, color: '#10b981' }} />}
                                    label={`API Status: ${apiStatus}`}
                                    size="small"
                                    sx={{
                                        bgcolor: '#ecfdf5',
                                        color: '#065f46',
                                        fontWeight: 700,
                                        border: '1px solid #10b981',
                                        fontSize: '0.75rem'
                                    }}
                                /> */}
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                                <AccessTimeIcon sx={{ fontSize: 14 }} />
                                <Typography variant="caption" fontWeight={600}>
                                    Generated on {formatDate(timestamp)}
                                </Typography>
                            </Stack>
                        </Box>

                        <Paper
                            sx={{
                                p: { xs: 3, md: 5 },
                                borderRadius: 6,
                                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                                color: "white",
                                position: "relative",
                                overflow: "hidden",
                                boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)"
                            }}
                        >
                            <Box sx={{ position: "relative", zIndex: 1 }}>
                                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={3}>
                                    <Box>
                                        <Typography variant="overline" sx={{ opacity: 0.7, letterSpacing: 3, fontWeight: 800 }}>
                                            PROFESSIONAL GROWTH ENGINE
                                        </Typography>
                                        <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: -1.5, mb: 1.5, lineHeight: 1 }}>
                                            Career Advisor
                                        </Typography>
                                        <Typography variant="body1" sx={{ opacity: 0.85, maxWidth: 650, fontSize: '1.1rem', fontWeight: 400 }}>
                                            Personalized career guidance based on your {profile?.skills?.length || 0} skills and {profile?.experience?.length || 0} experiences.
                                        </Typography>
                                    </Box>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                        <Button
                                            variant="outlined"
                                            disabled={downloadingPDF || loading || refreshing}
                                            onClick={handleDownloadPDF}
                                            startIcon={downloadingPDF ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />}
                                            sx={{
                                                color: "white",
                                                borderColor: "rgba(255,255,255,0.3)",
                                                px: 3,
                                                py: 1.5,
                                                borderRadius: 4,
                                                fontWeight: 700,
                                                textTransform: 'none',
                                                "&:hover": { bgcolor: "rgba(255,255,255,0.1)", borderColor: "white" }
                                            }}
                                        >
                                            {downloadingPDF ? "Preparing..." : "Export PDF Report"}
                                        </Button>
                                        <Button
                                            variant="contained"
                                            disabled={refreshing}
                                            onClick={() => fetchCareerAdvice(true)}
                                            startIcon={refreshing ? <CircularProgress size={22} color="inherit" /> : <AutoFixHighIcon />}
                                            sx={{
                                                bgcolor: "#3b82f6",
                                                color: "white",
                                                px: 4,
                                                py: 1.5,
                                                borderRadius: 4,
                                                fontWeight: 900,
                                                fontSize: '1rem',
                                                textTransform: 'none',
                                                boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.5)',
                                                "&:hover": { bgcolor: "#2563eb", transform: 'translateY(-2px)', boxShadow: '0 15px 25px -5px rgba(59, 130, 246, 0.6)' },
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {refreshing ? "Analyzing Profile..." : "Regenerate Analysis"}
                                        </Button>
                                    </Stack>
                                </Stack>
                            </Box>
                            <PsychologyIcon sx={{
                                position: "absolute",
                                right: -30,
                                bottom: -30,
                                fontSize: 240,
                                opacity: 0.04,
                                transform: "rotate(-10deg)"
                            }} />
                        </Paper>
                    </Grid>


                    {/* Skill Gaps Analysis */}
                    <Grid item xs={12} md={7}>
                        <Card sx={{ height: '100%', borderRadius: 6, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)" }}>
                            <CardContent sx={{ p: 4 }}>
                                <SectionTitle
                                    icon={<AssignmentIcon />}
                                    title="⚡ Skill Gap Analysis"
                                    subtitle="Detailed comparison of your current levels vs market requirements."
                                />
                                <TableContainer component={Box} sx={{ mt: 2 }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 800, borderBottom: '2px solid #f1f5f9' }}>Skill Name</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 800, borderBottom: '2px solid #f1f5f9' }}>Current</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 800, borderBottom: '2px solid #f1f5f9' }}>Required</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 800, borderBottom: '2px solid #f1f5f9' }}>Importance</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {skill_gaps?.length > 0 ? (
                                                skill_gaps.map((skill, index) => (
                                                    <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        <TableCell component="th" scope="row">
                                                            <Typography variant="body2" fontWeight={700}>{skill.skill}</Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Chip label={skill.current_level || "Beginner"} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Chip label={skill.required_level || "Advanced"} size="small" color="primary" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Box sx={{ width: 100, display: 'inline-block' }}>
                                                                <Tooltip title={`Importance: ${skill.importance}/10`}>
                                                                    <LinearProgress
                                                                        variant="determinate"
                                                                        value={(skill.importance || 0) * 10}
                                                                        sx={{
                                                                            height: 6,
                                                                            borderRadius: 3,
                                                                            bgcolor: '#f1f5f9',
                                                                            '& .MuiLinearProgress-bar': {
                                                                                bgcolor: skill.importance >= 8 ? '#ef4444' : skill.importance >= 5 ? '#f59e0b' : '#3b82f6',
                                                                                borderRadius: 3
                                                                            }
                                                                        }}
                                                                    />
                                                                </Tooltip>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                                        <Typography color="text.secondary">No major skill gaps identified based on your profile.</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                {/* <Box sx={{ mt: 3, textAlign: 'center', p: 2, bgcolor: '#f8fafc', borderRadius: 4, border: '1px dashed #cbd5e1' }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
                                        Not satisfied with these results? Rerun the AI engine.
                                    </Typography>
                                    <Button
                                        size="small"
                                        variant="text"
                                        disabled={refreshing}
                                        onClick={() => fetchCareerAdvice(true)}
                                        startIcon={<RefreshIcon />}
                                        sx={{ fontWeight: 800, color: '#3b82f6', "&:hover": { bgcolor: 'transparent', textDecoration: 'underline' } }}
                                    >
                                        Regenerate Analysis
                                    </Button>
                                </Box> */}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Recommendations */}
                    <Grid item xs={12} md={5}>
                        <Card sx={{ height: '100%', borderRadius: 6, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)" }}>
                            <CardContent sx={{ p: 4 }}>
                                <SectionTitle
                                    icon={<SchoolIcon />}
                                    title="📚 Recommendations"
                                    subtitle="Handpicked resources to accelerate your growth."
                                />
                                <Stack spacing={2.5}>
                                    {((recommendations?.courses?.length || 0) + (recommendations?.certifications?.length || 0)) > 0 ? (
                                        [...(recommendations?.courses || []), ...(recommendations?.certifications || [])].map((item, i) => (
                                            <Paper
                                                key={i}
                                                elevation={0}
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 4,
                                                    bgcolor: '#f8fafc',
                                                    border: '1px solid #f1f5f9',
                                                    transition: 'all 0.2s',
                                                    '&:hover': { borderColor: '#3b82f6', transform: 'scale(1.02)' }
                                                }}
                                            >
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Avatar sx={{ bgcolor: 'white', border: '1px solid #e2e8f0', color: 'black', width: 40, height: 40 }}>
                                                        {item.title?.toLowerCase().includes('cert') ? <AssignmentIcon fontSize="small" /> : <SchoolIcon fontSize="small" />}
                                                    </Avatar>
                                                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                                        <Typography variant="subtitle2" fontWeight={800} noWrap>
                                                            {item.title}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                            {item.provider}
                                                        </Typography>
                                                    </Box>
                                                    <IconButton
                                                        size="small"
                                                        component="a"
                                                        href={item.url}
                                                        target="_blank"
                                                        sx={{ bgcolor: '#eff6ff', color: '#3b82f6', '&:hover': { bgcolor: '#dbeafe' } }}
                                                    >
                                                        <LaunchIcon fontSize="small" />
                                                    </IconButton>
                                                </Stack>
                                            </Paper>
                                        ))
                                    ) : (
                                        <Box sx={{ textAlign: 'center', py: 4 }}>
                                            <Typography variant="body2" color="text.secondary">No recommendations available yet.</Typography>
                                        </Box>
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Action Plan */}
                    <Grid item xs={12}>
                        <Card sx={{ borderRadius: 6, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)" }}>
                            <CardContent sx={{ p: 4 }}>
                                <SectionTitle
                                    icon={<WorkIcon />}
                                    title="🚀 Action Plan"
                                    subtitle="A phase-by-phase execution strategy for your career goals."
                                />
                                <Box sx={{ mt: 2 }}>
                                    {action_plan?.length > 0 ? (
                                        action_plan.map((item, i) => (
                                            <Accordion
                                                key={i}
                                                disableGutters
                                                elevation={0}
                                                sx={{
                                                    mb: 2,
                                                    borderRadius: 4,
                                                    overflow: 'hidden',
                                                    border: '1px solid #f1f5f9',
                                                    '&:before': { display: 'none' },
                                                    '&.Mui-expanded': { boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }
                                                }}
                                            >
                                                <AccordionSummary
                                                    expandIcon={<ExpandMoreIcon />}
                                                    sx={{
                                                        bgcolor: '#f8fafc',
                                                        px: 3,
                                                        '&.Mui-expanded': { borderBottom: '1px solid #f1f5f9' }
                                                    }}
                                                >
                                                    <Stack direction="row" spacing={3} alignItems="center">
                                                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'black', fontSize: 14, fontWeight: 800 }}>
                                                            {i + 1}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography fontWeight={800} variant="subtitle1">{item.phase}</Typography>
                                                            {item.timeline && (
                                                                <Typography variant="caption" color="primary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                                                                    ⏳ {item.timeline}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </Stack>
                                                </AccordionSummary>
                                                <AccordionDetails sx={{ p: 4, bgcolor: 'white' }}>
                                                    <Grid container spacing={4}>
                                                        <Grid item xs={12} md={8}>
                                                            <Typography variant="subtitle2" fontWeight={800} color="text.secondary" gutterBottom sx={{ textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 1 }}>
                                                                Description & Actions
                                                            </Typography>
                                                            <Typography variant="body1" sx={{ lineHeight: 1.7, color: '#334155' }}>
                                                                {item.action}
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item xs={12} md={4}>
                                                            <Typography variant="subtitle2" fontWeight={800} color="text.secondary" gutterBottom sx={{ textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 1 }}>
                                                                Recommended Resources
                                                            </Typography>
                                                            <Stack spacing={1} sx={{ mt: 1 }}>
                                                                {item.resources?.length > 0 ? (
                                                                    item.resources.map((res, idx) => (
                                                                        <Button
                                                                            key={idx}
                                                                            variant="outlined"
                                                                            size="small"
                                                                            component="a"
                                                                            href={res}
                                                                            target="_blank"
                                                                            startIcon={<LinkIcon sx={{ fontSize: 14 }} />}
                                                                            sx={{
                                                                                justifyContent: 'flex-start',
                                                                                textTransform: 'none',
                                                                                borderRadius: 2,
                                                                                borderColor: '#e2e8f0',
                                                                                color: '#475569',
                                                                                fontWeight: 600,
                                                                                fontSize: '0.8rem',
                                                                                '&:hover': { bgcolor: '#f8fafc', borderColor: '#3b82f6' }
                                                                            }}
                                                                        >
                                                                            {getUrlLabel(res)}
                                                                        </Button>
                                                                    ))
                                                                ) : (
                                                                    <Typography variant="caption" color="text.secondary" italic>No specific resources for this phase.</Typography>
                                                                )}
                                                            </Stack>
                                                        </Grid>
                                                    </Grid>
                                                </AccordionDetails>
                                            </Accordion>
                                        ))
                                    ) : (
                                        <Typography color="text.secondary" align="center">Action plan is being prepared...</Typography>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Footer Info */}
                    <Grid item xs={12} textAlign="center" sx={{ py: 4 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.8, fontWeight: 500 }}>
                            Generated by <strong>TrotixAI Career Engine</strong>. Recommendations are dynamic and evolve with your profile updates.
                        </Typography>
                    </Grid>

                </Grid>
            </Container>

            {/* Hidden Report for PDF Generation */}
            <CareerAdviceReport
                data={careerData}
                profile={profile}
                timestamp={timestamp}
            />
        </Box>
    );
};

export default CareerAdvisorDashboard;