// components/jobs/MobileJobCard.js
import React, { useState } from "react";
import { Box, Typography, Button, Chip, Stack, IconButton } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import MatchBadge from "./MatchBadge";
import { getWorkModeIcon } from "../../utils/themeUtils";

const CARD_HEADER_H = 51;
const CARD_FOOTER_H = 82;

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
      <Box
        sx={{
          flexShrink: 0,
          zIndex: 6,
          bgcolor: '#ffffff',
          borderBottom: '1px solid rgba(226,232,240,0.6)',
        }}
      >
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

      <Box
        onClick={onDetail}
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 2.5,
          pt: 2,
          pb: `${CARD_FOOTER_H + 16}px`,
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

export default MobileJobCard;
