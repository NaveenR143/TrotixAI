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
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CakeIcon from "@mui/icons-material/Cake";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import * as profileAPI from "../../../api/profileAPI";
import { updateUserProfile } from "../../../redux/user/Action";

const PersonalDetailsSection = ({ userId, profile, initialData, onSuccess }) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    date_of_birth: "",
    maritalStatus: "",
    gender: "",
    currentLocation: "",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!isEditing && initialData) {
      setFormData({
        date_of_birth: initialData.date_of_birth || "",
        maritalStatus: initialData.maritalStatus || "",
        gender: initialData.gender || "",
        currentLocation: initialData.currentLocation || "",
      });
    }
  }, [initialData, isEditing]);

  const handleToggleEdit = () => {
    if (isEditing) {
      handleCancel();
    } else {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setFormData({
      date_of_birth: initialData.date_of_birth || "",
      maritalStatus: initialData.maritalStatus || "",
      gender: initialData.gender || "",
      currentLocation: initialData.currentLocation || "",
    });
    setIsEditing(false);
    setError(null);
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors({});
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.date_of_birth) newErrors.date_of_birth = "Date of birth is required";
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    setError(null);

    try {
      const dataToUpdate = {
        date_of_birth: formData.date_of_birth,
        marital_status: formData.maritalStatus,
        gender: formData.gender,
        current_location: formData.currentLocation,
      };

      const result = await profileAPI.updatePersonalInfo(userId, dataToUpdate);

      if (result.error) {
        setError(result.message);
      } else {
        if (onSuccess) onSuccess("Personal details updated successfully!");
        
        dispatch(updateUserProfile({
          ...profile,
          date_of_birth: formData.date_of_birth,
          maritalStatus: formData.maritalStatus,
          gender: formData.gender,
          currentLocation: formData.currentLocation,
        }));

        setIsEditing(false);
      }
    } catch (err) {
      setError("Failed to update personal details");
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
          <PersonIcon sx={{ fontSize: 20, color: "#64748b" }} />
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#0f172a" }}>
            Personal Details
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
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", mb: 0.5, textTransform: "uppercase" }}>
                Date of Birth
              </Typography>
              <Typography sx={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: 500 }}>
                {formData.date_of_birth || "—"}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", mb: 0.5, textTransform: "uppercase" }}>
                Marital Status
              </Typography>
              <Typography sx={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: 500 }}>
                {formData.maritalStatus || "—"}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", mb: 0.5, textTransform: "uppercase" }}>
                Gender
              </Typography>
              <Typography sx={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: 500 }}>
                {formData.gender || "—"}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", mb: 0.5, textTransform: "uppercase" }}>
                Current Location
              </Typography>
              <Typography sx={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: 500 }}>
                {formData.currentLocation || "—"}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Date of Birth"
              value={formData.date_of_birth ? dayjs(formData.date_of_birth) : null}
              onChange={(newValue) => {
                setFormData(prev => ({ ...prev, date_of_birth: newValue ? newValue.format("YYYY-MM-DD") : "" }));
              }}
              disableFuture
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                  error: !!formErrors.date_of_birth,
                  helperText: formErrors.date_of_birth,
                  InputProps: {
                    startAdornment: <CakeIcon sx={{ mr: 1, fontSize: 18, color: "#64748b" }} />,
                  },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Marital Status"
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleInputChange}
              size="small"
              InputProps={{
                startAdornment: <FamilyRestroomIcon sx={{ mr: 1, fontSize: 18, color: "#64748b" }} />,
              }}
            >
              <MenuItem value="">Select</MenuItem>
              <MenuItem value="Single">Single</MenuItem>
              <MenuItem value="Married">Married</MenuItem>
              <MenuItem value="Divorced">Divorced</MenuItem>
              <MenuItem value="Widowed">Widowed</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              size="small"
              InputProps={{
                startAdornment: <PersonIcon sx={{ mr: 1, fontSize: 18, color: "#64748b" }} />,
              }}
            >
              <MenuItem value="">Select</MenuItem>
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
              <MenuItem value="prefer not to say">Prefer not to say</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Current Location"
              name="currentLocation"
              value={formData.currentLocation}
              onChange={handleInputChange}
              size="small"
              InputProps={{
                startAdornment: <LocationOnIcon sx={{ mr: 1, fontSize: 18, color: "#64748b" }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              onClick={handleSave}
              startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
              disabled={loading}
              sx={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}
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

export default PersonalDetailsSection;
