// components/common/AuthComponent.js
import React, { useState } from "react";
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
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { sendOTP, verifyOTP, sendRegistrationOTP } from "../../api/jobpostingAPI";
import { UPDATE_USER_PROFILE } from "../../redux/constants";
import { fetchAndStoreProfile } from "../../redux/profile/ProfileAction";

const AuthComponent = ({ userType = 'Candidate', invokedFrom = '', onSuccess }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isLogin, setIsLogin] = useState(false);
  const [step, setStep] = useState(1); // 1: Input, 2: OTP
  const [formData, setFormData] = useState({ name: "", mobile: "", otp: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const mapRoleToType = (role) => {
    switch (role?.toLowerCase()) {
      case 'jobseeker': return 'Candidate';
      case 'recruiter': return 'Recruiter';
      case 'consultant': return 'Consultant';
      default: return 'Candidate';
    }
  };

  const handleNavigation = (type) => {
    if (invokedFrom === 'JobPost') {
      if (onSuccess) onSuccess();
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
      const resp = await sendRegistrationOTP(name, phone, role);
      if (!resp.error) {
        setStep(2);
      } else {
        setError(resp.message);
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
      await handleNewUserRegistration(formData.name, formData.mobile, userType);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const resp = await sendOTP(formData.mobile);
      if (!resp.error) setStep(2);
      else setError(resp.message);
    } catch (err) {
      setError("Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (formData.otp.length !== 4) { setError("Enter 4-digit OTP"); return; }

    setLoading(true);
    setError("");
    try {
      const resp = await verifyOTP(formData.mobile, formData.otp);
      if (!resp.error) {
        const verifiedType = mapRoleToType(resp.data.user_type);
        dispatch({
          type: UPDATE_USER_PROFILE,
          payload: {
            userid: resp.data.user_id,
            mobile: formData.mobile,
            displayname: formData.name || 'User',
            fullname: formData.name || 'User',
            userType: verifiedType,
            role: resp.data.user_type
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
            sx={{ position: 'absolute', top: 24, left: 24, color: '#64748B' }}
          >
            <KeyboardBackspaceIcon />
          </IconButton>
        )}

        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#111827', mb: 1.5, letterSpacing: '-0.03em' }}>
            {step === 1 ? (isLogin ? "Welcome back" : "Create account") : "Verification"}
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '0.95rem', fontWeight: 500 }}>
            {step === 1 
              ? (isLogin ? "Enter your mobile to continue" : "Join the platform to start matching")
              : `Enter the code sent to +91 ${formData.mobile}`}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: '12px', fontWeight: 600 }}>
            {error}
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
                    startAdornment: <InputAdornment position="start"><Typography sx={{ color: '#94A3B8', fontWeight: 700 }}>+91</Typography></InputAdornment>
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
                />
                <Button
                  fullWidth variant="contained" size="large" type="submit"
                  disabled={loading || (isLogin ? formData.mobile.length !== 10 : (!formData.name.trim() || formData.mobile.length !== 10))}
                  sx={{ 
                    py: 2, borderRadius: '16px', fontWeight: 800, textTransform: 'none', fontSize: '1rem',
                    bgcolor: '#2563EB', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.2)',
                    '&:hover': { bgcolor: '#1e40af' }
                  }}
                >
                  {loading ? "Sending..." : "Get OTP"}
                </Button>

                <Box sx={{ textAlign: 'center', pt: 1 }}>
                  <Link
                    component="button" type="button" 
                    onClick={() => { setIsLogin(!isLogin); setError(""); }}
                    sx={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                  </Link>
                </Box>
              </>
            ) : (
              <>
                <TextField
                  fullWidth label="Enter 4-Digit OTP" placeholder="0 0 0 0" autoFocus
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' }, '& input': { textAlign: 'center', letterSpacing: '8px', fontWeight: 800, fontSize: '1.2rem' } }}
                />
                <Button
                  fullWidth variant="contained" size="large" type="submit"
                  disabled={loading || formData.otp.length !== 4}
                  sx={{ 
                    py: 2, borderRadius: '16px', fontWeight: 800, textTransform: 'none', fontSize: '1rem',
                    bgcolor: '#2563EB', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.2)',
                    '&:hover': { bgcolor: '#1e40af' }
                  }}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>
                <Button
                  fullWidth variant="text" size="small"
                  onClick={() => { setStep(1); setError(""); }}
                  sx={{ color: '#64748B', fontWeight: 700, textTransform: 'none' }}
                >
                  Resend code or change number
                </Button>
              </>
            )}
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default AuthComponent;
