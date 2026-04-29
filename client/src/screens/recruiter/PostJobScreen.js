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
import SchoolIcon from "@mui/icons-material/School";
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
    salaryMin: '',
    salaryMax: '',
    experienceLevel: '',
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
    job_types: [],
    experience_levels: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [isSkillsFocused, setIsSkillsFocused] = useState(false);


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
        experience_level: formData.experienceLevel,
        salary_min: formData.salaryMin ? parseFloat(formData.salaryMin) : null,
        salary_max: formData.salaryMax ? parseFloat(formData.salaryMax) : null,
        description: formData.description,
        skills: formData.skills,
        email: email || '',
        mobile: mobile || ''
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


  // Helper for section titles
  const SectionTitle = ({ icon: Icon, title }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
      <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon sx={{ color: '#2563EB', fontSize: 20 }} />
      </Box>
      <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#111827' }}>
        {title}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 8 }}>
      <Box sx={{ bgcolor: '#FFFFFF', borderBottom: '1px solid #E5E7EB', py: 2, mb: 4, position: 'sticky', top: 0, zIndex: 1000 }}>
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: '#6B7280' }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
              Post New Job
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="md">
        {!(mobile) ? (
          <Paper elevation={0} sx={{ p: 6, borderRadius: '24px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
            <AuthComponent invokedFrom="JobPost" userType="Recruiter" />
          </Paper>
        ) : (
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              {/* Basic Information */}
              <Paper elevation={0} sx={{ p: 4, borderRadius: '20px', border: '1px solid #E5E7EB' }}>
                <SectionTitle icon={WorkOutlineIcon} title="Basic Information" />
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      id="title" fullWidth label="Job Title *" name="title" value={formData.title} onChange={handleChange}
                      error={!!errors.title} helperText={errors.title}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      id="company" fullWidth label="Company Name *" name="company" value={formData.company} onChange={handleChange}
                      error={!!errors.company} helperText={errors.company}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      id="location" fullWidth label="Location *" name="location" value={formData.location} onChange={handleChange}
                      error={!!errors.location} helperText={errors.location}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Autocomplete
                      id="type" options={metadata.job_types || []}
                      getOptionLabel={(option) => option.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      value={formData.type || null}
                      onChange={(e, v) => setFormData(prev => ({ ...prev, type: v || '' }))}
                      renderInput={(params) => <TextField {...params} label="Job Type *" error={!!errors.type} helperText={errors.type} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Autocomplete
                      id="workMode" options={metadata.work_modes || []}
                      getOptionLabel={(option) => option.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      value={formData.workMode || null}
                      onChange={(e, v) => setFormData(prev => ({ ...prev, workMode: v || '' }))}
                      renderInput={(params) => <TextField {...params} label="Work Mode *" error={!!errors.workMode} helperText={errors.workMode} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth label="No. of Openings *" name="openings" type="number" value={formData.openings} onChange={handleChange}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* Requirements & Experience */}
              <Paper elevation={0} sx={{ p: 4, borderRadius: '20px', border: '1px solid #E5E7EB' }}>
                <SectionTitle icon={SchoolIcon} title="Requirements & Experience" />
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Autocomplete
                      id="industry_id" options={metadata.industries || []}
                      getOptionLabel={(option) => option.name || ""}
                      value={metadata.industries.find(item => item.id === formData.industry_id) || null}
                      onChange={(e, v) => setFormData(prev => ({ ...prev, industry_id: v ? v.id : '' }))}
                      renderInput={(params) => <TextField {...params} label="Industry Type *" error={!!errors.industry_id} helperText={errors.industry_id} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Autocomplete
                      id="education_requirement" options={metadata.education_levels || []}
                      getOptionLabel={(option) => option.name || ""}
                      value={metadata.education_levels.find(item => item.name === formData.education_requirement) || null}
                      onChange={(e, v) => setFormData(prev => ({ ...prev, education_requirement: v ? v.name : '' }))}
                      renderInput={(params) => <TextField {...params} label="Education Level *" error={!!errors.education_requirement} helperText={errors.education_requirement} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      id="expMin" fullWidth label="Min Exp (Yrs) *" name="expMin" type="number" value={formData.expMin} onChange={handleChange}
                      error={!!errors.expMin} helperText={errors.expMin} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                      id="expMax" fullWidth label="Max Exp (Yrs) *" name="expMax" type="number" value={formData.expMax} onChange={handleChange}
                      error={!!errors.expMax} helperText={errors.expMax} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Autocomplete
                      id="experienceLevel" options={metadata.experience_levels || []}
                      getOptionLabel={(option) => option.charAt(0).toUpperCase() + option.slice(1)}
                      value={formData.experienceLevel || null}
                      onChange={(e, v) => setFormData(prev => ({ ...prev, experienceLevel: v || '' }))}
                      renderInput={(params) => <TextField {...params} label="Exp Level (Optional)" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* Compensation & Skills */}
              <Paper elevation={0} sx={{ p: 4, borderRadius: '20px', border: '1px solid #E5E7EB' }}>
                <SectionTitle icon={AttachMoneyIcon} title="Compensation & Skills" />
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth label="Salary Min (Optional)" name="salaryMin" type="number" value={formData.salaryMin} onChange={handleChange}
                      InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoneyIcon sx={{ fontSize: 20, color: '#94A3B8' }} /></InputAdornment> }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth label="Salary Max (Optional)" name="salaryMax" type="number" value={formData.salaryMax} onChange={handleChange}
                      InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoneyIcon sx={{ fontSize: 20, color: '#94A3B8' }} /></InputAdornment> }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Autocomplete
                      multiple freeSolo options={predefinedSkills} value={formData.skills} onChange={handleSkillsChange}
                      renderTags={(value, getTagProps) => value.map((option, index) => (
                        <Chip variant="filled" label={option} size="small" sx={{ borderRadius: '8px', bgcolor: '#eff6ff', color: '#2563EB', fontWeight: 700 }} {...getTagProps({ index })} />
                      ))}
                      renderInput={(params) => (
                        <TextField {...params} label="Required Skills" placeholder="Type and press enter" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
                      )}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* Detailed Description */}
              <Paper elevation={0} sx={{ p: 4, borderRadius: '20px', border: '1px solid #E5E7EB' }}>
                <SectionTitle icon={DescriptionIcon} title="Detailed Description" />
                <Box id="description" sx={{
                  '& .ql-container': {
                    borderRadius: '0 0 12px 12px',
                    minHeight: '300px',
                    fontSize: '1rem',
                    border: errors.description ? '1px solid #ef4444' : '1px solid #E5E7EB',
                    bgcolor: 'white'
                  },
                  '& .ql-toolbar': {
                    borderRadius: '12px 12px 0 0',
                    border: errors.description ? '1px solid #ef4444' : '1px solid #E5E7EB',
                    borderBottom: 'none',
                    bgcolor: '#F8FAFC'
                  },
                  '& .ql-editor': {
                    minHeight: '300px',
                    fontFamily: 'inherit',
                    color: '#111827',
                    wordBreak: 'break-word'
                  }
                }}>
                  <ReactQuill
                    theme="snow" value={formData.description} onChange={handleDescriptionChange}
                    modules={quillModules} formats={quillFormats}
                    placeholder="Describe the role, responsibilities, and ideal candidate profile..."
                  />
                  {errors.description && (
                    <Typography variant="caption" sx={{ color: '#ef4444', mt: 1, ml: 1, display: 'block', fontWeight: 600 }}>
                      {errors.description}
                    </Typography>
                  )}
                </Box>
              </Paper>

              {/* Submit Action */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
                <Button
                  type="submit" variant="contained" size="large" disabled={isSubmitting}
                  sx={{
                    px: 6, py: 2, borderRadius: '16px', fontWeight: 800, textTransform: 'none', fontSize: '1.1rem',
                    bgcolor: '#2563EB', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.2)',
                    '&:hover': { bgcolor: '#1e40af', boxShadow: '0 12px 30px rgba(37, 99, 235, 0.3)' }
                  }}
                >
                  {isSubmitting ? "Processing..." : "Publish Job Post"}
                </Button>
              </Box>
            </Stack>
          </form>
        )}
      </Container>

      <Snackbar open={!!successMsg} autoHideDuration={3000} onClose={() => setSuccessMsg('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" sx={{ borderRadius: '12px', fontWeight: 600 }}>
          {successMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PostJobScreen;
