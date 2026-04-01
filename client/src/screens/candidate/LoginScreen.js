import React, { useState } from "react";
import { 
  Box, Typography, Button, TextField, Paper, Container, 
  InputAdornment, Stack, IconButton, Fade, Alert
} from "@mui/material";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { UPDATE_USER_PROFILE } from "../../redux/constants";
import { fadeSlideUp } from "../../utils/themeUtils";

const LoginScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: Mobile, 2: OTP
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMobileSubmit = (e) => {
    e.preventDefault();
    if (mobile.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setLoading(true);
    setError("");
    // Mock API call delay
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 800);
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (otp !== "123456") {
      setError("Invalid OTP. Please use 123456 for testing.");
      return;
    }
    setLoading(true);
    setError("");
    
    // Mock success
    setTimeout(() => {
      // Save to localStorage and Redux
      const userData = { 
        mobile,
        userType: 'Candidate' // Default to Candidate for now
      };
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userType', 'Candidate');
      localStorage.setItem('mobileNumber', mobile);
      
      dispatch({
        type: UPDATE_USER_PROFILE,
        payload: userData
      });
      setLoading(false);
      navigate("/dashboard");
    }, 800);
  };

  return (
    <Box 
      sx={{ 
        bgcolor: '#f8fafc', 
        minHeight: 'calc(100vh - 64px)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        px: 2,
        py: 4
      }}
    >
      <Container maxWidth="xs">
        <Fade in timeout={600}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: { xs: 3, sm: 5 }, 
              borderRadius: 4, 
              border: '1px solid #e2e8f0', 
              boxShadow: '0 10px 40px rgba(15,23,42,0.08)',
              bgcolor: '#ffffff',
              position: 'relative',
              overflow: 'hidden',
              animation: `${fadeSlideUp} 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both`
            }}
          >
            {/* Design accents */}
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 0, left: 0, right: 0, height: 4, 
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' 
              }} 
            />
            
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box 
                sx={{ 
                  width: 56, height: 56, borderRadius: '16px', 
                  bgcolor: '#ede9fe', color: '#6366f1', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  mx: 'auto', mb: 2.5,
                  boxShadow: '0 8px 16px rgba(99, 102, 241, 0.15)'
                }}
              >
                {step === 1 ? <PhoneIphoneIcon sx={{ fontSize: 28 }} /> : <LockOutlinedIcon sx={{ fontSize: 28 }} />}
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, letterSpacing: '-0.02em' }}>
                {step === 1 ? "Welcome Back" : "Verify OTP"}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                {step === 1 
                  ? "Sign in to access your AI-powered job matches" 
                  : `Enter the code sent to +91 ${mobile}`}
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {step === 1 ? (
              <form onSubmit={handleMobileSubmit}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Mobile Number"
                    placeholder="Enter 10 digit number"
                    variant="outlined"
                    value={mobile}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setMobile(val);
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem', mr: 0.5 }}>+91</Typography>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: '#f8fafc' }
                      }
                    }}
                  />
                  <Button 
                    fullWidth 
                    variant="contained" 
                    size="large"
                    type="submit"
                    disabled={mobile.length !== 10 || loading}
                    endIcon={!loading && <ArrowForwardIcon />}
                    sx={{ 
                      py: 1.5, 
                      fontSize: '1rem', 
                      borderRadius: 2.5,
                      textTransform: 'none',
                      fontWeight: 700,
                      background: 'black',
                      color: 'white',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                      '&:hover': {
                        background: '#333333',
                        transform: 'translateY(-1px)'
                      },
                      '&.Mui-disabled': {
                        background: 'rgba(15, 23, 42, 0.6)',
                        color: 'rgba(255, 255, 255, 0.5)'
                      }
                    }}
                  >
                    {loading ? "Sending..." : "Get OTP"}
                  </Button>
                </Stack>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="One-Time Password"
                    placeholder="Enter 6-digit OTP"
                    variant="outlined"
                    autoFocus
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(val);
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button 
                    fullWidth 
                    variant="contained" 
                    size="large"
                    type="submit"
                    disabled={otp.length !== 6 || loading}
                    endIcon={!loading && <CheckCircleOutlineIcon />}
                    sx={{ 
                      py: 1.5, 
                      fontSize: '1rem', 
                      borderRadius: 2.5,
                      textTransform: 'none',
                      fontWeight: 700,
                      background: 'black',
                      color: 'white',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                      '&:hover': {
                        background: '#333333',
                        transform: 'translateY(-1px)'
                      },
                      '&.Mui-disabled': {
                        background: 'rgba(15, 23, 42, 0.6)',
                        color: 'rgba(255, 255, 255, 0.5)'
                      }
                    }}
                  >
                    {loading ? "Verifying..." : "Verify & Sign In"}
                  </Button>
                  <Button 
                    fullWidth 
                    variant="text" 
                    size="small"
                    onClick={() => { setStep(1); setError(""); }}
                    sx={{ color: '#64748b', fontWeight: 600 }}
                  >
                    Change Mobile Number
                  </Button>
                </Stack>
              </form>
            )}

            <Box sx={{ mt: 5, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                For testing purposes use OTP: <b>123456</b>
              </Typography>
              <Typography variant="caption" sx={{ color: '#cbd5e1', mt: 2, display: 'block' }}>
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default LoginScreen;
