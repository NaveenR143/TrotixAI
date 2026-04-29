import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Typography, Button, Container, Card, CardContent, Chip, Stack,
  IconButton, Menu, MenuItem, Tooltip, CircularProgress, useMediaQuery, useTheme,
  InputAdornment, TextField, Divider, Paper
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import DateRangeIcon from "@mui/icons-material/DateRange";
import GroupIcon from "@mui/icons-material/Group";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useNavigate, useParams } from "react-router-dom";
import { mockJobs } from "../../services/mockData";
import { fadeSlideUp } from "../../utils/themeUtils";
import RecruiterJobDetailScreen from "./RecruiterJobDetailScreen";
import { useSelector } from "react-redux";
import { fetchRecruiterPostedJobs } from "../../api/jobpostingAPI";

const PostedJobsScreen = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { jobId } = useParams();

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [selectedJobId, setSelectedJobId] = useState(jobId || null);
  const [viewingApplicantsForJob, setViewingApplicantsForJob] = useState(null);

  const { userid } = useSelector((state) => state.UserReducer);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const response = await fetchRecruiterPostedJobs(userid);
        if (!response.error && response.data) {
          const recruiterJobs = response.data.map(job => ({
            id: job.id,
            title: job.title,
            company: job.company?.name,
            location: job.location,
            type: job.job_type,
            posted: job.posted_at ? new Date(job.posted_at).toLocaleDateString() : null,
            applicants: job.apply_count,
            status: job.status === "active" ? "Active" : job.status,
            logoColor: "#6366f1",
            rawJob: job
          }));
          setJobs(recruiterJobs);
        } else {
          setJobs([]);
        }
      } catch (error) {
        console.error("Failed to fetch jobs", error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    if (userid) {
      fetchJobs();
    } else {
      setLoading(false);
    }
  }, [userid]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = (!searchQuery) || (job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFilter = filterType === "All" || job.type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [jobs, searchQuery, filterType]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const handleMenuOpen = (event, job) => {
    setAnchorEl(event.currentTarget);
    setSelectedJob(job);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedJob(null);
  };

  const handleViewDetails = () => {
    if (selectedJob) {
      setSelectedJobId(selectedJob.id);
      handleMenuClose();
    }
  };

  const handleViewApplicants = (event, job) => {
    event.stopPropagation();
    navigate(`/job-applicants/${job.id}`, { state: { jobTitle: job.title } });
  };

  const handleViewMatchCandidates = (event, job) => {
    event.stopPropagation();
    navigate(`/candidate-feed/${job.id}`, { state: { jobTitle: job.title } });
  };


  // Show job details screen if jobId is selected
  if (selectedJobId) {
    const selectedJobData = jobs.find(j => j.id === selectedJobId)?.rawJob;
    return (
      <RecruiterJobDetailScreen
        jobId={selectedJobId}
        jobData={selectedJobData}
        onBack={() => setSelectedJobId(null)}
      />
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)', bgcolor: '#F8FAFC' }}>
        <CircularProgress size={40} thickness={5} sx={{ color: '#2563EB', mb: 2 }} />
        <Typography sx={{ color: '#6B7280', fontWeight: 600 }}>Loading your jobs...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: 'calc(100vh - 64px)', pb: 8 }}>
      {/* Header Section */}
      <Box sx={{ bgcolor: '#FFFFFF', borderBottom: '1px solid #E5E7EB', mb: 5, py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 3 }}>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: '#6B7280', bgcolor: '#F8FAFC' }}>
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
                <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Recruiter Dashboard
                </Typography>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', mb: 1, letterSpacing: '-0.03em' }}>
                Posted Jobs
              </Typography>
              <Typography variant="body1" sx={{ color: '#475569', fontWeight: 500 }}>
                Manage {jobs.length} active job postings and track applicant progress.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/post-job')}
              sx={{
                px: 4, py: 1.5, fontWeight: 800, borderRadius: '12px', bgcolor: '#2563EB',
                boxShadow: '0 8px 20px rgba(37, 99, 235, 0.2)',
                '&:hover': { bgcolor: '#1e40af', boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)' }
              }}
            >
              Post New Job
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Search and Filter */}
        {jobs.length > 0 && (
          <Paper elevation={0} sx={{ p: 1.5, mb: 4, borderRadius: '16px', border: '1px solid #E5E7EB', display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', bgcolor: '#FFFFFF' }}>
            <TextField
              placeholder="Search by job title or keyword..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 300 }, '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#F8FAFC', border: 'none' } }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94a3b8' }} /></InputAdornment>,
              }}
            />
            <TextField
              select
              size="small"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#F8FAFC' } }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><FilterListIcon sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment>,
              }}
            >
              {['All', 'Full-time', 'Part-time', 'Contract', 'Freelance'].map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </TextField>
          </Paper>
        )}

        {/* Jobs Grid */}
        {jobs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 12, bgcolor: '#ffffff', borderRadius: '24px', border: '2px dashed #E5E7EB' }}>
            <Box sx={{ width: 80, height: 80, borderRadius: '24px', bgcolor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
              <WorkOutlineIcon sx={{ fontSize: 40, color: '#CBD5E1' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', mb: 1 }}>No jobs posted yet</Typography>
            <Typography sx={{ color: '#6B7280', mb: 4, maxWidth: 400, mx: 'auto' }}>
              Create your first job posting to start receiving AI-matched applications from top talent.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => navigate('/post-job')}
              sx={{ borderRadius: '12px', fontWeight: 800, px: 4, py: 1.2, borderColor: '#E5E7EB', color: '#111827' }}
            >
              Get Started
            </Button>
          </Box>
        ) : filteredJobs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography sx={{ fontWeight: 700, color: '#6B7280', mb: 2 }}>No results found for "{searchQuery}"</Typography>
            <Button variant="text" onClick={() => { setSearchQuery(""); setFilterType("All"); }} sx={{ fontWeight: 800, color: '#2563EB' }}>
              Reset Filters
            </Button>
          </Box>
        ) : (
          <Stack spacing={3}>
            {filteredJobs.map((job, index) => (
              <Card
                key={job.id}
                elevation={0}
                onClick={() => setSelectedJobId(job.id)}
                sx={{
                  borderRadius: '16px',
                  border: '1px solid #E5E7EB',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  overflow: 'visible',
                  '&:hover': {
                    borderColor: '#bfdbfe',
                    boxShadow: '0 12px 40px rgba(37, 99, 235, 0.08)',
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Grid container spacing={3} alignItems="center">
                    {/* Left: Job Info */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack direction="row" spacing={3} alignItems="flex-start">
                        <Box sx={{
                          width: 64, height: 64, borderRadius: '16px',
                          background: `linear-gradient(135deg, ${job.logoColor || '#2563EB'}, #4f46e5)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          color: 'white', fontWeight: 800, fontSize: '1.5rem',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                        }}>
                          {job.company ? job.company.charAt(0) : 'J'}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: '#111827', mb: 0.5, letterSpacing: '-0.02em', fontSize: '1.15rem' }}>
                            {job.title}
                          </Typography>
                          <Typography sx={{ color: '#2563EB', fontWeight: 700, mb: 2 }}>
                            {job.company}
                          </Typography>
                          <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#6B7280' }}>
                              <WorkOutlineIcon sx={{ fontSize: 18 }} />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{job.type}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#6B7280' }}>
                              <LocationOnIcon sx={{ fontSize: 18 }} />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{job.location}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#6B7280' }}>
                              <DateRangeIcon sx={{ fontSize: 18 }} />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{job.posted}</Typography>
                            </Box>
                          </Stack>
                        </Box>
                      </Stack>
                    </Grid>

                    {/* Right: Stats & Actions */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack direction="row" spacing={{ xs: 2, md: 4 }} alignItems="center" justifyContent={{ xs: 'space-between', md: 'flex-end' }}>
                        {/* Applicants */}
                        <Box
                          sx={{ textAlign: 'center', cursor: 'pointer', transition: 'opacity 0.2s', '&:hover': { opacity: 0.7 } }}
                          onClick={(e) => handleViewApplicants(e, job)}
                        >
                          <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', lineHeight: 1 }}>
                            {job.applicants || 0}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                            Applicants
                          </Typography>
                        </Box>

                        {/* Status */}
                        <Box sx={{ textAlign: 'center' }}>
                          <Chip
                            label={job.status}
                            size="small"
                            sx={{
                              bgcolor: job.status?.toLowerCase() === 'active' ? '#dcfce7' : '#fef2f2',
                              color: job.status?.toLowerCase() === 'active' ? '#16a34a' : '#ef4444',
                              fontWeight: 800,
                              borderRadius: '8px',
                              height: 24,
                              px: 1
                            }}
                          />
                          <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', display: 'block', mt: 0.5, fontSize: '0.65rem' }}>
                            Status
                          </Typography>
                        </Box>

                        {/* AI Match CTA */}
                        <Button
                          variant="contained"
                          startIcon={<AutoAwesomeIcon />}
                          onClick={(e) => handleViewMatchCandidates(e, job)}
                          sx={{
                            background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
                            color: 'white',
                            fontWeight: 800,
                            borderRadius: '12px',
                            px: 3,
                            py: 1.2,
                            boxShadow: '0 4px 14px 0 rgba(124, 58, 237, 0.3)',
                            border: 'none',
                            textTransform: 'none',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #6D28D9 0%, #1E40AF 100%)',
                              boxShadow: '0 6px 20px rgba(124, 58, 237, 0.4)',
                              transform: 'translateY(-2px)'
                            }
                          }}
                        >
                          AI Match
                        </Button>

                        <IconButton onClick={(e) => handleMenuOpen(e, job)} sx={{ border: '1px solid #E5E7EB', borderRadius: '10px' }}>
                          <MoreVertIcon />
                        </IconButton>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
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
            border: '1px solid #E5E7EB',
            boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
            borderRadius: '12px',
            minWidth: 200,
            p: 1
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleViewDetails} sx={{ borderRadius: '8px', fontWeight: 600, py: 1.5 }}>
          View Details
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ borderRadius: '8px', fontWeight: 600, py: 1.5 }}>
          Edit Posting
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={handleMenuClose} sx={{ borderRadius: '8px', fontWeight: 600, py: 1.5, color: '#ef4444' }}>
          Deactivate Job
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default PostedJobsScreen;
