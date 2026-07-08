import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, Paper, Stack, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const IndustriesBanner = ({ autoNavigate = false, onNavigate }) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const timerRef = useRef(null);

  const handleNavigate = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (onNavigate) {
      onNavigate();
    } else {
      navigate("/profile");
    }
  };

  useEffect(() => {
    if (!autoNavigate) return;

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (onNavigate) {
            onNavigate();
          } else {
            navigate("/profile");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [autoNavigate, navigate, onNavigate]);

  return (
    <Box
      sx={{
        width: "100%",
        animation: "slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        "@keyframes slideDown": {
          "0%": { transform: "translateY(-20px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: { xs: "12px", sm: "16px" },
          border: "1px solid rgba(37, 99, 235, 0.25)",
          background: "linear-gradient(135deg, rgba(239, 246, 255, 0.7) 0%, rgba(219, 234, 254, 0.6) 100%)",
          backdropFilter: "blur(12px)",
          p: { xs: 1.75, sm: 2.5, md: 3 },
          position: "relative",
          overflow: "hidden",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 10px 30px rgba(37, 99, 235, 0.08)",
            borderColor: "rgba(37, 99, 235, 0.4)",
          },
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 2, md: 3 }}
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="flex-start" sx={{ flex: 1 }}>
            <Box
              sx={{
                width: { xs: 36, sm: 42 },
                height: { xs: 36, sm: 42 },
                borderRadius: { xs: "10px", sm: "12px" },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#1D4ED8",
                bgcolor: "rgba(37, 99, 235, 0.15)",
                flexShrink: 0,
                border: "1px solid rgba(37, 99, 235, 0.2)",
              }}
            >
              <BusinessCenterOutlinedIcon sx={{ fontSize: { xs: 18, sm: 22 } }} />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "0.88rem", sm: "1.05rem" },
                  color: "#1E3A8A",
                  mb: 0.5,
                  letterSpacing: "-0.01em",
                }}
              >
                Personalize your industry preferences
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "0.78rem", sm: "0.9rem" },
                  color: "#1E40AF",
                  fontWeight: 500,
                  lineHeight: 1.4,
                }}
              >
                Please update your preferred industries in your profile to unlock highly personalized job recommendations and AI-powered roadmaps.
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="flex-end"
            sx={{
              width: { xs: "100%", md: "auto" },
              mt: { xs: 1.5, md: 0 },
            }}
          >
            {autoNavigate && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  justifyContent: { xs: "center", sm: "flex-end" },
                  mb: { xs: 0.5, sm: 0 },
                }}
              >
                <CircularProgress
                  variant="determinate"
                  value={(countdown / 5) * 100}
                  size={18}
                  thickness={6}
                  sx={{
                    color: "#2563EB",
                    transition: "all 0.3s ease",
                  }}
                />
                <Typography
                  sx={{
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "#1E40AF",
                    letterSpacing: "-0.01em",
                    whiteSpace: "nowrap",
                  }}
                >
                  Redirecting in {countdown}s
                </Typography>
              </Box>
            )}

            <Button
              variant="contained"
              onClick={handleNavigate}
              endIcon={<ArrowForwardIcon className="arrow" sx={{ fontSize: 16, transition: "transform 0.2s ease" }} />}
              sx={{
                whiteSpace: "nowrap",
                px: { xs: 2.5, sm: 3.5 },
                py: { xs: 1, sm: 1.2 },
                borderRadius: { xs: "10px", sm: "12px" },
                fontWeight: 700,
                textTransform: "none",
                fontSize: { xs: "0.82rem", sm: "0.88rem" },
                background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                color: "#FFFFFF",
                boxShadow: "0 4px 14px rgba(37, 99, 235, 0.25)",
                width: { xs: "100%", sm: "auto" },
                "&:hover": {
                  background: "linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)",
                  boxShadow: "0 6px 20px rgba(37, 99, 235, 0.35)",
                  "& .arrow": { transform: "translateX(3px)" },
                },
                transition: "all 0.2s ease",
              }}
            >
              Go to Profile
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default IndustriesBanner;
