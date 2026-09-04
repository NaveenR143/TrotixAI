// screens/candidate/ProcessingScreen.js
import React, { useEffect, useState, useCallback } from "react";
import { Box, Container, Snackbar, Alert } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../authContext";
import { calculateRealisticProgress, isProcessingTimeout } from "../../utils/progressUtils";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useOtp } from "../../hooks/useOtp";

import { API_BASE_URL, API_ENDPOINTS } from "../../config/api.config";
import { applyJob } from "../../api/jobpostingAPI";

import ResumeUploadProgress from "./components/processing/ResumeUploadProgress";
import ResumeFinalizingStatus from "./components/processing/ResumeFinalizingStatus";
import ProcessingCompleteCard from "./components/processing/ProcessingCompleteCard";
import ProcessingOtpVerification from "./components/processing/ProcessingOtpVerification";
import IndustrySelectionCard from "./components/processing/IndustrySelectionCard";

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
  const { refreshAuth } = useAuth();
  const resumeData = location.state?.resumeData;
  const dispatch = useDispatch();

  const flowType = resumeData?.new_user ? "registration" : "login";
  const activeOtp = useOtp(flowType);

  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [showOTPValidation, setShowOTPValidation] = useState(false);
  const [newUser, setNewUser] = useState(null);

  // Enhanced state for progress tracking
  const [processingStartTime, setProcessingStartTime] = useState(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [resumeProcessingStatus, setResumeProcessingStatus] = useState("unknown");
  const [processingError, setProcessingError] = useState(null);
  const [otpVerified, setOtpVerified] = useState(false);
  const [industrySaved, setIndustrySaved] = useState(false);
  const [showStatusAlert, setShowStatusAlert] = useState(false);
  const [statusAlertMessage, setStatusAlertMessage] = useState("");
  const [autoApplyStatus, setAutoApplyStatus] = useState("idle"); // idle, applying, success, error
  const [verifiedUserId, setVerifiedUserId] = useState(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const delayNoticeRef = React.useRef(null);

  // Log resume data when component mounts or data changes
  // Cycle steps during initial phase
  useEffect(() => {
    if (showOTPValidation) return;

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 2000);

    return () => clearInterval(stepInterval);
  }, [showOTPValidation]);

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

      // Trigger the 25s cooldown timer for the flow immediately since the backend sends the first OTP during resume upload
      const flowType = resumeData.new_user ? "registration" : "login";
      dispatch({
        type: "OTP_SEND_REQUEST",
        payload: { flowType, isResend: false }
      });
    } else {
      console.log("No resume data received")
    }
  }, [resumeData, dispatch]);

  // Track progress after OTP verification
  useEffect(() => {
    if (!otpVerified || resumeProcessingStatus === "incomplete" || processingError) return;

    if (!processingStartTime) {
      setProcessingStartTime(Date.now());
    }

    const startTime = processingStartTime || Date.now();

    const progressInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedSeconds(elapsed);

      // Calculate realistic progress
      const progress = calculateRealisticProgress(elapsed, 50);
      setProgressPercent(progress);

      // Check for timeout
      if (isProcessingTimeout(elapsed, 180)) {
        clearInterval(progressInterval);
        if (resumeProcessingStatus !== "completed" && resumeProcessingStatus !== "failed") {
          setProcessingError("Processing took longer than expected. We will notify you once processing is complete. You can close this window.");
        }
      }
    }, 500);

    return () => clearInterval(progressInterval);
  }, [otpVerified, resumeProcessingStatus, processingStartTime, processingError]);

  // Handle resume status updates
  const handleResumeStatusUpdate = useCallback((statusData) => {
    console.log("📊 Resume Status Update Received:", statusData);
    const newStatus = (statusData.status || "unknown").toLowerCase();
    setResumeProcessingStatus(newStatus);

    // If status is completed, finalize the processing
    if (newStatus === "completed") {
      setTimeout(() => {
        setProgressPercent(100);
        setProcessingComplete(true);

        // Handle auto-apply if applicable
        const autoApplyJobId = location.state?.autoApplyJobId;
        const userId = verifiedUserId || statusData.user_id;

        if (autoApplyJobId && userId) {
          console.log("🚀 Triggering auto-apply for job:", autoApplyJobId);
          handleAutoApply(autoApplyJobId, userId);

          // Refresh auth state to ensure navigation bar updates
          refreshAuth(resumeData?.phone).catch(err => console.error("Auth refresh failed:", err));

          // Brief delay before automatic redirection for applied jobs
          setTimeout(() => handleContinue(), 2500);
        } else {
          // Refresh auth state to ensure navigation bar updates
          refreshAuth(resumeData?.phone).catch(err => console.error("Auth refresh failed:", err));

          // Standard redirection delay
          setTimeout(() => handleContinue(), 1500);
        }
      }, 500);
    } else if (newStatus === "incomplete") {
      const displayMessage = statusData.message === "Resume processing did not complete within 90 seconds"
        ? "Resume processing did not complete within 90 seconds. Please try to login after some time."
        : (statusData.message || "Resume processing failed or timed out.");
      setProcessingError(displayMessage);
    }
  }, [location.state, verifiedUserId, resumeData?.phone, refreshAuth, handleContinue]);

  // Define checkStatus helper
  const checkStatus = useCallback(async () => {
    const phone = resumeData?.phone;
    if (!phone) return;

    console.log("⏳ Checking resume status from backend...");
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.RESUME_STATUS}`,
      { params: { phone: phone.replace(/\D/g, '') } }
    );

    const status = response.data?.resume_status || response.data?.status;
    if (status) {
      handleResumeStatusUpdate({
        status: status.toLowerCase(),
        user_id: response.data?.user_id,
        message: response.data?.message
      });
    }
    return response.data;
  }, [resumeData, handleResumeStatusUpdate]);

  // Polling for resume status - Updated to wait for long-running backend output
  useEffect(() => {
    if (
      !otpVerified ||
      resumeProcessingStatus === "completed" ||
      resumeProcessingStatus === "failed" ||
      resumeProcessingStatus === "incomplete" ||
      processingError
    ) {
      return;
    }

    let isActive = true;

    const runCheck = async () => {
      try {
        await checkStatus();
      } catch (err) {
        if (isActive) {
          console.error("Status check error:", err);
          // Only show error if we're still on this screen and it's not a normal timeout
          if (err.code !== 'ECONNABORTED') {
            // setProcessingError("Failed to verify resume status. Please try again.");
          }
        }
      }
    };

    runCheck();

    return () => {
      isActive = false;
    };
  }, [otpVerified, resumeProcessingStatus, processingError, checkStatus]);

  // Auto-scroll to processing error/warning alert when it becomes visible
  useEffect(() => {
    if (processingError && delayNoticeRef.current) {
      delayNoticeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [processingError]);

  // Manual status check retry handler
  const handleManualStatusCheck = async () => {
    setIsCheckingStatus(true);
    try {
      await checkStatus();
    } catch (err) {
      console.error("Manual status check error:", err);
      setProcessingError("Failed to check status. Please try again.");
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleOTPSuccess = async (verificationData) => {
    console.log("✓ OTP Verification Successful:", {
      timestamp: new Date().toISOString(),
      verificationData,
      newUser: verificationData.newUser,
    });



    // Mark OTP as verified to start status tracking in useEffect
    setOtpVerified(true);
    if (verificationData.verificationData?.user_id) {
      setVerifiedUserId(verificationData.verificationData.user_id);
    }

    // Refresh auth state immediately so the frontend knows we're logged in
    // This allows background status checks (which are protected) to succeed
    refreshAuth(verificationData.mobileNumber).catch(err =>
      console.error("Auth refresh after OTP failed:", err)
    );

    // Set initial status to show we're starting
    setResumeProcessingStatus("processing");
    setStatusAlertMessage("Mobile verified. Finalizing your profile...");
    setShowStatusAlert(true);
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
    setIndustrySaved(false);
    setProgressPercent(0);
    setProcessingError(null);
  };

  const handleRetry = () => {
    setProcessingError(null);
    setOtpVerified(false);
    setIndustrySaved(false);
    setProgressPercent(0);
    setElapsedSeconds(0);
    setProcessingStartTime(null);
    setResumeProcessingStatus("unknown");
  };

  const handleResendOtp = async () => {
    const name = resumeData?.name || resumeData?.fullName || "Candidate";
    const phone = resumeData?.phone;
    if (!phone) return;

    try {
      const resp = await activeOtp.sendOtp({
        name,
        phone,
        isResend: true,
        role: "Candidate"
      });

      if (!resp.error) {
        setProcessingError(null);
        setOtpVerified(false);
        setProgressPercent(0);
        setElapsedSeconds(0);
        setProcessingStartTime(null);
        setResumeProcessingStatus("unknown");
      } else {
        setProcessingError(resp.message || "Failed to resend OTP.");
      }
    } catch (err) {
      console.error("Failed to resend OTP:", err);
      setProcessingError("Failed to resend OTP. Please try again.");
    }
  };

  const handleAutoApply = async (jobId, userId) => {
    setAutoApplyStatus("applying");
    try {
      const result = await applyJob({ job_id: jobId, user_id: userId });
      if (!result.error) {
        setAutoApplyStatus("success");
        setSnackbar({ open: true, message: "Applied successfully!", severity: "success" });
      } else {
        setAutoApplyStatus("error");
      }
    } catch (err) {
      console.error("Auto-apply error:", err);
      setAutoApplyStatus("error");
    }
  };

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleContinue = () => {
    const autoApplyJobId = location.state?.autoApplyJobId;
    if (autoApplyJobId) {
      // Redirect back to the public job detail page
      navigate(`/job/${autoApplyJobId}`, { state: { applied: true } });
    } else {
      navigate("/dashboard");
    }
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
          <ResumeUploadProgress
            currentStep={currentStep}
            steps={steps}
          />
        ) : !otpVerified ? (
          // Step 1: OTP Validation Phase
          <ProcessingOtpVerification
            newUser={newUser}
            processingError={processingError}
            handleRetry={handleRetry}
            resumeData={resumeData}
            handleOTPSuccess={handleOTPSuccess}
            handleChangeNumber={handleChangeNumber}
          />
        ) : !industrySaved ? (
          // Step 2: Industry Selection Phase
          <IndustrySelectionCard
            userId={verifiedUserId}
            onSave={() => setIndustrySaved(true)}
          />
        ) : !processingComplete ? (
          // Step 3: Post-OTP & Post-Industry Resume Processing Status Phase
          <ResumeFinalizingStatus
            processingError={processingError}
            delayNoticeRef={delayNoticeRef}
            resumeProcessingStatus={resumeProcessingStatus}
            handleManualStatusCheck={handleManualStatusCheck}
            isCheckingStatus={isCheckingStatus}
            progressPercent={progressPercent}
            userId={verifiedUserId}
            elapsedSeconds={elapsedSeconds}
          />
        ) : (
          // Step 4: Completion State
          <ProcessingCompleteCard
            autoApplyStatus={autoApplyStatus}
            autoApplyJobId={location.state?.autoApplyJobId}
            handleContinue={handleContinue}
          />
        )}

        {/* Status Alert Snackbar */}
        <Snackbar
          open={showStatusAlert}
          autoHideDuration={3000}
          onClose={() => setShowStatusAlert(false)}
          message={statusAlertMessage}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default ProcessingScreen;
