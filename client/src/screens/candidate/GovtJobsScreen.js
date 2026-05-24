import React, { useState, useEffect, useRef } from "react";
import {
  Box, Typography, Button, Stack, useMediaQuery, useTheme, IconButton, CircularProgress, Container, Chip
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { API_BASE_URL, API_ENDPOINTS } from "../../config/api.config";
import JobListItem from "../../components/jobs/JobListItem";
import MobileJobCard from "../../components/jobs/MobileJobCard";
import GovtJobDetailScreen from "./GovtJobDetailScreen";

const GovtJobsScreen = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();
  const { mobile } = useSelector((state) => state.UserReducer);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UX State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [animDir, setAnimDir] = useState('left');
  const [selectedDesktopJob, setSelectedDesktopJob] = useState(null);
  const [showMobileDetailView, setShowMobileDetailView] = useState(false);

  // Touch handling for swipe
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleSwipe('right');
      else handlePrev();
    }
  };

  useEffect(() => {
    const fetchGovtJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.GOVT_JOBS}`);
        
        if (response.data && response.data.data) {
          const mappedJobs = response.data.data.map(job => ({
            id: job.id,
            title: job.title,
            company: job.state || "Government Department",
            location: job.location || job.state,
            type: job.job_type || "Govt Job",
            posted: job.posted_date || "Recently",
            expired_date: job.expired_date,
            qualification: job.qualification,
            description: job.description,
            apply_url: job.apply_url,
            pdf_url: job.pdf_url,
            summary: job.qualification || job.description || "View details for more information.",
            matchScore: 0, 
            workMode: "On-site", 
            keySkillsMatched: [],
            logoColor: "#059669", // Green for govt jobs
          }));
          setJobs(mappedJobs);
          if (mappedJobs.length > 0) {
            setSelectedDesktopJob(mappedJobs[0]);
          }
        } else {
          setError("No government jobs found at the moment.");
        }
      } catch (err) {
        console.error("Error fetching govt jobs:", err);
        setError("Failed to load government jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchGovtJobs();
  }, []);

  const handleSwipe = (dir) => {
    if (animating || currentIndex >= jobs.length - 1) {
       if (currentIndex >= jobs.length - 1 && !animating) {
          setCurrentIndex(p => p + 1);
       }
       return;
    };
    setAnimDir(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex(p => p + 1);
      setAnimating(false);
    }, 300);
  };

  const handlePrev = () => {
    if (animating || currentIndex <= 0) return;
    setAnimDir('left');
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex(p => p - 1);
      setAnimating(false);
    }, 300);
  };

  const onGoBack = () => navigate('/dashboard');

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100dvh - 64px)', gap: 3, bgcolor: '#f8fafc' }}>
        <CircularProgress size={50} sx={{ color: '#059669' }} />
        <Typography sx={{ color: '#64748b', fontWeight: 500 }}>Fetching latest government opportunities...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100dvh - 64px)', gap: 2, px: 4, textAlign: 'center' }}>
        <Typography sx={{ fontSize: '3rem' }}>⚠️</Typography>
        <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#0f172a' }}>{error}</Typography>
        <Button variant="contained" onClick={onGoBack} startIcon={<ArrowBackIcon />}
          sx={{ mt: 2, bgcolor: '#059669', '&:hover': { bgcolor: '#047857' }, borderRadius: '12px', textTransform: 'none', px: 4 }}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  // Mobile View
  if (!isDesktop) {
    if (jobs.length === 0 || currentIndex >= jobs.length) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100dvh - 64px)', gap: 2, px: 4, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '3rem' }}>✨</Typography>
          <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#0f172a', mb: 0.5 }}>You're all caught up!</Typography>
          <Typography sx={{ color: '#64748b', fontSize: '1rem', maxWidth: 400, mb: 2, lineHeight: 1.6 }}>
            We couldn't find any more government jobs at this time. Check back later for new opportunities.
          </Typography>
          <Button variant="contained" onClick={onGoBack} startIcon={<ArrowBackIcon />}
            sx={{ mt: 2, bgcolor: '#059669', '&:hover': { bgcolor: '#047857' }, borderRadius: '12px', textTransform: 'none', px: 4 }}>
            Back to Dashboard
          </Button>
        </Box>
      );
    }

    const currentJob = jobs[currentIndex];

    if (showMobileDetailView) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 64px)' }}>
          <GovtJobDetailScreen 
            job={currentJob} 
            isEmbedded={false} 
            onBack={() => setShowMobileDetailView(false)} 
          />
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 64px)', position: 'relative', overflow: 'hidden', bgcolor: '#f8fafc' }}>
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
          <MobileJobCard
            job={currentJob}
            onSkip={() => handleSwipe('right')}
            onInterested={() => handlePrev()}
            onExit={onGoBack}
            onDetail={() => setShowMobileDetailView(true)}
            isSaved={false}
            onToggleSave={() => {}}
          />
        </Box>

        <Box sx={{ pb: 3, px: 4 }}>
          <Box sx={{ height: 6, bgcolor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ height: '100%', width: `${((currentIndex + 1) / jobs.length) * 100}%`, bgcolor: '#059669', transition: 'width 0.3s' }} />
          </Box>
          <Typography variant="caption" align="center" sx={{ display: 'block', mt: 1, color: '#6B7280', fontWeight: 600 }}>
            Swipe to browse jobs
          </Typography>
        </Box>
      </Box>
    );
  }

  // Desktop View
  return (
    <Box sx={{ display: 'flex', height: 'calc(100dvh - 64px)', overflow: 'hidden' }}>
      {/* Sidebar List */}
      <Box sx={{ width: 340, flexShrink: 0, borderRight: '1px solid #e2e8f0', bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', bgcolor: '#fff' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
            Government Jobs
            <Box component="span" sx={{ ml: 1, px: 1, py: 0.25, bgcolor: '#ecfdf5', color: '#059669', borderRadius: 100, fontSize: '0.72rem', fontWeight: 700 }}>{jobs.length}</Box>
          </Typography>
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5, display: 'flex', flexDirection: 'column', gap: 1, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: 100 } }}>
          {jobs.map((job) => (
            <JobListItem 
              key={job.id} 
              job={job} 
              isSelected={selectedDesktopJob?.id === job.id} 
              onClick={() => setSelectedDesktopJob(job)} 
            />
          ))}
        </Box>
      </Box>

      {/* Main Detail View */}
      <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: '#fff', '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: 100 } }}>
        {selectedDesktopJob ? (
          <GovtJobDetailScreen job={selectedDesktopJob} isEmbedded />
        ) : (
          <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>Select a job to view details</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default GovtJobsScreen;
