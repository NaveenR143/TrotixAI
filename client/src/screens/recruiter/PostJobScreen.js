import React, { useState, useEffect } from "react";
import {
  Box, Typography, Button, TextField, Paper, Container, Stack,
  Autocomplete, Chip, FormControl, InputLabel, Select, MenuItem,
  FormHelperText, InputAdornment, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Snackbar, Alert, Fade, IconButton
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonIcon from "@mui/icons-material/Person";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import EmailIcon from "@mui/icons-material/Email";
import DescriptionIcon from "@mui/icons-material/Description";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { UPDATE_USER_PROFILE } from "../../redux/constants";
import { fadeSlideUp } from "../../utils/themeUtils";

const predefinedSkills = ["React", "Node.js", "Python", "Java", "Docker", "AWS", "UI/UX", "JavaScript", "TypeScript", "SQL"];

const PostJobScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mobile: savedMobile } = useSelector(state => state.UserReducer || {});

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: '',
    salary: '',
    description: '',
    skills: [],
    email: '',
    mobile: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Draft persistence
  useEffect(() => {
    const draft = localStorage.getItem('postJobDraft');
    if (draft) {
      try {
        setFormData(JSON.parse(draft));
      } catch (e) {
        console.error("Error loading draft", e);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('postJobDraft', JSON.stringify(formData));
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData]);

  // Login Modal State
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginStep, setLoginStep] = useState(1);
  const [loginForm, setLoginForm] = useState({ name: '', mobile: '', otp: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Validation
  const validate = () => {
    let temp = {};
    if (!formData.title.trim()) temp.title = "Job Title is required";
    if (!formData.company.trim()) temp.company = "Company Name is required";
    if (!formData.location.trim()) temp.location = "Location is required";
    if (!formData.type) temp.type = "Job Type is required";
    if (!formData.description.trim()) temp.description = "Job Description is required";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      temp.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      temp.email = "Invalid email format";
    }

    if (!formData.mobile.trim()) {
      temp.mobile = "Mobile Number is required";
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      temp.mobile = "Must be 10 digits";
    }

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (event, newValue) => {
    setFormData(prev => ({ ...prev, skills: newValue }));
  };

  const performJobSubmit = () => {
    setIsSubmitting(true);
    // Mock API Call
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMsg("Job posted successfully!");
      localStorage.removeItem('postJobDraft');
      setTimeout(() => navigate('/posted-jobs'), 1500);
    }, 1200);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    if (!savedMobile) {
      setLoginModalOpen(true);
    } else {
      performJobSubmit();
    }
  };

  // Login Modal Handlers
  const handleLoginNext = () => {
    if (!loginForm.name.trim()) {
      setLoginError("Name is required");
      return;
    }
    if (!/^\d{10}$/.test(loginForm.mobile)) {
      setLoginError("Valid 10-digit mobile number is required");
      return;
    }
    setLoginError("");
    setLoginLoading(true);
    setTimeout(() => {
      setLoginLoading(false);
      setLoginStep(2);
    }, 800);
  };

  const handleLoginVerify = () => {
    if (loginForm.otp !== "123456") {
      setLoginError("Invalid OTP. Use 123456");
      return;
    }
    setLoginError("");
    setLoginLoading(true);
    
    setTimeout(() => {
      dispatch({ 
        type: UPDATE_USER_PROFILE, 
        payload: { mobile: loginForm.mobile, displayname: loginForm.name } 
      });
      setLoginLoading(false);
      setLoginModalOpen(false);
      // Automatically post job after authentication
      performJobSubmit();
    }, 800);
  };

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: 'calc(100vh - 64px)', py: { xs: 3, md: 5 } }}>
      <Container maxWidth="md">
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)} 
          sx={{ mb: 2, color: '#64748b', fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: 'transparent', color: '#0f172a' } }}
        >
          Back
        </Button>

        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 3, md: 6 }, 
            borderRadius: 4, 
            border: '1px solid #e2e8f0', 
            boxShadow: '0 10px 40px rgba(15,23,42,0.06)',
            position: 'relative',
            overflow: 'hidden',
            animation: `${fadeSlideUp} 0.5s both`
          }}
        >
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', mb: 1 }}>
              Post a Free Job
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#64748b' }}>
              Find your ideal candidate 10× faster.
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField 
                  fullWidth label="Job Title *" name="title" value={formData.title} onChange={handleChange}
                  error={!!errors.title} helperText={errors.title}
                  InputProps={{ startAdornment: <InputAdornment position="start"><WorkOutlineIcon sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment> }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField 
                  fullWidth label="Company Name *" name="company" value={formData.company} onChange={handleChange}
                  error={!!errors.company} helperText={errors.company}
                  InputProps={{ startAdornment: <InputAdornment position="start"><BusinessIcon sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment> }}
                />
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField 
                  fullWidth label="Location *" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. San Francisco or Remote"
                  error={!!errors.location} helperText={errors.location}
                  InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnIcon sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment> }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth error={!!errors.type}>
                  <InputLabel>Job Type *</InputLabel>
                  <Select name="type" value={formData.type} onChange={handleChange} label="Job Type *">
                    <MenuItem value="Full-time">Full-time</MenuItem>
                    <MenuItem value="Part-time">Part-time</MenuItem>
                    <MenuItem value="Contract">Contract</MenuItem>
                    <MenuItem value="Freelance">Freelance</MenuItem>
                    <MenuItem value="Internship">Internship</MenuItem>
                  </Select>
                  {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField 
                  fullWidth label="Salary Range (Optional)" name="salary" value={formData.salary} onChange={handleChange} placeholder="e.g. $80k - $120k"
                  InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoneyIcon sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment> }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Autocomplete
                  multiple freeSolo options={predefinedSkills} value={formData.skills} onChange={handleSkillsChange}
                  renderTags={(value, getTagProps) => value.map((option, index) => (
                    <Chip variant="outlined" label={option} size="small" sx={{ borderColor: '#c7d2fe', color: '#4f46e5', bgcolor: '#e0e7ff' }} {...getTagProps({ index })} />
                  ))}
                  renderInput={(params) => <TextField {...params} variant="outlined" label="Required Skills (Optional)" placeholder="Add skills" />}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField 
                  fullWidth multiline rows={4} label="Job Description *" name="description" value={formData.description} onChange={handleChange}
                  error={!!errors.description} helperText={errors.description}
                  InputProps={{ startAdornment: <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}><DescriptionIcon sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment> }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField 
                  fullWidth label="Contact Email *" name="email" value={formData.email} onChange={handleChange}
                  error={!!errors.email} helperText={errors.email}
                  InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment> }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField 
                  fullWidth label="Contact Mobile *" name="mobile" value={formData.mobile} 
                  onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  error={!!errors.mobile} helperText={errors.mobile}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem', mr: 0.5 }}>+91</Typography></InputAdornment> }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button 
                    type="submit" variant="contained" size="large"
                    disabled={isSubmitting}
                    sx={{
                      px: 5, py: 1.5, fontSize: '1rem', fontWeight: 700, borderRadius: 2.5, textTransform: 'none',
                      background: '#0f172a', color: 'white',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                      '&:hover': { background: '#333333', transform: 'translateY(-1px)' },
                      '&.Mui-disabled': { background: 'rgba(15, 23, 42, 0.6)', color: 'rgba(255, 255, 255, 0.5)' }
                    }}
                  >
                    {isSubmitting ? "Posting Job..." : "Submit Job"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>

      {/* Login Modal */}
      <Dialog open={loginModalOpen} onClose={() => { if(!loginLoading) setLoginModalOpen(false); }} PaperProps={{ sx: { borderRadius: 4, width: '100%', maxWidth: 400, p: 2 } }}>
        <DialogTitle sx={{ textAlign: 'center', pb: 1, fontWeight: 800 }}>
          {loginStep === 1 ? "Sign In to Continue" : "Verify OTP"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ textAlign: 'center', mb: 3, pt: 1 }}>
            {loginStep === 1 ? "Please verify your mobile number to post this job." : `Enter the OTP sent to +91 ${loginForm.mobile}`}
          </DialogContentText>
          
          {loginError && <Alert severity="error" sx={{ mb: 2 }}>{loginError}</Alert>}

          {loginStep === 1 ? (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField 
                fullWidth label="Your Name *" placeholder="John Doe" 
                value={loginForm.name} onChange={(e) => setLoginForm(prev => ({ ...prev, name: e.target.value }))}
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#94a3b8' }} /></InputAdornment> }}
              />
              <TextField 
                fullWidth label="Mobile Number *" placeholder="Enter 10 digit number" 
                value={loginForm.mobile} onChange={(e) => setLoginForm(prev => ({ ...prev, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ color: '#94a3b8', fontWeight: 600 }}>+91</Typography></InputAdornment> }}
              />
              <Button 
                variant="contained" size="large" onClick={handleLoginNext} disabled={loginLoading}
                sx={{ py: 1.5, background: '#0f172a', '&:hover': { background: '#333333' }, borderRadius: 2, fontWeight: 700 }}
              >
                {loginLoading ? "Sending..." : "Get OTP"}
              </Button>
            </Stack>
          ) : (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField 
                fullWidth label="OTP" placeholder="Enter 6-digit OTP" autoFocus
                value={loginForm.otp} onChange={(e) => setLoginForm(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                InputProps={{ startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: '#94a3b8' }} /></InputAdornment> }}
              />
              <Typography variant="caption" sx={{ color: '#94a3b8', textAlign: 'center', mt: -2 }}>
                For testing purposes use OTP: <b>123456</b>
              </Typography>
              <Button 
                variant="contained" size="large" onClick={handleLoginVerify} disabled={loginLoading}
                sx={{ py: 1.5, background: '#0f172a', '&:hover': { background: '#333333' }, borderRadius: 2, fontWeight: 700 }}
              >
                {loginLoading ? "Verifying..." : "Verify & Submit Job"}
              </Button>
              <Button variant="text" size="small" onClick={() => { setLoginStep(1); setLoginError(""); }} disabled={loginLoading} sx={{ mt: -1, color: '#64748b' }}>
                Change Mobile Number
              </Button>
            </Stack>
          )}
        </DialogContent>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar open={!!successMsg} autoHideDuration={3000} onClose={() => setSuccessMsg('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" sx={{ width: '100%', borderRadius: 2, fontWeight: 600 }}>
          {successMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PostJobScreen;
