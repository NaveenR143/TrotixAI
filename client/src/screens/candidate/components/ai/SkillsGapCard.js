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
        cursor: userPoints >= 20 ? "pointer" : "default",
        opacity: userPoints >= 20 ? 1 : 0.6,
        transition: "all 0.3s ease",
        "&:hover": {
          border: userPoints >= 20 ? "1px solid #c4b5fd" : "1px solid #e2e8f0",
          boxShadow: userPoints >= 20 ? "0 4px 12px rgba(99,102,241,0.15)" : "none",
          transform: userPoints >= 20 ? "translateY(-2px)" : "none",
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
        <Chip
          label="20 Credits"
          size="small"
          sx={{
            bgcolor: "#dbeafe",
            color: "#0369a1",
            fontSize: "0.75rem",
            fontWeight: 600,
            height: 20,
          }}
        />
      </Box>
      <Typography sx={{ fontWeight: 700, color: "#0f172a", mb: 1, fontSize: "0.95rem" }}>
        Missing Skills
      </Typography>
      <Typography sx={{ fontSize: "0.85rem", color: "#64748b", mb: 2 }}>
        Identify skills gaps based on market demand
      </Typography>
      <Tooltip title={userPoints < 20 ? `Need ${20 - userPoints} more credits` : "Click to identify missing skills"}>
        <Button
          variant="outlined"
          size="small"
          fullWidth
          onClick={onAnalyze}
          disabled={userPoints < 20}
          sx={{
            color: userPoints >= 20 ? "#0369a1" : "#94a3b8",
            borderColor: userPoints >= 20 ? "#dbeafe" : "#e2e8f0",
            "&:hover": {
              borderColor: userPoints >= 20 ? "#0369a1" : "#e2e8f0",
              bgcolor: userPoints >= 20 ? "#f0f9ff" : "transparent",
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
