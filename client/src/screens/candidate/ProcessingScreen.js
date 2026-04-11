// screens/candidate/ProcessingScreen.js
import React, { useEffect, useState } from "react";
import { Box, Typography, Container, LinearProgress, Stack, Fade } from "@mui/material";
import { useLocation } from "react-router-dom";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { fadeSlideUp, pulse } from "../../utils/themeUtils";
import MobileOTPValidation from "../../components/forms/MobileOTPValidation";

const steps = [
  "Uploading your resume...",
  "Extracting skills and experience...",
  "Analyzing matching patterns...",
  "Finding the best jobs for you...",
  "Almost ready!"
];

const ProcessingScreen = ({ onComplete }) => {
  const location = useLocation();
  const resumeData = location.state?.resumeData;

  const [currentStep, setCurrentStep] = useState(0);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [showOTPValidation, setShowOTPValidation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [newUser, setNewUser] = useState(null); // Track if the user is new or existing based on API response

  // Log resume data when component mounts or data changes
  useEffect(() => {
    if (resumeData) {
      console.log("📄 Resume Data Received in ProcessingScreen:", {
        timestamp: new Date().toISOString(),
        data: resumeData,
        dataKeys: Object.keys(resumeData)
      });

      setNewUser(resumeData.new_user); // Set newUser state based on passed data

      debugger;

      setShowOTPValidation(true);
    }
  }, [resumeData]);

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setCurrentStep((prev) => {
  //       if (prev >= steps.length - 1) {
  //         clearInterval(timer);
  //         // Mark processing as complete and show OTP validation
  //         setTimeout(() => {
  //           setProcessingComplete(true);
  //           setShowOTPValidation(true);
  //         }, 800);
  //         return prev;
  //       }
  //       return prev + 1;
  //     });
  //   }, 1500);
  //   return () => clearInterval(timer);
  // }, []);

  const handleOTPSuccess = (verificationData) => {
    console.log("✓ OTP Verification Successful:", {
      timestamp: new Date().toISOString(),
      verificationData,
      newUser: verificationData.newUser,
      resumeData: verificationData.resumeData || "No resume data available"
    });

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

    console.log("✓ Combined Processing Complete:", combinedData);

  };

  const handleOTPError = (errorMessage) => {
    console.error("✗ OTP verification failed:", errorMessage);
    // Keep the OTP validation visible for retry
  };

  const handleChangeNumber = () => {
    // Reset to allow user to restart the process
    setProcessingComplete(false);
    setShowOTPValidation(false);
    setCurrentStep(0);
  };

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", px: 2, py: 4 }}>
      <Container maxWidth="xs">
        {!showOTPValidation ? (
          // Processing Animation Phase
          <Box sx={{ textAlign: "center" }}>
            <Box sx={{ position: "relative", display: "inline-flex", mb: 5 }}>
              <Box sx={{ width: 80, height: 80, borderRadius: "24px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 32px rgba(99,102,241,0.35)", animation: `${pulse} 2s infinite ease-in-out` }}>
                <AutoAwesomeIcon sx={{ color: "#fff", fontSize: 40 }} />
              </Box>
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", mb: 1.5, letterSpacing: "-0.02em", animation: `${fadeSlideUp} 0.5s both` }}>
              AI is Analyzing
            </Typography>

            <Box sx={{ mb: 4, height: 24, overflow: "hidden" }}>
              <Fade in={true} key={currentStep} timeout={500}>
                <Typography sx={{ color: "#64748b", fontSize: "0.95rem" }}>
                  {steps[currentStep]}
                </Typography>
              </Fade>
            </Box>

            <Box sx={{ width: "100%", bgcolor: "#e2e8f0", height: 6, borderRadius: 100, overflow: "hidden", mb: 2 }}>
              <LinearProgress variant="determinate" value={((currentStep + 1) / steps.length) * 100} sx={{ height: "100%", bgcolor: "transparent", "& .MuiLinearProgress-bar": { background: "linear-gradient(90deg, #6366f1, #8b5cf6)", borderRadius: 100 } }} />
            </Box>

            <Stack direction="row" justifyContent="center" spacing={3} sx={{ mt: 6, opacity: 0.6 }}>
              {["Parsing PDF", "NLP Analysis", "Vector Search"].map((label, i) => (
                <Typography key={label} sx={{ fontSize: "0.65rem", fontWeight: 800, color: i <= currentStep / 2 ? "#6366f1" : "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {label}
                </Typography>
              ))}
            </Stack>
          </Box>
        ) : (
          // OTP Validation Phase with Background Processing
          <Stack spacing={4}>

            {/* Show message for existing users */}
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

            {/* OTP Validation Component */}
            <MobileOTPValidation
              mobileNumber={resumeData.phone}
              onSuccess={handleOTPSuccess}
              onError={handleOTPError}
              onChangeNumber={handleChangeNumber}
              newUser={newUser}
              resumeData={resumeData}
            />

            {newUser && (
              <>

                

                {/* Background Processing Animation */}
                <Fade in timeout={800}>
                  <Box sx={{
                    p: 3,
                    bgcolor: "rgba(99, 102, 241, 0.05)",
                    borderRadius: 3,
                    border: "1px solid #e2e8f0",
                    textAlign: "center",
                    animation: `${fadeSlideUp} 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) both 0.3s`
                  }}>
                    {/* Processing Title */}
                    <Typography sx={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "#6366f1",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      mb: 2
                    }}>
                      Processing in Background
                    </Typography>

                    {/* Processing Steps */}
                    <Stack spacing={2}>
                      <Box>
                        <Box sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 1.5
                        }}>
                          <Box sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor: "#6366f1",
                            animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`
                          }} />
                          <Typography sx={{
                            fontSize: "0.82rem",
                            color: "#64748b",
                            flex: 1,
                            textAlign: "left"
                          }}>
                            Parsing resume document
                          </Typography>
                        </Box>

                        <Box sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 1.5
                        }}>
                          <Box sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor: "#6366f1",
                            animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite 0.3s`
                          }} />
                          <Typography sx={{
                            fontSize: "0.82rem",
                            color: "#64748b",
                            flex: 1,
                            textAlign: "left"
                          }}>
                            Extracting skills & experience
                          </Typography>
                        </Box>

                        <Box sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2
                        }}>
                          <Box sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor: "#6366f1",
                            animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite 0.6s`
                          }} />
                          <Typography sx={{
                            fontSize: "0.82rem",
                            color: "#64748b",
                            flex: 1,
                            textAlign: "left"
                          }}>
                            Matching with opportunities
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>

                    {/* Processing Status Text */}
                    {/* <Typography sx={{
                      fontSize: "0.78rem",
                      color: "#94a3b8",
                      mt: 2.5,
                      lineHeight: 1.4
                    }}>
                      While you verify your mobile, our AI is analyzing your profile and matching it with the best opportunities.
                    </Typography> */}
                  </Box>
                </Fade>
              </>
            )}
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default ProcessingScreen;
