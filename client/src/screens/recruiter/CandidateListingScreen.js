import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Box, Typography, Button, Stack, useMediaQuery, useTheme, Tooltip, IconButton, Chip, Drawer, Badge, CircularProgress, Paper, Avatar, Container, Divider, Grid, Menu, MenuItem
} from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import StarIcon from "@mui/icons-material/Star";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleIcon from "@mui/icons-material/People";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { fetchJobMatchingCandidates, fetchJobApplicants } from "../../api/jobpostingAPI";
import { fadeSlideUp } from "../../utils/themeUtils";
import { toTitleCase } from "../../screens/candidate/utils/profileUtils";

const CandidateListingScreen = ({ mode = "matching" }) => {
  const { jobId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const jobTitle = location.state?.jobTitle || "Job Listing";

  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [savedCandidates, setSavedCandidates] = useState(new Set());
  const [animating, setAnimating] = useState(false);
  const [animDir, setAnimDir] = useState('left');
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // Touch handling for swipe
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const isMatchingMode = mode === "matching";

  useEffect(() => {
    const loadCandidates = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchFn = isMatchingMode ? fetchJobMatchingCandidates : fetchJobApplicants;
        const response = await fetchFn(jobId);
        
        if (!response.error && response.data) {
          const rawCandidates = response.data.candidates || [];
          const normalized = rawCandidates.map(c => ({
            id: c.user_id,
            name: toTitleCase(c.full_name),
            phone: c.phone,
            jobTitle: toTitleCase(c.headline),
            location: toTitleCase(c.current_location),
            matchScore: Math.round(c.final_score * 100),
            scores: c.scores,
            matchedSkills: (c.matched_skills || []).map(toTitleCase),
            missingSkills: (c.missing_skills || []).map(toTitleCase),
            reason: c.reason,
            experience: `${c.experience_years} yrs`,
            allSkills: (c.skills || []).map(toTitleCase),
            summary: c.summary,
            profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(c.full_name)}`
          }));

          setCandidates(normalized);
          if (normalized.length > 0) {
            setSelectedCandidate(normalized[0]);
          }
        } else {
          setError(response.message || `Failed to load ${isMatchingMode ? 'candidates' : 'applicants'}`);
        }
      } catch (err) {
        console.error(`Error loading ${mode}:`, err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      loadCandidates();
    }
  }, [jobId, mode, isMatchingMode]);

  const handleNext = () => {
    if (currentIndex < candidates.length - 1) {
      setAnimDir('right');
      setAnimating(true);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setAnimating(false);
      }, 300);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setAnimDir('left');
      setAnimating(true);
      setTimeout(() => {
        setCurrentIndex(prev => prev - 1);
        setAnimating(false);
      }, 300);
    }
  };

  const toggleSave = (id) => {
    setSavedCandidates(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getMatchColor = (score) => {
    if (score >= 90) return { main: "#10b981", bg: "#ecfdf5", border: "#a7f3d0" };
    if (score >= 80) return { main: "#f59e0b", bg: "#fffbeb", border: "#fde68a" };
    if (score >= 70) return { main: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" };
    return { main: "#94a3b8", bg: "#f8fafc", border: "#e2e8f0" };
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)', gap: 3 }}>
        <CircularProgress size={50} sx={{ color: '#6366f1' }} />
        <Typography sx={{ color: '#64748b', fontWeight: 500 }}>
          {isMatchingMode ? "Finding the best matches for your job..." : "Loading applicants for this job..."}
        </Typography>
      </Box>
    );
  }

  if (error || candidates.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)', gap: 2 }}>
        <Typography sx={{ fontSize: '3rem' }}>{error ? '⚠️' : '✨'}</Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
          {error || (isMatchingMode ? "No matching candidates found" : "No applicants yet")}
        </Typography>
        <Typography sx={{ color: '#64748b', textAlign: 'center', maxWidth: 400 }}>
          {error 
            ? `We encountered an issue fetching ${isMatchingMode ? 'matches' : 'applicants'}.` 
            : (isMatchingMode 
                ? "Try adjusting the job description or skills to find more candidates." 
                : "Promote your job posting to reach more potential candidates.")}
        </Typography>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Back to Jobs
        </Button>
      </Box>
    );
  }

  const currentCandidate = candidates[currentIndex];

  const CandidateDetail = ({ candidate }) => (
    <Box sx={{ p: { xs: 3, md: 5 } }}>
      <Box sx={{ display: 'flex', gap: 4, mb: 4, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-start' } }}>
        <Avatar src={candidate.profileImage} sx={{ width: 100, height: 100, borderRadius: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }} />
        <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827' }}>{candidate.name}</Typography>
            <Box sx={{ bgcolor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <StarIcon sx={{ color: '#2563EB', fontSize: 18 }} />
              <Typography sx={{ fontWeight: 800, color: '#2563EB', fontSize: '1rem' }}>{candidate.matchScore}% Match</Typography>
            </Box>
          </Box>
          <Typography variant="h6" sx={{ color: '#2563EB', fontWeight: 700, mb: 1.5 }}>{candidate.jobTitle}</Typography>
          <Stack direction="row" spacing={3} justifyContent={{ xs: 'center', sm: 'flex-start' }} sx={{ color: '#6B7280' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><LocationOnIcon sx={{ fontSize: 18 }} /> <Typography variant="body2">{candidate.location}</Typography></Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><WorkHistoryIcon sx={{ fontSize: 18 }} /> <Typography variant="body2">{candidate.experience}</Typography></Box>
          </Stack>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ p: 3, bgcolor: '#f5f3ff', border: '1px solid #e5e0fa', borderRadius: '16px', mb: 4 }}>
        <Typography variant="subtitle2" sx={{ color: '#7C3AED', fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon fontSize="small" /> Why this match?
        </Typography>
        <Typography variant="body2" sx={{ color: '#4c1d95', lineHeight: 1.7, fontWeight: 500 }}>{candidate.reason}</Typography>
      </Paper>

      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: '#111827' }}>Professional Summary</Typography>
      <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.8, mb: 4 }}>{candidate.summary}</Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: '#111827', display: 'flex', alignItems: 'center', gap: 1 }}>
            Top Skills <Chip label={candidate.matchedSkills.length} size="small" sx={{ bgcolor: '#dcfce7', color: '#10b981', fontWeight: 800, height: 20 }} />
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {candidate.matchedSkills.map(skill => (
              <Chip key={skill} label={skill} sx={{ bgcolor: '#eff6ff', color: '#2563EB', fontWeight: 600, border: '1px solid #dbeafe' }} />
            ))}
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: '#111827', display: 'flex', alignItems: 'center', gap: 1 }}>
            Gap Analysis <Chip label={candidate.missingSkills.length} size="small" sx={{ bgcolor: '#fef2f2', color: '#ef4444', fontWeight: 800, height: 20 }} />
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {candidate.missingSkills.map(skill => (
              <Chip key={skill} label={skill} sx={{ bgcolor: '#F8FAFC', color: '#6B7280', fontWeight: 600, border: '1px solid #E5E7EB' }} />
            ))}
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid #E5E7EB' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={() => navigate(`/candidate-profile/${candidate.id}`, { state: { applicant: candidate, jobId, jobTitle } })}
              sx={{ bgcolor: '#2563EB', py: 1.8, fontWeight: 800, fontSize: '0.95rem' }}
            >
              View Full Profile
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={() => toggleSave(candidate.id)}
              startIcon={savedCandidates.has(candidate.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              sx={{ 
                py: 1.8, fontWeight: 800, fontSize: '0.95rem',
                color: savedCandidates.has(candidate.id) ? '#ef4444' : '#111827',
                borderColor: savedCandidates.has(candidate.id) ? '#ef4444' : '#E5E7EB',
                '&:hover': { borderColor: '#ef4444', bgcolor: '#fef2f2' }
              }}
            >
              {savedCandidates.has(candidate.id) ? "Saved" : "Save Candidate"}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#F8FAFC' }}>
      {/* Header */}
      <Box sx={{ py: 1.5, px: 3, bgcolor: '#FFFFFF', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1000 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: '#6B7280' }}><ArrowBackIcon /></IconButton>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#111827', display: 'flex', alignItems: 'center', gap: 1.5, letterSpacing: '-0.02em' }}>
              {isMatchingMode ? (
                <>
                  <AutoAwesomeIcon sx={{ color: '#2563EB' }} /> AI Matching
                </>
              ) : (
                <>
                  <PeopleIcon sx={{ color: '#2563EB' }} /> Job Applicants
                </>
              )}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600 }}>{toTitleCase(jobTitle)}</Typography>
          </Box>
        </Box>
        
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#6B7280' }}>
            {currentIndex + 1} of {candidates.length} candidates
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            <Button size="small" sx={{ fontWeight: 700, color: '#6B7280' }}>Export List</Button>
            <IconButton 
              size="small" 
              sx={{ border: '1px solid #E5E7EB', borderRadius: '10px' }}
              onClick={handleMenuOpen}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Stack>
      </Box>

      {/* Global Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: { mt: 1, border: '1px solid #E5E7EB', borderRadius: '12px', minWidth: 160 }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleMenuClose} sx={{ fontWeight: 600, py: 1.5 }}>Share List</MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ fontWeight: 600, py: 1.5 }}>Email All</MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ fontWeight: 600, py: 1.5, color: '#ef4444' }}>Clear List</MenuItem>
      </Menu>

      {isDesktop ? (
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar */}
          <Box sx={{ width: 360, borderRight: '1px solid #E5E7EB', bgcolor: '#FFFFFF', overflowY: 'auto', p: 2 }}>
            <Stack spacing={1}>
              {candidates.map((c, idx) => (
                <Box 
                  key={c.id} 
                  onClick={() => { setCurrentIndex(idx); setSelectedCandidate(c); }}
                  sx={{ 
                    p: 2.5, cursor: 'pointer', borderRadius: '12px',
                    bgcolor: currentIndex === idx ? '#eff6ff' : 'transparent',
                    border: currentIndex === idx ? '1px solid #bfdbfe' : '1px solid transparent',
                    transition: '0.2s',
                    '&:hover': { bgcolor: currentIndex === idx ? '#eff6ff' : '#F8FAFC' }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontWeight: 800, color: '#111827', fontSize: '0.95rem' }}>{c.name}</Typography>
                    <Typography sx={{ fontWeight: 800, color: '#2563EB', fontSize: '0.85rem' }}>{c.matchScore}%</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, display: 'block' }}>{c.jobTitle}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>
          {/* Detail */}
          <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: '#FFFFFF' }}>
            <CandidateDetail candidate={currentCandidate} />
          </Box>
        </Box>
      ) : (
        <Box 
          onTouchStart={handleTouchStart} 
          onTouchEnd={handleTouchEnd}
          sx={{ 
            flex: 1, p: 2, display: 'flex', flexDirection: 'column', 
            position: 'relative', overflow: 'hidden',
            transition: 'transform 0.3s ease-out',
            transform: animating ? (animDir === 'right' ? 'translateX(-100%)' : 'translateX(100%)') : 'translateX(0)'
          }}
        >
          <Paper elevation={0} sx={{ flex: 1, borderRadius: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', border: '1px solid #E5E7EB' }}>
            <CandidateDetail candidate={currentCandidate} />
          </Paper>
          
          <Box sx={{ mt: 2, px: 2 }}>
            <Box sx={{ height: 6, bgcolor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ height: '100%', width: `${((currentIndex + 1) / candidates.length) * 100}%`, bgcolor: '#2563EB', transition: 'width 0.3s' }} />
            </Box>
            <Typography variant="caption" align="center" sx={{ display: 'block', mt: 1, color: '#6B7280', fontWeight: 600 }}>
              Swipe to browse candidates
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CandidateListingScreen;
