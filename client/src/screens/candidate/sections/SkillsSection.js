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
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import * as profileAPI from "../../../api/profileAPI";
import { updateUserProfile } from "../../../redux/user/Action";

const SkillsSection = ({ userId, profile, initialSkills, onSuccess }) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [skills, setSkills] = useState([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [skillsDropdown, setSkillsDropdown] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!isEditing && initialSkills) {
      setSkills(Array.isArray(initialSkills) ? [...initialSkills] : []);
    }
  }, [initialSkills, isEditing]);

  const fetchDropdownData = async () => {
    setDropdownLoading(true);
    try {
      const result = await profileAPI.fetchSkillsDropdown();
      if (!result.error) {
        setSkillsDropdown(result.data);
      }
    } catch (err) {
      console.error("Error fetching skills dropdown:", err);
    } finally {
      setDropdownLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    if (skillsDropdown.length === 0) {
      fetchDropdownData();
    }
  };

  const handleCancel = () => {
    setSkills(Array.isArray(initialSkills) ? [...initialSkills] : []);
    setIsEditing(false);
    setError(null);
    setFormErrors({});
  };

  const handleSkillChange = (newSkills) => {
    setSkills(newSkills);
    if (formErrors.skills) {
      setFormErrors((prev) => ({ ...prev, skills: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (skills.length === 0) newErrors.skills = "Add at least one skill";
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    setError(null);

    try {
      const result = await profileAPI.updateSkills(userId, skills);
      if (result.error) {
        setError(result.message);
      } else {
        if (onSuccess) onSuccess("Skills updated successfully!");
        dispatch(updateUserProfile({
          ...profile,
          skills: skills,
        }));
        setIsEditing(false);
      }
    } catch (err) {
      setError("Failed to update skills");
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
          <AutoAwesomeIcon sx={{ fontSize: 20, color: "#6366f1" }} />
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#0f172a" }}>
            Skills
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
          {skills && skills.length > 0 ? (
            skills.map((skill) => (
              <Chip
                key={skill}
                label={skill}
                sx={{ bgcolor: "#ede9fe", color: "#4f46e5", fontWeight: 600 }}
              />
            ))
          ) : (
            <Typography sx={{ fontSize: "0.85rem", color: "#94a3b8", fontStyle: "italic" }}>
              No skills added yet.
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
              border: formErrors.skills ? "1px solid #ef4444" : "1px solid #e2e8f0",
              bgcolor: "#f8fafc",
              minHeight: 60,
            }}
          >
            {skills.map((skill) => (
              <Chip
                key={skill}
                label={skill}
                onDelete={() => handleSkillChange(skills.filter((s) => s !== skill))}
                sx={{
                  bgcolor: "#ede9fe",
                  color: "#4f46e5",
                  fontWeight: 600,
                  "& .MuiChip-deleteIcon": { color: "#6366f1" },
                }}
              />
            ))}
          </Box>
          {formErrors.skills && (
            <Typography sx={{ fontSize: "0.75rem", color: "#ef4444" }}>
              {formErrors.skills}
            </Typography>
          )}
          <Autocomplete
            freeSolo
            loading={dropdownLoading}
            options={(skillsDropdown || [])
              .map((s) => s.name)
              .filter((s) => !skills.includes(s))}
            onChange={(e, value) => {
              if (value && !skills.includes(value)) {
                handleSkillChange([...skills, value]);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Add skills..."
                size="small"
                disabled={dropdownLoading}
                helperText="Type and press Enter to add a new skill"
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

export default SkillsSection;
