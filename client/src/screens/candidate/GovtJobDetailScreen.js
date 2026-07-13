// screens/candidate/GovtJobDetailScreen.js
import React, { useState, useEffect } from "react";
import {
  Box, Typography, Button, Stack, CircularProgress, Container, Paper, Divider, Chip, IconButton
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DescriptionIcon from "@mui/icons-material/Description";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { API_BASE_URL, API_ENDPOINTS } from "../../config/api.config";

const GovtJobDetailScreen = ({ job: initialJob, isEmbedded = false, onBack }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { mobile } = useSelector((state) => state.UserReducer);
  const [job, setJob] = useState(initialJob || null);
  const [loading, setLoading] = useState(!initialJob);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialJob) {
      setJob(initialJob);
      setLoading(false);
      return;
    }

    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.GOVT_JOB_DETAILS}${id}`);
        
        if (response.data && response.data.data) {
          setJob(response.data.data);
        } else {
          setError("Job details not found.");
        }
      } catch (err) {
        console.error("Error fetching job details:", err);
        setError("Failed to load job details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id, initialJob]);

  const onGoBack = () => {
    if (onBack) onBack();
    else navigate('/govt-jobs');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: isEmbedded ? '400px' : '100vh', gap: 3, bgcolor: '#f8fafc' }}>
        <CircularProgress size={50} sx={{ color: '#059669' }} />
        <Typography sx={{ color: '#64748b', fontWeight: 500 }}>Loading job details...</Typography>
      </Box>
    );
  }

  if (error || !job) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: isEmbedded ? '400px' : '100vh', gap: 2, px: 4, textAlign: 'center' }}>
        <Typography sx={{ fontSize: '3rem' }}>⚠️</Typography>
        <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#0f172a' }}>{error}</Typography>
        {!isEmbedded && (
          <Button variant="contained" onClick={onGoBack} startIcon={<ArrowBackIcon />}
            sx={{ mt: 2, bgcolor: '#059669', '&:hover': { bgcolor: '#047857' }, borderRadius: '12px' }}>
            Back to Government Jobs
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: isEmbedded ? '#fff' : '#f8fafc', minHeight: isEmbedded ? 'auto' : '100vh', pb: isEmbedded ? 4 : 8 }}>
      {/* Header */}
      {!isEmbedded && (
        <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #e2e8f0', py: 2, position: 'sticky', top: 0, zIndex: 10 }}>
          <Container maxWidth="lg">
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton onClick={onGoBack} sx={{ color: '#0f172a' }}>
                <ArrowBackIcon />
              </IconButton>
              <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
                Job Details
              </Typography>
            </Stack>
          </Container>
        </Box>
      )}

      <Container maxWidth={isEmbedded ? false : "md"} sx={{ mt: isEmbedded ? 0 : 4, px: isEmbedded ? { xs: 2, md: 3 } : undefined }}>
        <Paper elevation={0} sx={{ p: isEmbedded ? { xs: 2, md: 4 } : { xs: 3, md: 5 }, borderRadius: isEmbedded ? 0 : '24px', border: isEmbedded ? 'none' : '1px solid #e2e8f0' }}>
          <Stack spacing={3}>
            {/* Title & Badge */}
            <Box>
              <Chip 
                label="Government Opportunity" 
                size="small" 
                sx={{ bgcolor: '#ecfdf5', color: '#059669', fontWeight: 700, mb: 1.5, borderRadius: '6px' }} 
              />
              <Typography sx={{ fontWeight: 900, fontSize: { xs: "1.5rem", md: "1.8rem" }, color: '#0f172a', mb: 1, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                {job.title}
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: { xs: "0.85rem", md: "0.9rem" }, fontWeight: 500 }}>
                {job.state || "Government Department"}
              </Typography>
            </Box>

            <Divider />

            {/* Quick Info Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ p: 1, bgcolor: '#f1f5f9', borderRadius: '10px' }}>
                  <LocationOnIcon sx={{ color: '#64748b' }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Location</Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b' }}>{job.location || job.state}</Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ p: 1, bgcolor: '#f1f5f9', borderRadius: '10px' }}>
                  <CalendarTodayIcon sx={{ color: '#64748b' }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Last Date to Apply</Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', color: '#dc2626' }}>{job.expired_date || "Not Specified"}</Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ p: 1, bgcolor: '#f1f5f9', borderRadius: '10px' }}>
                  <SchoolIcon sx={{ color: '#64748b' }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Qualification</Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b' }}>{job.qualification || "Refer to PDF"}</Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ p: 1, bgcolor: '#f1f5f9', borderRadius: '10px' }}>
                  <WorkIcon sx={{ color: '#64748b' }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Job Type</Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b' }}>{job.job_type || "Govt Job"}</Typography>
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Description */}
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', mb: 2 }}>Job Description</Typography>
              <Typography sx={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {job.description || "No detailed description provided. Please refer to the official notification for complete details."}
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 2 }}>
              {job.apply_url && (
                <Button 
                  variant="contained" 
                  fullWidth
                  startIcon={<OpenInNewIcon />}
                  onClick={() => {
                    if (mobile) {
                      window.open(job.apply_url, '_blank');
                    } else {
                      navigate(`/?redirect=${encodeURIComponent(`/govt-job-detail/${id}`)}`);
                    }
                  }}
                  sx={{ 
                    bgcolor: '#059669', 
                    '&:hover': { bgcolor: '#047857' },
                    py: 1.5,
                    borderRadius: '12px',
                    fontWeight: 700,
                    textTransform: 'none'
                  }}
                >
                  Apply Now
                </Button>
              )}
              {job.pdf_url && (
                <Button 
                  variant="outlined" 
                  fullWidth
                  startIcon={<DescriptionIcon />}
                  onClick={() => {
                    if (mobile) {
                      window.open(job.pdf_url, '_blank');
                    } else {
                      navigate(`/?redirect=${encodeURIComponent(`/govt-job-detail/${id}`)}`);
                    }
                  }}
                  sx={{ 
                    borderColor: '#059669', 
                    color: '#059669',
                    '&:hover': { borderColor: '#047857', bgcolor: '#f0fdf4' },
                    py: 1.5,
                    borderRadius: '12px',
                    fontWeight: 700,
                    textTransform: 'none'
                  }}
                >
                  Download PDF
                </Button>
              )}
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default GovtJobDetailScreen;
