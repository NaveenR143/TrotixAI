import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Stack,
  Chip,
  Autocomplete,
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import * as profileAPI from "../../../api/profileAPI";
import { updateUserProfile } from "../../../redux/user/Action";

const LanguagesSection = ({ userId, profile, initialLanguages, onSuccess }) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [languagesDropdown, setLanguagesDropdown] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!isEditing && initialLanguages) {
      setLanguages(Array.isArray(initialLanguages) ? [...initialLanguages] : []);
    }
  }, [initialLanguages, isEditing]);

  const fetchDropdownData = async () => {
    setDropdownLoading(true);
    try {
      const result = await profileAPI.fetchLanguagesDropdown();
      if (!result.error) {
        setLanguagesDropdown(result.data);
      }
    } catch (err) {
      console.error("Error fetching languages dropdown:", err);
    } finally {
      setDropdownLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    if (languagesDropdown.length === 0) {
      fetchDropdownData();
    }
  };

  const handleCancel = () => {
    setLanguages(Array.isArray(initialLanguages) ? [...initialLanguages] : []);
    setIsEditing(false);
    setError(null);
    setFormErrors({});
  };

  const handleLanguageChange = (newLanguages) => {
    setLanguages(newLanguages);
    if (formErrors.languages) {
      setFormErrors((prev) => ({ ...prev, languages: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (languages.length === 0) newErrors.languages = "Add at least one language";
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    setError(null);

    try {
      const result = await profileAPI.updateLanguages(userId, languages);
      if (result.error) {
        setError(result.message);
      } else {
        if (onSuccess) onSuccess("Languages updated successfully!");
        dispatch(updateUserProfile({
          ...profile,
          languages: languages,
        }));
        setIsEditing(false);
      }
    } catch (err) {
      setError("Failed to update languages");
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
          <LanguageIcon sx={{ fontSize: 20, color: "#0ea5e9" }} />
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#0f172a" }}>
            Languages
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {loading && <CircularProgress size={20} />}
          <Button
            size="small"
            variant={isEditing ? "outlined" : "text"}
            startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
            onClick={isEditing ? handleCancel : handleEditClick}
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
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {languages && languages.length > 0 ? (
            languages.map((lang) => (
              <Chip
                key={lang}
                label={lang}
                sx={{ bgcolor: "#f0f9ff", color: "#0369a1", fontWeight: 600 }}
              />
            ))
          ) : (
            <Typography sx={{ fontSize: "0.85rem", color: "#94a3b8", fontStyle: "italic" }}>
              No languages added yet.
            </Typography>
          )}
        </Box>
      ) : (
        <Stack spacing={2}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              p: 2,
              borderRadius: 1.5,
              border: formErrors.languages ? "1px solid #ef4444" : "1px solid #e2e8f0",
              bgcolor: "#f8fafc",
              minHeight: 60,
            }}
          >
            {languages.map((lang) => (
              <Chip
                key={lang}
                label={lang}
                onDelete={() => handleLanguageChange(languages.filter((l) => l !== lang))}
                sx={{
                  bgcolor: "#f0f9ff",
                  color: "#0369a1",
                  fontWeight: 600,
                  "& .MuiChip-deleteIcon": { color: "#0ea5e9" },
                }}
              />
            ))}
          </Box>
          {formErrors.languages && (
            <Typography sx={{ fontSize: "0.75rem", color: "#ef4444" }}>
              {formErrors.languages}
            </Typography>
          )}
          <Autocomplete
            freeSolo
            loading={dropdownLoading}
            options={(languagesDropdown || [])
              .map((l) => l.language)
              .filter((l) => !languages.includes(l))}
            onChange={(e, value) => {
              if (value && !languages.includes(value)) {
                handleLanguageChange([...languages, value]);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Add languages..."
                size="small"
                disabled={dropdownLoading}
                helperText="Type and press Enter to add a new language"
              />
            )}
          />
          <Box sx={{ display: "flex", gap: 1 }}>
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
          </Box>
        </Stack>
      )}
    </Paper>
  );
};

export default LanguagesSection;
