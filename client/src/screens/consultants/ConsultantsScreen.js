// screens/candidate/ConsultantsScreen.js
import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Typography, Button, Container, Card, CardContent, Chip, Stack,
  IconButton, Menu, MenuItem, Tooltip, CircularProgress, useMediaQuery, useTheme,
  InputAdornment, TextField, Divider, Paper, Avatar
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import LinkIcon from "@mui/icons-material/Link";
import { useNavigate } from "react-router-dom";
import { fadeSlideUp } from "../../utils/themeUtils";

// Mock consultants data
const MOCK_CONSULTANTS = [
  {
    id: 1,
    name: "Priya Singh",
    company: "Career Catalyst Consulting",
    city: "Bangalore",
    candidatesConnected: 156,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    logoColor: "#6366f1",
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    company: "TalentBridge Solutions",
    city: "Delhi",
    candidatesConnected: 203,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh",
    logoColor: "#ec4899",
  },
  {
    id: 3,
    name: "Neha Patel",
    company: "Skill Enhancement Academy",
    city: "Mumbai",
    candidatesConnected: 189,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha",
    logoColor: "#0ea5e9",
  },
  {
    id: 4,
    name: "Arun Verma",
    company: "Professional Growth Hub",
    city: "Hyderabad",
    candidatesConnected: 142,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arun",
    logoColor: "#10b981",
  },
  {
    id: 5,
    name: "Deepa Menon",
    company: "Career Excellence Center",
    city: "Chennai",
    candidatesConnected: 167,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Deepa",
    logoColor: "#f59e0b",
  },
  {
    id: 6,
    name: "Vimal Shah",
    company: "Executive Coaching Institute",
    city: "Pune",
    candidatesConnected: 198,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vimal",
    logoColor: "#8b5cf6",
  },
  {
    id: 7,
    name: "Ankita Gupta",
    company: "Future Leaders Academy",
    city: "Gurgaon",
    candidatesConnected: 211,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ankita",
    logoColor: "#f43f5e",
  },
  {
    id: 8,
    name: "Sanjay Nair",
    company: "Career Transformation Labs",
    city: "Bangalore",
    candidatesConnected: 174,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sanjay",
    logoColor: "#06b6d4",
  },
];

const ConsultantsScreen = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(true);
  const [consultants, setConsultants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("candidatesConnected");
  const [connectedSet, setConnectedSet] = useState(new Set());

  useEffect(() => {
    // Simulate API fetch
    const fetchConsultants = () => {
      setTimeout(() => {
        setConsultants(MOCK_CONSULTANTS);
        setLoading(false);
      }, 800);
    };
    fetchConsultants();
  }, []);

  const filteredConsultants = useMemo(() => {
    let result = consultants.filter(consultant => {
      const matchesSearch = consultant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        consultant.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        consultant.city.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    // Sort based on sortBy
    if (sortBy === "candidatesConnected") {
      result.sort((a, b) => b.candidatesConnected - a.candidatesConnected);
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "city") {
      result.sort((a, b) => a.city.localeCompare(b.city));
    }

    return result;
  }, [consultants, searchQuery, sortBy]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedConsultant, setSelectedConsultant] = useState(null);

  const handleMenuOpen = (event, consultant) => {
    setAnchorEl(event.currentTarget);
    setSelectedConsultant(consultant);
    event.stopPropagation();
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedConsultant(null);
  };

  const handleConnect = (consultantId) => {
    const newConnectedSet = new Set(connectedSet);
    if (newConnectedSet.has(consultantId)) {
      newConnectedSet.delete(consultantId);
    } else {
      newConnectedSet.add(consultantId);
    }
    setConnectedSet(newConnectedSet);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)' }}>
        <CircularProgress size={48} sx={{ color: '#6366f1', mb: 2 }} />
        <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Loading consultants...</Typography>
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
              Career Consultants
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#64748b', mt: 0.5 }}>
              Connect with {consultants.length} professional career consultants to guide your growth.
            </Typography>
          </Box>
        </Box>

        {consultants.length > 0 && (
          <Paper elevation={0} sx={{ p: 2, mb: 4, borderRadius: 3, border: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder="Search consultants, companies, or cities..."
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
              sx={{ minWidth: 180, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><FilterListIcon sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment>,
              }}
            >
              {[
                { value: 'candidatesConnected', label: 'Most Connected' },
                { value: 'name', label: 'Name (A-Z)' },
                { value: 'city', label: 'City' }
              ].map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </TextField>
          </Paper>
        )}

        {consultants.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10, bgcolor: '#ffffff', borderRadius: 4, border: '1px dashed #cbd5e1' }}>
            <BusinessIcon sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>No consultants found</Typography>
            <Typography sx={{ color: '#64748b' }}>Check back soon for new consultants joining the platform.</Typography>
          </Box>
        ) : filteredConsultants.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography sx={{ fontWeight: 600, color: '#64748b' }}>No consultants found matching your search.</Typography>
            <Button variant="text" onClick={() => setSearchQuery("")} sx={{ mt: 1, textTransform: 'none' }}>
              Clear Search
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredConsultants.map((consultant, index) => (
              <Grid size={{ xs: 12 }} key={consultant.id}>
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
                          src={consultant.avatar}
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            flexShrink: 0,
                            border: '2px solid #e2e8f0'
                          }}
                        />
                        
                        {/* Consultant Info */}
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2, mb: 0.5 }}>
                              {consultant.name}
                            </Typography>
                            {isMobile && (
                              <IconButton size="small" onClick={(e) => {
                                e.stopPropagation();
                                handleMenuOpen(e, consultant);
                              }} sx={{ ml: 1, mt: -0.5 }}>
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                          <Typography sx={{ color: '#6366f1', fontWeight: 600, fontSize: '0.9rem', mb: 1 }}>
                            {consultant.company}
                          </Typography>

                          <Stack direction="row" flexWrap="wrap" gap={2} sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                            <Tooltip title="Location" placement="top" arrow>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 1, borderRadius: 1.5, bgcolor: '#f0f9ff' }}>
                                <LocationOnIcon sx={{ fontSize: 16, color: '#0ea5e9' }} />
                                <span style={{ fontWeight: 500 }}>{consultant.city}</span>
                              </Box>
                            </Tooltip>
                            <Tooltip title="Candidates connected" placement="top" arrow>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 1, borderRadius: 1.5, bgcolor: '#f8fafc' }}>
                                <WorkIcon sx={{ fontSize: 16, color: '#6366f1' }} />
                                <span style={{ fontWeight: 600, color: '#6366f1' }}>{consultant.candidatesConnected} connected</span>
                              </Box>
                            </Tooltip>
                          </Stack>
                        </Box>
                      </Box>

                      <Divider orientation={isMobile ? "horizontal" : "vertical"} flexItem sx={{ display: { xs: 'none', sm: 'block' }, my: 1 }} />

                      {/* Action Buttons */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: { xs: '100%', sm: 'auto' }, gap: 2 }}>
                        <Button
                          variant={connectedSet.has(consultant.id) ? "contained" : "outlined"}
                          size="small"
                          startIcon={<LinkIcon sx={{ fontSize: 16 }} />}
                          onClick={() => handleConnect(consultant.id)}
                          sx={{
                            backgroundColor: connectedSet.has(consultant.id) ? '#6366f1' : 'transparent',
                            color: connectedSet.has(consultant.id) ? '#ffffff' : '#6366f1',
                            borderColor: '#6366f1',
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 2,
                            py: 0.8,
                            px: 2,
                            border: '1.5px solid #6366f1',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: connectedSet.has(consultant.id) ? '#4f46e5' : '#ede9fe',
                              borderColor: '#4f46e5',
                              transform: 'translateY(-1px)',
                              boxShadow: connectedSet.has(consultant.id) ? '0 4px 12px rgba(99, 102, 241, 0.25)' : 'none'
                            }
                          }}
                        >
                          {connectedSet.has(consultant.id) ? 'Connected' : 'Connect'}
                        </Button>

                        {!isMobile && (
                          <IconButton onClick={(e) => handleMenuOpen(e, consultant)} sx={{ border: '1px solid #e2e8f0', '&:hover': { bgcolor: '#f8fafc' } }}>
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
        <MenuItem onClick={handleMenuClose} sx={{ fontSize: '0.9rem', py: 1.5 }}>Send Message</MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ fontSize: '0.9rem', py: 1.5 }}>View Details</MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ fontSize: '0.9rem', py: 1.5 }}>Report</MenuItem>
      </Menu>
    </Box>
  );
};

export default ConsultantsScreen;
