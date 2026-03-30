// screens/candidate/JobFeedScreen.js
import React, { useState, useMemo } from "react";
import {
  Box, Typography, Button, Stack, useMediaQuery, useTheme, Tooltip, IconButton, Chip, Drawer, Badge,
} from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CareerCoach from "../../components/profile/CareerCoach";
import JobDetailScreen from "./JobDetailScreen";
import JobListItem from "../../components/jobs/JobListItem";
import MobileJobCard from "../../components/jobs/MobileJobCard";
import JobFilters from "../../components/jobs/JobFilters";
import { useSelector } from "react-redux";

const JobFeedScreen = ({ jobs, onOpenDetail, onGoBack }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [animDir, setAnimDir] = useState('left');
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [selectedDesktopJob, setSelectedDesktopJob] = useState(jobs[0] || null);
  const [filterMode, setFilterMode] = useState('all');
  const [showCoach, setShowCoach] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    locations: [],
    types: [],
    workModes: [],
    experiences: [],
    departments: [],
    salaryRange: null,
    matchScore: 0,
  });
  const profile = useSelector((state) => state.UserReducer);

  const handleSwipe = (dir) => {
    if (animating || currentIndex >= filteredJobs.length) return;
    setAnimDir(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex(p => p + 1);
      setAnimating(false);
    }, 350);
  };

  const handlePrev = () => {
    if (animating || currentIndex <= 0) return;
    setAnimDir('left');
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex(p => p - 1);
      setAnimating(false);
    }, 350);
  };

  const toggleSave = (id) =>
    setSavedJobs(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // Filter jobs based on active filters
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    // Apply work mode filter
    if (filters.workModes.length > 0) {
      result = result.filter(job => filters.workModes.includes(job.workMode));
    }

    // Apply job type filter
    if (filters.types.length > 0) {
      result = result.filter(job => filters.types.includes(job.type));
    }

    // Apply location filter
    if (filters.locations.length > 0) {
      result = result.filter(job => filters.locations.includes(job.location));
    }

    // Apply experience level filter
    if (filters.experiences.length > 0) {
      result = result.filter(job => filters.experiences.includes(job.experience));
    }

    // Apply department filter
    if (filters.departments.length > 0) {
      result = result.filter(job => filters.departments.includes(job.department));
    }

    // Apply salary range filter
    if (filters.salaryRange) {
      result = result.filter(job => {
        const salaryMatch = job.salary?.match(/\$(\d+)k*/gi);
        if (salaryMatch && salaryMatch[0]) {
          const salary = parseInt(salaryMatch[0].replace(/[^0-9]/g, "")) * 1000;
          return salary >= filters.salaryRange[0] && salary <= filters.salaryRange[1];
        }
        return true;
      });
    }

    // Apply match score filter
    if (filters.matchScore > 0) {
      result = result.filter(job => job.matchScore >= filters.matchScore);
    }

    return result;
  }, [jobs, filters]);

  // Get active filter count
  const activeFilterCount =
    filters.locations.length +
    filters.types.length +
    filters.workModes.length +
    filters.experiences.length +
    filters.departments.length +
    (filters.salaryRange ? 1 : 0) +
    (filters.matchScore > 0 ? 1 : 0);

  if (jobs.length === 0 || (currentIndex >= filteredJobs.length && !isDesktop)) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)', gap: 2 }}>
        <Typography sx={{ fontSize: '2rem' }}>🎉</Typography>
        <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#0f172a' }}>
          {filteredJobs.length === 0 && activeFilterCount > 0 ? 'No jobs match your filters' : "You're all caught up!"}
        </Typography>
        <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>
          {filteredJobs.length === 0 && activeFilterCount > 0 ? 'Try adjusting your filters.' : 'No more jobs right now. Check back later.'}
        </Typography>
        {activeFilterCount > 0 && (
          <Button variant="outlined" size="small" onClick={() => setFilters({
            locations: [],
            types: [],
            workModes: [],
            experiences: [],
            departments: [],
            salaryRange: null,
            matchScore: 0,
          })}
            sx={{ mt: 1, borderColor: '#e2e8f0', color: '#0f172a', '&:hover': { borderColor: '#0f172a' } }}>
            Clear Filters
          </Button>
        )}
        <Button variant="outlined" onClick={onGoBack} startIcon={<ArrowBackIcon />}
          sx={{ mt: 1, borderColor: '#e2e8f0', color: '#0f172a', '&:hover': { borderColor: '#0f172a' } }}>
          Back to Search
        </Button>
      </Box>
    );
  }

  if (!isDesktop) {
    const job = filteredJobs[currentIndex];
    if (!job) return null;
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 64px)', position: 'relative', overflow: 'hidden' }}>
        {/* Mobile Filter Header */}
        <Box sx={{
          p: 2,
          borderBottom: '1px solid #e2e8f0',
          bgcolor: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 5
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
              {currentIndex + 1} / {filteredJobs.length}
            </Typography>
            {activeFilterCount > 0 && (
              <Chip
                size="small"
                label={`${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''}`}
                sx={{
                  bgcolor: '#ede9fe',
                  color: '#4f46e5',
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}
              />
            )}
          </Box>
          <Badge badgeContent={activeFilterCount > 0 ? activeFilterCount : 0} color="error">
            <IconButton
              size="small"
              onClick={() => setShowFilters(true)}
              sx={{
                color: '#6366f1',
                bgcolor: '#f5f3ff',
                border: '1px solid #c4b5fd',
                '&:hover': { bgcolor: '#ede9fe' }
              }}
            >
              <TuneIcon fontSize="small" />
            </IconButton>
          </Badge>
        </Box>

        <MobileJobCard
          job={job} jobNumber={currentIndex + 1} totalJobs={filteredJobs.length} animating={animating} animDir={animDir}
          onNext={() => handleSwipe('right')} onPrev={() => handlePrev()} onSkip={() => handleSwipe('right')} onInterested={() => handlePrev()}
          onToggleSave={() => toggleSave(job.id)} isSaved={savedJobs.has(job.id)} onExit={onGoBack} onDetail={() => onOpenDetail(job)}
        />

        {/* Mobile Filters Drawer */}
        <Drawer
          anchor="bottom"
          open={showFilters}
          onClose={() => setShowFilters(false)}
          PaperProps={{
            sx: {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: '90vh'
            }
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>Job Filters</Typography>
            <IconButton onClick={() => setShowFilters(false)} size="small"><CloseIcon /></IconButton>
          </Box>
          <Box sx={{ p: 2, overflowY: 'auto', maxHeight: 'calc(90vh - 60px)' }}>
            <JobFilters jobs={jobs} filters={filters} onFiltersChange={setFilters} compact={true} />
          </Box>
          <Box sx={{ p: 2, borderTop: '1px solid #e2e8f0', display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setFilters({
                locations: [],
                types: [],
                workModes: [],
                experiences: [],
                departments: [],
                salaryRange: null,
                matchScore: 0,
              })}
              sx={{ textTransform: 'none' }}
            >
              Clear All
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                setShowFilters(false);
                setCurrentIndex(0);
              }}
              sx={{ textTransform: 'none', background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
            >
              Apply Filters
            </Button>
          </Box>
        </Drawer>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      <Box sx={{ width: 340, flexShrink: 0, borderRight: '1px solid #e2e8f0', bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', bgcolor: '#fff' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
              {filteredJobs.length === 0 ? 'No matches' : 'Recommended'}
              <Box component="span" sx={{ ml: 1, px: 1, py: 0.25, bgcolor: '#ede9fe', color: '#4f46e5', borderRadius: 100, fontSize: '0.72rem', fontWeight: 700 }}>{filteredJobs.length}</Box>
            </Typography>
            <Stack direction="row" spacing={1}>
              <Tooltip title="AI Career Coach">
                <IconButton size="small" onClick={() => setShowCoach(true)} sx={{ color: '#6366f1', bgcolor: '#f5f3ff', border: '1px solid #c4b5fd', '&:hover': { bgcolor: '#ede9fe' } }}>
                  <AutoAwesomeIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Filters">
                <Badge badgeContent={activeFilterCount > 0 ? activeFilterCount : 0} color="error">
                  <IconButton size="small" onClick={() => setShowFilters(true)} sx={{ color: '#64748b', bgcolor: '#f8fafc', border: '1px solid #e2e8f0', '&:hover': { bgcolor: '#f1f5f9' } }}>
                    <TuneIcon fontSize="small" />
                  </IconButton>
                </Badge>
              </Tooltip>
            </Stack>
          </Box>
          <Stack direction="row" spacing={0.75} sx={{ overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
            {['all', 'remote', '90%+'].map((f) => (
              <Chip key={f} label={f === 'all' ? 'All Jobs' : f === 'remote' ? '🌐 Remote' : '⚡ 90%+ Match'} size="small" onClick={() => {
                if (f === 'all') {
                  setFilters({
                    locations: [],
                    types: [],
                    workModes: [],
                    experiences: [],
                    departments: [],
                    salaryRange: null,
                    matchScore: 0,
                  });
                } else if (f === 'remote') {
                  setFilters(prev => ({
                    ...prev,
                    workModes: prev.workModes.includes('Remote') ? [] : ['Remote']
                  }));
                } else if (f === '90%+') {
                  setFilters(prev => ({
                    ...prev,
                    matchScore: prev.matchScore === 90 ? 0 : 90
                  }));
                }
              }}
                sx={{ cursor: 'pointer', flexShrink: 0, bgcolor: (f === 'all' && activeFilterCount === 0) || (f === 'remote' && filters.workModes.includes('Remote')) || (f === '90%+' && filters.matchScore >= 90) ? '#ede9fe' : '#f8fafc', color: (f === 'all' && activeFilterCount === 0) || (f === 'remote' && filters.workModes.includes('Remote')) || (f === '90%+' && filters.matchScore >= 90) ? '#4f46e5' : '#64748b', border: `1px solid ${(f === 'all' && activeFilterCount === 0) || (f === 'remote' && filters.workModes.includes('Remote')) || (f === '90%+' && filters.matchScore >= 90) ? '#c4b5fd' : '#e2e8f0'}`, fontWeight: (f === 'all' && activeFilterCount === 0) || (f === 'remote' && filters.workModes.includes('Remote')) || (f === '90%+' && filters.matchScore >= 90) ? 600 : 400, '&:hover': { bgcolor: '#ede9fe' } }} />
            ))}
          </Stack>
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5, display: 'flex', flexDirection: 'column', gap: 1, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: 100 } }}>
          {filteredJobs.length === 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center' }}>No jobs match your filters</Typography>
            </Box>
          ) : (
            filteredJobs.map((job) => (
              <JobListItem key={job.id} job={job} isSelected={selectedDesktopJob?.id === job.id} onClick={() => setSelectedDesktopJob(job)} />
            ))
          )}
        </Box>
      </Box>

      {/* Filters Drawer for Desktop */}
      <Drawer
        anchor="right"
        open={showFilters}
        onClose={() => setShowFilters(false)}
        PaperProps={{ sx: { width: { xs: '100vw', sm: 420 }, borderLeft: '1px solid #e2e8f0', boxShadow: '-4px 0 20px rgba(0,0,0,0.05)' } }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0' }}>
          <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>Job Filters</Typography>
          <IconButton onClick={() => setShowFilters(false)} size="small"><CloseIcon /></IconButton>
        </Box>
        <Box sx={{ p: 2, overflowY: 'auto', maxHeight: 'calc(100vh - 120px)' }}>
          <JobFilters jobs={jobs} filters={filters} onFiltersChange={setFilters} compact={true} />
        </Box>
      </Drawer>

      <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: '#fff', '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: 100 } }}>
        {selectedDesktopJob ? (
          <JobDetailScreen job={selectedDesktopJob} isEmbedded savedJobs={savedJobs} onToggleSave={toggleSave} />
        ) : (
          <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}><Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>Select a job to view details</Typography></Box>
        )}
      </Box>

      {/* AI Career Coach Drawer */}
      <Drawer
        anchor="right"
        open={showCoach}
        onClose={() => setShowCoach(false)}
        PaperProps={{ sx: { width: { xs: '100vw', sm: 400 }, borderLeft: '1px solid #e2e8f0', boxShadow: '-4px 0 20px rgba(0,0,0,0.05)' } }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0' }}>
          <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>AI Career Assistant</Typography>
          <IconButton onClick={() => setShowCoach(false)} size="small"><CloseIcon /></IconButton>
        </Box>
        <CareerCoach profile={profile} />
      </Drawer>
    </Box>
  );
};

export default JobFeedScreen;
