import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Stack,
  IconButton,
  Grid,
  TextField,
  CircularProgress,
  Divider,
  Snackbar,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import LinkIcon from "@mui/icons-material/Link";
import InfoIcon from "@mui/icons-material/Info";
import { useParams, useNavigate } from "react-router-dom";
import { getJobDetailsById, updateJobDirectUrl, updateJobCompanyUrls } from "../../api/jobpostingAPI";


const JobDetailsScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [job, setJob] = useState(null);
  const [directUrlInput, setDirectUrlInput] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [companyWebsiteUrl, setCompanyWebsiteUrl] = useState("");
  const [companyCareersUrl, setCompanyCareersUrl] = useState("");
  const [updatingCompanyUrls, setUpdatingCompanyUrls] = useState(false);
  const [companyWebsiteError, setCompanyWebsiteError] = useState("");
  const [companyCareersError, setCompanyCareersError] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const loadJobDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getJobDetailsById(id);
      if (!res.error && res.data) {
        setJob(res.data);
        setDirectUrlInput(res.data.direct_url || "");
        setCompanyWebsiteUrl(res.data.company?.website || "");
        setCompanyCareersUrl(res.data.careers_url || "");
      } else {
        setError(res.message || "Failed to load job details.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred while loading job details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadJobDetails();
    }
  }, [id]);

  const validateUrl = (url) => {
    if (!url.trim()) return true; // Empty is fine, we can clear it
    try {
      const parsed = new URL(url.trim());
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return false;
      }
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setFieldError("");

    const url = directUrlInput.trim();
    if (url && !validateUrl(url)) {
      setFieldError("Please enter a valid URL including http:// or https://");
      return;
    }

    setUpdating(true);
    try {
      const res = await updateJobDirectUrl(id, url);
      if (!res.error) {
        setSnackbar({
          open: true,
          message: "Direct URL updated successfully!",
          severity: "success",
        });
        // Reload details to refresh displayed data
        await loadJobDetails();
      } else {
        setSnackbar({
          open: true,
          message: res.message || "Failed to update direct URL.",
          severity: "error",
        });
      }
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "An unexpected error occurred during update.",
        severity: "error",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateCompanyUrls = async (e) => {
    e.preventDefault();
    setCompanyWebsiteError("");
    setCompanyCareersError("");

    const website = companyWebsiteUrl.trim();
    const careers = companyCareersUrl.trim();

    let hasError = false;
    if (website && !validateUrl(website)) {
      setCompanyWebsiteError("Please enter a valid URL including http:// or https://");
      hasError = true;
    }
    if (careers && !validateUrl(careers)) {
      setCompanyCareersError("Please enter a valid URL including http:// or https://");
      hasError = true;
    }

    if (hasError) return;

    setUpdatingCompanyUrls(true);
    try {
      const res = await updateJobCompanyUrls(id, website, careers);
      if (!res.error) {
        setSnackbar({
          open: true,
          message: "Company URLs updated successfully!",
          severity: "success",
        });
        await loadJobDetails();
      } else {
        setSnackbar({
          open: true,
          message: res.message || "Failed to update Company URLs.",
          severity: "error",
        });
      }
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "An unexpected error occurred during Company URLs update.",
        severity: "error",
      });
    } finally {
      setUpdatingCompanyUrls(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const formatExperience = (min, max) => {
    if (min === null || min === undefined) return "Not specified";
    if (max === null || max === undefined || min === max) {
      return min === 0 ? "Fresher" : `${min}+ Years`;
    }
    if (min === 0 && max === 0) return "Fresher";
    return `${min} - ${max} Years`;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 64px)", bgcolor: "#F8FAFC" }}>
        <CircularProgress thickness={4} size={48} sx={{ color: "#3B82F6", mb: 2 }} />
        <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 500 }}>
          Loading job details...
        </Typography>
      </Box>
    );
  }

  if (error || !job) {
    return (
      <Box sx={{ bgcolor: "#F8FAFC", minHeight: "calc(100vh - 64px)", py: 6 }}>
        <Container maxWidth="md">
          <Paper elevation={0} sx={{ p: 4, borderRadius: "20px", border: "1px solid #FEE2E2", bgcolor: "#FEF2F2", textAlign: "center" }}>
            <Alert severity="error" sx={{ mb: 3, borderRadius: "12px" }}>
              {error || "Job details not found"}
            </Alert>
            <Button variant="contained" color="error" onClick={() => navigate("/admin/recent-jobs")} sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600 }}>
              Back to List
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "calc(100vh - 64px)", py: 6 }}>
      <Container maxWidth="lg">
        {/* Header Block */}
        <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton 
            onClick={() => navigate("/admin/recent-jobs")} 
            sx={{ bgcolor: "#FFFFFF", border: "1px solid #E5E7EB", "&:hover": { bgcolor: "#F1F5F9" } }}
          >
            <ArrowBackIcon sx={{ color: "#475569" }} />
          </IconButton>
          <Box>
            <Typography variant="caption" sx={{ color: "#3B82F6", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Job ID: {job.id}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#1E293B", letterSpacing: "-0.02em" }}>
              {job.title}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={4}>
          {/* Left Column: Job Info & Description */}
          <Grid item xs={12} md={8}>
            <Stack spacing={4}>
              {/* Job Metadata Card */}
              <Paper elevation={0} sx={{ p: 4, borderRadius: "20px", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#1E293B", mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
                  <InfoIcon sx={{ color: "#3B82F6" }} /> Job Overview
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, display: "block" }}>
                      Company Name
                    </Typography>
                    <Typography sx={{ fontWeight: 600, color: "#1E293B", mt: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
                      <BusinessIcon sx={{ fontSize: 18, color: "#94A3B8" }} />
                      {job.company?.name || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, display: "block" }}>
                      Company ID
                    </Typography>
                    <Typography sx={{ fontWeight: 600, color: "#1E293B", mt: 0.5 }}>
                      {job.company?.id || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, display: "block" }}>
                      Industry Type
                    </Typography>
                    <Typography sx={{ fontWeight: 600, color: "#1E293B", mt: 0.5 }}>
                      {job.industry?.name || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, display: "block" }}>
                      Experience Required
                    </Typography>
                    <Typography sx={{ fontWeight: 600, color: "#1E293B", mt: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
                      <WorkHistoryIcon sx={{ fontSize: 18, color: "#94A3B8" }} />
                      {formatExperience(job.experience_min_yrs, job.experience_max_yrs)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, display: "block" }}>
                      Location
                    </Typography>
                    <Typography sx={{ fontWeight: 600, color: "#1E293B", mt: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
                      <LocationOnIcon sx={{ fontSize: 18, color: "#94A3B8" }} />
                      {job.location || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, display: "block" }}>
                      Posted Date/Time
                    </Typography>
                    <Typography sx={{ fontWeight: 600, color: "#1E293B", mt: 0.5 }}>
                      {job.posted_at ? new Date(job.posted_at).toLocaleString() : "N/A"}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1E293B", mb: 2 }}>
                  Company Links
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company Website URL"
                      placeholder="https://company.com"
                      value={companyWebsiteUrl}
                      onChange={(e) => {
                        setCompanyWebsiteUrl(e.target.value);
                        setCompanyWebsiteError("");
                      }}
                      error={!!companyWebsiteError}
                      helperText={companyWebsiteError}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                        }
                      }}
                    />
                    {job.company?.website && (
                      <Box sx={{ mt: 1 }}>
                        <Button
                          variant="text"
                          href={job.company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          startIcon={<LinkIcon />}
                          sx={{ textTransform: "none", fontSize: "0.825rem", fontWeight: 600, color: "#3B82F6", p: 0, minWidth: 0, "&:hover": { bgcolor: "transparent", textDecoration: "underline" } }}
                        >
                          Visit Website
                        </Button>
                      </Box>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company Careers URL"
                      placeholder="https://company.com/careers"
                      value={companyCareersUrl}
                      onChange={(e) => {
                        setCompanyCareersUrl(e.target.value);
                        setCompanyCareersError("");
                      }}
                      error={!!companyCareersError}
                      helperText={companyCareersError}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                        }
                      }}
                    />
                    {job.careers_url && (
                      <Box sx={{ mt: 1 }}>
                        <Button
                          variant="text"
                          href={job.careers_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          startIcon={<LinkIcon />}
                          sx={{ textTransform: "none", fontSize: "0.825rem", fontWeight: 600, color: "#3B82F6", p: 0, minWidth: 0, "&:hover": { bgcolor: "transparent", textDecoration: "underline" } }}
                        >
                          Visit Careers Page
                        </Button>
                      </Box>
                    )}
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      disabled={updatingCompanyUrls}
                      onClick={handleUpdateCompanyUrls}
                      sx={{
                        borderRadius: "12px",
                        py: 1.5,
                        px: 4,
                        fontWeight: 700,
                        textTransform: "none",
                        bgcolor: "#10B981",
                        boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
                        "&:hover": { bgcolor: "#059669" }
                      }}
                    >
                      {updatingCompanyUrls ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Update Company URLs"}
                    </Button>
                  </Grid>
                </Grid>
              </Paper>

              {/* Job Description Card */}
              <Paper elevation={0} sx={{ p: 4, borderRadius: "20px", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#1E293B", mb: 3 }}>
                  Job Description
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box
                  sx={{
                    color: "#334155",
                    lineHeight: 1.7,
                    "& p": { mb: 2 },
                    "& ul, & ol": { pl: 3, mb: 2 },
                    "& li": { mb: 1 }
                  }}
                  dangerouslySetInnerHTML={{ __html: job.description || "<p>No description provided.</p>" }}
                />
              </Paper>
            </Stack>
          </Grid>

          {/* Right Column: Manage Direct URL */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ borderRadius: "20px", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF", position: "sticky", top: 24 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#1E293B", mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  <LinkIcon sx={{ color: "#3B82F6" }} /> Manage Application Link
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748B", mb: 3 }}>
                  Update the Direct URL field where candidates can apply to this job listing directly.
                </Typography>

                <form onSubmit={handleUpdate}>
                  <Stack spacing={2.5}>
                    <TextField
                      fullWidth
                      label="Direct URL"
                      placeholder="https://company.com/careers/apply"
                      value={directUrlInput}
                      onChange={(e) => {
                        setDirectUrlInput(e.target.value);
                        setFieldError("");
                      }}
                      error={!!fieldError}
                      helperText={fieldError}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                        }
                      }}
                    />

                    {job.direct_url && (
                      <Box>
                        <Button
                          variant="text"
                          href={job.direct_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          startIcon={<LinkIcon />}
                          sx={{ textTransform: "none", fontWeight: 600, color: "#3B82F6", p: 0, justifyContent: "flex-start", "&:hover": { bgcolor: "transparent", textDecoration: "underline" } }}
                        >
                          Visit Current Link
                        </Button>
                      </Box>
                    )}

                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={updating}
                      sx={{
                        borderRadius: "12px",
                        py: 1.5,
                        fontWeight: 700,
                        textTransform: "none",
                        bgcolor: "#3B82F6",
                        boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)",
                        "&:hover": { bgcolor: "#2563EB" }
                      }}
                    >
                      {updating ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Update Link"}
                    </Button>
                  </Stack>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Toast Alert */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ borderRadius: "12px", fontWeight: 500 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default JobDetailsScreen;
