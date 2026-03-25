// components/common/StatPill.js
import React from "react";
import { Box, Typography } from "@mui/material";
import { fadeSlideUp } from "../../utils/themeUtils";

const StatPill = ({ label, value, delay = 0 }) => (
  <Box
    sx={{
      display: 'inline-flex', alignItems: 'center', gap: 1,
      px: 2, py: 0.75, borderRadius: 100,
      bgcolor: '#fff', border: '1px solid #e2e8f0',
      boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
      animation: `${fadeSlideUp} 0.5s ${delay}ms both`,
    }}
  >
    <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>{value}</Typography>
    <Typography sx={{ fontSize: '0.78rem', color: '#64748b' }}>{label}</Typography>
  </Box>
);

export default StatPill;
