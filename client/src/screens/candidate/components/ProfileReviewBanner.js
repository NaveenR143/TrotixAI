import React from "react";
import { Box, Typography, Button, Paper, Stack } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const ProfileReviewBanner = () => {
  const navigate = useNavigate();
  const { profile_viewed } = useSelector((state) => state.UserReducer);

  // If profile has been viewed (or is default true), do not render the banner
  if (profile_viewed !== false) {
    return null;
  }

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
          border: "1px solid rgba(245, 158, 11, 0.25)",
          background: "linear-gradient(135deg, rgba(254, 243, 199, 0.5) 0%, rgba(253, 230, 138, 0.4) 100%)",
          backdropFilter: "blur(8px)",
          p: { xs: 2, sm: 2.5, md: 3 },
          position: "relative",
          overflow: "hidden",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 10px 25px rgba(245, 158, 11, 0.08)",
            borderColor: "rgba(245, 158, 11, 0.4)",
          },
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 2, sm: 3 }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="flex-start">
            <Box
              sx={{
                width: { xs: 36, sm: 42 },
                height: { xs: 36, sm: 42 },
                borderRadius: { xs: "10px", sm: "12px" },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#D97706",
                bgcolor: "rgba(245, 158, 11, 0.15)",
                flexShrink: 0,
                border: "1px solid rgba(245, 158, 11, 0.2)",
              }}
            >
              <InfoOutlinedIcon sx={{ fontSize: { xs: 18, sm: 22 } }} />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "0.9rem", sm: "1.05rem" },
                  color: "#78350F",
                  mb: 0.5,
                  letterSpacing: "-0.01em",
                }}
              >
                Please review your profile
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                  color: "#92400E",
                  fontWeight: 500,
                  lineHeight: 1.4,
                }}
              >
                Reviewing your details ensures your AI job matches, career roadmaps, and enhancements remain accurate.
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="contained"
            onClick={() => navigate("/profile")}
            endIcon={<ArrowForwardIcon className="arrow" sx={{ fontSize: 16, transition: "transform 0.2s ease" }} />}
            sx={{
              whiteSpace: "nowrap",
              px: { xs: 2.5, sm: 3.5 },
              py: { xs: 1, sm: 1.2 },
              borderRadius: { xs: "10px", sm: "12px" },
              fontWeight: 700,
              textTransform: "none",
              fontSize: { xs: "0.82rem", sm: "0.88rem" },
              background: "linear-gradient(135deg, #D97706 0%, #B45309 100%)",
              color: "#FFFFFF",
              boxShadow: "0 4px 14px rgba(217, 119, 6, 0.25)",
              alignSelf: { xs: "stretch", sm: "auto" },
              "&:hover": {
                background: "linear-gradient(135deg, #B45309 0%, #92400E 100%)",
                boxShadow: "0 6px 20px rgba(217, 119, 6, 0.35)",
                "& .arrow": { transform: "translateX(3px)" },
              },
              transition: "all 0.2s ease",
            }}
          >
            Review Profile
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ProfileReviewBanner;

