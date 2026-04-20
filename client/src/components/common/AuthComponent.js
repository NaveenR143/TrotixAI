import React, { useState } from "react";
import {
  Box, Typography, Button, TextField, Paper,
  InputAdornment, Stack, Fade, Alert, Link
} from "@mui/material";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { sendOTP, verifyOTP, sendRegistrationOTP } from "../../api/jobpostingAPI";
import { UPDATE_USER_PROFILE } from "../../redux/constants";
import { fetchAndStoreProfile } from "../../redux/profile/ProfileAction";
import { fadeSlideUp } from "../../utils/themeUtils";
import { scrollToFirstError } from "../../utils/formUtils";

/**
 * AuthComponent - Universal login and registration component
 * @param {string} userType - 'Candidate', 'Recruiter', or 'Consultant'
 * @param {string} invokedFrom - Context identifier (e.g., 'JobPost')
 * @param {function} onSuccess - Callback for successful authentication
 */
const AuthComponent = ({ userType = 'Candidate', invokedFrom = '', onSuccess }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isLogin, setIsLogin] = useState(false);
  const [step, setStep] = useState(1); // 1: Input, 2: OTP
  const [formData, setFormData] = useState({ name: "", mobile: "", otp: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Role mapping helper
  const mapRoleToType = (role) => {
    switch (role?.toLowerCase()) {
      case 'jobseeker': return 'Candidate';
      case 'recruiter': return 'Recruiter';
      case 'consultant': return 'Consultant';
      default: return 'Candidate';
    }
  };

  // Redirection logic
  const handleNavigation = (type) => {
    if (invokedFrom === 'JobPost') {
      if (onSuccess) onSuccess();
      return;
    }

    switch (type) {
      case 'Recruiter':
        navigate("/recruiter-dashboard");
        break;
      case 'Consultant':
        navigate("/consultant-dashboard");
        break;
      default:
        navigate("/dashboard");
    }
  };

  /**
   * Dedicated function for New User Registration Flow
   * Handles /new-recruiter-otp and can be extended for other roles
   */
  const handleNewUserRegistration = async (name, phone, role) => {
    setLoading(true);
    setError("");
    try {
      // Logic for new user flow
      const resp = await sendRegistrationOTP(name, phone, role);
      if (!resp.error) {
        setStep(2);
      } else {
        setError(resp.message);
      }
    } catch (err) {
      setError("Registration flow failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Main handler for requesting OTP
   * Determines whether to trigger Login or Registration flow
   */
  const handleGetOtp = async (e) => {
    e.preventDefault();

    // Validation
    const validationErrors = {};
    if (!isLogin && !formData.name.trim()) validationErrors.name = "Please enter your name.";
    if (formData.mobile.length !== 10) validationErrors.mobile = "Please enter a valid 10-digit mobile number.";

    if (Object.keys(validationErrors).length > 0) {
      setError(Object.values(validationErrors)[0]);
      scrollToFirstError(validationErrors, ['name', 'mobile']);
      return;
    }

    // New User Flow (Registration)
    if (!isLogin) {
      await handleNewUserRegistration(formData.name, formData.mobile, userType);
      return;
    }

    // Existing User Flow (Login)
    setLoading(true);
    setError("");
    try {
      const resp = await sendOTP(formData.mobile);
      if (!resp.error) {
        setStep(2);
      } else {
        setError(resp.message);
      }
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (formData.otp.length !== 4) {
      setError("Please enter the 4-digit OTP.");
      scrollToFirstError({ otp: true }, ['otp']);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const resp = await verifyOTP(formData.mobile, formData.otp);
      if (!resp.error) {
        const verifiedType = mapRoleToType(resp.data.user_type);

        // Update Redux
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

        // Fetch and store complete profile information
        dispatch(fetchAndStoreProfile(formData.mobile));

        handleNavigation(verifiedType);
      } else {
        setError(resp.message);
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setStep(1);
    setError("");
    setFormData({ ...formData, otp: "" });
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 420, mx: 'auto' }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 40px rgba(15,23,42,0.08)',
          bgcolor: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          animation: `${fadeSlideUp} 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both`
        }}
      >
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />

        <Box sx={{ textAlign: 'center', mb: 4 }}>
          {/* <Box
            sx={{
              width: 56, height: 56, borderRadius: '16px',
              bgcolor: '#ede9fe', color: '#6366f1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 2.5,
              boxShadow: '0 8px 16px rgba(99, 102, 241, 0.15)'
            }}
          >
            {step === 1 ? <PhoneIphoneIcon sx={{ fontSize: 28 }} /> : <LockOutlinedIcon sx={{ fontSize: 28 }} />}
          </Box> */}
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, letterSpacing: '-0.02em' }}>
            {step === 1 ? (isLogin ? "Welcome Back" : "Create Account") : "Verify OTP"}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            {step === 1
              ? (isLogin ? "Sign in to access your profile" : "Join us to explore opportunities")
              : `Enter the code sent to +91 ${formData.mobile}`}
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

        <form onSubmit={step === 1 ? handleGetOtp : handleVerifyOtp}>
          <Stack spacing={2.5}>
            {step === 1 ? (
              <>
                {!isLogin && (
                  <TextField
                    id="name"
                    fullWidth label="Full Name" placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#94a3b8' }} /></InputAdornment> }}
                  />
                )}
                <TextField
                  id="mobile"
                  fullWidth label="Mobile Number" placeholder="10-digit number"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography sx={{ color: '#94a3b8', fontWeight: 600 }}>+91</Typography>
                      </InputAdornment>
                    )
                  }}
                />
                <Button
                  fullWidth variant="contained" size="large" type="submit"
                  disabled={loading || (isLogin ? formData.mobile.length !== 10 : (!formData.name.trim() || formData.mobile.length !== 10))}
                  endIcon={!loading && <ArrowForwardIcon />}
                  sx={{ py: 1.5, borderRadius: 2.5, fontWeight: 700, background: 'black', '&:hover': { background: '#333' } }}
                >
                  {loading ? "Sending..." : "Get OTP"}
                </Button>

                <Box sx={{ textAlign: 'center', mt: 1 }}>
                  <Link
                    component="button" type="button" variant="body2"
                    onClick={toggleMode}
                    sx={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {isLogin ? "New user? Register here" : "Existing user? Login"}
                  </Link>
                </Box>
              </>
            ) : (
              <>
                <TextField
                  id="otp"
                  fullWidth label="4-Digit OTP" placeholder="0000" autoFocus
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  InputProps={{ startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment> }}
                />
                <Button
                  fullWidth variant="contained" size="large" type="submit"
                  disabled={loading || formData.otp.length !== 4}
                  endIcon={!loading && <CheckCircleOutlineIcon />}
                  sx={{ py: 1.5, borderRadius: 2.5, fontWeight: 700, background: 'black', '&:hover': { background: '#333' } }}
                >
                  {loading ? "Verifying..." : "Verify & Continue"}
                </Button>
                <Button
                  fullWidth variant="text" size="small"
                  onClick={() => { setStep(1); setError(""); }}
                  sx={{ color: '#64748b', fontWeight: 600 }}
                >
                  Change Mobile Number
                </Button>
              </>
            )}
          </Stack>
        </form>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
            For testing use OTP: <b>1234</b>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default AuthComponent;
