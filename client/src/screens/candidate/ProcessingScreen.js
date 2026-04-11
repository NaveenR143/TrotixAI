// screens/candidate/ProcessingScreen.js
import React, { useEffect, useState, useCallback } from "react";
import { Box, Typography, Container, LinearProgress, Stack, Fade, Button, Alert, AlertTitle } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import ReplayIcon from "@mui/icons-material/Replay";
import { fadeSlideUp, pulse } from "../../utils/themeUtils";
import { calculateRealisticProgress, getStatusMessage, getStatusIndicator, isProcessingTimeout } from "../../utils/progressUtils";
import MobileOTPValidation from "../../components/forms/MobileOTPValidation";
import axios from "axios";

import { API_BASE_URL, API_ENDPOINTS } from "../../config/api.config";

const steps = [
  "Uploading your resume...",
  "Extracting skills and experience...",
  "Analyzing matching patterns...",
  "Finding the best jobs for you...",
  "Almost ready!"
];

const ProcessingScreen = ({ onComplete }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const resumeData = location.state?.resumeData;

  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [showOTPValidation, setShowOTPValidation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newUser, setNewUser] = useState(null);

  // Enhanced state for progress tracking
  const [progressPercent, setProgressPercent] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [resumeProcessingStatus, setResumeProcessingStatus] = useState("unknown");
  const [processingError, setProcessingError] = useState(null);
  const [otpVerified, setOtpVerified] = useState(false);
  const [processingStartTime, setProcessingStartTime] = useState(null);



  // Log resume data when component mounts or data changes
  useEffect(() => {
    if (resumeData) {
      console.log("📄 Resume Data Received in ProcessingScreen:", {
        timestamp: new Date().toISOString(),
        data: resumeData,
        dataKeys: Object.keys(resumeData)
      });

      setNewUser(resumeData.new_user);
      setShowOTPValidation(true);
    }
  }, [resumeData]);

  // Track progress after OTP verification
  useEffect(() => {
    if (!otpVerified) return;

    setProcessingStartTime(Date.now());
    const startTime = Date.now();

    const progressInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedSeconds(elapsed);

      // Calculate realistic progress
      const progress = calculateRealisticProgress(elapsed, 50);
      setProgressPercent(progress);

      // Check for timeout
      if (isProcessingTimeout(elapsed, 60)) {
        clearInterval(progressInterval);
        if (resumeProcessingStatus !== "completed") {
          setProcessingError("Processing took longer than expected. Please check back shortly.");
        }
      }
    }, 500);

    return () => clearInterval(progressInterval);
  }, [otpVerified, resumeProcessingStatus]);

  // Handle resume status updates from OTP validation component
  const handleResumeStatusUpdate = useCallback((statusData) => {
    console.log("📊 Resume Status Update:", statusData);
    setResumeProcessingStatus(statusData.status);
    setProgressPercent(statusData.progress);

    // If status is completed, finalize the processing
    if (statusData.status === "completed") {
      setTimeout(() => {
        setProgressPercent(100);
        setProcessingComplete(true);
      }, 500);
    }
  }, []);

  const handleOTPSuccess = async (verificationData) => {
    console.log("✓ OTP Verification Successful:", {
      timestamp: new Date().toISOString(),
      verificationData,
      newUser: verificationData.newUser,
      resumeData: verificationData.resumeData || "No resume data available"
    });

    // Mark OTP as verified to start progress tracking
    setOtpVerified(true);

    // Fetch resume status in the background
    try {
      console.log("📋 Fetching resume status for phone:", verificationData.mobileNumber);

      const statusResponse = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.RESUME_STATUS}`,
        { params: { phone: verificationData.mobileNumber } }
      );

      const resumeStatusData = statusResponse.data?.resume_status || "unknown";
      setResumeProcessingStatus(resumeStatusData);

      console.log("✓ Resume Status Fetched:", {
        status: resumeStatusData,
        fullResponse: statusResponse.data
      });


    } catch (statusErr) {
      console.error("✗ Error fetching resume status:", statusErr);
      // Don't fail the verification if status fetch fails
      setResumeProcessingStatus("processing");
    }

    // Combine all data from verification
    const combinedData = {
      resumeData: verificationData.resumeData,
      verificationData: {
        otp: verificationData.otp,
        mobileNumber: resumeData.phone,
        apiResponse: verificationData.verificationData,
        newUser: resumeData.new_user
      },
      processedAt: new Date().toISOString(),
      userType: resumeData.new_user ? "New User" : "Existing User"
    };

    console.log("✓ Combined Processing Started:", combinedData);
  };

  const handleOTPError = (errorMessage) => {
    console.error("✗ OTP verification failed:", errorMessage);
    setProcessingError(errorMessage);
    // Keep the OTP validation visible for retry
  };

  const handleChangeNumber = () => {
    // Reset to allow user to restart the process
    setProcessingComplete(false);
    setShowOTPValidation(false);
    setCurrentStep(0);
    setOtpVerified(false);
    setProgressPercent(0);
    setProcessingError(null);
  };

  // Handle retry after processing failure
  const handleRetry = () => {
    setProcessingError(null);
    setOtpVerified(false);
    setProgressPercent(0);
    setElapsedSeconds(0);
    setResumeProcessingStatus("unknown");
  };

  return (
    <Box sx={{
      bgcolor: "#f8fafc",
      minHeight: "calc(100vh - 64px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      px: 2,
      py: 4
    }}>
      <Container maxWidth="xs">
        {!showOTPValidation ? (
          // Initial Resume Upload Animation Phase
          <Box sx={{ textAlign: "center" }}>
            <Box sx={{ position: "relative", display: "inline-flex", mb: 5 }}>
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: "24px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 12px 32px rgba(99,102,241,0.35)",
                animation: `${pulse} 2s infinite ease-in-out`
              }}>
                <AutoAwesomeIcon sx={{ color: "#fff", fontSize: 40 }} />
              </Box>
            </Box>

            <Typography variant="h5" sx={{
              fontWeight: 800,
              color: "#0f172a",
              mb: 1.5,
              letterSpacing: "-0.02em",
              animation: `${fadeSlideUp} 0.5s both`
            }}>
              Processing Your Resume
            </Typography>

            <Box sx={{ mb: 4, height: 24, overflow: "hidden" }}>
              <Fade in={true} key={currentStep} timeout={500}>
                <Typography sx={{ color: "#64748b", fontSize: "0.95rem" }}>
                  {steps[currentStep]}
                </Typography>
              </Fade>
            </Box>

            <Box sx={{ width: "100%", bgcolor: "#e2e8f0", height: 6, borderRadius: 100, overflow: "hidden", mb: 2 }}>
              <LinearProgress variant="determinate" value={((currentStep + 1) / steps.length) * 100} sx={{
                height: "100%",
                bgcolor: "transparent",
                "& .MuiLinearProgress-bar": {
                  background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                  borderRadius: 100
                }
              }} />
            </Box>

            <Stack direction="row" justifyContent="center" spacing={3} sx={{ mt: 6, opacity: 0.6 }}>
              {["Parsing PDF", "NLP Analysis", "Vector Search"].map((label, i) => (
                <Typography key={label} sx={{
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  color: i <= currentStep / 2 ? "#6366f1" : "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em"
                }}>
                  {label}
                </Typography>
              ))}
            </Stack>
          </Box>
        ) : otpVerified && !processingComplete ? (
          // Post-OTP: Resume Processing Progress Phase
          <Stack spacing={4}>
            {/* OTP Success Banner */}
            <Fade in timeout={600}>
              <Alert severity="success" sx={{
                background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                borderRadius: 2.5,
                border: "1px solid #86efac"
              }}>
                <AlertTitle sx={{ fontWeight: 700, color: "#166534" }}>
                  ✓ Mobile Verified Successfully
                </AlertTitle>
                <Typography sx={{ fontSize: "0.8rem", color: "#4b5563" }}>
                  Now finalizing your resume processing...
                </Typography>
              </Alert>
            </Fade>

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
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
                boxShadow: "0 8px 20px rgba(99,102,241,0.2)",
                animation: `${pulse} 2s infinite ease-in-out`
              }}>
                <AutoAwesomeIcon sx={{ color: "#fff", fontSize: 35 }} />
              </Box>

              <Typography sx={{
                fontSize: "1rem",
                fontWeight: 800,
                color: "#0f172a",
                mb: 2
              }}>
                Finalizing Your Profile
              </Typography>

              {/* Status Message */}
              <Typography sx={{
                fontSize: "0.9rem",
                color: "#6366f1",
                fontWeight: 700,
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
                      background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                      borderRadius: 100,
                      transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                    }
                  }}
                />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600 }}>
                    Processing...
                  </Typography>
                  <Typography sx={{
                    fontSize: "0.85rem",
                    fontWeight: 800,
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
                      fontWeight: 700
                    }}>
                      {step.done ? "✓" : idx + 1}
                    </Box>
                    <Typography sx={{
                      fontSize: "0.85rem",
                      color: step.done ? "#166534" : "#64748b",
                      fontWeight: step.done ? 600 : 500
                    }}>
                      {step.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* Helpful Message */}
            <Typography sx={{
              fontSize: "0.8rem",
              color: "#94a3b8",
              textAlign: "center",
              lineHeight: 1.6,
              fontStyle: "italic"
            }}>
              ⏱️ Typical processing time: 30-50 seconds. We'll notify you when complete.
            </Typography>
          </Stack>
        ) : processingComplete ? (
          // Completion State
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
                fontWeight: 800,
                color: "#0f172a",
                mb: 1.5
              }}>
                🎉 All Set!
              </Typography>

              <Typography sx={{
                fontSize: "0.95rem",
                color: "#64748b",
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
                  fontWeight: 600
                }}>
                  ✓ Profile: Complete  •  ✓ Resume: Verified  •  ✓ Ready: To Connect
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  py: 1.5,
                  fontSize: "1rem",
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(99,102,241,0.4)"
                  }
                }}
              >
                Continue to Dashboard
              </Button>
            </Box>
          </Stack>
        ) : (
          // OTP Validation Phase
          <Stack spacing={4}>
            {newUser === false && (
              <Box sx={{
                p: 3,
                bgcolor: "rgba(59, 130, 246, 0.05)",
                borderRadius: 3,
                border: "1px solid #3b82f6",
                textAlign: "center",
                animation: `${fadeSlideUp} 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) both`
              }}>
                <Typography sx={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#3b82f6",
                  mb: 0.5
                }}>
                  Welcome Back!
                </Typography>
                <Typography sx={{
                  fontSize: "0.85rem",
                  color: "#64748b",
                  lineHeight: 1.5
                }}>
                  We found your account. Please verify your mobile number to continue.
                </Typography>
              </Box>
            )}

            {/* Error Alert if Processing Failed */}
            {processingError && (
              <Alert severity="error" sx={{ borderRadius: 2.5 }}>
                <AlertTitle sx={{ fontWeight: 700 }}>Processing Error</AlertTitle>
                {processingError}
                <Button
                  size="small"
                  startIcon={<ReplayIcon />}
                  onClick={handleRetry}
                  sx={{ mt: 1.5, textTransform: "none" }}
                >
                  Try Again
                </Button>
              </Alert>
            )}

            {/* OTP Validation Component */}
            <MobileOTPValidation
              mobileNumber={resumeData?.phone}
              onSuccess={handleOTPSuccess}
              // onError={handleOTPError}
              onChangeNumber={handleChangeNumber}
              newUser={newUser}
              resumeData={resumeData}

            />
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default ProcessingScreen;
