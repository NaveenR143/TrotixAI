import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Paper, Stepper, Step, StepLabel, Typography, Button, TextField,
  Stack, Grid, Divider, IconButton, Tooltip, Chip, Alert, Autocomplete, MenuItem,
  InputAdornment, CircularProgress
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BusinessIcon from "@mui/icons-material/Business";
import SchoolIcon from "@mui/icons-material/School";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LanguageIcon from "@mui/icons-material/Language";
import PublicIcon from "@mui/icons-material/Public";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CakeIcon from "@mui/icons-material/Cake";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { updateUserProfile, debitPoints, addUserDetails } from "../../redux/user/Action";
import { scrollToFirstError, toTitleCase } from "../../utils/formUtils";
import { fetchSkillsDropdown, fetchLanguagesDropdown, submitManualProfile } from "../../api/profileAPI";
import { sendRegistrationOTP, verifyOTP } from "../../api/jobpostingAPI";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { useOtp } from "../../hooks/useOtp";

const QUILL_MODULES = {
  toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link', 'clean'],
  ],
};

const QUILL_FORMATS = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list',
  'link'
];

const STEPS = ["Identity", "Experience & Education", "Summary & Skills"];
// const SKILLS_OPTIONS = [
//   "React", "Node.js", "JavaScript", "TypeScript", "Python", "Java", "C++", "AWS", "Docker",
//   "Kubernetes", "Git", "SQL", "NoSQL", "MongoDB", "PostgreSQL", "SEO", "Digital Marketing",
//   "Project Management", "Agile", "UI/UX Design", "Figma", "Redux", "GraphQL"
// ];

// const LANGUAGES_OPTIONS = [
//   "English (Native)", "English (Professional)", "Hindi", "Spanish", "French", "German",
//   "Mandarin", "Japanese", "Bengali", "Portuguese", "Russian", "Arabic"
// ];

//   "Mandarin", "Japanese", "Bengali", "Portuguese", "Russian", "Arabic"
// ];

const ManualProfileScreen = ({ onSave, onBack }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.UserReducer);
  const membership = user.membership || 'Free';
  const userPoints = user.points ?? 100;
  const userid = user.userid;

  const [activeStep, setActiveStep] = useState(() => {
    const saved = localStorage.getItem("manual_profile_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.activeStep !== undefined) {
          return parsed.activeStep;
        }
      } catch (e) {}
    }
    return 0;
  });
  const [skillsOptions, setSkillsOptions] = useState([]);
  const [languagesOptions, setLanguagesOptions] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [languagesLoading, setLanguagesLoading] = useState(false);

  useEffect(() => {
    // Initial fetch of popular/default skills and languages
    const loadInitialOptions = async () => {
      try {
        setSkillsLoading(true);
        const skillsRes = await fetchSkillsDropdown("");
        if (!skillsRes.error) {
          setSkillsOptions(skillsRes.data.map(s => toTitleCase(typeof s === 'string' ? s : s.name)));
        }
        setSkillsLoading(false);

        setLanguagesLoading(true);
        const languagesRes = await fetchLanguagesDropdown("");
        if (!languagesRes.error) {
          setLanguagesOptions(languagesRes.data.map(l => toTitleCase(typeof l === 'string' ? l : l.language)));
        }
        setLanguagesLoading(false);
      } catch (err) {
        console.error("Error loading initial dropdown data:", err);
        setSkillsLoading(false);
        setLanguagesLoading(false);
      }
    };

    loadInitialOptions();
  }, []);

  // Handle skills search
  const handleSkillsSearch = async (query) => {
    setSkillsLoading(true);
    try {
      const res = await fetchSkillsDropdown(query);
      if (!res.error) {
        setSkillsOptions(res.data.map(s => toTitleCase(typeof s === 'string' ? s : s.name)));
      }
    } catch (err) {
      console.error("Skills search error:", err);
    } finally {
      setSkillsLoading(false);
    }
  };

  // Handle languages search
  const handleLanguagesSearch = async (query) => {
    setLanguagesLoading(true);
    try {
      const res = await fetchLanguagesDropdown(query);
      if (!res.error) {
        setLanguagesOptions(res.data.map(l => toTitleCase(typeof l === 'string' ? l : l.language)));
      }
    } catch (err) {
      console.error("Languages search error:", err);
    } finally {
      setLanguagesLoading(false);
    }
  };

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem("manual_profile_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.formData) {
          return parsed.formData;
        }
      } catch (e) {
        console.error("Error loading manual profile draft", e);
      }
    }
    
    // Fallback: Populate details from user (Redux) if logged in
    let firstName = "";
    let lastName = "";
    if (user?.fullname) {
      const parts = user.fullname.trim().split(/\s+/);
      firstName = parts[0] || "";
      lastName = parts.slice(1).join(" ") || "";
    }
    return {
      firstName,
      lastName,
      email: user?.email || "",
      phone: user?.mobile || "",
      preferredLocation: "",
      about: "",
      website: "",
      experience: [],
      education: [],
      achievements: [],
      skills: [],
      languages: [],
      dob: "",
      maritalStatus: "",
      gender: "",
      currentLocation: ""
    };
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // OTP Verification State
  const otpVerification = useOtp("registration");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(() => {
    const saved = localStorage.getItem("manual_profile_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.isPhoneVerified !== undefined) {
          return parsed.isPhoneVerified;
        }
      } catch (e) {}
    }
    return user?.mobile ? true : false;
  });
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Save progress to localStorage on any changes
  useEffect(() => {
    localStorage.setItem("manual_profile_data", JSON.stringify({
      formData,
      activeStep,
      isPhoneVerified
    }));
  }, [formData, activeStep, isPhoneVerified]);

  useEffect(() => {
    if (otpSent && !isPhoneVerified && otp.length === 4) {
      handleVerifyOtp(null, otp);
    }
  }, [otp, otpSent, isPhoneVerified]);

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 0) {
      if (!formData.firstName.trim()) newErrors.firstName = "First Name is required";
      if (!formData.lastName.trim()) newErrors.lastName = "Last Name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      if (!formData.phone.trim()) {
        newErrors.phone = "Mobile Number is required";
      } else if (formData.phone.replace(/\D/g, '').length !== 10) {
        newErrors.phone = "Enter valid 10-digit number";
      } else if (!isPhoneVerified) {
        newErrors.phone = "Please verify your mobile number";
      }
      if (!formData.preferredLocation.trim()) newErrors.preferredLocation = "Preferred Location is required";
    } else if (step === 1) {
      if (formData.experience.length > 0) {
        let expError = "";
        for (let i = 0; i < formData.experience.length; i++) {
          const exp = formData.experience[i];
          if (!exp.company_name.trim() || !exp.role.trim()) {
            expError = "Company and Role are required for all experience entries";
            break;
          }
          if (!exp.startDate) {
            expError = "Start Date is required for all experience entries";
            break;
          }
          if (!exp.isCurrent && !exp.endDate) {
            expError = "End Date is required for non-current experience entries";
            break;
          }
          if (exp.startDate && !exp.isCurrent && exp.endDate) {
            const start = new Date(exp.startDate);
            const end = new Date(exp.endDate);
            if (start > end) {
              expError = "Start Date must be before End Date";
              break;
            }
          }
        }
        if (expError) newErrors.experience = expError;
      }

      if (formData.education.length === 0) {
        newErrors.education = "At least one education entry is required";
      } else {
        const hasEmptyEdu = formData.education.some(edu => !edu.school.trim() || !edu.degree.trim());
        if (hasEmptyEdu) newErrors.education = "School and Degree are required for all entries";
      }
    } else if (step === 2) {
      if (formData.skills.length === 0) newErrors.skills = "At least one skill is required";
      if (formData.languages.length === 0) newErrors.languages = "At least one language is required";
      if (!formData.dob) newErrors.dob = "Date of Birth is required";
      if (!formData.about.trim()) newErrors.about = "Summary is required";
    }
    setErrors(newErrors);
    return newErrors;
  };

  const handleNext = () => {
    const stepErrors = validateStep(activeStep);
    if (Object.keys(stepErrors).length === 0) {
      setActiveStep((prev) => prev + 1);
    } else {
      const fieldOrder = activeStep === 0
        ? ['firstName', 'lastName', 'email', 'phone', 'preferredLocation']
        : activeStep === 1 ? ['experience', 'education'] : ['skills', 'languages', 'dob', 'about'];
      scrollToFirstError(stepErrors, fieldOrder);
    }
  };
  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Reset verification if phone changes
    if (name === "phone") {
      setIsPhoneVerified(false);
      setOtpSent(false);
      setOtp("");
      setVerificationError("");
    }
  };

  const handleSendOtp = async (isResend = false) => {
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrors(prev => ({ ...prev, phone: "Enter valid 10-digit number" }));
      return;
    }

    setVerificationLoading(true);
    setVerificationError("");

    const name = formData.firstName + " " + formData.lastName;

    try {
      const resp = await otpVerification.sendOtp({
        name,
        phone: cleanPhone,
        isResend,
        role: "Candidate"
      });
      if (!resp.error) {
        setOtpSent(true);
      } else {
        setVerificationError(resp.message || otpVerification.error);
      }
    } catch (err) {
      setVerificationError("Failed to send OTP. Please try again.");
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleVerifyOtp = async (e, otpOverride) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const otpToVerify = otpOverride || otp;
    if (otpToVerify.length !== 4) {
      setVerificationError("Enter 4-digit OTP");
      return;
    }

    setVerificationLoading(true);
    setVerificationError("");
    try {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      const resp = await verifyOTP(cleanPhone, otpToVerify);
      if (!resp.error) {
        setIsPhoneVerified(true);
        setOtpSent(false);
        setOtp("");

        // Save user_id and user_type to Redux
        dispatch(addUserDetails({
          userid: resp.data.user_id,
          role: resp.data.user_type,
          userType: resp.data.user_type,
          mobile: cleanPhone,
          fullname: formData.firstName + " " + formData.lastName,
          email: formData.email
        }));

        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.phone;
          return newErrors;
        });
      } else {
        setVerificationError(resp.message);
      }
    } catch (err) {
      setVerificationError("Verification failed. Please try again.");
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleAiAssist = async (field) => {
    if (membership === 'Free') {
      alert("AI Improve requires Credits. Please purchase credits.");
      navigate('/membership');
      return;
    }
    setAiLoading(true);
    // Simulate AI Generation
    setTimeout(() => {
      const generatedText = field === "about"
        ? "Experienced professional with a strong background in software development and a passion for building user-centric applications. Proven track record of delivering high-quality solutions in fast-paced environments."
        : "Led cross-functional teams to deliver scalable enterprise solutions while improving system performance by 30%.";

      setFormData((prev) => ({ ...prev, [field]: generatedText }));
      dispatch(debitPoints(10));
      setAiLoading(false);
    }, 1500);
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { company_name: "", role: "", startDate: "", endDate: "", isCurrent: false, description: "" }]
    }));
  };

  const removeExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const updateExperience = (index, field, value) => {
    const newExp = [...formData.experience];
    newExp[index][field] = value;
    setFormData(prev => ({ ...prev, experience: newExp }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { school: "", degree: "", year: "" }]
    }));
  };

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const updateEducation = (index, field, value) => {
    const newEdu = [...formData.education];
    newEdu[index][field] = value;
    setFormData(prev => ({ ...prev, education: newEdu }));
  };

  const addAchievement = () => {
    setFormData(prev => ({
      ...prev,
      achievements: [...prev.achievements, { achievement: "" }]
    }));
  };

  const removeAchievement = (index) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  const updateAchievement = (index, value) => {
    const newAch = [...formData.achievements];
    newAch[index].achievement = value;
    setFormData(prev => ({ ...prev, achievements: newAch }));
  };

  const handleFinalSave = async () => {
    const stepErrors = validateStep(activeStep);
    if (Object.keys(stepErrors).length > 0) {
      const fieldOrder = ['skills', 'languages', 'dob', 'about'];
      scrollToFirstError(stepErrors, fieldOrder);
      return;
    }

    if (!userid) {
      setVerificationError("User session not found. Please verify your mobile number.");
      setActiveStep(0);
      return;
    }

    setIsSubmitting(true);

    // Map frontend fields to backend models
    const submissionData = {
      user_id: userid,
      full_name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone.replace(/\D/g, ''),
      current_location: formData.currentLocation || formData.preferredLocation,
      preferred_locations: [formData.preferredLocation],
      date_of_birth: formData.dob || null,
      marital_status: formData.maritalStatus || null,
      gender: formData.gender || null,
      about: formData.about,
      website: formData.website,
      skills: formData.skills,
      languages: formData.languages,
      experience: formData.experience.map(exp => ({
        title: exp.role || "Role",
        company_name: exp.company_name,
        description: exp.description,
        start_date: exp.startDate || null,
        end_date: exp.isCurrent ? null : (exp.endDate || null),
        is_current: exp.isCurrent || false
      })),
      achievements: formData.achievements.filter(a => a.achievement.trim()).map(a => ({
        achievement: a.achievement
      })),
      education: formData.education.map(edu => ({
        institution: edu.school,
        degree: edu.degree,
        end_year: parseInt(edu.year) || null
      }))
    };

    try {
      const resp = await submitManualProfile(submissionData);
      if (!resp.error) {
        dispatch(updateUserProfile(submissionData));
        localStorage.removeItem("manual_profile_data");
        if (onSave) onSave(); // Redirection to dashboard
      } else {
        setVerificationError(resp.message);
        // If it's an auth error, maybe go back to step 0
        if (resp.status === 403 || resp.status === 401) {
          setActiveStep(0);
        }
      }
    } catch (err) {
      setVerificationError("An error occurred while saving your profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <TextField id="firstName" fullWidth label="First Name *" name="firstName" value={formData.firstName} onChange={handleInputChange} error={!!errors.firstName} helperText={errors.firstName} size="small" InputProps={{ startAdornment: <PersonIcon sx={{ mr: 1, fontSize: 18, color: '#64748b' }} /> }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField id="lastName" fullWidth label="Last Name *" name="lastName" value={formData.lastName} onChange={handleInputChange} error={!!errors.lastName} helperText={errors.lastName} size="small" InputProps={{ startAdornment: <PersonIcon sx={{ mr: 1, fontSize: 18, color: '#64748b' }} /> }} />
              </Grid>
            </Grid>
            <TextField id="email" fullWidth label="Email Address *" name="email" value={formData.email} onChange={handleInputChange} error={!!errors.email} helperText={errors.email} size="small" InputProps={{ startAdornment: <EmailIcon sx={{ mr: 1, fontSize: 18, color: '#64748b' }} /> }} />
            <Grid container spacing={1} alignItems="flex-start">
              <Grid item sx={{ width: '90px' }}>
                <TextField fullWidth label="Code" value="+91" disabled size="small" InputProps={{ startAdornment: <WhatsAppIcon sx={{ mr: 0.5, fontSize: 18, color: '#25D366' }} /> }} />
              </Grid>
              <Grid item sx={{ width: '220px' }}>
                <TextField
                  id="phone"
                  fullWidth
                  label="Mobile Number *"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  size="small"
                  placeholder="10-digit number"
                  disabled={isPhoneVerified}
                  InputProps={{
                    endAdornment: isPhoneVerified && (
                      <InputAdornment position="end">
                        <CheckCircleIcon sx={{ color: '#10b981' }} />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              {!isPhoneVerified && !otpSent && (
                <Grid item sx={{ width: { xs: '100%', sm: 'auto' } }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleSendOtp}
                    disabled={verificationLoading || formData.phone.replace(/\D/g, '').length !== 10}
                    sx={{
                      height: 40, width: { xs: '100%', sm: 'auto' }, whiteSpace: 'nowrap', textTransform: 'none', borderRadius: 1.5,
                      "&.Mui-disabled": {
                        background: "#E2E8F0",
                        color: "#475569"
                      }
                    }}
                  >
                    {verificationLoading ? <CircularProgress size={20} /> : "Send OTP"}
                  </Button>
                </Grid>
              )}

              {otpSent && !isPhoneVerified && (
                <Grid item xs={12}>
                  <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: 'center' }}>
                    <TextField
                      placeholder="4-digit OTP"
                      size="small"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      inputProps={{
                        autoComplete: 'one-time-code',
                        inputMode: 'numeric',
                        pattern: '[0-9]*',
                      }}
                      sx={{ width: 150 }}
                      autoFocus
                    />
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleVerifyOtp}
                      disabled={verificationLoading || otp.length !== 4}
                      sx={{
                        background: 'black', color: 'white', textTransform: 'none', px: 3, height: 40,
                        "&.Mui-disabled": {
                          background: "#E2E8F0",
                          color: "#475569"
                        }
                      }}
                    >
                      {verificationLoading ? <CircularProgress size={20} color="inherit" /> : "Verify"}
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleSendOtp(true)}
                      disabled={verificationLoading || otpVerification.isCooldownActive || !otpVerification.isEligible || otpVerification.loading}
                      sx={{
                        height: 40, textTransform: 'none', px: 2,
                        "&.Mui-disabled": {
                          color: "#94A3B8"
                        }
                      }}
                    >
                      {otpVerification.loading
                        ? "Resending..."
                        : otpVerification.isCooldownActive
                          ? `Resend in ${otpVerification.remainingSeconds}s`
                          : otpVerification.resendAttempts >= 3
                            ? "Limit Reached"
                            : "Resend OTP"}
                    </Button>
                  </Stack>
                  {otpVerification.resendAttempts >= 3 && (
                    <Typography color="warning.main" variant="caption" sx={{ mt: 1, display: 'block', fontWeight: 600 }}>
                      ⚠️ Daily resend limit of 3 attempts reached. Please request a new OTP tomorrow.
                    </Typography>
                  )}
                  {verificationError && (
                    <Typography color="error" variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                      {verificationError}
                    </Typography>
                  )}
                </Grid>
              )}
              {isPhoneVerified && (
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CheckCircleIcon sx={{ fontSize: 14 }} /> Mobile number verified successfully
                  </Typography>
                </Grid>
              )}
            </Grid>
            <TextField fullWidth label="Website / Portfolio" name="website" value={formData.website} onChange={handleInputChange} size="small" placeholder="https://..." InputProps={{ startAdornment: <PublicIcon sx={{ mr: 1, fontSize: 18, color: '#64748b' }} /> }} />
            <TextField id="preferredLocation" fullWidth label="Job Preferred Location *" name="preferredLocation" value={formData.preferredLocation} onChange={handleInputChange} error={!!errors.preferredLocation} helperText={errors.preferredLocation} size="small" InputProps={{ startAdornment: <LocationOnIcon sx={{ mr: 1, fontSize: 18, color: '#64748b' }} /> }} />
          </Stack>
        );
      case 1:
        return (
          <Stack spacing={4}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 1 }}><BusinessIcon color="primary" /> WORK EXPERIENCE</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={addExperience} sx={{ textTransform: 'none' }}>Add Entry</Button>
              </Box>
              <Box id="experience">
                {errors.experience && <Alert severity="error" sx={{ mb: 2 }}>{errors.experience}</Alert>}
              </Box>
              {formData.experience.length === 0 && <Typography sx={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>No experience entries added yet.</Typography>}
              {formData.experience.map((exp, idx) => (
                <Paper key={idx} variant="outlined" sx={{ p: 2, mb: 2, position: 'relative', bgcolor: '#f8fafc', borderStyle: 'dashed' }}>
                  <IconButton size="small" onClick={() => removeExperience(idx)} sx={{ position: 'absolute', top: 8, right: 8, color: '#f43f5e' }}><DeleteIcon fontSize="inherit" /></IconButton>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}><TextField fullWidth label="Company *" value={exp.company_name} onChange={(e) => updateExperience(idx, 'company_name', e.target.value)} size="small" /></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth label="Role *" value={exp.role} onChange={(e) => updateExperience(idx, 'role', e.target.value)} size="small" /></Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Start Date *"
                        value={exp.startDate || ""}
                        onChange={(e) => updateExperience(idx, 'startDate', e.target.value)}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="date"
                        label="End Date *"
                        value={exp.isCurrent ? "" : (exp.endDate || "")}
                        onChange={(e) => updateExperience(idx, 'endDate', e.target.value)}
                        disabled={exp.isCurrent}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <input
                          type="checkbox"
                          checked={exp.isCurrent || false}
                          onChange={(e) => {
                            updateExperience(idx, 'isCurrent', e.target.checked);
                            if (e.target.checked) {
                              updateExperience(idx, 'endDate', '');
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                        <Typography sx={{ fontSize: '0.9rem', color: '#475569' }}>Currently Working Here</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography sx={{ fontSize: "0.85rem", color: "text.secondary", mb: 1 }}>Description</Typography>
                      <Box sx={{
                        "& .ql-container": {
                          borderRadius: "0 0 8px 8px",
                          minHeight: "120px",
                          fontSize: "0.9rem",
                          border: "1px solid #e2e8f0",
                          bgcolor: "white"
                        },
                        "& .ql-toolbar": {
                          borderRadius: "8px 8px 0 0",
                          border: "1px solid #e2e8f0",
                          borderBottom: "none",
                          bgcolor: "#f8fafc"
                        },
                        "& .ql-editor": {
                          minHeight: "120px",
                          fontFamily: "inherit",
                          color: "#0f172a",
                          wordBreak: "break-word"
                        }
                      }}>
                        <ReactQuill
                          theme="snow"
                          value={exp.description || ""}
                          onChange={(content) => updateExperience(idx, "description", content)}
                          modules={QUILL_MODULES}
                          formats={QUILL_FORMATS}
                          placeholder="Describe your role, responsibilities, and achievements..."
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Box>
            <Divider />
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 1 }}><SchoolIcon color="primary" /> EDUCATION</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={addEducation} sx={{ textTransform: 'none' }}>Add Entry</Button>
              </Box>
              <Box id="education">
                {errors.education && <Alert severity="error" sx={{ mb: 2 }}>{errors.education}</Alert>}
              </Box>
              {formData.education.map((edu, idx) => (
                <Paper key={idx} variant="outlined" sx={{ p: 2, mb: 2, position: 'relative', bgcolor: '#f8fafc', borderStyle: 'dashed' }}>
                  <IconButton size="small" onClick={() => removeEducation(idx)} sx={{ position: 'absolute', top: 8, right: 8, color: '#f43f5e' }}><DeleteIcon fontSize="inherit" /></IconButton>
                  <Grid container spacing={2}>
                    <Grid item xs={12}><TextField fullWidth label="Institution *" value={edu.school} onChange={(e) => updateEducation(idx, 'school', e.target.value)} size="small" /></Grid>
                    <Grid item xs={7}><TextField fullWidth label="Degree *" value={edu.degree} onChange={(e) => updateEducation(idx, 'degree', e.target.value)} size="small" /></Grid>
                    <Grid item xs={5}><TextField fullWidth label="Year" value={edu.year} onChange={(e) => updateEducation(idx, 'year', e.target.value)} size="small" /></Grid>
                  </Grid>
                </Paper>
              ))}
            </Box>
            <Divider />
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 1 }}><EmojiEventsIcon color="warning" /> ACHIEVEMENTS</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={addAchievement} sx={{ textTransform: 'none' }}>Add Entry</Button>
              </Box>
              {formData.achievements.length === 0 && <Typography sx={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>No achievements added yet.</Typography>}
              {formData.achievements.map((ach, idx) => (
                <Paper key={idx} variant="outlined" sx={{ p: 2, mb: 2, position: 'relative', bgcolor: '#f8fafc', borderStyle: 'dashed' }}>
                  <IconButton size="small" onClick={() => removeAchievement(idx)} sx={{ position: 'absolute', top: 8, right: 8, color: '#f43f5e' }}><DeleteIcon fontSize="inherit" /></IconButton>
                  <TextField fullWidth multiline rows={2} label="Achievement" value={ach.achievement} onChange={(e) => updateAchievement(idx, e.target.value)} size="small" placeholder="E.g. Won Best Employee Award 2023" />
                </Paper>
              ))}
            </Box>
          </Stack>
        );
      case 2:
        return (
          <Stack spacing={3}>
            <Box>
              <Box id="skills">
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 18, color: '#6366f1' }} /> SKILLS *
                </Typography>
                <Autocomplete
                  multiple
                  freeSolo
                  options={skillsOptions}
                  loading={skillsLoading}
                  onInputChange={(event, newInputValue) => {
                    handleSkillsSearch(newInputValue);
                  }}
                  filterSelectedOptions
                  value={formData.skills}
                  onChange={(event, newValue) => {
                    const titleCasedValues = newValue.map(v => toTitleCase(v));
                    setFormData(prev => ({ ...prev, skills: titleCasedValues }));
                  }}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip variant="filled" label={toTitleCase(option)} {...getTagProps({ index })} sx={{ borderRadius: 1.5, bgcolor: '#eef2ff', color: '#4f46e5', fontWeight: 600, '& .MuiChip-deleteIcon': { color: '#6366f1' } }} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Type to search skills..." error={!!errors.skills} helperText={errors.skills || "Type and press Enter to add a new skill"}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <React.Fragment>
                            {skillsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </React.Fragment>
                        ),
                      }}
                    />
                  )}
                />
              </Box>
            </Box>
            <Box id="languages">
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LanguageIcon sx={{ fontSize: 18, color: '#0ea5e9' }} /> LANGUAGES *
              </Typography>
              <Autocomplete
                multiple
                freeSolo
                options={languagesOptions}
                loading={languagesLoading}
                onInputChange={(event, newInputValue) => {
                  handleLanguagesSearch(newInputValue);
                }}
                filterSelectedOptions
                value={formData.languages}
                onChange={(event, newValue) => {
                  const titleCasedValues = newValue.map(v => toTitleCase(v));
                  setFormData(prev => ({ ...prev, languages: titleCasedValues }));
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="filled" label={toTitleCase(option)} {...getTagProps({ index })} sx={{ borderRadius: 1.5, bgcolor: '#f0f9ff', color: '#0369a1', fontWeight: 600, '& .MuiChip-deleteIcon': { color: '#0ea5e9' } }} />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} placeholder="Type or select languages..." error={!!errors.languages} helperText={errors.languages}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <React.Fragment>
                          {languagesLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </React.Fragment>
                      ),
                    }}
                  />
                )}
              />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>About / Professional Summary *</Typography>
                {/* <Tooltip title={membership === 'Free' ? "Purchase Credits for AI Improve" : "AI Magic Improve (Credit Benefit)"}>
                  <Button size="small" startIcon={<AutoAwesomeIcon />} onClick={() => handleAiAssist('about')} disabled={aiLoading}
                    sx={{ textTransform: 'none', color: '#6366f1', fontSize: '0.75rem', '&:hover': { bgcolor: '#f5f3ff' } }}>
                    AI Improve
                  </Button>
                </Tooltip> */}
              </Box>
              <TextField id="about" fullWidth multiline rows={4} name="about" value={formData.about} onChange={handleInputChange} placeholder="Tell us about yourself..." error={!!errors.about} helperText={errors.about} />
            </Box>

            <Divider sx={{ my: 1 }} />

            <Box>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon sx={{ fontSize: 18, color: '#64748b' }} /> PERSONAL DETAILS
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <TextField id="dob" fullWidth label="Date of Birth *" name="dob" type="date" value={formData.dob} onChange={handleInputChange} error={!!errors.dob} helperText={errors.dob} size="small" InputLabelProps={{ shrink: true }} InputProps={{ startAdornment: <CakeIcon sx={{ mr: 1, fontSize: 18, color: '#64748b' }} /> }} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth select label="Gender" name="gender" value={formData.gender} onChange={handleInputChange} size="small" InputProps={{ startAdornment: <PersonIcon sx={{ mr: 1, fontSize: 18, color: '#64748b' }} /> }}>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                    <MenuItem value="prefer not to say">Prefer not to say</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth select label="Marital Status" name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange} size="small" InputProps={{ startAdornment: <FamilyRestroomIcon sx={{ mr: 1, fontSize: 18, color: '#64748b' }} /> }}>
                    <MenuItem value="Single">Single</MenuItem>
                    <MenuItem value="Married">Married</MenuItem>
                    <MenuItem value="Divorced">Divorced</MenuItem>
                    <MenuItem value="Widowed">Widowed</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth label="Current Location" name="currentLocation" value={formData.currentLocation} onChange={handleInputChange} size="small" InputProps={{ startAdornment: <LocationOnIcon sx={{ mr: 1, fontSize: 18, color: '#64748b' }} /> }} />
                </Grid>
              </Grid>
            </Box>

            <Alert severity="info" icon={<CheckCircleIcon fontSize="inherit" />} sx={{ mt: 2, bgcolor: '#f0f9ff', color: '#0369a1', '& .MuiAlert-icon': { color: '#0ea5e9' } }}>
              Almost done! Saving will update your profile and redirect you to the job feed tailored for you.
            </Alert>
          </Stack>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: '#f8fafc', py: { xs: 4, md: 8 } }}>
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ color: '#64748b', textTransform: 'none' }}>Back</Button>
          <Box sx={{ flexGrow: 1 }} />
          <Chip
            label={membership === 'Free' ? 'Free Tier' : 'Available Credits'}
            color="primary"
            variant="outlined"
            onClick={() => navigate('/membership')}
            sx={{ fontWeight: 700, border: '1px solid #c4b5fd', color: '#4f46e5', cursor: 'pointer', '&:hover': { bgcolor: '#f5f3ff' } }}
          />
        </Box>

        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', borderRadius: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#0f172a' }}>Build your profile</Typography>
          <Typography sx={{ color: '#64748b', mb: 4, fontSize: '0.95rem' }}>Manually fill in your details to start finding the best job matches.</Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 6, '& .MuiStepIcon-root.Mui-active': { color: '#6366f1' }, '& .MuiStepIcon-root.Mui-completed': { color: '#10b981' } }}>
            {STEPS.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
          </Stepper>

          <Box sx={{ minHeight: 400 }}>
            {renderStepContent(activeStep)}
          </Box>

          {verificationError && activeStep > 0 && (
            <Alert severity="error" sx={{ mt: 4, mb: 1, borderRadius: 2 }}>
              {verificationError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6 }}>
            <Button disabled={activeStep === 0} onClick={handleBack} sx={{ color: '#64748b' }}>Previous</Button>
            {activeStep === STEPS.length - 1 ? (
              <Button variant="contained" endIcon={!isSubmitting && <CheckCircleIcon />} onClick={handleFinalSave} disabled={isSubmitting}
                sx={{
                  px: 4, py: 1.2, background: 'linear-gradient(135deg, #0f172a, #334155)', borderRadius: 2,
                  "&.Mui-disabled": {
                    background: "#E2E8F0",
                    color: "#475569"
                  }
                }}>
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Save & View Matches"}
              </Button>
            ) : (
              <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={handleNext}
                sx={{ px: 4, py: 1.2, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', borderRadius: 2 }}>
                Next Step
              </Button>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ManualProfileScreen;
