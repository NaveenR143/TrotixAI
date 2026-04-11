// components/forms/MobileOTPValidation.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Box,
    Typography,
    Button,
    TextField,
    Paper,
    Stack,
    InputAdornment,
    Alert,
    AlertTitle,
    Fade,
    CircularProgress,
    LinearProgress
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import { fadeSlideUp } from "../../utils/themeUtils";
import { API_BASE_URL, API_ENDPOINTS } from "../../config/api.config";

/**
 * MobileOTPValidation Component
 * A reusable component for mobile OTP verification
 * 
 * @param {string} mobileNumber - The mobile number in format XXX-XXX-XXXX or +91-XXXXXXXXXX
 * @param {function} onSuccess - Callback when OTP is verified successfully (receives {otp, mobileNumber})
 * @param {function} onError - Callback when verification fails (receives error message)
 * @param {function} onChangeNumber - Callback to go back and change mobile number
 * @param {boolean} disabled - Disable the entire component
 * @param {string} otpLength - Length of OTP (default: 6)
 * @param {boolean} newUser - Flag indicating if user is new (true) or existing (false)
 * @param {object} resumeData - Resume data for validation purposes
 */
const MobileOTPValidation = ({
    mobileNumber = "",
    onSuccess,
    onError,
    onChangeNumber,
    disabled = false,
    otpLength = 4,
    newUser = null,
    resumeData = null
}) => {
    const navigate = useNavigate();
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [verificationSuccess, setVerificationSuccess] = useState(false);
    const [resumeStatus, setResumeStatus] = useState("unknown");

    const handleOtpChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, otpLength);
        setOtp(val);
        setError(""); // Clear error when user starts typing
    };

    const handleVerify = async (e) => {
        e?.preventDefault?.();

        if (otp.length !== otpLength) {
            setError(`Please enter a valid ${otpLength}-digit OTP.`);
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Clean phone number - remove all non-digits
            const cleanPhone = mobileNumber.replace(/\D/g, '');

            // Determine which endpoint to call based on newUser flag
            const endpoint = newUser
                ? `${API_BASE_URL}${API_ENDPOINTS.VERIFY_OTP_UPDATE}`
                : `${API_BASE_URL}${API_ENDPOINTS.VERIFY_OTP}`;

            const payload = {
                phone: cleanPhone,
                otp: otp
            };

            console.log(`🔐 Calling OTP endpoint (${newUser ? "New User" : "Existing User"}):`, {
                endpoint,
                payload,
                resumeData: resumeData || "No resume data"
            });

            const response = await axios.post(endpoint, payload);
            const verifyResult = response.data;

            console.log("✓ OTP Verification Successful:", {
                response: verifyResult,
                userType: newUser ? "New User" : "Existing User"
            });

            setVerificationSuccess(true);
            setLoading(false);

            // Fetch resume status in the background

            try {
                console.log("📋 Fetching resume status for user:", verifyResult.user_id);

                const statusResponse = await axios.get(
                    `${API_BASE_URL}${API_ENDPOINTS.RESUME_STATUS}`,
                    { params: { phone: cleanPhone } }
                );

                const resumeStatusData = statusResponse.data?.resume_status || "unknown";
                setResumeStatus(resumeStatusData);

                console.log("✓ Resume Status Fetched:", {
                    status: resumeStatusData,
                    phone: cleanPhone
                });
            } catch (statusErr) {
                console.error("✗ Error fetching resume status:", statusErr);
                // Don't fail the verification if status fetch fails
            }


            // Call success callback after brief delay for UX
            setTimeout(() => {
                if (onSuccess) {
                    onSuccess({
                        otp,
                        mobileNumber,
                        verificationData: verifyResult,
                        newUser,
                        resumeData,
                        resumeStatus
                    });
                }

                // Navigate based on user type
                // const route = newUser ? "/feed" : "/dashboard";
                // console.log(`🚀 Navigating to ${route} for ${newUser ? "new" : "existing"} user`);
                // navigate(route);
            }, 800);
        } catch (err) {
            setLoading(false);
            const errorMsg = err?.message || "Verification failed. Please try again.";
            console.error("✗ OTP Verification Error:", {
                error: errorMsg,
                details: err
            });
            setError(errorMsg);
            if (onError) onError(errorMsg);
        }
    };

    const handleRetry = () => {
        setOtp("");
        setError("");
        setVerificationSuccess(false);
    };

    // Format mobile number for display (hide some digits)
    const formatDisplayNumber = (num) => {
        if (!num) return "";
        // If it's a full number, show only last 4 digits
        const lastFour = num.replace(/\D/g, '').slice(-4);
        return `****${lastFour}`;
    };

    return (
        <Fade in timeout={600}>
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 3, sm: 4 },
                    borderRadius: 3,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 40px rgba(15,23,42,0.08)",
                    bgcolor: "#ffffff",
                    position: "relative",
                    overflow: "hidden",
                    animation: `${fadeSlideUp} 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both`,
                    maxWidth: "100%",
                    width: "100%"
                }}
            >
                {/* Top accent bar */}
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: "linear-gradient(90deg, #6366f1, #8b5cf6)"
                    }}
                />

                {/* Header Section */}
                <Box sx={{ textAlign: "center", mb: 4 }}>
                    <Box
                        sx={{
                            width: 56,
                            height: 56,
                            borderRadius: "16px",
                            bgcolor: "#ede9fe",
                            color: "#6366f1",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mx: "auto",
                            mb: 2.5,
                            boxShadow: "0 8px 16px rgba(99, 102, 241, 0.15)"
                        }}
                    >
                        {verificationSuccess ? (
                            <CheckCircleOutlineIcon sx={{ fontSize: 28 }} />
                        ) : (
                            <LockOutlinedIcon sx={{ fontSize: 28 }} />
                        )}
                    </Box>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 800,
                            color: "#0f172a",
                            mb: 1,
                            letterSpacing: "-0.02em"
                        }}
                    >
                        {verificationSuccess ? "Verification Complete" : "Verify Your Mobile"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                        {verificationSuccess ? (
                            "You're all set! Proceeding to your dashboard..."
                        ) : (
                            <>
                                Enter the code sent to{" "}
                                <Box
                                    component="span"
                                    sx={{ fontWeight: 700, color: "#0f172a", display: "block", mt: 0.5 }}
                                >
                                    {formatDisplayNumber(mobileNumber)}
                                </Box>
                            </>
                        )}
                    </Typography>
                </Box>

                {/* Error Alert */}
                <Fade in={!!error && !verificationSuccess}>
                    <Alert
                        severity="error"
                        onClose={() => setError("")}
                        sx={{ mb: 3, borderRadius: 2, display: error ? "flex" : "none" }}
                    >
                        <AlertTitle sx={{ fontSize: "0.85rem", fontWeight: 700 }}>
                            Verification Failed
                        </AlertTitle>
                        {error}
                    </Alert>
                </Fade>

                {/* Success Alert */}
                <Fade in={verificationSuccess}>
                    <Alert
                        severity="success"
                        sx={{
                            mb: 3,
                            borderRadius: 2,
                            display: verificationSuccess ? "flex" : "none"
                        }}
                    >
                        <AlertTitle sx={{ fontSize: "0.85rem", fontWeight: 700 }}>
                            OTP Verified Successfully
                        </AlertTitle>
                        Your mobile number has been verified.
                    </Alert>
                </Fade>

                {/* Form Content */}
                {!verificationSuccess ? (
                    <form onSubmit={handleVerify}>
                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                label="One-Time Password"
                                placeholder={`Enter ${otpLength}-digit OTP`}
                                variant="outlined"
                                autoFocus
                                disabled={disabled || loading}
                                value={otp}
                                onChange={handleOtpChange}
                                maxLength={otpLength}
                                inputMode="numeric"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlinedIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
                                        </InputAdornment>
                                    )
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        transition: "all 0.2s",
                                        fontSize: { xs: "1rem", sm: "1.1rem" },
                                        letterSpacing: "0.15em",
                                        "& input": {
                                            textAlign: "center",
                                            fontWeight: 600,
                                            fontFamily: "monospace"
                                        },
                                        "&:hover": { bgcolor: "#f8fafc" }
                                    }
                                }}
                            />

                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                type="submit"
                                disabled={otp.length !== otpLength || disabled || loading}
                                startIcon={loading && <CircularProgress size={20} color="inherit" />}
                                endIcon={!loading && <CheckCircleOutlineIcon />}
                                sx={{
                                    py: 1.5,
                                    fontSize: "1rem",
                                    borderRadius: 2.5,
                                    textTransform: "none",
                                    fontWeight: 700,
                                    background: "black",
                                    color: "white",
                                    boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                                    transition: "all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
                                    "&:hover:not(.Mui-disabled)": {
                                        background: "#333333",
                                        transform: "translateY(-1px)",
                                        boxShadow: "0 6px 20px rgba(0,0,0,0.2)"
                                    },
                                    "&.Mui-disabled": {
                                        background: "rgba(15, 23, 42, 0.6)",
                                        color: "rgba(255, 255, 255, 0.5)"
                                    }
                                }}
                            >
                                {loading ? "Verifying..." : "Verify OTP"}
                            </Button>

                            {onChangeNumber && (
                                <Button
                                    fullWidth
                                    variant="text"
                                    size="small"
                                    onClick={onChangeNumber}
                                    disabled={disabled || loading}
                                    sx={{
                                        color: "#64748b",
                                        fontWeight: 600,
                                        textTransform: "none",
                                        "&:hover": {
                                            bgcolor: "rgba(99, 102, 241, 0.05)",
                                            color: "#6366f1"
                                        }
                                    }}
                                >
                                    Resend OTP
                                </Button>
                            )}

                            <Typography sx={{
                                fontSize: "0.78rem",
                                color: "#94a3b8",
                                mt: 2.5,
                                lineHeight: 1.4
                            }}>
                                While you verify your mobile, our AI is analyzing your profile and matching it with the best opportunities.
                            </Typography>

                            {/* Progress Bar on Top */}
                            <Box sx={{ width: "100%", mb: 2 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                    <Typography sx={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
                                        Upload Resume Progress
                                    </Typography>
                                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#6366f1" }}>
                                        30%
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={30}
                                    sx={{
                                        borderRadius: 100,
                                        height: 6,
                                        bgcolor: "#e2e8f0",
                                        "& .MuiLinearProgress-bar": {
                                            background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                                            borderRadius: 100
                                        }
                                    }}
                                />
                            </Box>
                        </Stack>
                    </form>
                ) : (
                    <Stack spacing={3}>
                        <Box
                            sx={{
                                p: 2.5,
                                bgcolor: "#f0fdf4",
                                borderRadius: 2,
                                border: "1px solid #86efac",
                                textAlign: "center"
                            }}
                        >
                            <Typography sx={{ color: "#166534", fontWeight: 700, fontSize: "0.95rem" }}>
                                ✓ Mobile verification complete
                            </Typography>
                            <Typography
                                sx={{
                                    color: "#4b5563",
                                    fontSize: "0.85rem",
                                    mt: 1,
                                    lineHeight: 1.5
                                }}
                            >
                                Please wait while our AI processes your resume and matches you with the best opportunities.
                            </Typography>

                            {/* Progress Bar on Top */}
                            <Box sx={{ width: "100%", mb: 2 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                    <Typography sx={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
                                        Upload Resume Progress
                                    </Typography>
                                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#6366f1" }}>
                                        70%
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={70}
                                    sx={{
                                        borderRadius: 100,
                                        height: 6,
                                        bgcolor: "#e2e8f0",
                                        "& .MuiLinearProgress-bar": {
                                            background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                                            borderRadius: 100
                                        }
                                    }}
                                />
                            </Box>
                        </Box>
                    </Stack>
                )}
            </Paper>
        </Fade>
    );
};

export default MobileOTPValidation;
