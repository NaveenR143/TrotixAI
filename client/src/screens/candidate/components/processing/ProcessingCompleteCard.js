import React from "react";
import { Box, Typography, Stack, Button, CircularProgress } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { fadeSlideUp } from "../../../../utils/themeUtils";

const ProcessingCompleteCard = ({
  autoApplyStatus,
  autoApplyJobId,
  handleContinue
}) => {
  return (
    <Stack spacing={4}>
      <Box sx={{
        p: 4,
        bgcolor: "white",
        borderRadius: 3,
        border: "2px solid #86efac",
        boxShadow: "0 10px 40px rgba(15,23,42,0.08)",
        textAlign: "center",
        animation: `${fadeSlideUp} 0.5s ease-out`
      }}>
        <Box sx={{
          width: 80,
          height: 80,
          borderRadius: "24px",
          background: "linear-gradient(135deg, #4ade80, #22c55e)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 3,
          boxShadow: "0 8px 20px rgba(52,211,153,0.3)"
        }}>
          <CheckCircleIcon sx={{ color: "#fff", fontSize: 45 }} />
        </Box>

        <Typography sx={{
          fontSize: "1.3rem",
          fontWeight: 700,
          color: "#0f172a",
          mb: 1.5
        }}>
          🎉 All Set!
        </Typography>

        <Typography sx={{
          fontSize: "0.95rem",
          color: "#212121",
          mb: 3,
          lineHeight: 1.6
        }}>
          Your resume has been successfully processed and analyzed. We're ready to match you with the best opportunities!
        </Typography>

        <Box sx={{
          p: 2.5,
          bgcolor: "#f0fdf4",
          borderRadius: 2,
          border: "1px solid #86efac",
          mb: 3
        }}>
          <Typography sx={{
            fontSize: "0.85rem",
            color: "#166534",
            fontWeight: 500
          }}>
            ✓ Profile: Complete  •  ✓ Resume: Verified  •  ✓ Ready: To Connect
          </Typography>
        </Box>

        {autoApplyStatus === "applying" && (
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <CircularProgress size={24} sx={{ mb: 1 }} />
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#2563EB' }}>
              Applying for the job...
            </Typography>
          </Box>
        )}

        {autoApplyStatus === "success" && (
          <Box sx={{ mb: 3, p: 2, bgcolor: '#eff6ff', borderRadius: 2, border: '1px solid #bfdbfe' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <CheckCircleIcon sx={{ fontSize: 18 }} />
              Applied for {autoApplyJobId ? "Job Posting" : "Job"}!
            </Typography>
          </Box>
        )}

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleContinue}
          sx={{
            py: 1.5,
            fontSize: "1rem",
            borderRadius: 2.5,
            textTransform: "none",
            fontWeight: 600,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
            "&:hover": {
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              transform: "translateY(-2px)",
              boxShadow: "0 6px 20px rgba(99,102,241,0.4)"
            },
            "&.Mui-disabled": {
              background: "#E2E8F0",
              color: "#475569"
            }
          }}
        >
          {autoApplyJobId ? "View Applied Job" : "Continue to Dashboard"}
        </Button>
      </Box>
    </Stack>
  );
};

export default ProcessingCompleteCard;
