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
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const EnhanceResumeCard = ({ userPoints, loading, onEnhance }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: "1px solid #e2e8f0",
        bgcolor: "#fff",
        cursor: userPoints >= 50 ? "pointer" : "default",
        opacity: userPoints >= 50 ? 1 : 0.6,
        transition: "all 0.3s ease",
        "&:hover": {
          border: userPoints >= 50 ? "1px solid #c4b5fd" : "1px solid #e2e8f0",
          boxShadow: userPoints >= 50 ? "0 4px 12px rgba(99,102,241,0.15)" : "none",
          transform: userPoints >= 50 ? "translateY(-2px)" : "none",
        },
      }}
    >
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            bgcolor: "#ede9fe",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AutoAwesomeIcon sx={{ color: "#6366f1", fontSize: 20 }} />
        </Box>
        <Chip
          label="50 Credits"
          size="small"
          sx={{
            bgcolor: "#fee2e2",
            color: "#dc2626",
            fontSize: "0.75rem",
            fontWeight: 600,
            height: 20,
          }}
        />
      </Box>
      <Typography sx={{ fontWeight: 700, color: "#0f172a", mb: 1, fontSize: "0.95rem" }}>
        Enhance Resume
      </Typography>
      <Typography sx={{ fontSize: "0.85rem", color: "#64748b", mb: 2 }}>
        AI will tailor your resume to match job market trends
      </Typography>
      <Tooltip title={userPoints < 50 ? `Need ${50 - userPoints} more credits` : "Click to enhance your resume"}>
        <Button
          variant="outlined"
          size="small"
          fullWidth
          onClick={onEnhance}
          disabled={userPoints < 50}
          sx={{
            color: userPoints >= 50 ? "#6366f1" : "#94a3b8",
            borderColor: userPoints >= 50 ? "#c4b5fd" : "#e2e8f0",
            "&:hover": {
              borderColor: userPoints >= 50 ? "#6366f1" : "#e2e8f0",
              bgcolor: userPoints >= 50 ? "#f5f3ff" : "transparent",
            },
          }}
        >
          {loading ? <CircularProgress size={16} /> : "Enhance"}
        </Button>
      </Tooltip>
    </Paper>
  );
};

export default EnhanceResumeCard;
