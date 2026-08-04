import React from "react";
import {
    Box,
    Grid,
    Typography,
    Divider,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    List,
    ListItem,
    ListItemText
} from "@mui/material";

const SkillDevelopmentReport = ({ data, profile, timestamp }) => {
    if (!data) return null;

    const { skills_analysis, industry } = data;

    // Sorting priorities order: immediate -> job-match -> future-ready -> long-term
    const priorityOrder = {
        'immediate': 1,
        'job-match': 2,
        'future-ready': 3,
        'long-term': 4,
        'short-term': 5
    };

    const sortedSkillsAnalysis = skills_analysis ? [...skills_analysis].sort((a, b) => {
        const pA = priorityOrder[a.roadmap_priority?.toLowerCase()] || 99;
        const pB = priorityOrder[b.roadmap_priority?.toLowerCase()] || 99;
        return pA - pB;
    }) : [];

    const getPriorityPdfStyle = (priority) => {
        const p = priority?.toLowerCase() || '';
        if (p === 'immediate') {
            return { bgcolor: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5' };
        }
        if (p === 'job-match') {
            return { bgcolor: '#eff6ff', color: '#1d4ed8', border: '1px solid #93c5fd' };
        }
        if (p === 'future-ready') {
            return { bgcolor: '#f5f3ff', color: '#6d28d9', border: '1px solid #c084fc' };
        }
        if (p === 'long-term') {
            return { bgcolor: '#f0fdf4', color: '#047857', border: '1px solid #6ee7b7' };
        }
        return { bgcolor: '#fef3c7', color: '#92400e', border: '1px solid #f59e0b' };
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Box
            id="skill-development-report"
            sx={{
                width: "210mm",
                bgcolor: "white",
                color: "black",
                position: "fixed",
                left: "-9999px",
                top: "-9999px",
                zIndex: -1000,
                fontFamily: "'Inter', 'Roboto', sans-serif",
                p: "20mm",
                "& .report-section": {
                    mb: 6,
                    pageBreakInside: "avoid",
                    breakInside: "avoid",
                    width: "100%",
                }
            }}
        >
            {/* Header */}
            <Box className="report-section" sx={{ borderBottom: '4px solid #6366f1', pb: 2 }}>
                <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: -1, color: '#0f172a' }}>
                    Skill Enhancement Report
                </Typography>
                <Typography variant="h6" color="#6366f1" fontWeight={600} sx={{ mt: 1 }}>
                    Industry: {industry || "General"}
                </Typography>
                <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" fontWeight={500} color="text.secondary">
                        Candidate: {profile?.personalDetails?.fullName || "Valued User"}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={500} color="text.secondary">
                        Generated on: {formatDate(timestamp)}
                    </Typography>
                </Stack>
            </Box>

            {/* Overview Section */}
            <Box className="report-section">
                <Typography variant="h5" fontWeight={700} sx={{ mb: 2, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Skill Analysis Overview
                </Typography>
                <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.6 }}>
                    This report identifies key skills required to stay competitive in the {industry || "your industry"} sector.
                    It provides rationales for each skill, practical learning suggestions, and curated resources
                    to accelerate your professional growth.
                </Typography>
            </Box>

            {/* Skills Details Section */}
            {sortedSkillsAnalysis?.map((item, index) => (
                <Box key={index} className="report-section" sx={{ border: '1px solid #e2e8f0', borderRadius: 3, p: 3, bgcolor: index % 2 === 0 ? '#f8fafc' : 'white' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                        <Box>
                            <Typography variant="h5" fontWeight={700} color="#0f172a">
                                {item.skill}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                <Typography variant="caption" sx={{ px: 1.5, py: 0.5, bgcolor: '#e0e7ff', color: '#4338ca', borderRadius: 1, fontWeight: 600, textTransform: 'uppercase' }}>
                                    {item.category}
                                </Typography>
                                <Typography variant="caption" sx={{ px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 600, textTransform: 'uppercase', ...getPriorityPdfStyle(item.roadmap_priority) }}>
                                    {item.roadmap_priority}
                                </Typography>
                            </Stack>
                        </Box>
                    </Stack>

                    <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.8rem', mb: 1, letterSpacing: 1 }}>
                        Why this matters
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: '#334155' }}>
                        {item.importance_rationale}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.8rem', mb: 1.5, letterSpacing: 1 }}>
                                Learning Path
                            </Typography>
                            <List dense disablePadding>
                                {item.learning_suggestions?.map((s, i) => (
                                    <ListItem key={i} sx={{ px: 0, py: 0.5 }}>
                                        <ListItemText
                                            primary={`• ${s}`}
                                            primaryTypographyProps={{ variant: 'body2', color: '#475569' }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.8rem', mb: 1.5, letterSpacing: 1 }}>
                                Curated Resources
                            </Typography>
                            <Stack spacing={1}>
                                {item.resources?.map((res, i) => (
                                    <Box key={i} sx={{ p: 1.5, border: '1px solid #e2e8f0', borderRadius: 2, bgcolor: 'white' }}>
                                        <Typography variant="caption" fontWeight={700} display="block" color="#6366f1">
                                            {res.type.toUpperCase()} • {res.provider}
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            {res.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {res.cost === 'free' ? '🆓 Free Resource' : '💰 Paid Resource'}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>
            ))}

            {/* Footer */}
            <Box sx={{ mt: 8, textAlign: 'center', borderTop: '1px solid #e2e8f0', pt: 2, opacity: 0.6 }}>
                <Typography variant="caption" color="text.secondary">
                    Generated by RightNxt AI Skills Engine. Confidential Skill Enhancement Roadmap.
                </Typography>
            </Box>
        </Box>
    );
};

export default SkillDevelopmentReport;
