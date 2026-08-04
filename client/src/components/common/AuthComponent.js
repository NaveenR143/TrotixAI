// components/common/AuthComponent.js
import React, { useState, useEffect } from "react";
import {
  Box, Typography, Button, TextField, Paper,
  InputAdornment, Stack, Fade, Alert, Link, IconButton
} from "@mui/material";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PersonIcon from "@mui/icons-material/Person";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { verifyOTP } from "../../api/jobpostingAPI";
import { UPDATE_USER_PROFILE } from "../../redux/constants";
import { fetchAndStoreProfile } from "../../redux/profile/ProfileAction";
import { mapRoleToType } from "../../utils/profileMapping";
import { useOtp } from "../../hooks/useOtp";
import { useAuth } from "../../authContext";

const AuthComponent = ({ userType = 'Candidate', invokedFrom = '', onSuccess }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { refreshAuth } = useAuth();

  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const isPostJobRoute = location.pathname === '/post-job' || invokedFrom === 'JobPost';

  useEffect(() => {
    setIsLogin(!isPostJobRoute);
  }, [isPostJobRoute]);

  const loginOtp = useOtp("login");
  const registrationOtp = useOtp("registration");
  const activeOtp = isLogin ? loginOtp : registrationOtp;

  const [step, setStep] = useState(1); // 1: Input, 2: OTP
  const [formData, setFormData] = useState({ name: "", mobile: "", otp: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Listen for WebOTP SMS on mobile devices when step is 2
  useEffect(() => {
    if (step !== 2 || !('OTPCredential' in window)) return;

    const ac = new AbortController();
    navigator.credentials.get({
      otp: { transport: ['sms'] },
      signal: ac.signal
    }).then(otpObj => {
      if (otpObj && otpObj.code) {
        const digits = otpObj.code.replace(/\D/g, '').slice(0, 4);
        setFormData(prev => ({ ...prev, otp: digits }));
        handleVerifyOtp(null, digits);
      }
    }).catch(err => {
      console.log("WebOTP API Error/Aborted in AuthComponent:", err);
    });

    return () => {
      ac.abort();
    };
  }, [step]);

  useEffect(() => {
    if (step === 1) {
      setFormData(prev => ({ ...prev, otp: "" }));
    }
  }, [step]);

  const handleNavigation = (type) => {
    if (invokedFrom === 'JobPost') {
      if (onSuccess) onSuccess();
      return;
    }

    const searchParams = new URLSearchParams(location.search);
    const redirectUrl = searchParams.get('redirect');

    if (redirectUrl) {
      // Remove redirect from params but keep others (like action=apply)
      searchParams.delete('redirect');
      const queryString = searchParams.toString();
      navigate(`${redirectUrl}${queryString ? `?${queryString}` : ''}`);
      return;
    }

    switch (type) {
      case 'Recruiter': navigate("/recruiter-dashboard"); break;
      case 'Consultant': navigate("/consultant-dashboard"); break;
      default: navigate("/dashboard");
    }
  };

  const handleNewUserRegistration = async (name, phone, role) => {
    setLoading(true);
    setError("");
    try {
      const resp = await registrationOtp.sendOtp({ name, phone, isResend: false, role });
      if (!resp.error) {
        setStep(2);
      } else {
        setError(resp.message || registrationOtp.error);
      }
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGetOtp = async (e) => {
    e.preventDefault();
    if (!isLogin && !formData.name.trim()) { setError("Name is required"); return; }
    if (formData.mobile.length !== 10) { setError("Enter valid 10-digit number"); return; }

    if (!isLogin) {
      if (userType !== 'Recruiter') {
        setError("Mobile registration is only available for recruiters.");
        return;
      }
      await handleNewUserRegistration(formData.name, formData.mobile, userType);
      return;
    }


    setLoading(true);
    setError("");
    try {
      const resp = await loginOtp.sendOtp({ phone: formData.mobile, isResend: false });
      if (!resp.error) setStep(2);
      else setError(resp.message || loginOtp.error);
    } catch (err) {
      setError("Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    try {
      const resp = await activeOtp.sendOtp({
        name: formData.name,
        phone: formData.mobile,
        isResend: true,
        role: userType
      });
      if (resp.error) {
        setError(resp.message || activeOtp.error);
      }
    } catch (err) {
      setError("Failed to resend OTP.");
    }
  };

  const handleVerifyOtp = async (e, otpOverride) => {
    if (e) e.preventDefault();
    const otpToVerify = otpOverride || formData.otp;
    if (otpToVerify.length !== 4) { setError("Enter 4-digit OTP"); return; }

    setLoading(true);
    setError("");
    try {
      const resp = await verifyOTP(formData.mobile, otpToVerify);
      if (!resp.error) {
        const verifiedType = mapRoleToType(resp.data.role || resp.data.user_type);

        // Refresh React Auth Context before navigating to populate the context user state
        await refreshAuth(formData.mobile);

        if (verifiedType) {
          localStorage.setItem("role", verifiedType);
          localStorage.setItem("userrole", verifiedType);
        }

        dispatch({
          type: UPDATE_USER_PROFILE,
          payload: {
            userid: resp.data.user_id,
            mobile: formData.mobile,
            displayname: formData.name || 'User',
            fullname: formData.name || 'User',
            role: verifiedType,
            userrole: verifiedType
          }
        });
        dispatch(fetchAndStoreProfile(formData.mobile));
        handleNavigation(verifiedType);
      } else {
        setError(resp.message);
      }
    } catch (err) {
      setError("Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 440, mx: 'auto' }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, sm: 5 },
          borderRadius: '32px',
          border: '1px solid #E5E7EB',
          bgcolor: '#FFFFFF',
          boxShadow: '0 20px 50px rgba(0,0,0,0.04)',
          position: 'relative'
        }}
      >
        {step === 2 && (
          <IconButton
            onClick={() => setStep(1)}
            sx={{ position: 'absolute', top: 24, left: 24, color: '#212121' }}
          >
            <KeyboardBackspaceIcon />
          </IconButton>
        )}

        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', mb: 1.5, letterSpacing: '-0.03em' }}>
            {step === 1 ? (isLogin ? "Welcome back" : "Create account") : "Verification"}
          </Typography>
          <Typography sx={{ color: '#212121', fontSize: '0.95rem', fontWeight: 400 }}>
            {step === 1
              ? (isLogin ? "Enter your mobile to continue" : "Join the platform to start posting")
              : `Enter the code sent to +91 ${formData.mobile}`}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: '12px', fontWeight: 500 }}>
            {error}
          </Alert>
        )}

        {step === 2 && activeOtp.resendAttempts >= 3 && (
          <Alert severity="warning" sx={{ mb: 4, borderRadius: '12px', fontWeight: 500 }}>
            You have exhausted all 3 daily resend attempts. Please request a new code tomorrow.
          </Alert>
        )}

        <form onSubmit={step === 1 ? handleGetOtp : handleVerifyOtp}>
          <Stack spacing={3}>
            {step === 1 ? (
              <>
                {!isLogin && (
                  <TextField
                    fullWidth label="Full Name" placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
                  />
                )}
                <TextField
                  fullWidth label="Mobile Number" placeholder="9876543210"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Typography sx={{ color: '#94A3B8', fontWeight: 600 }}>+91</Typography></InputAdornment>
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
                />
                <Button
                  fullWidth variant="contained" size="large" type="submit"
                  disabled={loading || (isLogin ? formData.mobile.length !== 10 : (!formData.name.trim() || formData.mobile.length !== 10))}
                  sx={{
                    py: 2, borderRadius: '16px', fontWeight: 700, textTransform: 'none', fontSize: '1rem',
                    bgcolor: '#2563EB', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.2)',
                    '&:hover': { bgcolor: '#1e40af' },
                    "&.Mui-disabled": {
                      background: "#E2E8F0",
                      color: "#475569"
                    }
                  }}
                >
                  {loading ? "Sending..." : "Get OTP"}
                </Button>

                {isPostJobRoute && (
                  <Box sx={{ textAlign: 'center', pt: 1 }}>
                    <Link
                      component="button" type="button"
                      onClick={() => { setIsLogin(!isLogin); setError(""); }}
                      sx={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem', '&:hover': { textDecoration: 'underline' } }}
                    >
                      {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                    </Link>
                  </Box>
                )}

              </>
            ) : (
              <>
                <TextField
                  fullWidth label="Enter 4-Digit OTP" placeholder="0 0 0 0" autoFocus
                  value={formData.otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setFormData({ ...formData, otp: val });
                    if (val.length === 4) {
                      handleVerifyOtp(null, val);
                    }
                  }}
                  inputProps={{
                    autoComplete: 'one-time-code',
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' }, '& input': { textAlign: 'center', letterSpacing: '8px', fontWeight: 700, fontSize: '1.2rem' } }}
                />
                <Button
                  fullWidth variant="contained" size="large" type="submit"
                  disabled={loading || formData.otp.length !== 4}
                  sx={{
                    py: 2, borderRadius: '16px', fontWeight: 700, textTransform: 'none', fontSize: '1rem',
                    bgcolor: '#2563EB', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.2)',
                    '&:hover': { bgcolor: '#1e40af' },
                    "&.Mui-disabled": {
                      background: "#E2E8F0",
                      color: "#475569"
                    }
                  }}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                  <Button
                    fullWidth variant="outlined" size="medium"
                    onClick={handleResendOtp}
                    disabled={activeOtp.isCooldownActive || !activeOtp.isEligible || activeOtp.loading}
                    sx={{
                      borderRadius: '16px', fontWeight: 600, textTransform: 'none', py: 1.5,
                      "&.Mui-disabled": {
                        color: "#94A3B8"
                      }
                    }}
                  >
                    {activeOtp.loading
                      ? "Resending..."
                      : activeOtp.isCooldownActive
                        ? `Resend code in ${activeOtp.remainingSeconds}s`
                        : activeOtp.resendAttempts >= 3
                          ? "Daily Limit Reached"
                          : "Resend Code"}
                  </Button>
                  <Button
                    fullWidth variant="text" size="small"
                    onClick={() => { setStep(1); setError(""); }}
                    sx={{ color: '#212121', fontWeight: 600, textTransform: 'none' }}
                  >
                    Change phone number
                  </Button>
                </Box>
              </>
            )}
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default AuthComponent;
