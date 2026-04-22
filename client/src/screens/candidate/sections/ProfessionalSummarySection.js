import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import { updateUserProfile } from "../../../redux/user/Action";

const ProfessionalSummarySection = ({ profile, initialAbout, onSuccess, enhancedData }) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [about, setAbout] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [showReviewBanner, setShowReviewBanner] = useState(false);

  useEffect(() => {
    if (!isEditing && initialAbout !== undefined) {
      setAbout(initialAbout || "");
    }
  }, [initialAbout, isEditing]);

  // Handle AI Enhancement
  useEffect(() => {
    if (enhancedData) {
      setAbout(enhancedData);
      setIsEditing(true);
      setShowReviewBanner(true);
    }
  }, [enhancedData]);

  const handleToggleEdit = () => {
    if (isEditing) {
      handleCancel();
    } else {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setAbout(initialAbout || "");
    setIsEditing(false);
    setError(null);
    setFormErrors({});
  };

  const validate = () => {
    const newErrors = {};
    if (!about.trim()) newErrors.about = "Professional summary is required";
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    setError(null);

    try {
      // For now, this section uses Redux update as per UserProfile.js logic
      // In a real scenario, you'd call an API here
      dispatch(updateUserProfile({
        ...profile,
        about: about,
      }));
      
      if (onSuccess) onSuccess("Professional summary updated!");
      setIsEditing(false);
      setShowReviewBanner(false);
    } catch (err) {
      setError("Failed to update summary");
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
          Professional Summary
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
      
      {showReviewBanner && (
        <Alert 
          severity="info" 
          sx={{ mb: 2, bgcolor: "#f5f3ff", border: "1px solid #c4b5fd", "& .MuiAlert-icon": { color: "#6366f1" } }}
          onClose={() => setShowReviewBanner(false)}
        >
          ✨ <strong>AI Enhanced:</strong> We've professionally rewritten your summary. Please review and <strong>Save</strong> to apply changes.
        </Alert>
      )}

      {!isEditing ? (
        <Typography sx={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.6 }}>
          {about || "—"}
        </Typography>
      ) : (
        <Stack spacing={2}>
          <TextField
            fullWidth
            multiline
            rows={4}
            name="about"
            value={about}
            onChange={(e) => {
              setAbout(e.target.value);
              if (formErrors.about) setFormErrors({});
            }}
            error={!!formErrors.about}
            helperText={formErrors.about}
            placeholder="Tell us about yourself..."
          />
          <Box sx={{ display: "flex", gap: 1 }}>
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
          </Box>
        </Stack>
      )}
    </Paper>
  );
};

export default ProfessionalSummarySection;
