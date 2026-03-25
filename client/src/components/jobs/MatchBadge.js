// components/jobs/MatchBadge.js
import React from "react";
import { Box, Typography } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { getMatchColor } from "../../utils/themeUtils";

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

export default MatchBadge;
