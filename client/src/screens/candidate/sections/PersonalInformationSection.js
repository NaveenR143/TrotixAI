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
import WorkIcon from "@mui/icons-material/Work";
import { API_BASE_URL, API_ENDPOINTS } from "../../../config/api.config";
import * as profileAPI from "../../../api/profileAPI";
import { updateUserProfile } from "../../../redux/user/Action";
import { useOtp } from "../../../hooks/useOtp";
import { verifyOTP } from "../../../api/jobpostingAPI";

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

  const phoneVerificationOtp = useOtp("phone_verification");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState("");



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
    if (formData.headline?.trim() && formData.headline.trim().length > 100) {
      newErrors.headline = "Headline must not exceed 100 characters";
    }
    if (formData.headline?.trim() && /<[^>]*>/g.test(formData.headline)) {
      newErrors.headline = "Headline cannot contain HTML tags";
    }
    
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
    setOtp("");
    setOtpSent(false);
    setOtpVerified(false);
    setVerificationError("");
  };

  const handleSendOtp = async (isResend = false) => {
    setError(null);
    setVerificationError("");
    try {
      const resp = await phoneVerificationOtp.sendOtp({
        phone: formData.mobile.toString(),
        isResend
      });
      if (!resp.error) {
        setOtpSent(true);
        if (onSuccess) onSuccess("OTP sent successfully!");
      } else {
        setVerificationError(resp.message || phoneVerificationOtp.error);
      }
    } catch (err) {
      setVerificationError("Failed to send OTP. Please try again.");
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
      const resp = await verifyOTP(formData.mobile, otpToVerify);
      if (!resp.error) {
        setOtpVerified(true);
        setOtpSent(false);
        setOtp("");
        if (onSuccess) onSuccess("Mobile verified successfully!");
      } else {
        setVerificationError(resp.message);
      }
    } catch (err) {
      setVerificationError("Verification failed. Please try again.");
    } finally {
      setVerificationLoading(false);
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PersonIcon sx={{ fontSize: 20, color: "#212121" }} />
          <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#0f172a", textTransform: "uppercase", letterSpacing: "1px" }}>
            Personal Information
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {loading && <CircularProgress size={20} />}
          <Button
            size="small"
            variant={isEditing ? "outlined" : "text"}
            startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
            onClick={handleToggleEdit}
            disabled={loading}
            sx={{
              color: isEditing ? "#ef4444" : "#6366f1",
              textTransform: "none",
              "&.Mui-disabled": {
                color: "#94A3B8",
              },
            }}
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
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#212121", mb: 0.5, textTransform: "uppercase" }}>
                Full Name
              </Typography>
              <Typography sx={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: 400 }}>
                {profile?.fullname || "—"}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#212121", mb: 0.5, textTransform: "uppercase" }}>
                Headline
              </Typography>
              <Typography sx={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: 400 }}>
                {profile?.headline || "—"}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#212121", mb: 0.5, textTransform: "uppercase" }}>
                Email
              </Typography>
              <Typography sx={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: 400 }}>
                {profile?.email || "—"}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#212121", mb: 0.5, textTransform: "uppercase" }}>
                Mobile
              </Typography>
              <Typography sx={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: 400 }}>
                {profile?.mobile || "—"}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#212121", mb: 0.5, textTransform: "uppercase" }}>
                Preferred Location
              </Typography>
              <Typography sx={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: 400 }}>
                {profile?.preferredLocation || "—"}
              </Typography>
            </Box>
          </Grid>
          {profile?.website && (
            <Grid item xs={12}>
              <Box>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#212121", mb: 0.5, textTransform: "uppercase" }}>
                  Website
                </Typography>
                <Typography sx={{ fontSize: "0.95rem", color: "#6366f1", fontWeight: 400 }}>
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
                startAdornment: <PersonIcon sx={{ mr: 1, fontSize: 18, color: "#212121" }} />,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Headline"
              name="headline"
              value={formData.headline || ""}
              onChange={handleInputChange}
              error={!!formErrors.headline}
              helperText={formErrors.headline}
              size="small"
              placeholder="e.g. Software Engineer at Trotix"
              InputProps={{
                startAdornment: <WorkIcon sx={{ mr: 1, fontSize: 18, color: "#212121" }} />,
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
                startAdornment: <EmailIcon sx={{ mr: 1, fontSize: 18, color: "#212121" }} />,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  fullWidth
                  label="Mobile Number *"
                  name="mobile"
                  value={formData.mobile}
                  onChange={(e) => {
                    handleInputChange(e);
                    setOtpSent(false);
                    setOtpVerified(false);
                    setOtp("");
                    setVerificationError("");
                  }}
                  error={!!formErrors.mobile}
                  helperText={formErrors.mobile}
                  size="small"
                  placeholder="10-digit number"
                  disabled={loading || otpVerified}
                />
                {!otpVerified && !otpSent && (
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => handleSendOtp(false)}
                    disabled={loading || !formData.mobile || formData.mobile.length < 10 || phoneVerificationOtp.loading}
                    sx={{
                      textTransform: "none",
                      height: 40,
                      "&.Mui-disabled": {
                        color: "#94A3B8",
                      },
                    }}
                  >
                    {phoneVerificationOtp.loading ? <CircularProgress size={20} /> : "Verify"}
                  </Button>
                )}
              </Box>

              {otpSent && !otpVerified && (
                <Box>
                  <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: 'center' }}>
                    <TextField
                      placeholder="4-digit OTP"
                      size="small"
                      value={otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setOtp(val);
                        if (val.length === 4) {
                          handleVerifyOtp(null, val);
                        }
                      }}
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
                      disabled={verificationLoading || phoneVerificationOtp.isCooldownActive || !phoneVerificationOtp.isEligible || phoneVerificationOtp.loading}
                      sx={{
                        height: 40, textTransform: 'none', px: 2,
                        "&.Mui-disabled": {
                          color: "#94A3B8"
                        }
                      }}
                    >
                      {phoneVerificationOtp.loading
                        ? "Resending..."
                        : phoneVerificationOtp.isCooldownActive
                        ? `Resend in ${phoneVerificationOtp.remainingSeconds}s`
                        : phoneVerificationOtp.resendAttempts >= 3
                        ? "Limit Reached"
                        : "Resend OTP"}
                    </Button>
                  </Stack>
                  {phoneVerificationOtp.resendAttempts >= 3 && (
                    <Typography color="warning.main" variant="caption" sx={{ mt: 1, display: 'block', fontWeight: 500 }}>
                      ⚠️ Daily resend limit of 3 attempts reached. Please request a new OTP tomorrow.
                    </Typography>
                  )}
                  {verificationError && (
                    <Typography color="error" variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                      {verificationError}
                    </Typography>
                  )}
                </Box>
              )}

              {otpVerified && (
                <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  ✓ Mobile number verified successfully
                </Typography>
              )}
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
                startAdornment: <LocationOnIcon sx={{ mr: 1, fontSize: 18, color: "#212121" }} />,
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
                startAdornment: <PublicIcon sx={{ mr: 1, fontSize: 18, color: "#212121" }} />,
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
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                textTransform: "none",
                "&.Mui-disabled": {
                  background: "#E2E8F0",
                  color: "#94A3B8",
                },
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
              sx={{
                textTransform: "none",
                "&.Mui-disabled": {
                  color: "#94A3B8",
                  borderColor: "#E2E8F0",
                },
              }}
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
