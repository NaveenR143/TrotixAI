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
import SchoolIcon from "@mui/icons-material/School";

const LearningPathCard = ({ userPoints, loading, onSuggest }) => {
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
            bgcolor: "#d1fae5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SchoolIcon sx={{ color: "#059669", fontSize: 20 }} />
        </Box>
        <Chip
          label="50 Credits"
          size="small"
          sx={{
            bgcolor: "#d1fae5",
            color: "#059669",
            fontSize: "0.75rem",
            fontWeight: 600,
            height: 20,
          }}
        />
      </Box>
      <Typography sx={{ fontWeight: 700, color: "#0f172a", mb: 1, fontSize: "0.95rem" }}>
        Learning Path
      </Typography>
      <Typography sx={{ fontSize: "0.85rem", color: "#64748b", mb: 2 }}>
        Personalized resources to improve your skills
      </Typography>
      <Tooltip title={userPoints < 50 ? `Need ${50 - userPoints} more credits` : "Click to get learning recommendations"}>
        <Button
          variant="outlined"
          size="small"
          fullWidth
          onClick={onSuggest}
          disabled={userPoints < 50}
          sx={{
            color: userPoints >= 50 ? "#059669" : "#94a3b8",
            borderColor: userPoints >= 50 ? "#d1fae5" : "#e2e8f0",
            "&:hover": {
              borderColor: userPoints >= 50 ? "#059669" : "#e2e8f0",
              bgcolor: userPoints >= 50 ? "#f0fdf4" : "transparent",
            },
          }}
        >
          {loading ? <CircularProgress size={16} /> : "Suggest"}
        </Button>
      </Tooltip>
    </Paper>
  );
};

export default LearningPathCard;
