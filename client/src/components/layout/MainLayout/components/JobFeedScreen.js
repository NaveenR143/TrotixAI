// components/JobFeedScreen.js
import React, { useState } from "react";
import {
  Box, Typography, Button, Card, Chip, Avatar, IconButton,
  Stack, useMediaQuery, useTheme, Divider, Tooltip, Badge,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import TuneIcon from "@mui/icons-material/Tune";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import JobDetailScreen from "./JobDetailScreen";
import { getMatchColor, getWorkModeIcon, fadeSlideUp } from "../utils";

// ── Match score badge ──────────────────────────────────────────────────────────
const MatchBadge = ({ score, size = 'md' }) => {
  const c = getMatchColor(score);
  const isLg = size === 'lg';
  return (
    <Box
      sx={{
        display: 'inline-flex', alignItems: 'center', gap: 0.6,
        px: isLg ? 1.5 : 1, py: isLg ? 0.6 : 0.3,
        borderRadius: 100, border: `1px solid ${c.border}`,
        bgcolor: c.bg,
      }}
    >
      <AutoAwesomeIcon sx={{ fontSize: isLg ? 13 : 10, color: c.main }} />
      <Typography sx={{ fontSize: isLg ? '0.82rem' : '0.7rem', fontWeight: 700, color: c.main }}>
        {score}% match
      </Typography>
    </Box>
  );
};

// ── Sidebar job list item ─────────────────────────────────────────────────────
const JobListItem = ({ job, isSelected, onClick }) => {
  const c = getMatchColor(job.matchScore);
  return (
    <Box
      onClick={onClick}
      sx={{
        p: 2, borderRadius: 2, cursor: 'pointer',
        border: `1px solid ${isSelected ? '#6366f1' : '#e2e8f0'}`,
        bgcolor: isSelected ? '#f5f3ff' : '#fff',
        transition: 'all 0.15s',
        '&:hover': { borderColor: isSelected ? '#6366f1' : '#94a3b8', bgcolor: isSelected ? '#f5f3ff' : '#f8fafc' },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.75 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', lineHeight: 1.3, flex: 1, pr: 1 }} noWrap>
          {job.title}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.4, flexShrink: 0 }}>
          <MatchBadge score={job.matchScore} />
          {job.posted && (
            <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{job.posted}</Typography>
          )}
        </Box>
      </Box>
      <Typography sx={{ fontSize: '0.8rem', color: '#64748b', mb: 0.75 }}>{job.company}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.25 }}>
        <LocationOnIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
        <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>{job.location}</Typography>
        <Typography sx={{ fontSize: '0.75rem', color: '#cbd5e1', mx: 0.25 }}>·</Typography>
        <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          {getWorkModeIcon(job.workMode)} {job.workMode}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {job.keySkillsMatched.slice(0, 3).map(s => (
          <Chip key={s} label={s} size="small"
            sx={{ height: 18, fontSize: '0.68rem', bgcolor: isSelected ? '#ede9fe' : '#f8fafc', color: isSelected ? '#4f46e5' : '#64748b', border: `1px solid ${isSelected ? '#c4b5fd' : '#e2e8f0'}` }}
          />
        ))}
        {job.keySkillsMatched.length > 3 && (
          <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', alignSelf: 'center' }}>+{job.keySkillsMatched.length - 3}</Typography>
        )}
      </Box>
    </Box>
  );
};

// ── Mobile swipe card ─────────────────────────────────────────────────────────
// HEADER_H: height of the sticky internal header (progress bar 3px + counter row 48px)
// This is used as paddingTop on the scrollable content so it's never hidden behind the header.
const CARD_HEADER_H = 51; // px — 3px progress bar + 48px counter row
const CARD_FOOTER_H = 82; // px — bottom action bar (pb:2 + pt:2 + 54px buttons)

const MobileJobCard = ({
  job,
  jobNumber,
  totalJobs,
  onNext,
  onPrev,
  onSkip,
  onInterested,
  onToggleSave,
  isSaved,
  onExit,
  onDetail,
  animDir,
  animating,
}) => {
  const c = getMatchColor(job.matchScore);
  const [touchStartY, setTouchStartY] = useState(null);
  const [touchStartX, setTouchStartX] = useState(null);
  const [currentY, setCurrentY] = useState(null);
  const [currentX, setCurrentX] = useState(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swipeOffsetX, setSwipeOffsetX] = useState(0);

  const handleTouchStart = (e) => {
    setTouchStartY(e.touches[0].clientY);
    setTouchStartX(e.touches[0].clientX);
    setCurrentY(e.touches[0].clientY);
    setCurrentX(e.touches[0].clientX);
    setSwipeOffset(0);
    setSwipeOffsetX(0);
  };

  const handleTouchMove = (e) => {
    if (touchStartY === null || touchStartX === null) return;
    const y = e.touches[0].clientY;
    const x = e.touches[0].clientX;
    setCurrentY(y);
    setCurrentX(x);
    setSwipeOffset((y - touchStartY) * 0.65);
    setSwipeOffsetX((x - touchStartX) * 0.65);
  };

  const handleTouchEnd = () => {
    if (touchStartY === null || currentY === null) return;
    const distanceY = touchStartY - currentY;
    const distanceX = touchStartX - currentX;

    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      if (distanceX > 60 && onSkip) onSkip();
      else if (distanceX < -60 && onInterested) onInterested();
    } else {
      if (distanceY > 60 && onNext) onNext();
      else if (distanceY < -60 && onPrev) onPrev();
    }

    setTouchStartY(null);
    setCurrentY(null);
    setTouchStartX(null);
    setCurrentX(null);
    setSwipeOffset(0);
    setSwipeOffsetX(0);
  };

  let transformValue = `translateX(${swipeOffsetX}px) rotate(${swipeOffsetX * 0.05}deg)`;
  if (animating) {
    if (animDir === 'right') transformValue = 'translate(120%, 0px) rotate(10deg)';
    else if (animDir === 'left') transformValue = 'translate(-120%, 0px) rotate(-10deg)';
    else if (animDir === 'up') transformValue = 'translateY(-110%)';
    else if (animDir === 'down') transformValue = 'translateY(110%)';
  }

  return (
    <Box
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      sx={{
        position: 'absolute',
        inset: 0,
        bgcolor: '#ffffff',
        backgroundImage: 'linear-gradient(160deg, #ffffff 0%, rgba(248,250,252,0.9) 40%, rgba(238,242,246,0.95) 100%)',
        boxShadow: '0 4px 20px rgba(15,23,42,0.06)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        touchAction: 'pan-x',
        transition: animating
          ? 'transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.35s'
          : swipeOffset !== 0 || swipeOffsetX !== 0
            ? 'none'
            : 'transform 0.2s cubic-bezier(0.4,0,0.2,1)',
        transform: transformValue,
        opacity: animating ? 0 : 1,
      }}
    >
      {/* ── Sticky internal header (progress bar + counter) ── */}
      {/* position: sticky inside a flex column keeps it pinned at the top   */}
      {/* while the scrollable content below it scrolls freely.              */}
      <Box
        sx={{
          flexShrink: 0,          // never shrink — always full height
          zIndex: 6,
          bgcolor: '#ffffff',     // solid bg so scrolled content doesn't bleed through
          borderBottom: '1px solid rgba(226,232,240,0.6)',
        }}
      >
        {/* Progress bar */}
        <Box sx={{ height: 3, bgcolor: 'rgba(0,0,0,0.06)', width: '100%' }}>
          <Box
            sx={{
              height: '100%',
              width: `${totalJobs > 0 ? (jobNumber / totalJobs) * 100 : 0}%`,
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
              transition: 'width 0.35s',
            }}
          />
        </Box>

        {/* Counter + exit row */}
        <Box sx={{ px: 2, py: 1.25, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em' }}>
            <Box component="span" sx={{ color: '#0f172a' }}>{jobNumber}</Box> / {totalJobs}
          </Typography>
          <Button
            size="small"
            onClick={(e) => { e.stopPropagation(); onExit?.(); }}
            sx={{ minWidth: 0, p: 0.5, fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}
          >
            Exit
          </Button>
        </Box>
      </Box>

      {/* ── Scrollable content ── */}
      {/* flex: 1 + overflowY: auto means this grows to fill space between    */}
      {/* the sticky header above and the absolute action bar below.          */}
      {/* paddingBottom must be >= CARD_FOOTER_H so the last content line     */}
      {/* is fully visible above the action bar overlay.                      */}
      <Box
        onClick={onDetail}
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 2.5,
          pt: 2,
          pb: `${CARD_FOOTER_H + 16}px`,   // ← key fix: clears the action bar
          cursor: 'pointer',
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <MatchBadge score={job.matchScore} size="lg" />
          {job.posted && (
            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>{job.posted}</Typography>
          )}
        </Box>

        <Typography sx={{ fontWeight: 900, fontSize: '1.7rem', color: '#0f172a', lineHeight: 1.15, mb: 1, letterSpacing: '-0.02em' }}>
          {job.title}
        </Typography>

        <Typography sx={{ fontSize: '1.1rem', color: '#64748b', fontWeight: 600, mb: 3 }}>
          {job.company}
        </Typography>

        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 4 }}>
          <Chip
            icon={<LocationOnIcon sx={{ fontSize: '0.9rem !important' }} />}
            label={job.location}
            size="small"
            sx={{ bgcolor: '#ffffff', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 2, fontSize: '0.8rem', px: 0.5, py: 1.5, boxShadow: '0 2px 6px rgba(15,23,42,0.03)' }}
          />
          <Chip
            label={job.salary}
            size="small"
            sx={{ bgcolor: 'rgba(16, 185, 129, 0.08)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 2, fontSize: '0.8rem', fontWeight: 700, px: 0.5, py: 1.5 }}
          />
          <Chip
            label={`${getWorkModeIcon(job.workMode)} ${job.workMode}`}
            size="small"
            sx={{ bgcolor: '#ffffff', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 2, fontSize: '0.8rem', px: 0.5, py: 1.5, boxShadow: '0 2px 6px rgba(15,23,42,0.03)' }}
          />
        </Stack>

        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>
            Matched Skills
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {job.keySkillsMatched.map((s) => (
              <Chip
                key={s} label={s} size="small"
                sx={{
                  background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)', color: '#4f46e5',
                  border: '1px solid rgba(124, 58, 237, 0.15)', borderRadius: 2, fontSize: '0.75rem', fontWeight: 600,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
                }}
              />
            ))}
          </Box>
        </Box>

        {job.keySkillsMissing?.length > 0 && (
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5 }}>
              Missing Skills
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {job.keySkillsMissing.slice(0, 6).map((s) => (
                <Chip
                  key={s} label={s} size="small"
                  sx={{
                    background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', color: '#dc2626',
                    border: '1px solid rgba(220, 38, 38, 0.15)', borderRadius: 2, fontSize: '0.75rem', fontWeight: 600,
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
                  }}
                />
              ))}
              {job.keySkillsMissing.length > 6 && (
                <Typography sx={{ color: '#dc2626', fontWeight: 900, lineHeight: '24px', px: 0.5, letterSpacing: '1px' }}>...</Typography>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* ── Fixed bottom action bar ── */}
      {/* position: absolute so it overlays the scrollable content.           */}
      {/* The gradient fade above it visually signals more content below.     */}
      <Box
        sx={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.96) 28%, #ffffff 100%)',
          px: 2.5, pb: 'calc(env(safe-area-inset-bottom) + 12px)', pt: 2,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1.5,
          zIndex: 10,
          minHeight: `${CARD_FOOTER_H}px`,
        }}
      >
        <IconButton
          onClick={(e) => { e.stopPropagation(); onSkip?.(); }}
          sx={{
            width: 54, height: 54,
            bgcolor: '#ffffff', color: '#ef4444', border: '1px solid #fee2e2',
            boxShadow: '0 8px 16px rgba(239,68,68,0.1)',
            transition: 'all 0.2s', '&:hover': { bgcolor: '#fef2f2', transform: 'scale(1.05)' }, '&:active': { transform: 'scale(0.95)' }
          }}
        >
          <CloseIcon fontSize="medium" />
        </IconButton>

        <IconButton
          onClick={(e) => { e.stopPropagation(); onInterested?.(); }}
          sx={{
            width: 54, height: 54,
            bgcolor: '#ffffff', color: '#10b981', border: '1px solid #d1fae5',
            boxShadow: '0 8px 16px rgba(16,185,129,0.1)',
            transition: 'all 0.2s', '&:hover': { bgcolor: '#ecfdf5', transform: 'scale(1.05)' }, '&:active': { transform: 'scale(0.95)' }
          }}
        >
          <CheckIcon fontSize="medium" />
        </IconButton>

        <IconButton
          onClick={(e) => { e.stopPropagation(); onToggleSave?.(); }}
          sx={{
            width: 54, height: 54,
            bgcolor: isSaved ? '#fffbeb' : '#ffffff', color: '#f59e0b', border: `1px solid ${isSaved ? '#fde68a' : '#fef3c7'}`,
            boxShadow: '0 8px 16px rgba(245,158,11,0.1)',
            transition: 'all 0.2s', '&:hover': { bgcolor: '#fffbeb', transform: 'scale(1.05)' }, '&:active': { transform: 'scale(0.95)' }
          }}
        >
          {isSaved ? <BookmarkIcon fontSize="medium" /> : <BookmarkBorderIcon fontSize="medium" />}
        </IconButton>

        <Button
          onClick={(e) => { e.stopPropagation(); onDetail?.(); }}
          sx={{
            flexGrow: 1, height: 54, borderRadius: 100, color: 'white', fontWeight: 800, fontSize: '1rem',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)',
            boxShadow: '0 10px 24px rgba(99,102,241,0.35), inset 0 2px 0 rgba(255,255,255,0.2)',
            transition: 'all 0.2s', '&:hover': { transform: 'scale(1.02) translateY(-2px)', boxShadow: '0 14px 30px rgba(99,102,241,0.45)' }, '&:active': { transform: 'scale(0.98)' }
          }}
        >
          Apply
        </Button>
      </Box>
    </Box>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
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

  // ── Empty state ────────────────────────────────────────────────────────────
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

  // ── Mobile ─────────────────────────────────────────────────────────────────
  if (!isDesktop) {
    const job = jobs[currentIndex];
    if (!job) return null;
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 64px)', position: 'relative', overflow: 'hidden' }}>
        <MobileJobCard
          job={job}
          jobNumber={currentIndex + 1}
          totalJobs={jobs.length}
          animating={animating}
          animDir={animDir}
          onNext={() => handleSwipeVertical('up')}
          onPrev={() => handleSwipeVertical('down')}
          onSkip={() => handleSwipe('left')}
          onInterested={() => handleSwipe('right')}
          onToggleSave={() => toggleSave(job.id)}
          isSaved={savedJobs.has(job.id)}
          onExit={onGoBack}
          onDetail={() => onOpenDetail(job)}
        />
      </Box>
    );
  }

  // ── Desktop split layout ───────────────────────────────────────────────────
  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      {/* Left sidebar */}
      <Box
        sx={{
          width: 340, flexShrink: 0,
          borderRight: '1px solid #e2e8f0',
          bgcolor: '#f8fafc',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Sidebar header */}
        <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', bgcolor: '#fff' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
              Recommended
              <Box component="span" sx={{ ml: 1, px: 1, py: 0.25, bgcolor: '#ede9fe', color: '#4f46e5', borderRadius: 100, fontSize: '0.72rem', fontWeight: 700 }}>
                {jobs.length}
              </Box>
            </Typography>
            <Tooltip title="Filters">
              <IconButton size="small" sx={{ color: '#64748b', bgcolor: '#f8fafc', border: '1px solid #e2e8f0', '&:hover': { bgcolor: '#f1f5f9' } }}>
                <TuneIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Filter chips */}
          <Stack direction="row" spacing={0.75} sx={{ overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
            {['all', 'remote', '90%+'].map((f) => (
              <Chip
                key={f}
                label={f === 'all' ? 'All Jobs' : f === 'remote' ? '🌐 Remote' : '⚡ 90%+ Match'}
                size="small"
                onClick={() => setFilterMode(f)}
                sx={{
                  cursor: 'pointer', flexShrink: 0,
                  bgcolor: filterMode === f ? '#ede9fe' : '#f8fafc',
                  color: filterMode === f ? '#4f46e5' : '#64748b',
                  border: `1px solid ${filterMode === f ? '#c4b5fd' : '#e2e8f0'}`,
                  fontWeight: filterMode === f ? 600 : 400,
                  '&:hover': { bgcolor: '#ede9fe' },
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* Job list */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5, display: 'flex', flexDirection: 'column', gap: 1, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-track': { bgcolor: 'transparent' }, '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: 100 } }}>
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

      {/* Right panel */}
      <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: '#fff', '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-track': { bgcolor: 'transparent' }, '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: 100 } }}>
        {selectedDesktopJob ? (
          <JobDetailScreen job={selectedDesktopJob} isEmbedded savedJobs={savedJobs} onToggleSave={toggleSave} />
        ) : (
          <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem' }}>Select a job to view details</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default JobFeedScreen;