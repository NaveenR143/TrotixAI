import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Stack,
  IconButton,
  Chip,
  Alert,
  TextField,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useNavigate } from "react-router-dom";
import { fetchRecentJobs } from "../../api/jobpostingAPI";

const RecentJobsListScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobs, setJobs] = useState([]);

  const [filters, setFilters] = useState({
    title: "",
    company: "",
    location: "",
    skills: "",
    industry: "All",
    experience: "All",
  });

  const loadRecentJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchRecentJobs();
      if (!res.error) {
        setJobs(res.data || []);
      } else {
        setError(res.message || "Failed to fetch recent job postings.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred while loading recent jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecentJobs();
  }, []);

  const uniqueIndustries = useMemo(() => {
    const industries = jobs
      .map((job) => job.industry?.name)
      .filter(Boolean);
    return ["All", ...new Set(industries)];
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // 1. Job Title Match
      const matchesTitle =
        !filters.title ||
        job.title?.toLowerCase().includes(filters.title.toLowerCase());

      // 2. Company Name Match
      const matchesCompany =
        !filters.company ||
        job.company?.name?.toLowerCase().includes(filters.company.toLowerCase());

      // 3. Location Match
      const matchesLocation =
        !filters.location ||
        job.location?.toLowerCase().includes(filters.location.toLowerCase());

      // 4. Skills Match
      const matchesSkills =
        !filters.skills ||
        (job.skills &&
          job.skills.some((skill) =>
            skill.toLowerCase().includes(filters.skills.toLowerCase())
          ));

      // 5. Industry Type Match
      const matchesIndustry =
        filters.industry === "All" ||
        job.industry?.name === filters.industry;

      // 6. Experience Match
      let matchesExperience = true;
      if (filters.experience !== "All") {
        const min = job.experience_min_yrs;
        const max = job.experience_max_yrs;

        if (filters.experience === "Fresher") {
          matchesExperience = min === 0 || min === null || min === undefined || max === 0;
        } else if (filters.experience === "1-3") {
          matchesExperience = min <= 3 && (max >= 1 || max === null || max === undefined);
        } else if (filters.experience === "3-5") {
          matchesExperience = min <= 5 && (max >= 3 || max === null || max === undefined);
        } else if (filters.experience === "5+") {
          matchesExperience =
            (min !== null && min !== undefined && min >= 5) ||
            (max !== null && max !== undefined && max >= 5);
        }
      }

      return (
        matchesTitle &&
        matchesCompany &&
        matchesLocation &&
        matchesSkills &&
        matchesIndustry &&
        matchesExperience
      );
    });
  }, [jobs, filters]);

  const handleResetFilters = () => {
    setFilters({
      title: "",
      company: "",
      location: "",
      skills: "",
      industry: "All",
      experience: "All",
    });
  };

  const formatExperience = (min, max) => {
    if (min === null || min === undefined) return "Not specified";
    if (max === null || max === undefined || min === max) {
      return min === 0 ? "Fresher" : `${min}+ Yrs`;
    }
    if (min === 0 && max === 0) return "Fresher";
    return `${min} - ${max} Yrs`;
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const dateObj = new Date(dateStr);
      // Check if it's today
      const today = new Date();
      const isToday = dateObj.toDateString() === today.toDateString();
      
      const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (isToday) {
        return `Today, ${timeStr}`;
      }
      return `${dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "calc(100vh - 64px)", py: 6 }}>
      <Container maxWidth="lg">
        {/* Header Block */}
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton 
              onClick={() => navigate("/dashboard")} 
              sx={{ bgcolor: "#FFFFFF", border: "1px solid #E5E7EB", "&:hover": { bgcolor: "#F1F5F9" } }}
            >
              <ArrowBackIcon sx={{ color: "#475569" }} />
            </IconButton>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#1E293B", letterSpacing: "-0.02em" }}>
                Recent Job Postings
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 500, mt: 0.5 }}>
                Manage all job postings created within the last 24 hours.
              </Typography>
            </Box>
          </Stack>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadRecentJobs}
            disabled={loading}
            sx={{
              borderRadius: "12px",
              borderColor: "#CBD5E1",
              color: "#475569",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1,
              bgcolor: "#FFFFFF",
              "&:hover": { borderColor: "#94A3B8", bgcolor: "#F8FAFC" }
            }}
          >
            Refresh
          </Button>
        </Box>

        {/* Main Content Area */}
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
            <CircularProgress thickness={4} size={48} sx={{ color: "#3B82F6", mb: 2 }} />
            <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 500 }}>
              Loading recent job postings...
            </Typography>
          </Box>
        ) : error ? (
          <Paper elevation={0} sx={{ p: 4, borderRadius: "20px", border: "1px solid #FEE2E2", bgcolor: "#FEF2F2", textAlign: "center" }}>
            <Alert severity="error" sx={{ mb: 3, borderRadius: "12px" }}>
              {error}
            </Alert>
            <Button variant="contained" color="error" onClick={loadRecentJobs} sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600 }}>
              Retry
            </Button>
          </Paper>
        ) : jobs.length === 0 ? (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 8, 
              borderRadius: "24px", 
              border: "1px solid #E2E8F0", 
              textAlign: "center",
              bgcolor: "#FFFFFF",
              boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)" 
            }}
          >
            <Box sx={{ width: 80, height: 80, borderRadius: "24px", bgcolor: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3 }}>
              <BusinessIcon sx={{ fontSize: 40, color: "#3B82F6" }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#1E293B", mb: 1 }}>
              No recent job postings
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B", maxW: 400, mx: "auto" }}>
              There are no jobs posted within the last 24 hours. Check back later or publish a new job.
            </Typography>
          </Paper>
        ) : (
          <>
            {/* Filters Card */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 4,
                borderRadius: "20px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                bgcolor: "#FFFFFF",
              }}
            >
              {/* Filter Header */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "10px",
                      bgcolor: "#EFF6FF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#3B82F6",
                    }}
                  >
                    <FilterListIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1E293B" }}>
                      Filter Job Postings
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>
                      Refine the jobs list using the column-specific filters below
                    </Typography>
                  </Box>
                  <Chip
                    label={`Showing ${filteredJobs.length} of ${jobs.length}`}
                    variant="outlined"
                    size="small"
                    sx={{
                      ml: 1,
                      fontWeight: 600,
                      color: "#3B82F6",
                      borderColor: "#DBEAFE",
                      bgcolor: "#EFF6FF",
                      borderRadius: "8px",
                    }}
                  />
                </Stack>
                <Button
                  variant="text"
                  onClick={handleResetFilters}
                  sx={{
                    fontWeight: 700,
                    color: "#EF4444",
                    textTransform: "none",
                    borderRadius: "10px",
                    "&:hover": { bgcolor: "rgba(239, 68, 68, 0.08)" },
                  }}
                >
                  Reset Filters
                </Button>
              </Box>

              {/* Filter Grid */}
              <Grid container spacing={2}>
                {/* Job Title Filter */}
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Job Title"
                    placeholder="Search title..."
                    size="small"
                    value={filters.title}
                    onChange={(e) => setFilters({ ...filters, title: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: "#94A3B8", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Company Filter */}
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    placeholder="Search company..."
                    size="small"
                    value={filters.company}
                    onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessIcon sx={{ color: "#94A3B8", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Location Filter */}
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Location"
                    placeholder="Search location..."
                    size="small"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnIcon sx={{ color: "#94A3B8", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Skills Filter */}
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Skills"
                    placeholder="Search skills (e.g. React)..."
                    size="small"
                    value={filters.skills}
                    onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: "#94A3B8", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Industry Filter */}
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    select
                    fullWidth
                    label="Industry Type"
                    size="small"
                    value={filters.industry}
                    onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FilterListIcon sx={{ color: "#94A3B8", fontSize: 20, mr: 1 }} />
                        </InputAdornment>
                      ),
                    }}
                  >
                    {uniqueIndustries.map((industry) => (
                      <MenuItem key={industry} value={industry}>
                        {industry}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Experience Filter */}
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    select
                    fullWidth
                    label="Experience"
                    size="small"
                    value={filters.experience}
                    onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <WorkHistoryIcon sx={{ color: "#94A3B8", fontSize: 20, mr: 1 }} />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="All">All Experience</MenuItem>
                    <MenuItem value="Fresher">Fresher (0 Yrs)</MenuItem>
                    <MenuItem value="1-3">1 - 3 Yrs</MenuItem>
                    <MenuItem value="3-5">3 - 5 Yrs</MenuItem>
                    <MenuItem value="5+">5+ Yrs</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Paper>

            {filteredJobs.length === 0 ? (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 6, 
                  borderRadius: "24px", 
                  border: "1px solid #E2E8F0", 
                  textAlign: "center",
                  bgcolor: "#FFFFFF",
                  boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)" 
                }}
              >
                <Box sx={{ width: 64, height: 64, borderRadius: "20px", bgcolor: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2.5 }}>
                  <FilterListIcon sx={{ fontSize: 32, color: "#94A3B8" }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#1E293B", mb: 1 }}>
                  No matching jobs found
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748B", maxW: 400, mx: "auto", mb: 3 }}>
                  Your search filters did not match any of the recent job postings. Try refining or resetting your filters.
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={handleResetFilters} 
                  sx={{ 
                    borderRadius: "10px", 
                    textTransform: "none", 
                    fontWeight: 600,
                    bgcolor: "#3B82F6",
                    "&:hover": { bgcolor: "#2563EB" }
                  }}
                >
                  Reset All Filters
                </Button>
              </Paper>
            ) : (
              <TableContainer 
                component={Paper} 
                elevation={0} 
                sx={{ 
                  borderRadius: "20px", 
                  border: "1px solid #E2E8F0", 
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                  overflow: "hidden"
                }}
              >
                <Table>
                  <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: "#475569", py: 2 }}>Company Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#475569", py: 2 }}>Job Title</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#475569", py: 2 }}>Industry Type</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#475569", py: 2 }}>Experience</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#475569", py: 2 }}>Location</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#475569", py: 2 }}>Posted Time</TableCell>
                      <TableCell sx={{ width: 40 }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredJobs.map((job) => (
                      <TableRow
                        key={job.id}
                        onClick={() => navigate(`/admin/job-detail/${job.id}`)}
                        sx={{
                          cursor: "pointer",
                          transition: "background-color 0.2s ease",
                          "&:hover": { bgcolor: "#F1F5F9" },
                          "&:last-child td, &:last-child th": { border: 0 }
                        }}
                      >
                        <TableCell sx={{ py: 2.5 }}>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box sx={{
                              width: 36,
                              height: 36,
                              borderRadius: "10px",
                              bgcolor: "#EFF6FF",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#3B82F6",
                              fontWeight: 700,
                              fontSize: "1.1rem"
                            }}>
                              {job.company?.name ? job.company.name.charAt(0).toUpperCase() : "J"}
                            </Box>
                            <Typography sx={{ fontWeight: 600, color: "#1E293B" }}>
                              {job.company?.name || "N/A"}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ py: 2.5 }}>
                          <Typography sx={{ fontWeight: 600, color: "#3B82F6", mb: job.skills?.length ? 0.8 : 0 }}>
                            {job.title}
                          </Typography>
                          {job.skills && job.skills.length > 0 && (
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                              {job.skills.map((skill, index) => (
                                <Chip
                                  key={index}
                                  label={skill}
                                  size="small"
                                  sx={{
                                    height: 18,
                                    fontSize: "0.65rem",
                                    bgcolor: "#EFF6FF",
                                    color: "#1E40AF",
                                    border: "1px solid #BFDBFE",
                                    fontWeight: 500,
                                  }}
                                />
                              ))}
                            </Stack>
                          )}
                        </TableCell>
                        <TableCell sx={{ py: 2.5, color: "#475569" }}>
                          {job.industry?.name ? (
                            <Chip
                              label={job.industry.name}
                              size="small"
                              sx={{
                                bgcolor: "#F1F5F9",
                                color: "#475569",
                                fontWeight: 500,
                                fontSize: "0.75rem",
                              }}
                            />
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell sx={{ py: 2.5, color: "#475569" }}>
                          <Stack direction="row" spacing={0.8} alignItems="center">
                            <WorkHistoryIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {formatExperience(job.experience_min_yrs, job.experience_max_yrs)}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ py: 2.5, color: "#475569" }}>
                          <Stack direction="row" spacing={0.8} alignItems="center">
                            <LocationOnIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {job.location || "N/A"}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ py: 2.5, color: "#64748B", fontWeight: 500 }}>
                          {formatDateTime(job.posted_at)}
                        </TableCell>
                        <TableCell sx={{ py: 2.5 }}>
                          <ArrowForwardIosIcon sx={{ fontSize: 14, color: "#CBD5E1" }} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default RecentJobsListScreen;
