import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Paper, Stepper, Step, StepLabel, Typography, Button, TextField,
  Stack, Grid, Divider, IconButton, Tooltip, Chip, Alert, Autocomplete, MenuItem
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
import { updateUserProfile, debitPoints } from "../../redux/user/Action";

const STEPS = ["Identity", "Experience & Education", "Summary & Skills"];
const SKILLS_OPTIONS = [
  "React", "Node.js", "JavaScript", "TypeScript", "Python", "Java", "C++", "AWS", "Docker",
  "Kubernetes", "Git", "SQL", "NoSQL", "MongoDB", "PostgreSQL", "SEO", "Digital Marketing",
  "Project Management", "Agile", "UI/UX Design", "Figma", "Redux", "GraphQL"
];

const LANGUAGES_OPTIONS = [
  "English (Native)", "English (Professional)", "Hindi", "Spanish", "French", "German",
  "Mandarin", "Japanese", "Bengali", "Portuguese", "Russian", "Arabic"
];

const ManualProfileScreen = ({ onSave, onBack }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userPoints = useSelector((state) => state.UserReducer.points ?? 100);

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    preferredLocation: "",
    about: "",
    website: "",
    experience: [],
    education: [],
    skills: [],
    languages: [],
    dob: "",
    maritalStatus: "",
    currentLocation: ""
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 0) {
      if (!formData.firstName.trim()) newErrors.firstName = "First Name is required";
      if (!formData.lastName.trim()) newErrors.lastName = "Last Name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      if (!formData.phone.trim()) newErrors.phone = "Mobile Number is required";
      if (!formData.preferredLocation.trim()) newErrors.preferredLocation = "Preferred Location is required";
    } else if (step === 1) {
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
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };
  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAiAssist = async (field) => {
    if (userPoints < 10) {
      alert("Not enough credits!");
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
      experience: [...prev.experience, { company: "", role: "", duration: "", description: "" }]
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

  const handleFinalSave = () => {
    if (!validateStep(activeStep)) return;

    const profileToPersist = {
      mobile: formData.phone,
      skills: formData.skills.join(", "),
      preferredLocation: formData.preferredLocation,
      experience: formData.experience.length > 0 ? `${formData.experience[0].role} at ${formData.experience[0].company}` : "",
      website: formData.website,
      // Pass other fields if needed for the backend/Redux
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      about: formData.about,
      education: formData.education,
      languages: formData.languages.join(", "),
      dob: formData.dob,
      maritalStatus: formData.maritalStatus,
      currentLocation: formData.currentLocation
    };
    dispatch(updateUserProfile(profileToPersist));
    if (onSave) onSave();
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="First Name *" name="firstName" value={formData.firstName} onChange={handleInputChange} error={!!errors.firstName} helperText={errors.firstName} size="small" InputProps={{ startAdornment: <PersonIcon sx={{ mr: 1, fontSize: 18, color: '#64748b' }} /> }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Last Name *" name="lastName" value={formData.lastName} onChange={handleInputChange} error={!!errors.lastName} helperText={errors.lastName} size="small" InputProps={{ startAdornment: <PersonIcon sx={{ mr: 1, fontSize: 18, color: '#64748b' }} /> }} />
              </Grid>
            </Grid>
            <TextField fullWidth label="Email Address *" name="email" value={formData.email} onChange={handleInputChange} error={!!errors.email} helperText={errors.email} size="small" InputProps={{ startAdornment: <EmailIcon sx={{ mr: 1, fontSize: 18, color: '#64748b' }} /> }} />
            <Grid container spacing={1}>
              <Grid item xs={2} sm={2}>
                <TextField fullWidth label="Code" value="+91" disabled size="small" InputProps={{ startAdornment: <WhatsAppIcon sx={{ mr: 0.5, fontSize: 18, color: '#25D366' }} /> }} />
              </Grid>
              <Grid item xs={9} sm={9.5}>
                <TextField fullWidth label="Mobile Number *" name="phone" value={formData.phone} onChange={handleInputChange} error={!!errors.phone} helperText={errors.phone} size="small" placeholder="10-digit number" />
              </Grid>
            </Grid>
            <TextField fullWidth label="Website / Portfolio" name="website" value={formData.website} onChange={handleInputChange} size="small" placeholder="https://..." InputProps={{ startAdornment: <PublicIcon sx={{ mr: 1, fontSize: 18, color: '#64748b' }} /> }} />
            <TextField fullWidth label="Job Preferred Location *" name="preferredLocation" value={formData.preferredLocation} onChange={handleInputChange} error={!!errors.preferredLocation} helperText={errors.preferredLocation} size="small" InputProps={{ startAdornment: <LocationOnIcon sx={{ mr: 1, fontSize: 18, color: '#64748b' }} /> }} />
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
              {formData.experience.length === 0 && <Typography sx={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>No experience entries added yet.</Typography>}
              {formData.experience.map((exp, idx) => (
                <Paper key={idx} variant="outlined" sx={{ p: 2, mb: 2, position: 'relative', bgcolor: '#f8fafc', borderStyle: 'dashed' }}>
                  <IconButton size="small" onClick={() => removeExperience(idx)} sx={{ position: 'absolute', top: 8, right: 8, color: '#f43f5e' }}><DeleteIcon fontSize="inherit" /></IconButton>
                  <Grid container spacing={2}>
                    <Grid item xs={6}><TextField fullWidth label="Company" value={exp.company} onChange={(e) => updateExperience(idx, 'company', e.target.value)} size="small" /></Grid>
                    <Grid item xs={6}><TextField fullWidth label="Role" value={exp.role} onChange={(e) => updateExperience(idx, 'role', e.target.value)} size="small" /></Grid>
                    <Grid item xs={12}><TextField fullWidth multiline rows={2} label="Description" value={exp.description} onChange={(e) => updateExperience(idx, 'description', e.target.value)} size="small" /></Grid>
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
              {errors.education && <Alert severity="error" sx={{ mb: 2 }}>{errors.education}</Alert>}
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
          </Stack>
        );
      case 2:
        return (
          <Stack spacing={3}>
            <Box>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesomeIcon sx={{ fontSize: 18, color: '#6366f1' }} /> SKILLS *
              </Typography>
              <Autocomplete
                multiple
                freeSolo
                options={SKILLS_OPTIONS}
                filterSelectedOptions
                value={formData.skills}
                onChange={(event, newValue) => {
                  setFormData(prev => ({ ...prev, skills: newValue }));
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="filled" label={option} {...getTagProps({ index })} sx={{ borderRadius: 1.5, bgcolor: '#eef2ff', color: '#4f46e5', fontWeight: 600, '& .MuiChip-deleteIcon': { color: '#6366f1' } }} />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} placeholder="Type or select skills..." error={!!errors.skills} helperText={errors.skills} />
                )}
              />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LanguageIcon sx={{ fontSize: 18, color: '#0ea5e9' }} /> LANGUAGES *
              </Typography>
              <Autocomplete
                multiple
                freeSolo
                options={LANGUAGES_OPTIONS}
                filterSelectedOptions
                value={formData.languages}
                onChange={(event, newValue) => {
                  setFormData(prev => ({ ...prev, languages: newValue }));
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="filled" label={option} {...getTagProps({ index })} sx={{ borderRadius: 1.5, bgcolor: '#f0f9ff', color: '#0369a1', fontWeight: 600, '& .MuiChip-deleteIcon': { color: '#0ea5e9' } }} />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} placeholder="Type or select languages..." error={!!errors.languages} helperText={errors.languages} />
                )}
              />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>About / Professional Summary *</Typography>
                <Tooltip title="AI Magic Improve (-10 Credits)">
                  <Button size="small" startIcon={<AutoAwesomeIcon />} onClick={() => handleAiAssist('about')} disabled={aiLoading}
                    sx={{ textTransform: 'none', color: '#6366f1', fontSize: '0.75rem', '&:hover': { bgcolor: '#f5f3ff' } }}>
                    AI Improve
                  </Button>
                </Tooltip>
              </Box>
              <TextField fullWidth multiline rows={4} name="about" value={formData.about} onChange={handleInputChange} placeholder="Tell us about yourself..." error={!!errors.about} helperText={errors.about} />
            </Box>

            <Divider sx={{ my: 1 }} />
            
            <Box>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon sx={{ fontSize: 18, color: '#64748b' }} /> PERSONAL DETAILS
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Date of Birth *" name="dob" type="date" value={formData.dob} onChange={handleInputChange} error={!!errors.dob} helperText={errors.dob} size="small" InputLabelProps={{ shrink: true }} InputProps={{ startAdornment: <CakeIcon sx={{ mr: 1, fontSize: 18, color: '#64748b' }} /> }} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth select label="Marital Status" name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange} size="small" InputProps={{ startAdornment: <FamilyRestroomIcon sx={{ mr: 1, fontSize: 18, color: '#64748b' }} /> }}>
                    <MenuItem value="Single">Single</MenuItem>
                    <MenuItem value="Married">Married</MenuItem>
                    <MenuItem value="Divorced">Divorced</MenuItem>
                    <MenuItem value="Widowed">Widowed</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
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
            label={`💎 ${userPoints || 0} Credits`} 
            color="primary" 
            variant="outlined" 
            onClick={() => navigate('/credits')}
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

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6 }}>
            <Button disabled={activeStep === 0} onClick={handleBack} sx={{ color: '#64748b' }}>Previous</Button>
            {activeStep === STEPS.length - 1 ? (
              <Button variant="contained" endIcon={<CheckCircleIcon />} onClick={handleFinalSave}
                sx={{ px: 4, py: 1.2, background: 'linear-gradient(135deg, #0f172a, #334155)', borderRadius: 2 }}>
                Save & View Matches
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
