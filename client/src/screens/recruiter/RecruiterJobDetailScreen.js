// screens/recruiter/RecruiterJobDetailScreen.js
import React, { useState } from "react";
import {
    Box,
    Typography,
    Button,
    Chip,
    Avatar,
    IconButton,
    Stack,
    Grid,
    Paper,
    Container,
    useMediaQuery,
    useTheme,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Menu,
    MenuItem,
    Tooltip,
    Alert,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import WorkIcon from "@mui/icons-material/Work";
import GroupIcon from "@mui/icons-material/Group";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SharedIcon from "@mui/icons-material/Share";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import DateRangeIcon from "@mui/icons-material/DateRange";
import SchoolIcon from "@mui/icons-material/School";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LinkIcon from "@mui/icons-material/Link";
import { useNavigate } from "react-router-dom";
import { fadeSlideUp } from "../../utils/themeUtils";

const RecruiterJobDetailScreen = ({ jobId, jobData, onBack }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [viewingApplicants, setViewingApplicants] = useState(false);

    const [job, setJob] = useState(null);

    React.useEffect(() => {
        if (jobData) {
            setJob({
                id: jobData.id,
                title: jobData.title,
                company: jobData.company?.name,
                location: jobData.location,
                workMode: jobData.work_mode,
                salary: jobData.salary_min && jobData.salary_max ? `$${jobData.salary_min} – $${jobData.salary_max}` : (jobData.salary_min ? `$${jobData.salary_min}` : null),
                type: jobData.job_type,
                experience: jobData.experience_min_yrs !== null && jobData.experience_max_yrs !== null ? `${jobData.experience_min_yrs}–${jobData.experience_max_yrs} yrs` : (jobData.experience_min_yrs !== null ? `${jobData.experience_min_yrs}+ yrs` : null),
                department: jobData.department?.name,
                posted: jobData.posted_at ? new Date(jobData.posted_at).toLocaleDateString() : null,
                openings: jobData.openings,
                applicants: jobData.apply_count,
                applicantsTrend: null,
                status: jobData.status === "active" ? "Active" : jobData.status,
                description: jobData.description,
                logoColor: "#6366f1",
                about: jobData.company?.description,
                requiredSkills: jobData.required_skills,
                preferredSkills: jobData.preferred_skills,
                benefits: jobData.benefits,
            });
        }
    }, [jobData]);

    const [anchorEl, setAnchorEl] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);

    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleEdit = () => {
        handleMenuClose();
        navigate(`/edit-job/${jobId}`, { state: { job: jobData } });
    };

    const handleShare = () => {
        handleMenuClose();
        setShareDialogOpen(true);
    };

    const handleDelete = () => {
        handleMenuClose();
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setDeleteDialogOpen(false);
        // Implement delete API call if needed
        console.log("Delete job:", jobId);
    };

    const handleViewApplicants = () => {
        navigate(`/job-applicants/${jobId}`, { state: { jobTitle: job.title } });
    };

    const handleAISearch = () => {
        navigate(`/candidate-feed/${jobId}`, { state: { jobTitle: job.title } });
    };

    // Helper component for section headers with icons
    const SectionHeader = ({ icon: Icon, title, accent = "#2563EB" }) => (
        <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <Icon sx={{ color: "#111827", fontSize: 22 }} />
                <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#111827", letterSpacing: "-0.02em" }}>
                    {title}
                </Typography>
            </Box>
            <Box sx={{ width: 40, height: 3, bgcolor: accent, borderRadius: 1 }} />
        </Box>
    );

    // Action button component
    const ActionButton = ({ icon: Icon, label, onClick, variant = "outlined", color = "primary" }) => (
        <Button
            startIcon={<Icon />}
            onClick={onClick}
            fullWidth
            variant={variant}
            sx={{
                fontWeight: 800,
                borderRadius: '12px',
                textTransform: "none",
                py: 1.5,
                fontSize: "0.95rem",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                ...(variant === "contained" && {
                    bgcolor: "#2563EB",
                    boxShadow: "0 8px 20px rgba(37, 99, 235, 0.2)",
                    '&:hover': {
                        bgcolor: "#1e40af",
                        boxShadow: "0 10px 25px rgba(37, 99, 235, 0.3)",
                        transform: "translateY(-2px)",
                    },
                }),
                ...(variant === "outlined" && {
                    borderColor: "#E5E7EB",
                    color: "#111827",
                    bgcolor: "#FFFFFF",
                    '&:hover': {
                        borderColor: "#2563EB",
                        color: "#2563EB",
                        bgcolor: "#eff6ff",
                        transform: "translateY(-2px)",
                    },
                }),
            }}
        >
            {label}
        </Button>
    );

    // Skill chip component
    const SkillChip = ({ skill, variant = "required" }) => (
        <Chip
            label={skill}
            sx={{
                fontWeight: 700,
                fontSize: "0.85rem",
                borderRadius: '10px',
                px: 1,
                ...(variant === "required" && {
                    bgcolor: "#eff6ff",
                    color: "#2563EB",
                    border: "1px solid #bfdbfe",
                }),
                ...(variant === "preferred" && {
                    bgcolor: "#F8FAFC",
                    color: "#64748b",
                    border: "1px solid #E5E7EB",
                }),
            }}
        />
    );

    if (!job) return null;

    return (
        <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", pb: 8 }}>
            {/* Top Navigation */}
            <Box sx={{ bgcolor: "#FFFFFF", borderBottom: "1px solid #E5E7EB", position: 'sticky', top: 0, zIndex: 1000 }}>
                <Container maxWidth="lg">
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.5 }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <IconButton onClick={onBack} size="small" sx={{ color: '#6B7280' }}>
                                <ArrowBackIcon />
                            </IconButton>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
                                Job Details
                            </Typography>
                        </Stack>
                        
                        <Stack direction="row" spacing={1}>
                            <IconButton onClick={handleMenuOpen} size="small" sx={{ border: "1px solid #E5E7EB", borderRadius: '10px' }}>
                                <MoreVertIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ pt: 4 }}>
                <Grid container spacing={4}>
                    {/* Main Content */}
                    <Grid item xs={12} md={8}>
                        {/* Job Header Card */}
                        <Paper elevation={0} sx={{ p: 4, mb: 4, position: 'relative', overflow: 'hidden' }}>
                            <Box sx={{ display: "flex", gap: 4, alignItems: "flex-start", mb: 4 }}>
                                <Avatar
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        background: `linear-gradient(135deg, ${job.logoColor || '#2563EB'}, #4f46e5)`,
                                        fontSize: "1.8rem",
                                        fontWeight: 800,
                                        borderRadius: '20px',
                                        boxShadow: "0 8px 25px rgba(37, 99, 235, 0.15)",
                                    }}
                                >
                                    {job.company?.[0]}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 900, color: "#111827", letterSpacing: "-0.03em", mb: 0.5 }}>
                                        {job.title}
                                    </Typography>
                                    <Typography variant="h6" sx={{ color: "#2563EB", fontWeight: 700, mb: 2 }}>
                                        {job.company}
                                    </Typography>
                                    <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
                                        <Chip 
                                            icon={<LocationOnIcon sx={{ fontSize: '16px !important' }} />} 
                                            label={job.location} 
                                            variant="outlined" 
                                            sx={{ borderRadius: '8px', fontWeight: 600, color: '#64748B', borderColor: '#E5E7EB' }} 
                                        />
                                        <Chip 
                                            icon={<WorkIcon sx={{ fontSize: '16px !important' }} />} 
                                            label={job.type} 
                                            variant="outlined" 
                                            sx={{ borderRadius: '8px', fontWeight: 600, color: '#64748B', borderColor: '#E5E7EB' }} 
                                        />
                                        {job.salary && (
                                            <Chip label={job.salary} sx={{ borderRadius: '8px', fontWeight: 800, bgcolor: '#dcfce7', color: '#16a34a' }} />
                                        )}
                                    </Stack>
                                </Box>
                            </Box>
                        </Paper>

                        {/* Description Section */}
                        <Paper elevation={0} sx={{ p: 4, mb: 4 }}>
                            <SectionHeader icon={AssignmentIcon} title="Job Description" accent="#22D3EE" />
                            <Typography
                                component="div"
                                sx={{
                                    color: "#475569",
                                    lineHeight: 1.8,
                                    fontSize: "1rem",
                                    wordBreak: 'break-word',
                                    overflowWrap: 'anywhere',
                                    '& p': { margin: '0 0 1.2em 0' },
                                    '& ul': { margin: '0 0 1.2em 0', paddingLeft: '1.5em' },
                                    '& li': { marginBottom: '0.6em' },
                                    '& img': { maxWidth: '100%', height: 'auto', borderRadius: '8px' }
                                }}
                                dangerouslySetInnerHTML={{ __html: job.description }}
                            />
                        </Paper>

                        {/* Skills Sections */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={6}>
                                <Paper elevation={0} sx={{ p: 4, height: '100%' }}>
                                    <SectionHeader icon={CheckCircleIcon} title="Required Skills" />
                                    <Stack direction="row" flexWrap="wrap" gap={1}>
                                        {job.requiredSkills?.map((skill, idx) => (
                                            <SkillChip key={idx} skill={skill} variant="required" />
                                        ))}
                                    </Stack>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Paper elevation={0} sx={{ p: 4, height: '100%' }}>
                                    <SectionHeader icon={SchoolIcon} title="Preferred Skills" accent="#7C3AED" />
                                    <Stack direction="row" flexWrap="wrap" gap={1}>
                                        {job.preferredSkills?.map((skill, idx) => (
                                            <SkillChip key={idx} skill={skill} variant="preferred" />
                                        ))}
                                    </Stack>
                                </Paper>
                            </Grid>
                        </Grid>

                        {/* Benefits Section */}
                        {job.benefits?.length > 0 && (
                            <Paper elevation={0} sx={{ p: 4 }}>
                                <SectionHeader icon={TrendingUpIcon} title="Benefits & Perks" accent="#10B981" />
                                <Grid container spacing={2}>
                                    {job.benefits.map((benefit, idx) => (
                                        <Grid item xs={12} sm={6} key={idx}>
                                            <Box sx={{ p: 2, bgcolor: "#F8FAFC", borderRadius: '12px', border: "1px solid #E5E7EB", display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <CheckCircleIcon sx={{ color: "#10B981", fontSize: 20 }} />
                                                <Typography sx={{ fontWeight: 700, color: "#111827" }}>{benefit}</Typography>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Paper>
                        )}
                    </Grid>

                    {/* Sidebar */}
                    <Grid item xs={12} md={4}>
                        <Stack spacing={4} sx={{ position: { md: 'sticky' }, top: 100 }}>
                            {/* Actions Card */}
                            <Paper elevation={0} sx={{ p: 4 }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Actions</Typography>
                                <Stack spacing={2}>
                                    <ActionButton
                                        icon={GroupIcon}
                                        label="View Applicants"
                                        onClick={handleViewApplicants}
                                        variant="contained"
                                    />
                                    <ActionButton
                                        icon={SmartToyIcon}
                                        label="Find with AI Match"
                                        onClick={handleAISearch}
                                        variant="outlined"
                                    />
                                </Stack>
                            </Paper>

                            {/* Stats Card */}
                            <Paper elevation={0} sx={{ p: 4 }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Recruitment Stats</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderRadius: '16px', textAlign: 'center' }}>
                                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#2563EB' }}>{job.applicants || 0}</Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Applied</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderRadius: '16px', textAlign: 'center' }}>
                                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827' }}>{job.openings || 1}</Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>Openings</Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* Job Info Card */}
                            <Paper elevation={0} sx={{ p: 4 }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Job Information</Typography>
                                <Stack spacing={3}>
                                    <Box>
                                        <Typography variant="caption" sx={{ display: 'block', color: '#6B7280', mb: 0.5, fontWeight: 600 }}>STATUS</Typography>
                                        <Chip 
                                            label={job.status} 
                                            sx={{ 
                                                fontWeight: 800, 
                                                bgcolor: job.status?.toLowerCase() === 'active' ? '#dcfce7' : '#fef2f2',
                                                color: job.status?.toLowerCase() === 'active' ? '#16a34a' : '#ef4444',
                                                borderRadius: '8px'
                                            }} 
                                        />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ display: 'block', color: '#6B7280', mb: 0.5, fontWeight: 600 }}>POSTED ON</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{job.posted}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ display: 'block', color: '#6B7280', mb: 0.5, fontWeight: 600 }}>EXPERIENCE</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{job.experience}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ display: 'block', color: '#6B7280', mb: 0.5, fontWeight: 600 }}>DEPARTMENT</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{job.department || "Engineering"}</Typography>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Stack>
                    </Grid>
                </Grid>
            </Container>

            {/* Menu & Dialogs (Keep existing logic) */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    elevation: 0,
                    sx: { mt: 1, border: "1px solid #E5E7EB", boxShadow: "0 12px 30px rgba(0,0,0,0.1)", borderRadius: '12px', minWidth: 180, p: 1 }
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
                <MenuItem onClick={handleEdit} sx={{ borderRadius: '8px', py: 1.2 }}><EditIcon sx={{ mr: 1.5, fontSize: 18 }} /> Edit Job</MenuItem>
                <MenuItem onClick={handleShare} sx={{ borderRadius: '8px', py: 1.2 }}><SharedIcon sx={{ mr: 1.5, fontSize: 18 }} /> Share</MenuItem>
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={handleDelete} sx={{ borderRadius: '8px', py: 1.2, color: '#ef4444' }}><DeleteIcon sx={{ mr: 1.5, fontSize: 18 }} /> Delete</MenuItem>
            </Menu>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: '16px' } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>Delete Job Posting?</DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: '#475569' }}>This will permanently remove the job and all associated applicant data.</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} sx={{ fontWeight: 700, color: '#6B7280' }}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} variant="contained" color="error" sx={{ fontWeight: 800, borderRadius: '10px' }}>Delete Forever</Button>
                </DialogActions>
            </Dialog>

            {/* Share Dialog */}
            <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} PaperProps={{ sx: { borderRadius: '16px', minWidth: 320 } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>Share Job</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <Button fullWidth variant="outlined" startIcon={<LinkIcon />} onClick={() => { navigator.clipboard.writeText(window.location.href); setShareDialogOpen(false); }} sx={{ borderRadius: '10px', fontWeight: 700, py: 1.2 }}>Copy Link</Button>
                        <Button fullWidth variant="outlined" sx={{ borderRadius: '10px', fontWeight: 700, py: 1.2 }}>LinkedIn</Button>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}><Button onClick={() => setShareDialogOpen(false)}>Close</Button></DialogActions>
            </Dialog>
        </Box>
    );
};

export default RecruiterJobDetailScreen;
