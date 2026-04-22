import React from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const SkillsGapCard = ({ userPoints, loading, onAnalyze }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: "1px solid #e2e8f0",
        bgcolor: "#fff",
        cursor: "pointer",
        transition: "all 0.3s ease",
        "&:hover": {
          border: "1px solid #c4b5fd",
          boxShadow: "0 4px 12px rgba(99,102,241,0.15)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            bgcolor: "#dbeafe",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TrendingUpIcon sx={{ color: "#0369a1", fontSize: 20 }} />
        </Box>
      </Box>
      <Typography sx={{ fontWeight: 700, color: "#0f172a", mb: 1, fontSize: "0.95rem" }}>
        Missing Skills & Analysis
      </Typography>
      <Typography sx={{ fontSize: "0.85rem", color: "#64748b", mb: 2 }}>
        Compare profile with live job openings to identify missing skills and improvement areas.
      </Typography>
      <Tooltip title="Click to identify missing skills">
        <Button
          variant="outlined"
          size="small"
          fullWidth
          onClick={onAnalyze}
          sx={{
            color: "#0369a1",
            borderColor: "#dbeafe",
            "&:hover": {
              borderColor: "#0369a1",
              bgcolor: "#f0f9ff",
            },
          }}
        >
          {loading ? <CircularProgress size={16} /> : "Analyze"}
        </Button>
      </Tooltip>
    </Paper>
  );
};

export default SkillsGapCard;
