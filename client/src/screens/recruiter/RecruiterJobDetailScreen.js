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
import ApplicantsScreen from "./ApplicantsScreen";

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
    const [editMode, setEditMode] = useState(false);

    // Helper component for section headers with icons
    const SectionHeader = ({ icon: Icon, title }) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
            <Box
                sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                <Icon sx={{ color: "#fff", fontSize: 22 }} />
            </Box>
            <Typography
                sx={{
                    fontWeight: 800,
                    fontSize: "1.1rem",
                    color: "#0f172a",
                    letterSpacing: "-0.02em",
                }}
            >
                {title}
            </Typography>
        </Box>
    );

    // Action button component
    const ActionButton = ({ icon: Icon, label, onClick, variant = "outlined", color = "primary" }) => (
        <Button
            startIcon={<Icon />}
            onClick={onClick}
            fullWidth={isMobile}
            variant={variant}
            color={color}
            sx={{
                fontWeight: 700,
                borderRadius: 2,
                textTransform: "none",
                py: isMobile ? 1.5 : 1,
                fontSize: "0.95rem",
                transition: "all 0.3s ease",
                ...(variant === "contained" && {
                    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                    boxShadow: "0 4px 15px rgba(99, 102, 241, 0.3)",
                    "&:hover": {
                        background: "linear-gradient(135deg, #4f46e5, #4338ca)",
                        boxShadow: "0 6px 20px rgba(99, 102, 241, 0.4)",
                        transform: "translateY(-2px)",
                    },
                }),
                ...(variant === "outlined" && {
                    borderColor: "#e2e8f0",
                    color: "#475569",
                    "&:hover": {
                        borderColor: "#6366f1",
                        color: "#6366f1",
                        bgcolor: "#f8f8ff",
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
            variant={variant === "required" ? "filled" : "outlined"}
            sx={{
                fontWeight: 600,
                fontSize: "0.85rem",
                borderRadius: 1.5,
                ...(variant === "required" && {
                    bgcolor: "#e0e7ff",
                    color: "#4f46e5",
                    borderColor: "transparent",
                }),
                ...(variant === "preferred" && {
                    bgcolor: "transparent",
                    color: "#64748b",
                    borderColor: "#cbd5e1",
                }),
            }}
        />
    );

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEdit = () => {
        handleMenuClose();
        setEditMode(true);
    };

    const handleDelete = () => {
        handleMenuClose();
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        setDeleteDialogOpen(false);
        onBack(); // Navigate back to jobs list after deletion
    };

    const handleShare = () => {
        setShareDialogOpen(true);
    };

    const handleViewApplicants = () => {
        setViewingApplicants(true);
    };

    const handleAISearch = () => {
        navigate(`/candidate-feed/${job.id}`, { state: { jobTitle: job.title } });
    };

    if (viewingApplicants) {
        return (
            <ApplicantsScreen
                jobId={job?.id}
                jobTitle={job?.title}
                onBack={() => setViewingApplicants(false)}
            />
        );
    }

    if (!job) {
        return null;
    }

    return (
        <Box
            sx={{
                bgcolor: "#f8fafc",
                minHeight: "100vh",
                pb: { xs: 8, md: 4 },
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    bgcolor: "#fff",
                    borderBottom: "1px solid #e2e8f0",
                    sticky: 0,
                    top: 0,
                    zIndex: 10,
                }}
            >
                <Container maxWidth="lg">
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            py: 2,
                        }}
                    >
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={onBack}
                            sx={{
                                color: "#64748b",
                                fontWeight: 600,
                                textTransform: "none",
                                "&:hover": { color: "#0f172a", bgcolor: "transparent" },
                            }}
                        >
                            Back to Jobs
                        </Button>
                        <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "1rem" }}>
                            Job Details
                        </Typography>
                        <Box>
                            <IconButton
                                onClick={handleMenuOpen}
                                size="small"
                                sx={{
                                    border: "1px solid #e2e8f0",
                                    borderRadius: 1.5,
                                    "&:hover": { bgcolor: "#f8fafc" },
                                }}
                            >
                                <MoreVertIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
                <Grid container spacing={3}>
                    {/* Main Content */}
                    <Grid item xs={12} md={8}>
                        {/* Status Alert */}
                        {job.status === "Active" && (
                            <Alert
                                severity="success"
                                sx={{
                                    mb: 3,
                                    borderRadius: 2,
                                    border: "1px solid #a7f3d0",
                                    bgcolor: "#ecfdf5",
                                }}
                            >
                                <strong>Job is Active:</strong> Applications are currently being accepted
                            </Alert>
                        )}

                        {/* Job Header Section */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 3, md: 4 },
                                bgcolor: "#fff",
                                border: "1px solid #e2e8f0",
                                borderRadius: 3,
                                mb: 3,
                                animation: `${fadeSlideUp} 0.5s ease-out`,
                            }}
                        >
                            <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", mb: 3 }}>
                                <Avatar
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        bgcolor: job.logoColor || "#6366f1",
                                        fontSize: "2rem",
                                        fontWeight: 700,
                                        borderRadius: 2,
                                        boxShadow: "0 4px 12px rgba(99, 102, 241, 0.15)",
                                    }}
                                >
                                    {job.company?.[0]}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    {job.title && (
                                        <Typography
                                            sx={{
                                                fontWeight: 900,
                                                fontSize: { xs: "1.6rem", md: "2rem" },
                                                color: "#0f172a",
                                                letterSpacing: "-0.02em",
                                                mb: 0.5,
                                                lineHeight: 1.2,
                                            }}
                                        >
                                            {job.title}
                                        </Typography>
                                    )}
                                    {job.company && (
                                        <Typography
                                            sx={{
                                                fontSize: "1.1rem",
                                                color: "#6366f1",
                                                fontWeight: 700,
                                                mb: 1,
                                            }}
                                        >
                                            {job.company}
                                        </Typography>
                                    )}
                                    {job.about && (
                                        <Typography sx={{ color: "#64748b", fontSize: "0.95rem" }}>
                                            {job.about}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>

                            {/* Metadata */}
                            <Stack
                                direction="row"
                                spacing={2}
                                sx={{
                                    flexWrap: "wrap",
                                    gap: 2,
                                    "& > *": { flexShrink: 0 },
                                }}
                            >
                                {job.location && (
                                    <Chip
                                        icon={<LocationOnIcon sx={{ fontSize: "1rem !important" }} />}
                                        label={job.location}
                                        variant="outlined"
                                        sx={{
                                            borderColor: "#e2e8f0",
                                            color: "#475569",
                                            fontWeight: 600,
                                            fontSize: "0.9rem",
                                            borderRadius: 2,
                                        }}
                                    />
                                )}
                                {(job.type || job.workMode) && (
                                    <Chip
                                        icon={<WorkIcon sx={{ fontSize: "1rem !important" }} />}
                                        label={[job.type, job.workMode].filter(Boolean).join(' • ')}
                                        variant="outlined"
                                        sx={{
                                            borderColor: "#e2e8f0",
                                            color: "#475569",
                                            fontWeight: 600,
                                            fontSize: "0.9rem",
                                            borderRadius: 2,
                                        }}
                                    />
                                )}
                                {job.salary && (
                                    <Chip
                                        label={job.salary}
                                        sx={{
                                            bgcolor: "#ecfdf5",
                                            color: "#047857",
                                            fontWeight: 700,
                                            borderRadius: 2,
                                            fontSize: "0.9rem",
                                        }}
                                    />
                                )}
                                {job.status && (
                                    <Chip
                                        label={job.status}
                                        sx={{
                                            bgcolor: "#e0e7ff",
                                            color: "#4f46e5",
                                            fontWeight: 700,
                                            borderRadius: 2,
                                            fontSize: "0.9rem",
                                            textTransform: 'capitalize'
                                        }}
                                    />
                                )}
                            </Stack>
                        </Paper>

                        {/* Key Metrics */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            {job.applicants !== undefined && job.applicants !== null && (
                                <Grid item xs={12} sm={6}>
                                    <Paper
                                        elevation={0}
                                        onClick={handleViewApplicants}
                                        sx={{
                                            p: 3,
                                            bgcolor: "#fff",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: 3,
                                            textAlign: "center",
                                            cursor: "pointer",
                                            transition: "all 0.2s",
                                            "&:hover": {
                                                borderColor: "#c7d2fe",
                                                boxShadow: "0 10px 25px rgba(99, 102, 241, 0.05)",
                                                transform: "translateY(-2px)",
                                            },
                                        }}
                                    >
                                        <GroupIcon sx={{ color: "#6366f1", fontSize: 32, mb: 1 }} />
                                        <Typography sx={{ color: "#64748b", fontSize: "0.85rem", mb: 0.5 }}>
                                            Total Applicants
                                        </Typography>
                                        <Typography sx={{ fontSize: "1.8rem", fontWeight: 900, color: "#0f172a" }}>
                                            {job.applicants}
                                        </Typography>
                                        {job.applicantsTrend && (
                                            <Typography sx={{ fontSize: "0.75rem", color: "#10b981", fontWeight: 600 }}>
                                                {job.applicantsTrend}
                                            </Typography>
                                        )}
                                    </Paper>
                                </Grid>
                            )}
                            {job.openings !== undefined && job.openings !== null && (
                                <Grid item xs={12} sm={6}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            bgcolor: "#fff",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: 3,
                                            textAlign: "center",
                                        }}
                                    >
                                        <TrendingUpIcon sx={{ color: "#6366f1", fontSize: 32, mb: 1 }} />
                                        <Typography sx={{ color: "#64748b", fontSize: "0.85rem", mb: 0.5 }}>
                                            Open Positions
                                        </Typography>
                                        <Typography sx={{ fontSize: "1.8rem", fontWeight: 900, color: "#0f172a" }}>
                                            {job.openings}
                                        </Typography>
                                        <Typography sx={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
                                            To fill
                                        </Typography>
                                    </Paper>
                                </Grid>
                            )}
                        </Grid>

                        {/* Job Description */}
                        {job.description && (
                            <Paper
                                elevation={0}
                                sx={{
                                    p: { xs: 3, md: 4 },
                                    bgcolor: "#fff",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: 3,
                                    mb: 3,
                                }}
                            >
                                <SectionHeader icon={AssignmentIcon} title="Job Description" />
                                <Typography
                                    sx={{
                                        color: "#475569",
                                        lineHeight: 1.8,
                                        fontSize: "0.95rem",
                                        wordWrap: "break-word",
                                        overflowWrap: "break-word",
                                        '& p': { margin: '0 0 1em 0' },
                                        '& ul': { margin: '0 0 1em 0', paddingLeft: '1.5em' },
                                        '& li': { marginBottom: '0.5em' },
                                        '& a': { wordBreak: 'break-all' }
                                    }}
                                    dangerouslySetInnerHTML={{ __html: job.description.replace(/&nbsp;/g, ' ') }}
                                />
                            </Paper>
                        )}

                        {/* Required Skills */}
                        {job.requiredSkills && job.requiredSkills.length > 0 && (
                            <Paper
                                elevation={0}
                                sx={{
                                    p: { xs: 3, md: 4 },
                                    bgcolor: "#fff",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: 3,
                                    mb: 3,
                                }}
                            >
                                <SectionHeader icon={CheckCircleIcon} title="Required Skills" />
                                <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ gap: 1.5 }}>
                                    {job.requiredSkills.map((skill, idx) => (
                                        <SkillChip key={idx} skill={skill} variant="required" />
                                    ))}
                                </Stack>
                            </Paper>
                        )}

                        {/* Preferred Skills */}
                        {job.preferredSkills && job.preferredSkills.length > 0 && (
                            <Paper
                                elevation={0}
                                sx={{
                                    p: { xs: 3, md: 4 },
                                    bgcolor: "#fff",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: 3,
                                    mb: 3,
                                }}
                            >
                                <SectionHeader icon={SchoolIcon} title="Preferred Skills" />
                                <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ gap: 1.5 }}>
                                    {job.preferredSkills.map((skill, idx) => (
                                        <SkillChip key={idx} skill={skill} variant="preferred" />
                                    ))}
                                </Stack>
                            </Paper>
                        )}

                        {/* Benefits */}
                        {job.benefits && job.benefits.length > 0 && (
                            <Paper
                                elevation={0}
                                sx={{
                                    p: { xs: 3, md: 4 },
                                    bgcolor: "#fff",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: 3,
                                }}
                            >
                                <SectionHeader icon={TrendingUpIcon} title="Benefits & Perks" />
                                <Grid container spacing={2}>
                                    {job.benefits.map((benefit, idx) => (
                                        <Grid item xs={12} sm={6} key={idx}>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1.5,
                                                    p: 1.5,
                                                    bgcolor: "#f8fafc",
                                                    borderRadius: 2,
                                                    border: "1px solid #e2e8f0",
                                                }}
                                            >
                                                <CheckCircleIcon
                                                    sx={{ color: "#10b981", fontWeight: 700, fontSize: 20 }}
                                                />
                                                <Typography sx={{ fontWeight: 600, color: "#0f172a" }}>
                                                    {benefit}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Paper>
                        )}
                    </Grid>

                    {/* Sidebar */}
                    <Grid item xs={12} md={4}>
                        {/* Action Buttons */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 3, md: 3 },
                                bgcolor: "#fff",
                                border: "1px solid #e2e8f0",
                                borderRadius: 3,
                                mb: 3,
                                position: { xs: "fixed", md: "relative" },
                                bottom: { xs: 0, md: "auto" },
                                left: { xs: 0, md: "auto" },
                                right: { xs: 0, md: "auto" },
                                width: { xs: "100%", md: "auto" },
                                borderRadius: { xs: "24px 24px 0 0", md: 3 },
                                zIndex: 20,
                            }}
                        >
                            <Stack spacing={2.5}>
                                <ActionButton
                                    icon={GroupIcon}
                                    label="View Applied Applicants"
                                    onClick={handleViewApplicants}
                                    variant="contained"
                                />
                                <ActionButton
                                    icon={SmartToyIcon}
                                    label="Find Applicants with AI"
                                    onClick={handleAISearch}
                                    variant="outlined"
                                />
                            </Stack>
                        </Paper>

                        {/* Job Info Card */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                bgcolor: "#fff",
                                border: "1px solid #e2e8f0",
                                borderRadius: 3,
                                mb: { xs: 0, md: 3 },
                            }}
                        >
                            <Typography sx={{ fontWeight: 800, color: "#0f172a", mb: 2 }}>
                                Job Information
                            </Typography>
                            <Stack spacing={2}>
                                {[
                                    { label: "Job Type", value: job.type },
                                    { label: "Experience Level", value: job.experience },
                                    { label: "Department", value: job.department },
                                    { label: "Posted Date", value: job.posted }
                                ].filter(field => field.value).map((field, index, array) => (
                                    <React.Fragment key={field.label}>
                                        <Box>
                                            <Typography sx={{ fontSize: "0.8rem", color: "#64748b", mb: 0.5 }}>
                                                {field.label}
                                            </Typography>
                                            <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                                                {field.value}
                                            </Typography>
                                        </Box>
                                        {index < array.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        mt: 1,
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                        borderRadius: 2,
                        minWidth: 180,
                    },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
                <MenuItem onClick={handleEdit} sx={{ py: 1.5 }}>
                    <EditIcon fontSize="small" sx={{ mr: 1.5 }} /> Edit Job
                </MenuItem>
                <MenuItem onClick={handleShare} sx={{ py: 1.5 }}>
                    <SharedIcon fontSize="small" sx={{ mr: 1.5 }} /> Share Job
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem onClick={handleDelete} sx={{ py: 1.5, color: "#ef4444" }}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} /> Delete Job
                </MenuItem>
            </Menu>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle sx={{ fontWeight: 800, color: "#0f172a" }}>Delete Job?</DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: "#475569", mt: 1 }}>
                        Are you sure you want to delete this job posting? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} sx={{ textTransform: "none" }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        variant="contained"
                        color="error"
                        sx={{
                            textTransform: "none",
                            fontWeight: 700,
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Share Dialog */}
            <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
                <DialogTitle sx={{ fontWeight: 800, color: "#0f172a" }}>Share Job Posting</DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: "#475569", mb: 2, mt: 1 }}>
                        Share this job posting with your network:
                    </Typography>
                    <Stack spacing={1.5}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<LinkIcon />}
                            onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/job/${job.id}`);
                                setShareDialogOpen(false);
                            }}
                            sx={{ textTransform: "none", fontWeight: 600 }}
                        >
                            Copy Job Link
                        </Button>
                        <Button fullWidth variant="outlined" sx={{ textTransform: "none", fontWeight: 600 }}>
                            Share on LinkedIn
                        </Button>
                        <Button fullWidth variant="outlined" sx={{ textTransform: "none", fontWeight: 600 }}>
                            Share on Twitter
                        </Button>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setShareDialogOpen(false)} sx={{ textTransform: "none" }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RecruiterJobDetailScreen;
