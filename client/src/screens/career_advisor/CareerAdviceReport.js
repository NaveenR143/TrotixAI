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
    Paper
} from "@mui/material";

const CareerAdviceReport = ({ data, profile, timestamp }) => {
    if (!data) return null;

    const { career_paths, skill_gaps, recommendations, action_plan } = data;

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
            id="career-advice-report"
            sx={{
                width: "210mm",
                bgcolor: "white",
                color: "black",
                position: "fixed",
                left: "-9999px",
                top: "-9999px",
                zIndex: -1000,
                fontFamily: "'Inter', 'Roboto', sans-serif",
                "& .report-section": {
                    mb: 6,
                    pageBreakInside: "avoid",
                    breakInside: "avoid",
                    width: "100%",
                }
            }}
        >
            {/* Header */}
            <Box className="report-section" sx={{ borderBottom: '4px solid #0f172a', pb: 2 }}>
                <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: -1, color: '#0f172a' }}>
                    Career Strategy Report
                </Typography>
                <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                        Prepared for: {profile?.personalDetails?.fullName || "Valued User"}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                        Date: {formatDate(timestamp)}
                    </Typography>
                </Stack>
            </Box>

            {/* Career Paths Section */}
            {career_paths && (
                <Box className="report-section">
                    <Typography variant="h5" fontWeight={800} sx={{ mb: 2, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 1 }}>
                        Target Career Path
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={4}>
                            <Box sx={{ p: 2, bgcolor: '#f1f5f9', borderRadius: 2, textAlign: 'center' }}>
                                <Typography variant="caption" fontWeight={800} color="text.secondary">CURRENT ROLE</Typography>
                                <Typography variant="body1" fontWeight={700}>{career_paths.current_role || "N/A"}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={4}>
                            <Box sx={{ p: 2, bgcolor: '#dbeafe', borderRadius: 2, textAlign: 'center', border: '1px solid #3b82f6' }}>
                                <Typography variant="caption" fontWeight={800} color="#1d4ed8">NEXT MILESTONE</Typography>
                                <Typography variant="body1" fontWeight={700} color="#1e40af">{career_paths.next_role || "N/A"}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={4}>
                            <Box sx={{ p: 2, bgcolor: '#0f172a', borderRadius: 2, textAlign: 'center', color: 'white' }}>
                                <Typography variant="caption" fontWeight={800} sx={{ opacity: 0.7 }}>LONG-TERM GOAL</Typography>
                                <Typography variant="body1" fontWeight={700}>{career_paths.future_role || "N/A"}</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            )}

            {/* Skill Gaps Section */}
            <Box className="report-section">
                <Typography variant="h5" fontWeight={800} sx={{ mb: 2, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Skill Gap Analysis
                </Typography>
                <TableContainer component={Box} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 800 }}>Skill</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 800 }}>Current Level</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 800 }}>Required Level</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 800 }}>Importance</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {skill_gaps?.map((skill, i) => (
                                <TableRow key={i}>
                                    <TableCell sx={{ fontWeight: 700 }}>{skill.skill}</TableCell>
                                    <TableCell align="center">{skill.current_level || "Beginner"}</TableCell>
                                    <TableCell align="center">{skill.required_level || "Advanced"}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>{skill.importance}/10</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Recommendations Section */}
            <Box className="report-section">
                <Typography variant="h5" fontWeight={800} sx={{ mb: 2, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Growth Recommendations
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={6}>
                        <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>Courses</Typography>
                        <Stack spacing={1}>
                            {recommendations?.courses?.map((c, i) => (
                                <Box key={i} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 1 }}>
                                    <Typography variant="body2" fontWeight={700}>{c.title}</Typography>
                                    <Typography variant="caption" color="text.secondary">{c.provider}</Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>Certifications</Typography>
                        <Stack spacing={1}>
                            {recommendations?.certifications?.map((c, i) => (
                                <Box key={i} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 1 }}>
                                    <Typography variant="body2" fontWeight={700}>{c.title}</Typography>
                                    <Typography variant="caption" color="text.secondary">{c.provider}</Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Grid>
                </Grid>
            </Box>

            {/* Action Plan Section */}
            <Box sx={{ mb: 2 }}>
                {action_plan?.map((item, i) => (
                    <Box key={i} className="report-section" sx={{ mb: 4 }}>
                        {i === 0 && (
                            <Typography variant="h5" fontWeight={800} sx={{ mb: 3, color: '#0f172a', textTransform: 'uppercase', letterSpacing: 1 }}>
                                Execution Action Plan
                            </Typography>
                        )}
                        <Box sx={{ p: 3, borderLeft: '4px solid #0f172a', bgcolor: '#f8fafc' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                <Typography variant="h6" fontWeight={800}>{item.phase}</Typography>
                                <Typography variant="subtitle2" fontWeight={700} color="primary">{item.timeline}</Typography>
                            </Stack>
                            <Typography variant="body1" sx={{ mb: 2 }}>{item.action}</Typography>
                            {item.resources?.length > 0 && (
                                <Box>
                                    <Typography variant="caption" fontWeight={800} color="text.secondary">RESOURCES:</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                        {item.resources.join(", ")}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* Footer */}
            <Box sx={{ mt: 8, textAlign: 'center', borderTop: '1px solid #e2e8f0', pt: 2, opacity: 0.6 }}>
                <Typography variant="caption" color="text.secondary">
                    Generated by TrotixAI Career Engine. Confidential Professional Report.
                </Typography>
            </Box>
        </Box>
    );
};

export default CareerAdviceReport;
