import React from "react";
import { Box, Typography, LinearProgress, Stack, Fade, Button, Alert, AlertTitle, CircularProgress } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ErrorIcon from "@mui/icons-material/Error";
import ReplayIcon from "@mui/icons-material/Replay";
import { pulse } from "../../../../utils/themeUtils";
import { getStatusMessage } from "../../../../utils/progressUtils";

const ResumeFinalizingStatus = ({
  processingError,
  delayNoticeRef,
  resumeProcessingStatus,
  handleManualStatusCheck,
  isCheckingStatus,
  progressPercent,
  userId,
  elapsedSeconds = 0
}) => {
  const isDelayed = Boolean(
    processingError ||
    resumeProcessingStatus === "incomplete" ||
    resumeProcessingStatus === "failed" ||
    (elapsedSeconds && elapsedSeconds >= 90)
  );
  return (
    <Stack spacing={4}>
      {/* Error Alert if Failed during Processing */}
      {processingError && (
        <Fade in timeout={600}>
          <Box ref={delayNoticeRef}>
            <Alert severity="warning" sx={{
              borderRadius: 2.5,
              p: 2,
              border: "1px solid #fee2e2",
              bgcolor: "#fef2f2"
            }}>
              <AlertTitle sx={{ fontWeight: 600 }}>
                Processing Delay Notice
              </AlertTitle>
              <Typography sx={{ fontSize: "0.85rem", mb: 1.5, fontWeight: 400 }}>
                {processingError}
              </Typography>

              {resumeProcessingStatus === "incomplete" && (
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleManualStatusCheck}
                  disabled={isCheckingStatus}
                  startIcon={isCheckingStatus ? <CircularProgress size={16} color="inherit" /> : <ReplayIcon />}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    fontWeight: 600,
                    mt: 1,
                    background: "linear-gradient(135deg, #f97316, #ea580c)",
                    color: "#fff",
                    boxShadow: "0 2px 4px rgba(249,115,22,0.2)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #ea580c, #c2410c)",
                    }
                  }}
                >
                  {isCheckingStatus ? "Checking..." : "Retry Check"}
                </Button>
              )}
            </Alert>
          </Box>
        </Fade>
      )}

      {/* OTP Success Banner - Only show if no error */}
      {/* {!processingError && (
        <Fade in timeout={600}>
          <Alert severity="success" sx={{
            background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
            borderRadius: 2.5,
            border: "1px solid #86efac"
          }}>
            <AlertTitle sx={{ fontWeight: 600, color: "#166534" }}>
              ✓ Mobile Verified Successfully
            </AlertTitle>
            <Typography sx={{ fontSize: "0.8rem", color: "#4b5563" }}>
              Now finalizing your resume processing...
            </Typography>
          </Alert>
        </Fade>
      )} */}

      {/* Processing Status Box */}
      <Box sx={{
        p: 4,
        bgcolor: "white",
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        boxShadow: "0 10px 40px rgba(15,23,42,0.08)",
        textAlign: "center"
      }}>
        {/* Animated Icon */}
        <Box sx={{
          width: 70,
          height: 70,
          borderRadius: "20px",
          background: resumeProcessingStatus === "failed" ? "linear-gradient(135deg, #ef4444, #dc2626)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 3,
          boxShadow: resumeProcessingStatus === "failed" ? "0 8px 20px rgba(239,68,68,0.2)" : "0 8px 20px rgba(99,102,241,0.2)",
          animation: resumeProcessingStatus === "failed" ? "none" : `${pulse} 2s infinite ease-in-out`
        }}>
          {resumeProcessingStatus === "failed" ? (
            <ErrorIcon sx={{ color: "#fff", fontSize: 35 }} />
          ) : (
            <AutoAwesomeIcon sx={{ color: "#fff", fontSize: 35 }} />
          )}
        </Box>

        <Typography sx={{
          fontSize: "1rem",
          fontWeight: 700,
          color: "#0f172a",
          mb: 2
        }}>
          Finalizing Your Profile
        </Typography>

        {/* Status Message */}
        <Typography sx={{
          fontSize: "0.9rem",
          color: resumeProcessingStatus === "failed" ? "#ef4444" : "#6366f1",
          fontWeight: 600,
          mb: 3,
          minHeight: 24
        }}>
          {getStatusMessage(progressPercent, resumeProcessingStatus)}
        </Typography>

        {/* Progress Bar */}
        <Box sx={{ mb: 2.5 }}>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{
              height: 10,
              borderRadius: 100,
              bgcolor: "#e2e8f0",
              mb: 1.5,
              "& .MuiLinearProgress-bar": {
                background: resumeProcessingStatus === "failed" ? "#ef4444" : "linear-gradient(90deg, #6366f1, #8b5cf6)",
                borderRadius: 100,
                transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
              }
            }}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500 }}>
              Processing...
            </Typography>
            <Typography sx={{
              fontSize: "0.85rem",
              fontWeight: 700,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>
              {progressPercent}%
            </Typography>
          </Box>
        </Box>

        {/* Processing Steps */}
        <Stack spacing={1.5} sx={{ mt: 3.5 }}>
          {[
            { label: "Resume Uploaded", done: true },
            { label: "Data Extraction", done: progressPercent > 25 },
            { label: "Profile Analysis", done: progressPercent > 55 },
            { label: "Job Matching", done: progressPercent > 85 }
          ].map((step, idx) => (
            <Box key={idx} sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 1.5,
              bgcolor: step.done ? "#f0fdf4" : "#f1f5f9",
              borderRadius: 1.5,
              transition: "all 0.3s ease"
            }}>
              <Box sx={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: step.done ? "#86efac" : "#e2e8f0",
                color: step.done ? "#166534" : "#94a3b8",
                flexShrink: 0,
                fontSize: "0.8rem",
                fontWeight: 600
              }}>
                {step.done ? "✓" : idx + 1}
              </Box>
              <Typography sx={{
                fontSize: "0.85rem",
                color: step.done ? "#166534" : "#212121",
                fontWeight: step.done ? 500 : 400
              }}>
                {step.label}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>



      {/* Helpful Message */}
      {isDelayed ? (
        <Box sx={{
          p: 2,
          borderRadius: 2.5,
          bgcolor: "#fff7ed",
          border: "1.5px solid #f97316",
          boxShadow: "0 4px 14px rgba(249, 115, 22, 0.18)",
          textAlign: "center",
          transition: "all 0.3s ease",
          animation: `${pulse} 2.5s infinite ease-in-out`
        }}>
          <Typography sx={{
            fontSize: "0.85rem",
            color: "#c2410c",
            fontWeight: 600,
            lineHeight: 1.6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1
          }}>
            <span>⚠️</span>
            <span>
              Typical processing time: 30-90 seconds. Processing is taking longer than expected. We'll notify you when complete.
            </span>
          </Typography>
        </Box>
      ) : (
        <Typography sx={{
          fontSize: "0.8rem",
          color: "#94a3b8",
          textAlign: "center",
          lineHeight: 1.6,
          fontStyle: "italic",
          transition: "all 0.3s ease"
        }}>
          ⏱️ Typical processing time: 30-90 seconds. We'll notify you when complete.
        </Typography>
      )}
    </Stack>
  );
};

export default ResumeFinalizingStatus;
