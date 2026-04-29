import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Box, Typography, Button, Stack, useMediaQuery, useTheme, Tooltip, IconButton, Chip, Drawer, Badge, CircularProgress, Paper, Avatar, Container, Divider, Grid
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
  const matchColor = getMatchColor(currentCandidate.matchScore);

  const CandidateDetail = ({ candidate }) => (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-start' } }}>
        <Avatar src={candidate.profileImage} sx={{ width: 120, height: 120, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
        <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>{candidate.name}</Typography>
            <Box sx={{ bgcolor: matchColor.bg, border: `2px solid ${matchColor.main}`, borderRadius: 2, px: 2, py: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <StarIcon sx={{ color: matchColor.main, fontSize: 20 }} />
              <Typography sx={{ fontWeight: 700, color: matchColor.main }}>{candidate.matchScore}% Match</Typography>
            </Box>
          </Box>
          <Typography variant="h6" sx={{ color: '#6366f1', fontWeight: 600, mb: 1 }}>{candidate.jobTitle}</Typography>
          <Stack direction="row" spacing={2} justifyContent={{ xs: 'center', sm: 'flex-start' }} sx={{ color: '#64748b' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><LocationOnIcon fontSize="small" /> {candidate.location}</Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><WorkHistoryIcon fontSize="small" /> {candidate.experience}</Box>
          </Stack>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ p: 2, bgcolor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 2, mb: 4 }}>
        <Typography variant="subtitle2" sx={{ color: '#0369a1', fontWeight: 700, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon fontSize="small" /> AI Rationale
        </Typography>
        <Typography sx={{ color: '#0c4a6e', fontSize: '0.95rem' }}>{candidate.reason}</Typography>
      </Paper>

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Professional Summary</Typography>
      <Typography sx={{ color: '#475569', lineHeight: 1.7, mb: 4 }}>{candidate.summary}</Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            Matched Skills <Chip label={candidate.matchedSkills.length} size="small" sx={{ bgcolor: '#dcfce7', color: '#16a34a', fontWeight: 700 }} />
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {candidate.matchedSkills.map(skill => (
              <Chip key={skill} label={skill} sx={{ bgcolor: '#e0e7ff', color: '#4f46e5', fontWeight: 600 }} />
            ))}
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            Missing Skills <Chip label={candidate.missingSkills.length} size="small" sx={{ bgcolor: '#fee2e2', color: '#ef4444', fontWeight: 700 }} />
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {candidate.missingSkills.map(skill => (
              <Chip key={skill} label={skill} sx={{ bgcolor: '#f1f5f9', color: '#64748b', fontWeight: 600 }} />
            ))}
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid #e2e8f0' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button 
            variant="contained" 
            fullWidth 
            onClick={() => navigate(`/candidate-profile/${candidate.id}`, { state: { applicant: candidate, jobId, jobTitle } })}
            sx={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', py: 1.5, fontWeight: 700 }}
          >
            View Full Profile
          </Button>
          <Button 
            variant="outlined" 
            fullWidth 
            sx={{ py: 1.5, fontWeight: 700, borderColor: '#e2e8f0', color: '#475569' }}
          >
            Contact Candidate
          </Button>
          <Button 
            variant="outlined" 
            sx={{ 
              py: 1.5, px: 3, fontWeight: 700, 
              color: savedCandidates.has(candidate.id) ? '#ef4444' : '#64748b', 
              borderColor: savedCandidates.has(candidate.id) ? '#ef4444' : '#e2e8f0',
              minWidth: 'fit-content'
            }}
            onClick={() => toggleSave(candidate.id)}
            startIcon={savedCandidates.has(candidate.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          >
            {savedCandidates.has(candidate.id) ? "Saved" : "Save"}
          </Button>
        </Stack>
      </Box>

    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', bgcolor: '#f8fafc' }}>
      {/* Header */}
      <Box sx={{ p: 2, bgcolor: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(-1)} size="small"><ArrowBackIcon /></IconButton>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
              {isMatchingMode ? (
                <>
                  <AutoAwesomeIcon sx={{ color: '#6366f1', fontSize: 20 }} /> AI Candidate Match
                </>
              ) : (
                <>
                  <PeopleIcon sx={{ color: '#6366f1', fontSize: 20 }} /> Job Applicants
                </>
              )}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>{toTitleCase(jobTitle)}</Typography>
          </Box>
        </Box>
        {!isDesktop && (
          <Typography sx={{ fontWeight: 700, color: '#6366f1' }}>{currentIndex + 1} / {candidates.length}</Typography>
        )}
      </Box>

      {isDesktop ? (
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar */}
          <Box sx={{ width: 340, borderRight: '1px solid #e2e8f0', bgcolor: '#fff', overflowY: 'auto' }}>
            {candidates.map((c, idx) => (
              <Box 
                key={c.id} 
                onClick={() => { setCurrentIndex(idx); setSelectedCandidate(c); }}
                sx={{ 
                  p: 2, cursor: 'pointer', borderBottom: '1px solid #f1f5f9',
                  bgcolor: currentIndex === idx ? '#f5f3ff' : 'transparent',
                  borderLeft: currentIndex === idx ? '4px solid #6366f1' : '4px solid transparent',
                  '&:hover': { bgcolor: '#f8fafc' }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>{c.name}</Typography>
                  <Typography sx={{ fontWeight: 700, color: getMatchColor(c.matchScore).main, fontSize: '0.8rem' }}>{c.matchScore}%</Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>{c.jobTitle}</Typography>
              </Box>
            ))}
          </Box>
          {/* Detail */}
          <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: '#fff' }}>
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
          <Paper elevation={0} sx={{ flex: 1, borderRadius: 4, border: '1px solid #e2e8f0', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <CandidateDetail candidate={currentCandidate} />
          </Paper>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
              💡 Swipe left or right to browse {isMatchingMode ? 'candidates' : 'applicants'}
            </Typography>
            <Box sx={{ height: 4, bgcolor: '#e2e8f0', borderRadius: 2, mt: 1, overflow: 'hidden' }}>
              <Box sx={{ height: '100%', width: `${((currentIndex + 1) / candidates.length) * 100}%`, bgcolor: '#6366f1', transition: 'width 0.3s' }} />
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CandidateListingScreen;
