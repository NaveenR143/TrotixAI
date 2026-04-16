import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PublicIcon from "@mui/icons-material/Public";
import { API_BASE_URL, API_ENDPOINTS } from "../../../config/api.config";
import * as profileAPI from "../../../api/profileAPI";
import { updateUserProfile } from "../../../redux/user/Action";

const PersonalInformationSection = ({ userId, profile, onSuccess }) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    mobile: "",
    website: "",
    preferredLocation: "",
    currentLocation: "",
    headline: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Sync with profile prop when not editing
  useEffect(() => {
    if (!isEditing && profile) {
      setFormData({
        fullname: profile.fullname || "",
        email: profile.email || "",
        mobile: profile.mobile || "",
        website: profile.website || "",
        preferredLocation: profile.preferredLocation || "",
        currentLocation: profile.currentLocation || "",
        headline: profile.headline || "",
      });
    }
  }, [profile, isEditing]);

  const validate = () => {
    const newErrors = {};
    if (!formData.fullname?.trim()) newErrors.fullname = "Full name is required";
    if (!formData.email?.trim()) newErrors.email = "Email is required";
    if (formData.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.mobile?.trim()) newErrors.mobile = "Mobile number is required";
    if (formData.mobile?.trim() && !/^\d{10}$/.test(formData.mobile.replace(/\D/g, ""))) {
      newErrors.mobile = "Mobile must be 10 digits";
    }
    if (!formData.preferredLocation?.trim()) newErrors.preferredLocation = "Preferred location is required";
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      handleCancel();
    } else {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullname: profile.fullname || "",
      email: profile.email || "",
      mobile: profile.mobile || "",
      website: profile.website || "",
      preferredLocation: profile.preferredLocation || "",
      currentLocation: profile.currentLocation || "",
      headline: profile.headline || "",
    });
    setFormErrors({});
    setIsEditing(false);
    setError(null);
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = `${API_BASE_URL}${API_ENDPOINTS.SEND_OTP}`;
      await axios.post(endpoint, { phone: formData.mobile.toString() });
      if (onSuccess) onSuccess("OTP sent successfully!");
    } catch (err) {
      const errorMsg = err?.response?.data?.detail || err?.message || "Sending OTP failed.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    setError(null);

    try {
      const dataToUpdate = {
        full_name: formData.fullname,
        email: formData.email,
        phone: formData.mobile,
        headline: formData.headline,
        current_location: formData.currentLocation,
        preferred_locations: formData.preferredLocation ? [formData.preferredLocation] : [],
        portfolio_url: formData.website,
      };

      const result = await profileAPI.updatePersonalInformation(userId, dataToUpdate);

      if (result.error) {
        setError(result.message);
      } else {
        if (onSuccess) onSuccess("Personal information updated successfully!");
        
        // Update Redux
        dispatch(updateUserProfile({
          ...profile,
          fullname: formData.fullname,
          email: formData.email,
          mobile: formData.mobile,
          preferredLocation: formData.preferredLocation,
          website: formData.website,
          currentLocation: formData.currentLocation,
          headline: formData.headline,
        }));

        setIsEditing(false);
      }
    } catch (err) {
      setError("Failed to update personal information");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: "1px solid #e2e8f0",
        borderRadius: 2,
        bgcolor: "#fff",
        boxShadow: "0 4px 24px rgba(15,23,42,0.06)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#0f172a" }}>
          Personal Information
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {loading && <CircularProgress size={20} />}
          <Button
            size="small"
            variant={isEditing ? "outlined" : "text"}
            startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
            onClick={handleToggleEdit}
            disabled={loading}
            sx={{ color: isEditing ? "#ef4444" : "#6366f1" }}
          >
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!isEditing ? (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", mb: 0.5, textTransform: "uppercase" }}>
                Full Name
              </Typography>
              <Typography sx={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: 500 }}>
                {profile?.fullname || "—"}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", mb: 0.5, textTransform: "uppercase" }}>
                Email
              </Typography>
              <Typography sx={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: 500 }}>
                {profile?.email || "—"}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", mb: 0.5, textTransform: "uppercase" }}>
                Mobile
              </Typography>
              <Typography sx={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: 500 }}>
                {profile?.mobile || "—"}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", mb: 0.5, textTransform: "uppercase" }}>
                Preferred Location
              </Typography>
              <Typography sx={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: 500 }}>
                {profile?.preferredLocation || "—"}
              </Typography>
            </Box>
          </Grid>
          {profile?.website && (
            <Grid item xs={12}>
              <Box>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", mb: 0.5, textTransform: "uppercase" }}>
                  Website
                </Typography>
                <Typography sx={{ fontSize: "0.95rem", color: "#6366f1", fontWeight: 500 }}>
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
                    {profile.website}
                  </a>
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Full Name *"
              name="fullname"
              value={formData.fullname}
              onChange={handleInputChange}
              error={!!formErrors.fullname}
              helperText={formErrors.fullname}
              size="small"
              InputProps={{
                startAdornment: <PersonIcon sx={{ mr: 1, fontSize: 18, color: "#64748b" }} />,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email *"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              size="small"
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, fontSize: 18, color: "#64748b" }} />,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                label="Mobile Number *"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                error={!!formErrors.mobile}
                helperText={formErrors.mobile}
                size="small"
                placeholder="10-digit number"
              />
              <Button 
                variant="outlined" 
                size="small" 
                onClick={handleSendOtp}
                disabled={loading || !formData.mobile || formData.mobile.length < 10}
              >
                Verify
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Preferred Location *"
              name="preferredLocation"
              value={formData.preferredLocation}
              onChange={handleInputChange}
              error={!!formErrors.preferredLocation}
              helperText={formErrors.preferredLocation}
              size="small"
              InputProps={{
                startAdornment: <LocationOnIcon sx={{ mr: 1, fontSize: 18, color: "#64748b" }} />,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Website / Portfolio"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              size="small"
              placeholder="https://..."
              InputProps={{
                startAdornment: <PublicIcon sx={{ mr: 1, fontSize: 18, color: "#64748b" }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sx={{ display: "flex", gap: 1, mt: 1 }}>
            <Button
              variant="contained"
              size="small"
              onClick={handleSave}
              startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
              disabled={loading}
              sx={{
                background: loading
                  ? "#cbd5e1"
                  : "linear-gradient(135deg, #6366f1, #4f46e5)",
              }}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleCancel}
              startIcon={<CancelIcon />}
              disabled={loading}
            >
              Cancel
            </Button>
          </Grid>
        </Grid>
      )}
    </Paper>
  );
};

export default PersonalInformationSection;
