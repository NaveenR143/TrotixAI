// screens/candidate/JobFeedScreen.js
import React, { useState } from "react";
import {
  Box, Typography, Button, Stack, useMediaQuery, useTheme, Tooltip, IconButton, Chip,
} from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import JobDetailScreen from "./JobDetailScreen";
import JobListItem from "../../components/jobs/JobListItem";
import MobileJobCard from "../../components/jobs/MobileJobCard";

const JobFeedScreen = ({ jobs, onOpenDetail, onGoBack }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [animDir, setAnimDir] = useState('left');
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [selectedDesktopJob, setSelectedDesktopJob] = useState(jobs[0] || null);
  const [filterMode, setFilterMode] = useState('all');

  const handleSwipe = (dir) => {
    if (animating || currentIndex >= jobs.length) return;
    setAnimDir(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex(p => p + 1);
      setAnimating(false);
    }, 350);
  };

  const handleSwipeVertical = (dir) => {
    if (animating) return;
    if (dir === 'up') {
      if (currentIndex >= jobs.length) return;
      setAnimDir('up');
      setAnimating(true);
      setTimeout(() => {
        setCurrentIndex(p => p + 1);
        setAnimating(false);
      }, 350);
    } else if (dir === 'down') {
      if (currentIndex <= 0) return;
      setAnimDir('down');
      setAnimating(true);
      setTimeout(() => {
        setCurrentIndex(p => p - 1);
        setAnimating(false);
      }, 350);
    }
  };

  const toggleSave = (id) =>
    setSavedJobs(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  if (jobs.length === 0 || (currentIndex >= jobs.length && !isDesktop)) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)', gap: 2 }}>
        <Typography sx={{ fontSize: '2rem' }}>🎉</Typography>
        <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#0f172a' }}>You're all caught up!</Typography>
        <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>No more jobs right now. Check back later.</Typography>
        <Button variant="outlined" onClick={onGoBack} startIcon={<ArrowBackIcon />}
          sx={{ mt: 1, borderColor: '#e2e8f0', color: '#0f172a', '&:hover': { borderColor: '#0f172a' } }}>
          Back to Search
        </Button>
      </Box>
    );
  }

  if (!isDesktop) {
    const job = jobs[currentIndex];
    if (!job) return null;
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 64px)', position: 'relative', overflow: 'hidden' }}>
        <MobileJobCard
          job={job} jobNumber={currentIndex + 1} totalJobs={jobs.length}Animating={animating} animDir={animDir}
          onNext={() => handleSwipeVertical('up')} onPrev={() => handleSwipeVertical('down')} onSkip={() => handleSwipe('left')} onInterested={() => handleSwipe('right')}
          onToggleSave={() => toggleSave(job.id)} isSaved={savedJobs.has(job.id)} onExit={onGoBack} onDetail={() => onOpenDetail(job)}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      <Box sx={{ width: 340, flexShrink: 0, borderRight: '1px solid #e2e8f0', bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', bgcolor: '#fff' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>Recommended <Box component="span" sx={{ ml: 1, px: 1, py: 0.25, bgcolor: '#ede9fe', color: '#4f46e5', borderRadius: 100, fontSize: '0.72rem', fontWeight: 700 }}>{jobs.length}</Box></Typography>
            <Tooltip title="Filters"><IconButton size="small" sx={{ color: '#64748b', bgcolor: '#f8fafc', border: '1px solid #e2e8f0', '&:hover': { bgcolor: '#f1f5f9' } }}><TuneIcon fontSize="small" /></IconButton></Tooltip>
          </Box>
          <Stack direction="row" spacing={0.75} sx={{ overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
            {['all', 'remote', '90%+'].map((f) => (
              <Chip key={f} label={f === 'all' ? 'All Jobs' : f === 'remote' ? '🌐 Remote' : '⚡ 90%+ Match'} size="small" onClick={() => setFilterMode(f)}
                sx={{ cursor: 'pointer', flexShrink: 0, bgcolor: filterMode === f ? '#ede9fe' : '#f8fafc', color: filterMode === f ? '#4f46e5' : '#64748b', border: `1px solid ${filterMode === f ? '#c4b5fd' : '#e2e8f0'}`, fontWeight: filterMode === f ? 600 : 400, '&:hover': { bgcolor: '#ede9fe' } }} />
            ))}
          </Stack>
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5, display: 'flex', flexDirection: 'column', gap: 1, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: 100 } }}>
          {jobs.map((job) => (
            <JobListItem key={job.id} job={job} isSelected={selectedDesktopJob?.id === job.id} onClick={() => setSelectedDesktopJob(job)} />
          ))}
        </Box>
      </Box>
      <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: '#fff', '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: 100 } }}>
        {selectedDesktopJob ? (
          <JobDetailScreen job={selectedDesktopJob} isEmbedded savedJobs={savedJobs} onToggleSave={toggleSave} />
        ) : (
          <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}><Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>Select a job to view details</Typography></Box>
        )}
      </Box>
    </Box>
  );
};

export default JobFeedScreen;
