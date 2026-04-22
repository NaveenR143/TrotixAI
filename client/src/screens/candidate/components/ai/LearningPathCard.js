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
            bgcolor: "#d1fae5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SchoolIcon sx={{ color: "#059669", fontSize: 20 }} />
        </Box>
      </Box>
      <Typography sx={{ fontWeight: 700, color: "#0f172a", mb: 1, fontSize: "0.95rem" }}>
        Learning Path
      </Typography>
      <Typography sx={{ fontSize: "0.85rem", color: "#64748b", mb: 2 }}>
        Personalized resources to improve your skills
      </Typography>
      <Tooltip title="Click to get learning recommendations">
        <Button
          variant="outlined"
          size="small"
          fullWidth
          onClick={onSuggest}
          sx={{
            color: "#059669",
            borderColor: "#d1fae5",
            "&:hover": {
              borderColor: "#059669",
              bgcolor: "#f0fdf4",
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
