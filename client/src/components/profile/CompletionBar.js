// components/profile/CompletionBar.js
import React from "react";
import { Box, Typography } from "@mui/material";

const CompletionBar = ({ pct }) => (
  <Box sx={{ mb: 3 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
      <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Profile Completeness
      </Typography>
      <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: pct >= 80 ? '#16a34a' : '#f59e0b' }}>
        {pct}%
      </Typography>
    </Box>
    <Box sx={{ height: 5, borderRadius: 100, bgcolor: '#e2e8f0', overflow: 'hidden' }}>
      <Box
        sx={{
          height: '100%', width: `${pct}%`, borderRadius: 100,
          background: pct >= 80
            ? 'linear-gradient(90deg, #10b981, #34d399)'
            : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
          transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
        }}
      />
    </Box>
  </Box>
);

export default CompletionBar;
