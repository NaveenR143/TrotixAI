import React from "react";
import { Box, Typography, Paper, Grid } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import EnhanceResumeCard from "./EnhanceResumeCard";
import SkillsGapCard from "./SkillsGapCard";
import LearningPathCard from "./LearningPathCard";

const AIPoweredActions = ({
  userPoints,
  aiLoading,
  onEnhance,
  onAnalyze,
  onSuggest,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: "1px solid #e2e8f0",
        borderRadius: 2,
        mb: 3,
        bgcolor: "linear-gradient(135deg, #f5f3ff 0%, #f8fafc 100%)",
        boxShadow: "0 4px 24px rgba(15,23,42,0.06)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <AutoAwesomeIcon sx={{ color: "#6366f1", fontSize: 20 }} />
        <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
          AI-Powered Actions
        </Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <EnhanceResumeCard
            userPoints={userPoints}
            loading={aiLoading.resume}
            onEnhance={onEnhance}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <SkillsGapCard
            userPoints={userPoints}
            loading={aiLoading.skills}
            onAnalyze={onAnalyze}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <LearningPathCard
            userPoints={userPoints}
            loading={aiLoading.learning}
            onSuggest={onSuggest}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AIPoweredActions;
