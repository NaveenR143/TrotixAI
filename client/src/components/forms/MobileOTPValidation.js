// components/forms/MobileOTPValidation.js
import React, { useState, useEffect } from "react";
import { useFetcher, useNavigate } from "react-router-dom";
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
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import { fadeSlideUp } from "../../utils/themeUtils";
import { API_BASE_URL, API_ENDPOINTS } from "../../config/api.config";
import { getStatusMessage, calculateRealisticProgress } from "../../utils/progressUtils";

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
    // onError,
    onChangeNumber,
    disabled = false,
    otpLength = 4,
    newUser = null,
    resumeData = null,

}) => {
    const navigate = useNavigate();
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [verificationSuccess, setVerificationSuccess] = useState(false);
    const [resumeStatus, setResumeStatus] = useState("unknown");
    const [processingProgress, setProcessingProgress] = useState(30);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    const handleOtpChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, otpLength);
        setOtp(val);
        setError(""); // Clear error when user starts typing

        // // Auto-submit when OTP reaches desired length
        // if (val.length === otpLength) {
        //     setTimeout(() => {
        //         // Auto-trigger verification
        //         handleVerify({ preventDefault: () => { }, target: { form: e.target.form } });
        //     }, 300);
        // }
    };

    // Handle paste events for better UX
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedText = (e.clipboardData || window.clipboardData).getData('text');
        const digits = pastedText.replace(/\D/g, '').slice(0, otpLength);
        setOtp(digits);
        setError("");

        // Auto-submit if pasted value reaches desired length
        if (digits.length === otpLength) {
            setTimeout(() => {

                
                handleVerify({ preventDefault: () => { } });
            }, 200);
        }
    };

    const handleVerify = async (e) => {
        e?.preventDefault?.();

        if (otp.length !== otpLength) {
            setError(`Please enter a valid ${otpLength}-digit OTP.`);
            return;
        }

    };

    const verifyOTP = async () => {
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

            // Call success callback after brief delay for UX
            setTimeout(() => {
                if (onSuccess) {
                    onSuccess({
                        otp,
                        mobileNumber,
                        verificationData: verifyResult,
                        newUser,
                        resumeData,
                    });
                }
            }, 200);
        } catch (err) {
            setLoading(false);
            const errorMsg = err?.response?.data?.detail || err?.message || "Verification failed. Please try again.";
            console.error("✗ OTP Verification Error:", {
                error: errorMsg,
                details: err
            });
            setError(errorMsg);
            // if (onError) onError(errorMsg);
        }
    };

    useEffect(() => {
        if (otp.length === otpLength) {
            verifyOTP();
        }

    }, [otp]);

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
                            "You're all set! ..."
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

                {/* Error Alert with Better Messaging */}
                <Fade in={!!error && !verificationSuccess}>
                    <Alert
                        severity="error"
                        onClose={() => setError("")}
                        sx={{ mb: 3, borderRadius: 2, display: error ? "flex" : "none" }}
                        icon={<ErrorOutlineIcon />}
                    >
                        <AlertTitle sx={{ fontSize: "0.85rem", fontWeight: 700 }}>
                            Verification Failed
                        </AlertTitle>
                        {error}
                        <Typography sx={{ fontSize: "0.75rem", mt: 1, opacity: 0.8 }}>
                            Please check your code and try again, or click "Resend OTP" for a new code.
                        </Typography>
                    </Alert>
                </Fade>

                {/* Success Alert */}
                <Fade in={verificationSuccess}>
                    <Alert
                        severity="success"
                        sx={{
                            mb: 3,
                            borderRadius: 2,
                            display: verificationSuccess ? "flex" : "none",
                            background: "linear-gradient(135deg, #f0fdf4, #dcfce7)"
                        }}
                    >
                        <AlertTitle sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#166534" }}>
                            ✓ Verification Successful!
                        </AlertTitle>
                        <Typography sx={{ fontSize: "0.82rem", color: "#4b5563" }}>
                            Your mobile number has been verified. Your resume is now being finalized...
                        </Typography>
                    </Alert>
                </Fade>

                {/* Form Content */}
                {!verificationSuccess ? (
                    <form onSubmit={handleVerify}>
                        <Stack spacing={3}>
                            {/* Helper Text Before OTP Entry */}
                            <Typography sx={{
                                fontSize: "0.85rem",
                                color: "#64748b",
                                textAlign: "center",
                                lineHeight: 1.5
                            }}>
                                We've sent a {otpLength}-digit code to {formatDisplayNumber(mobileNumber)}
                            </Typography>

                            <TextField
                                fullWidth
                                label="One-Time Password"
                                placeholder={`Enter ${otpLength}-digit code`}
                                variant="outlined"
                                autoFocus
                                disabled={disabled || loading}
                                value={otp}
                                onChange={handleOtpChange}
                                onPaste={handlePaste}
                                maxLength={otpLength}
                                inputMode="numeric"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlinedIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
                                        </InputAdornment>
                                    )
                                }}
                                helperText={otp.length > 0 ? `${otp.length}/${otpLength}` : `Paste or type your code`}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        transition: "all 0.2s",
                                        fontSize: { xs: "1.2rem", sm: "1.3rem" },
                                        letterSpacing: "0.2em",
                                        "& input": {
                                            textAlign: "center",
                                            fontWeight: 700,
                                            fontFamily: "monospace",
                                            padding: "16px 8px"
                                        },
                                        "&:hover": { bgcolor: "#f8fafc" },
                                        "&.Mui-focused": {
                                            "& fieldset": {
                                                borderColor: "#6366f1",
                                                borderWidth: 2
                                            }
                                        }
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
                                {loading ? "Verifying..." : otp.length === otpLength ? "Verify Now" : "Verify OTP"}
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
                                        fontSize: "0.85rem",
                                        "&:hover": {
                                            bgcolor: "rgba(99, 102, 241, 0.05)",
                                            color: "#6366f1"
                                        }
                                    }}
                                >
                                    Didn't receive the code? Resend OTP
                                </Button>
                            )}

                            {/* Helpful messaging during entry */}
                            <Typography sx={{
                                fontSize: "0.75rem",
                                color: "#94a3b8",
                                mt: 2,
                                lineHeight: 1.4,
                                textAlign: "center"
                            }}>
                                💡 Tip: You can paste your OTP directly from your messages
                            </Typography>
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
                                textAlign: "center",
                                animation: `${fadeSlideUp} 0.4s ease-in`
                            }}
                        >
                            <Box sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 1,
                                mb: 1
                            }}>
                                <CheckCircleOutlineIcon sx={{ color: "#166534", fontSize: 20 }} />
                                <Typography sx={{ color: "#166534", fontWeight: 700, fontSize: "0.95rem" }}>
                                    Mobile Verification Complete
                                </Typography>
                            </Box>
                            <Typography
                                sx={{
                                    color: "#4b5563",
                                    fontSize: "0.85rem",
                                    lineHeight: 1.5
                                }}
                            >
                                ✓ Your mobile number has been verified successfully.
                            </Typography>
                        </Box>

                        {/* Active Processing Indicator */}
                        {/* <Box
                            sx={{
                                p: 3,
                                bgcolor: "rgba(99, 102, 241, 0.05)",
                                borderRadius: 2.5,
                                border: "1px solid rgba(99, 102, 241, 0.2)",
                                textAlign: "center"
                            }}
                        >
                            <Typography sx={{
                                fontSize: "0.75rem",
                                fontWeight: 800,
                                color: "#6366f1",
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                                mb: 2
                            }}>
                                🔄 Processing Your Resume
                            </Typography>

                            
                            <Box sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 2.5
                            }}>
                                <Typography sx={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 600 }}>
                                    {getStatusMessage(processingProgress, resumeStatus)}
                                </Typography>
                                <Typography sx={{
                                    fontSize: "0.9rem",
                                    fontWeight: 800,
                                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text"
                                }}>
                                    {processingProgress}%
                                </Typography>
                            </Box>

                            
                            <LinearProgress
                                variant="determinate"
                                value={processingProgress}
                                sx={{
                                    borderRadius: 100,
                                    height: 8,
                                    bgcolor: "#e2e8f0",
                                    mb: 2,
                                    "& .MuiLinearProgress-bar": {
                                        background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                                        borderRadius: 100,
                                        transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                                    }
                                }}
                            />

                            
                            <Typography sx={{
                                fontSize: "0.75rem",
                                color: "#94a3b8",
                                lineHeight: 1.6
                            }}>
                                Parsing • Extracting • Analyzing • Validating
                            </Typography>
                        </Box> */}


                        {/* <Typography sx={{
                            fontSize: "0.8rem",
                            color: "#64748b",
                            textAlign: "center",
                            lineHeight: 1.5,
                            fontStyle: "italic"
                        }}>
                            Our AI is analyzing your profile and finding the best opportunities for you. This typically takes 30-50 seconds.
                        </Typography> */}
                    </Stack>
                )}
            </Paper>
        </Fade>
    );
};

export default MobileOTPValidation;
