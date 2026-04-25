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
import { useNavigate, useParams } from "react-router-dom";
import { mockJobs } from "../../services/mockData";
import { fadeSlideUp } from "../../utils/themeUtils";
import RecruiterJobDetailScreen from "./RecruiterJobDetailScreen";
import ApplicantsScreen from "./ApplicantsScreen";
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
    setViewingApplicantsForJob(job);
  };

  // Show applicants screen if viewing applicants for a specific job
  if (viewingApplicantsForJob) {
    return (
      <ApplicantsScreen
        jobId={viewingApplicantsForJob.id}
        jobTitle={viewingApplicantsForJob.title}
        onBack={() => setViewingApplicantsForJob(null)}
      />
    );
  }

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
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)' }}>
        <CircularProgress size={48} sx={{ color: '#4f46e5', mb: 2 }} />
        <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Loading posted jobs...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: 'calc(100vh - 64px)', py: { xs: 3, md: 5 } }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 4, gap: 2 }}>
          <Box>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              sx={{ mb: 1, color: '#64748b', fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: 'transparent', color: '#0f172a' } }}
            >
              Back
            </Button>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Posted Jobs
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#64748b', mt: 0.5 }}>
              Manage and track all your active job postings.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/post-job')}
            sx={{
              px: 3, py: 1.2, fontWeight: 700, borderRadius: 2, textTransform: 'none',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
              '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #4338ca)' }
            }}
          >
            Post a Job
          </Button>
        </Box>

        {jobs.length > 0 && (
          <Paper elevation={0} sx={{ p: 2, mb: 4, borderRadius: 3, border: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder="Search jobs..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 250 }, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94a3b8' }} /></InputAdornment>,
              }}
            />
            <TextField
              select
              size="small"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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

        {jobs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10, bgcolor: '#ffffff', borderRadius: 4, border: '1px dashed #cbd5e1' }}>
            <WorkOutlineIcon sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>No jobs posted yet</Typography>
            <Typography sx={{ color: '#64748b', mb: 3 }}>Create your first job posting to start receiving applications.</Typography>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => navigate('/post-job')} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: '#e2e8f0', color: '#0f172a', '&:hover': { borderColor: '#0f172a' } }}>
              Post a New Job
            </Button>
          </Box>
        ) : filteredJobs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography sx={{ fontWeight: 600, color: '#64748b' }}>No jobs found matching your criteria.</Typography>
            <Button variant="text" onClick={() => { setSearchQuery(""); setFilterType("All"); }} sx={{ mt: 1, textTransform: 'none' }}>
              Clear Filters
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredJobs.map((job, index) => (
              <Grid size={{ xs: 12 }} key={job.id}>
                <Card
                  elevation={0}
                  onClick={() => setSelectedJobId(job.id)}
                  sx={{
                    borderRadius: 3,
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s',
                    animation: `${fadeSlideUp} 0.4s ease-out ${index * 0.1}s both`,
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: '#c7d2fe',
                      boxShadow: '0 10px 25px rgba(99, 102, 241, 0.05)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <CardContent sx={{ p: { xs: 2.5, sm: 3 }, '&:last-child': { pb: { xs: 2.5, sm: 3 } } }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>

                      <Box sx={{ display: 'flex', gap: 2, flex: 1, width: '100%' }}>
                        <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: job.logoColor || '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>
                          {job.company ? job.company.charAt(0) : 'J'}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            {job.title && (
                              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2, mb: 0.5 }}>
                                {job.title}
                              </Typography>
                            )}
                            {isMobile && (
                              <IconButton size="small" onClick={(e) => {
                                e.stopPropagation();
                                handleMenuOpen(e, job);
                              }} sx={{ ml: 1, mt: -0.5 }}>
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                          {job.company && (
                            <Typography sx={{ color: '#6366f1', fontWeight: 600, fontSize: '0.9rem', mb: 1 }}>
                              {job.company}
                            </Typography>
                          )}

                          <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                            {job.type && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <WorkOutlineIcon sx={{ fontSize: 16 }} /> {job.type}
                              </Box>
                            )}
                            {job.location && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <LocationOnIcon sx={{ fontSize: 16 }} /> {job.location}
                              </Box>
                            )}
                            {job.posted && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <DateRangeIcon sx={{ fontSize: 16 }} /> {job.posted}
                              </Box>
                            )}
                          </Stack>
                        </Box>
                      </Box>

                      <Divider orientation={isMobile ? "horizontal" : "vertical"} flexItem sx={{ display: { xs: 'none', sm: 'block' }, my: 1 }} />

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: { xs: '100%', sm: 'auto' }, gap: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'center' }, minWidth: 80, cursor: 'pointer', p: 1.5, borderRadius: 2, transition: 'all 0.2s', '&:hover': { bgcolor: '#dcfce7' } }} onClick={(e) => handleViewApplicants(e, job)}>
                          <Typography sx={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500, mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <GroupIcon sx={{ fontSize: 16 }} /> Applicants
                          </Typography>
                          {job.applicants !== undefined && job.applicants !== null && (
                            <Chip
                              label={job.applicants}
                              size="small"
                              sx={{
                                bgcolor: job.applicants > 0 ? '#dcfce7' : '#f1f5f9',
                                color: job.applicants > 0 ? '#16a34a' : '#64748b',
                                fontWeight: 700,
                                borderRadius: 1.5,
                                cursor: 'pointer'
                              }}
                            />
                          )}
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-end', sm: 'center' }, minWidth: 80 }}>
                          <Typography sx={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500, mb: 0.5 }}>
                            Status
                          </Typography>
                          {job.status && (
                            <Chip
                              label={job.status}
                              size="small"
                              sx={{
                                bgcolor: job.status === "Active" || job.status === "active" ? '#e0e7ff' : '#fee2e2',
                                color: job.status === "Active" || job.status === "active" ? '#4f46e5' : '#ef4444',
                                fontWeight: 600,
                                borderRadius: 1.5,
                                textTransform: 'capitalize'
                              }}
                            />
                          )}
                        </Box>

                        {!isMobile && (
                          <IconButton onClick={(e) => {
                            e.stopPropagation();
                            handleMenuOpen(e, job);
                          }} sx={{ border: '1px solid #e2e8f0', '&:hover': { bgcolor: '#f8fafc' } }}>
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>

                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
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
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            borderRadius: 2,
            minWidth: 160
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleViewDetails} sx={{ fontSize: '0.9rem', py: 1.5 }}>View Details</MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ fontSize: '0.9rem', py: 1.5 }}>Edit Job</MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ fontSize: '0.9rem', py: 1.5, color: '#ef4444' }}>Close Job</MenuItem>
      </Menu>
    </Box>
  );
};

export default PostedJobsScreen;
