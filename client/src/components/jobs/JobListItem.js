// components/jobs/JobListItem.js
import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MatchBadge from "./MatchBadge";
import { getMatchColor, getWorkModeIcon } from "../../utils/themeUtils";

const JobListItem = ({ job, isSelected, onClick }) => {
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

export default JobListItem;
