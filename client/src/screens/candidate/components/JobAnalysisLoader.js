// screens/candidate/components/JobAnalysisLoader.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  LinearProgress,
  Card,
  Grid,
  Skeleton,
  Stack,
  Fade,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CircularProgress from "@mui/material/CircularProgress";
import { keyframes } from "@mui/system";

// Keyframe Animations
const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 15px rgba(99, 102, 241, 0.2); transform: scale(1); }
  50% { box-shadow: 0 0 35px rgba(99, 102, 241, 0.5); transform: scale(1.05); }
  100% { box-shadow: 0 0 15px rgba(99, 102, 241, 0.2); transform: scale(1); }
`;

const shimmeryText = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const STAGES = [
  "Fetching Jobs",
  "Processing Data",
  "Extracting Skills",
  "Matching Skills",
  "Matching Job Titles",
  "Calculating AI Scores",
  "Ranking Jobs",
  "Personalizing Recommendations",
  "Finalizing Results"
];

const AI_TIPS = [
  "Highlight quantifiable achievements (e.g. 'reduced load time by 40%') on your profile to catch recruiter attention.",
  "Our AI matches skills based on deep semantic meaning, not just exact keyword matches.",
  "Keep your profile industries updated to target the most relevant recommendations.",
  "Adding projects and certifications increases match accuracy by up to 35%.",
  "Tailoring your profile's summary statement directly boosts your Match Scores for key job roles.",
  "A clean, simple formatting layout is parsed with higher accuracy by applicant tracking systems."
];

const JobAnalysisLoader = ({ apiLoading, onComplete, isDesktop }) => {
  const theme = useTheme();
  const [progressPercent, setProgressPercent] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  // Determine active stage based on progress
  const activeStageIndex = Math.min(
    STAGES.length - 1,
    Math.floor(progressPercent / (100 / STAGES.length))
  );

  // Smoothly increment progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev < 94) {
          // Normal simulation phase (takes about 6.5s to reach 94%)
          return prev + 0.8;
        } else if (!apiLoading) {
          // Fast-forward or finish phase once API is complete
          if (prev >= 100) {
            clearInterval(interval);
            // Delay completion callback slightly so users see 100% completion
            setTimeout(onComplete, 500);
            return 100;
          }
          return prev + 2;
        } else {
          // Hold at 94% representing "Finalizing Results" waiting for API
          return 94;
        }
      });
    }, 50);

    return () => clearInterval(interval);
  }, [apiLoading, onComplete]);

  // Rotate AI tips
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % AI_TIPS.length);
    }, 2800);
    return () => clearInterval(tipInterval);
  }, []);

  // Compute estimated remaining seconds
  // Total duration is roughly 6.5 seconds.
  const secondsRemaining = Math.max(
    1,
    Math.ceil((100 - progressPercent) * 0.065)
  );

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "calc(100vh - 64px)",
        bgcolor: "#f8fafc",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      {/* ----------------- SKELETON BACKGROUND ----------------- */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.15,
          filter: "blur(2px)",
          userSelect: "none",
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {isDesktop ? (
          // Desktop Skeleton Layout
          <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
            {/* Sidebar Skeleton */}
            <Box
              sx={{
                width: 340,
                borderRight: "1px solid #e2e8f0",
                p: 2,
                display: "flex",
                flexDirection: "column",
                gap: 2
              }}
            >
              {[1, 2, 3, 4].map((i) => (
                <Box
                  key={i}
                  sx={{ p: 2, border: "1px solid #e2e8f0", borderRadius: 2 }}
                >
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="40%" height={16} sx={{ my: 1 }} />
                  <Skeleton variant="rectangular" width="100%" height={32} borderRadius={1} />
                </Box>
              ))}
            </Box>
            {/* Main Area Skeleton */}
            <Box sx={{ flex: 1, p: 4, display: "flex", flexDirection: "column", gap: 3 }}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Skeleton variant="circular" width={64} height={64} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="40%" height={32} />
                  <Skeleton variant="text" width="25%" height={20} />
                </Box>
              </Box>
              <Skeleton variant="rectangular" width="100%" height={120} />
              <Skeleton variant="text" width="100%" height={20} />
              <Skeleton variant="text" width="90%" height={20} />
              <Skeleton variant="text" width="95%" height={20} />
            </Box>
          </Box>
        ) : (
          // Mobile Skeleton Layout
          <Box sx={{ flex: 1, p: 2.5, display: "flex", flexDirection: "column", gap: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Skeleton variant="text" width="30%" height={24} />
              <Skeleton variant="circular" width={32} height={32} />
            </Box>
            <Box
              sx={{
                flex: 1,
                border: "1px solid #e2e8f0",
                borderRadius: 4,
                p: 3,
                display: "flex",
                flexDirection: "column",
                gap: 2
              }}
            >
              <Skeleton variant="text" width="80%" height={36} />
              <Skeleton variant="text" width="50%" height={24} />
              <Stack direction="row" spacing={1} sx={{ my: 1 }}>
                <Skeleton variant="rectangular" width={70} height={24} borderRadius={2} />
                <Skeleton variant="rectangular" width={90} height={24} borderRadius={2} />
                <Skeleton variant="rectangular" width={60} height={24} borderRadius={2} />
              </Stack>
              <Skeleton variant="text" width="100%" height={20} />
              <Skeleton variant="text" width="100%" height={20} />
              <Skeleton variant="text" width="90%" height={20} />
              <Skeleton variant="rectangular" width="100%" height={48} sx={{ mt: "auto" }} />
            </Box>
          </Box>
        )}
      </Box>

      {/* ----------------- FOREGROUND LOADER ----------------- */}
      <Fade in={true} timeout={800}>
        <Card
          sx={{
            width: "90%",
            maxWidth: 550,
            p: { xs: 3, sm: 4 },
            borderRadius: "24px",
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.6)",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.05)",
            zIndex: 10,
            textAlign: "center"
          }}
        >
          {/* AI Pulsing Orb */}
          <Box sx={{ position: "relative", display: "inline-flex", mb: 3 }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: `${pulseGlow} 2s infinite ease-in-out`
              }}
            >
              <AutoAwesomeIcon sx={{ color: "#fff", fontSize: 32 }} />
            </Box>
            {/* Spinning Outer Ring */}
            <Box
              sx={{
                position: "absolute",
                top: -6,
                left: -6,
                right: -6,
                bottom: -6,
                border: "2px solid transparent",
                borderTopColor: "#6366f1",
                borderBottomColor: "#ec4899",
                borderRadius: "50%",
                animation: `${rotate} 3s linear infinite`
              }}
            />
          </Box>

          {/* Active Step Title */}
          <Box sx={{ minHeight: 36, mb: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Fade in={true} key={activeStageIndex} timeout={300}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1.2rem", sm: "1.4rem" },
                  background: "linear-gradient(90deg, #4f46e5, #9333ea, #db2777)",
                  backgroundSize: "200% auto",
                  animation: `${shimmeryText} 4s linear infinite`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.01em"
                }}
              >
                {STAGES[activeStageIndex]}...
              </Typography>
            </Fade>
          </Box>

          <Typography variant="body2" sx={{ color: "#64748b", mb: 3, fontWeight: 500 }}>
            Analyzing profile and matching skills to recommend ideal opportunities
          </Typography>

          {/* Progress Bar Container */}
          <Box sx={{ mb: 4 }}>
            <LinearProgress
              variant="determinate"
              value={progressPercent}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: "#e2e8f0",
                mb: 1.5,
                "& .MuiLinearProgress-bar": {
                  background: "linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
                  borderRadius: 4,
                  transition: "width 0.1s linear"
                }
              }}
            />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600, display: "flex", alignItems: "center", gap: 0.5 }}>
                <HourglassEmptyIcon sx={{ fontSize: 13 }} />
                {progressPercent >= 100
                  ? "Completed!"
                  : `Estimated: ${secondsRemaining}s remaining`}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "#6366f1",
                  bgcolor: "#f0f2ff",
                  px: 1,
                  py: 0.25,
                  borderRadius: 1.5
                }}
              >
                {Math.round(progressPercent)}%
              </Typography>
            </Stack>
          </Box>

          {/* Pipeline Checklist */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: "16px",
              bgcolor: "rgba(241, 245, 249, 0.4)",
              border: "1px solid rgba(226, 232, 240, 0.5)",
              mb: 3,
              textAlign: "left"
            }}
          >
            <Grid container spacing={1.5}>
              {STAGES.map((stage, idx) => {
                const isCompleted = activeStageIndex > idx;
                const isActive = activeStageIndex === idx;

                return (
                  <Grid item xs={12} sm={6} key={stage}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.25,
                        opacity: isCompleted || isActive ? 1 : 0.4,
                        transition: "opacity 0.3s ease"
                      }}
                    >
                      {isCompleted ? (
                        <CheckCircleIcon sx={{ color: "#22c55e", fontSize: 16 }} />
                      ) : isActive ? (
                        <CircularProgress
                          size={12}
                          thickness={6}
                          sx={{ color: "#6366f1" }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            border: "1.5px solid #94a3b8",
                            boxShadow: "inset 0 0 2px rgba(0,0,0,0.05)"
                          }}
                        />
                      )}
                      <Typography
                        sx={{
                          fontSize: "0.78rem",
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? "#4f46e5" : isCompleted ? "#334155" : "#64748b"
                        }}
                      >
                        {stage}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          {/* Rotating AI Career Tips */}
          <Box
            sx={{
              p: 2,
              borderRadius: "12px",
              bgcolor: "rgba(99, 102, 241, 0.04)",
              border: "1px dashed rgba(99, 102, 241, 0.2)",
              minHeight: 68,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Fade in={true} key={tipIndex} timeout={500}>
              <Typography
                variant="body2"
                sx={{
                  color: "#4f46e5",
                  fontSize: "0.82rem",
                  fontWeight: 500,
                  lineHeight: 1.5,
                  maxWidth: "92%",
                  mx: "auto"
                }}
              >
                💡 <strong>AI Matching Tip:</strong> {AI_TIPS[tipIndex]}
              </Typography>
            </Fade>
          </Box>
        </Card>
      </Fade>
    </Box>
  );
};

export default JobAnalysisLoader;
