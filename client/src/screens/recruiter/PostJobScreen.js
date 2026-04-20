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
import {
  fetchJobMetadata,
  createJob
} from "../../api/jobpostingAPI";
import AuthComponent from "../../components/common/AuthComponent";
import { UPDATE_USER_PROFILE } from "../../redux/constants";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { fadeSlideUp } from "../../utils/themeUtils";

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link', 'clean'],
  ],
};

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list',
  'link'
];

const predefinedSkills = ["React", "Node.js", "Python", "Java", "Docker", "AWS", "UI/UX", "JavaScript", "TypeScript", "SQL"];

const PostJobScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    userid, email, mobile
  } = useSelector((state) => state.UserReducer);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: '',
    salary: '',
    description: '',
    skills: [],
    expMin: '',
    expMax: '',
    workMode: '',
    openings: 1,
    industry_id: '',
    department_id: '',
    education_requirement: ''
  });

  const [metadata, setMetadata] = useState({
    industries: [],
    education_levels: [],
    departments: [],
    work_modes: [],
    job_types: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');


  // Fetch Metadata
  useEffect(() => {
    const loadMetadata = async () => {
      const response = await fetchJobMetadata();
      if (!response.error) {
        setMetadata(response.data);
      } else {
        console.error("Error loading job metadata:", response.message);
      }
    };
    loadMetadata();
  }, []);



  // Validation
  const validate = () => {
    let temp = {};
    if (!formData.title.trim()) temp.title = "Job Title is required";
    if (!formData.company.trim()) temp.company = "Company Name is required";
    if (!formData.location.trim()) temp.location = "Location is required";
    if (!formData.type) temp.type = "Job Type is required";
    if (!formData.workMode) temp.workMode = "Work Mode is required";
    if (!formData.expMin) temp.expMin = "Min Experience is required";
    if (!formData.expMax) temp.expMax = "Max Experience is required";
    if (!formData.industry_id) temp.industry_id = "Industry is required";
    if (!formData.education_requirement) temp.education_requirement = "Education is required";
    if (!formData.description || !formData.description.trim() || formData.description === '<p><br></p>') temp.description = "Job Description is required";

    setErrors(temp);
    return temp;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (event, newValue) => {
    setFormData(prev => ({ ...prev, skills: newValue }));
  };

  const handleDescriptionChange = (content) => {
    setFormData(prev => ({ ...prev, description: content }));
  };

  const performJobSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        userid: userid,
        title: formData.title,
        company: formData.company,
        location: formData.location,
        work_mode: formData.workMode,
        openings: parseInt(formData.openings),
        industry_id: parseInt(formData.industry_id),
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
        education_requirement: formData.education_requirement,
        experience_min: parseInt(formData.expMin),
        experience_max: parseInt(formData.expMax),
        description: formData.description,
        skills: formData.skills,
        email: userEmail || '',
        mobile: mobile || '',
        salary: formData.salary
      };

      debugger;

      const response = await createJob(payload);

      if (!response.error) {
        setSuccessMsg("Job posted successfully!");
        setTimeout(() => navigate('/posted-jobs'), 1500);
      } else {
        setErrors({ submit: response.message });
      }
    } catch (error) {
      console.error("Error posting job:", error);
      setErrors({ submit: "An unexpected error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      const firstErrorKey = Object.keys(validationErrors)[0];
      const element = document.getElementById(firstErrorKey);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Optionally focus the input if it's a TextField
        const input = element.querySelector('input');
        if (input) input.focus();
      }
      return;
    }
    performJobSubmit();
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

          {!(mobile) ? (
            <Box sx={{ py: 4 }}>
              <AuthComponent invokedFrom="JobPost" userType="Recruiter" />
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    id="title"
                    fullWidth label="Job Title *" name="title" value={formData.title} onChange={handleChange}
                    error={!!errors.title} helperText={errors.title}
                    InputProps={{ startAdornment: <InputAdornment position="start"><WorkOutlineIcon sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment> }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    id="company"
                    fullWidth label="Company Name *" name="company" value={formData.company} onChange={handleChange}
                    error={!!errors.company} helperText={errors.company}
                    InputProps={{ startAdornment: <InputAdornment position="start"><BusinessIcon sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment> }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    id="location"
                    fullWidth label="Location *" name="location" value={formData.location} onChange={handleChange}
                    error={!!errors.location} helperText={errors.location}
                    InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnIcon sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment> }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Autocomplete
                    id="type"
                    options={metadata.job_types || []}
                    getOptionLabel={(option) => option.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    value={formData.type || null}
                    onChange={(event, newValue) => {
                      setFormData(prev => ({ ...prev, type: newValue || '' }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Job Type *"
                        error={!!errors.type}
                        helperText={errors.type}
                        fullWidth
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Autocomplete
                    id="workMode"
                    options={metadata.work_modes || []}
                    getOptionLabel={(option) => option.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    value={formData.workMode || null}
                    onChange={(event, newValue) => {
                      setFormData(prev => ({ ...prev, workMode: newValue || '' }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Work Mode *"
                        error={!!errors.workMode}
                        helperText={errors.workMode}
                        fullWidth
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    id="expMin"
                    fullWidth label="Experience Min (Yrs) *" name="expMin" type="number"
                    value={formData.expMin} onChange={handleChange}
                    error={!!errors.expMin} helperText={errors.expMin}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    id="expMax"
                    fullWidth label="Experience Max (Yrs) *" name="expMax" type="number"
                    value={formData.expMax} onChange={handleChange}
                    error={!!errors.expMax} helperText={errors.expMax}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth label="No. of Openings *" name="openings" type="number"
                    value={formData.openings} onChange={handleChange}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Autocomplete
                    id="industry_id"
                    options={metadata.industries || []}
                    getOptionLabel={(option) => option.name || ""}
                    value={metadata.industries.find(item => item.id === formData.industry_id) || null}
                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                    onChange={(event, newValue) => {
                      setFormData(prev => ({ ...prev, industry_id: newValue ? newValue.id : '' }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Industry Type *"
                        error={!!errors.industry_id}
                        helperText={errors.industry_id}
                        fullWidth
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Autocomplete
                    options={metadata.departments || []}
                    getOptionLabel={(option) => option.name || ""}
                    value={metadata.departments.find(item => item.id === formData.department_id) || null}
                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                    onChange={(event, newValue) => {
                      setFormData(prev => ({ ...prev, department_id: newValue ? newValue.id : '' }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Department"
                        fullWidth
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Autocomplete
                    id="education_requirement"
                    options={metadata.education_levels || []}
                    getOptionLabel={(option) => option.name || ""}
                    value={metadata.education_levels.find(item => item.name === formData.education_requirement) || null}
                    isOptionEqualToValue={(option, value) => option.name === value?.name}
                    onChange={(event, newValue) => {
                      setFormData(prev => ({ ...prev, education_requirement: newValue ? newValue.name : '' }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Education Level *"
                        error={!!errors.education_requirement}
                        helperText={errors.education_requirement}
                        fullWidth
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth label="Salary Range (Optional)" name="salary" value={formData.salary} onChange={handleChange}
                    InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoneyIcon sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment> }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Autocomplete
                    multiple freeSolo options={predefinedSkills} value={formData.skills} onChange={handleSkillsChange}
                    renderTags={(value, getTagProps) => value.map((option, index) => (
                      <Chip variant="outlined" label={option} size="small" sx={{ borderColor: '#c7d2fe', color: '#4f46e5', bgcolor: '#e0e7ff' }} {...getTagProps({ index })} />
                    ))}
                    renderInput={(params) => <TextField {...params} variant="outlined" label="Required Skills (Optional)" placeholder="Add skills" />}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Box id="description" sx={{
                    '& .ql-container': {
                      borderRadius: '0 0 12px 12px',
                      minHeight: '250px',
                      fontSize: '1rem',
                      border: errors.description ? '1px solid #ef4444' : '1px solid #e2e8f0',
                      bgcolor: 'white'
                    },
                    '& .ql-toolbar': {
                      borderRadius: '12px 12px 0 0',
                      border: errors.description ? '1px solid #ef4444' : '1px solid #e2e8f0',
                      borderBottom: 'none',
                      bgcolor: '#f8fafc',
                      fontFamily: 'inherit'
                    },
                    '& .ql-editor': {
                      minHeight: '250px',
                      fontFamily: '"Inter", "Roboto", sans-serif',
                      color: '#1e293b'
                    },
                    '& .ql-editor.ql-blank::before': {
                      color: '#94a3b8',
                      fontStyle: 'normal'
                    }
                  }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: errors.description ? '#ef4444' : '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DescriptionIcon sx={{ fontSize: 18 }} /> Job Description *
                    </Typography>
                    <ReactQuill
                      theme="snow"
                      value={formData.description}
                      onChange={handleDescriptionChange}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Enter detailed job description, responsibilities, and requirements..."
                    />
                    {errors.description && (
                      <Typography variant="caption" sx={{ color: '#ef4444', mt: 0.5, ml: 1, fontWeight: 500 }}>
                        {errors.description}
                      </Typography>
                    )}
                  </Box>
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
          )}
        </Paper>
      </Container>


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
