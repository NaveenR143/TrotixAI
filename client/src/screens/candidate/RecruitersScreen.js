// screens/candidate/RecruitersScreen.js
import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Typography, Button, Container, Card, CardContent, Chip, Stack,
  IconButton, Menu, MenuItem, Tooltip, CircularProgress, useMediaQuery, useTheme,
  InputAdornment, TextField, Divider, Paper, Avatar
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import BusinessIcon from "@mui/icons-material/Business";
import DateRangeIcon from "@mui/icons-material/DateRange";
import WorkIcon from "@mui/icons-material/Work";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useNavigate } from "react-router-dom";
import { fadeSlideUp } from "../../utils/themeUtils";

// Mock recruiters data
const MOCK_RECRUITERS = [
  {
    id: 1,
    name: "Sarah Anderson",
    company: "TechCorp Inc",
    jobsPosted: 23,
    joinedDate: "2023-02-15",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    logoColor: "#6366f1",
  },
  {
    id: 2,
    name: "Michael Chen",
    company: "Innovation Labs",
    jobsPosted: 18,
    joinedDate: "2023-04-20",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    logoColor: "#ec4899",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    company: "Digital Solutions",
    jobsPosted: 31,
    joinedDate: "2023-01-10",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    logoColor: "#0ea5e9",
  },
  {
    id: 4,
    name: "James Wilson",
    company: "CloudBase Systems",
    jobsPosted: 15,
    joinedDate: "2023-06-05",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    logoColor: "#10b981",
  },
  {
    id: 5,
    name: "Lisa Thompson",
    company: "NetWorks Pro",
    jobsPosted: 27,
    joinedDate: "2023-03-12",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
    logoColor: "#f59e0b",
  },
  {
    id: 6,
    name: "David Park",
    company: "Enterprise Solutions",
    jobsPosted: 42,
    joinedDate: "2023-01-25",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    logoColor: "#8b5cf6",
  },
  {
    id: 7,
    name: "Jessica Martinez",
    company: "Growth Analytics",
    jobsPosted: 19,
    joinedDate: "2023-05-18",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
    logoColor: "#f43f5e",
  },
  {
    id: 8,
    name: "Robert Kumar",
    company: "Tech Ventures",
    jobsPosted: 26,
    joinedDate: "2023-02-28",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert",
    logoColor: "#06b6d4",
  },
];

const RecruitersScreen = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(true);
  const [recruiters, setRecruiters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("jobsPosted");

  useEffect(() => {
    // Simulate API fetch
    const fetchRecruiters = () => {
      setTimeout(() => {
        setRecruiters(MOCK_RECRUITERS);
        setLoading(false);
      }, 800);
    };
    fetchRecruiters();
  }, []);

  const filteredRecruiters = useMemo(() => {
    let result = recruiters.filter(recruiter => {
      const matchesSearch = recruiter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recruiter.company.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    // Sort based on sortBy
    if (sortBy === "jobsPosted") {
      result.sort((a, b) => b.jobsPosted - a.jobsPosted);
    } else if (sortBy === "recent") {
      result.sort((a, b) => new Date(b.joinedDate) - new Date(a.joinedDate));
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [recruiters, searchQuery, sortBy]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);

  const handleMenuOpen = (event, recruiter) => {
    setAnchorEl(event.currentTarget);
    setSelectedRecruiter(recruiter);
    event.stopPropagation();
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRecruiter(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)' }}>
        <CircularProgress size={48} sx={{ color: '#6366f1', mb: 2 }} />
        <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Loading recruiters...</Typography>
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
              Recruiters
            </Typography>
            {/* <Typography variant="subtitle1" sx={{ color: '#64748b', mt: 0.5 }}>
              Connect with {recruiters.length} registered recruiters on the platform.
            </Typography> */}
          </Box>
        </Box>

        {/* {recruiters.length > 0 && (
          <Paper elevation={0} sx={{ p: 2, mb: 4, borderRadius: 3, border: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder="Search recruiters or companies..."
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
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><FilterListIcon sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment>,
              }}
            >
              {[
                { value: 'jobsPosted', label: 'Most Jobs Posted' },
                { value: 'recent', label: 'Recently Joined' },
                { value: 'name', label: 'Name (A-Z)' }
              ].map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </TextField>
          </Paper>
        )} */}

        {recruiters.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10, bgcolor: '#ffffff', borderRadius: 4, border: '1px dashed #cbd5e1' }}>
            <BusinessIcon sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>No recruiters found</Typography>
            <Typography sx={{ color: '#64748b' }}>Check back soon for new recruiters joining the platform.</Typography>
          </Box>
        ) : filteredRecruiters.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography sx={{ fontWeight: 600, color: '#64748b' }}>No recruiters found matching your search.</Typography>
            <Button variant="text" onClick={() => setSearchQuery("")} sx={{ mt: 1, textTransform: 'none' }}>
              Clear Search
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredRecruiters.map((recruiter, index) => (
              <Grid size={{ xs: 12 }} key={recruiter.id}>
                <Card
                  elevation={0}
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
                        {/* Avatar */}
                        <Avatar
                          src={recruiter.avatar}
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            flexShrink: 0,
                            border: '2px solid #e2e8f0'
                          }}
                        />
                        
                        {/* Recruiter Info */}
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2, mb: 0.5 }}>
                              {recruiter.name}
                            </Typography>
                            {isMobile && (
                              <IconButton size="small" onClick={(e) => {
                                e.stopPropagation();
                                handleMenuOpen(e, recruiter);
                              }} sx={{ ml: 1, mt: -0.5 }}>
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                          <Typography sx={{ color: '#6366f1', fontWeight: 600, fontSize: '0.9rem', mb: 1 }}>
                            {recruiter.company}
                          </Typography>

                          <Stack direction="row" flexWrap="wrap" gap={2} sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                            <Tooltip title="Number of jobs posted" placement="top" arrow>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 1, borderRadius: 1.5, bgcolor: '#f0f9ff', cursor: 'help' }}>
                                <WorkIcon sx={{ fontSize: 16, color: '#0ea5e9' }} />
                                <span style={{ fontWeight: 600, color: '#0ea5e9' }}>{recruiter.jobsPosted} jobs</span>
                              </Box>
                            </Tooltip>
                            <Tooltip title="Joined date" placement="top" arrow>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 1, borderRadius: 1.5, bgcolor: '#f8fafc' }}>
                                <DateRangeIcon sx={{ fontSize: 16 }} />
                                Joined {formatDate(recruiter.joinedDate)}
                              </Box>
                            </Tooltip>
                          </Stack>
                        </Box>
                      </Box>

                      <Divider orientation={isMobile ? "horizontal" : "vertical"} flexItem sx={{ display: { xs: 'none', sm: 'block' }, my: 1 }} />

                      {/* Action Buttons */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: { xs: '100%', sm: 'auto' }, gap: 2 }}>
                        {!isMobile && (
                          <IconButton onClick={(e) => handleMenuOpen(e, recruiter)} sx={{ border: '1px solid #e2e8f0', '&:hover': { bgcolor: '#f8fafc' } }}>
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
            minWidth: 180
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleMenuClose} sx={{ fontSize: '0.9rem', py: 1.5 }}>View Profile</MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ fontSize: '0.9rem', py: 1.5 }}>Connect</MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ fontSize: '0.9rem', py: 1.5 }}>Send Message</MenuItem>
      </Menu>
    </Box>
  );
};

export default RecruitersScreen;
