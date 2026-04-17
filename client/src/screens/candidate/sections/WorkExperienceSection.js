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
  Stack,
  IconButton,
  Chip,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { calculateExperienceDuration } from "../utils/profileUtils";
import * as profileAPI from "../../../api/profileAPI";
import { updateUserProfile } from "../../../redux/user/Action";

const WorkExperienceSection = ({ userId, profile, initialExperiences, onSuccess }) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [sectionErrors, setSectionErrors] = useState(null);
  
  const [experiences, setExperiences] = useState([]);
  const [changedExperience, setChangedExperience] = useState(new Set());
  const [newExperienceIndices, setNewExperienceIndices] = useState(new Set());
  const [recordLoading, setRecordLoading] = useState({});
  const [recordErrors, setRecordErrors] = useState({});

  useEffect(() => {
    if (!isEditing && initialExperiences) {
      setExperiences(JSON.parse(JSON.stringify(initialExperiences)));

      debugger;
    }
  }, [initialExperiences, isEditing]);

  const handleToggleEdit = () => {
    if (isEditing) {
      handleCancel();
    } else {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setExperiences(JSON.parse(JSON.stringify(initialExperiences || [])));
    setChangedExperience(new Set());
    setNewExperienceIndices(new Set());
    setRecordErrors({});
    setRecordLoading({});
    setIsEditing(false);
    setSectionErrors(null);
  };

  const addExperience = () => {
    const newIndex = experiences.length;
    setExperiences((prev) => [
      ...prev,
      { id: null, company_name: "", role: "", location: "", startDate: "", endDate: "", isCurrent: false, description: "", skills: [], achievements: [] }
    ]);
    setNewExperienceIndices((prev) => new Set([...prev, newIndex]));
    setChangedExperience((prev) => new Set([...prev, newIndex]));
  };

  const removeExperience = (index) => {
    setExperiences((prev) => prev.filter((_, i) => i !== index));
    setNewExperienceIndices((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
    setChangedExperience((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
    setRecordErrors((prev) => {
      const newObj = { ...prev };
      delete newObj[index];
      return newObj;
    });
  };

  const updateExperience = (index, field, value) => {
    const newExp = [...experiences];
    newExp[index][field] = value;
    setExperiences(newExp);
    setChangedExperience((prev) => new Set([...prev, index]));
  };

  const saveIndividualExperience = async (index) => {
    const exp = experiences[index];
    const isNewRecord = newExperienceIndices.has(index);

    setRecordLoading((prev) => ({ ...prev, [index]: true }));
    setRecordErrors((prev) => ({ ...prev, [index]: null }));

    try {
      const experienceData = {
        title: exp.role,
        location: exp.location,
        start_date: exp.startDate,
        end_date: exp.endDate,
        is_current: exp.isCurrent,
        description: exp.description,
        skills_used: exp.skills || [],
        achievements: exp.achievements || [],
      };

      if (exp.id) {
        experienceData.experience_id = exp.id;
      }

      const result = await profileAPI.updateWorkExperience(userId, experienceData);

      if (result.error) {
        setRecordErrors((prev) => ({ ...prev, [index]: result.message }));
      } else {
        if (onSuccess) onSuccess(isNewRecord ? "Created successfully!" : "Updated successfully!");
        
        // Remove tracking
        setChangedExperience((prev) => {
          const s = new Set(prev);
          s.delete(index);
          return s;
        });
        if (isNewRecord) {
          setNewExperienceIndices((prev) => {
            const s = new Set(prev);
            s.delete(index);
            return s;
          });
        }

        // Update Redux
        dispatch(updateUserProfile({
          ...profile,
          experience: experiences,
        }));
      }
    } catch (error) {
      setRecordErrors((prev) => ({ ...prev, [index]: error.message || "Failed to save" }));
    } finally {
      setRecordLoading((prev) => ({ ...prev, [index]: false }));
    }
  };

  const saveAllExperiences = async () => {
    if (changedExperience.size === 0) return;
    setSectionLoading(true);
    try {
      for (const index of changedExperience) {
        await saveIndividualExperience(index);
      }
    } finally {
      setSectionLoading(false);
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
          <BusinessIcon sx={{ fontSize: 20, color: "#6366f1" }} />
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
            Work Experience
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {sectionLoading && <CircularProgress size={20} />}
          <Button
            size="small"
            variant={isEditing ? "outlined" : "text"}
            startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
            onClick={handleToggleEdit}
            disabled={sectionLoading}
            sx={{ color: isEditing ? "#ef4444" : "#6366f1" }}
          >
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </Box>
      </Box>

      {sectionErrors && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {sectionErrors}
        </Alert>
      )}

      {!isEditing ? (
        <Box>
          {(!experiences || experiences.length === 0) ? (
            <Typography sx={{ fontSize: "0.85rem", color: "text.secondary", fontStyle: "italic" }}>
              No work experience added yet.
            </Typography>
          ) : (
            experiences.map((exp, idx) => (
              <Paper
                key={idx}
                variant="outlined"
                sx={{ p: 2.5, mb: 2, bgcolor: "#f8fafc", borderStyle: "dashed" }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                  <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
                    {exp.role}
                  </Typography>
                  {exp.isCurrent && (
                    <Chip label="Currently Working" size="small" sx={{ bgcolor: "#d1fae5", color: "#059669", fontWeight: 600, height: 24 }} />
                  )}
                </Box>
                <Typography sx={{ fontSize: "0.9rem", color: "#6366f1", fontWeight: 600, mb: 0.5 }}>
                  {exp.company_name}
                </Typography>
                {exp.location && (
                  <Typography sx={{ fontSize: "0.85rem", color: "text.secondary", mb: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}>
                    <LocationOnIcon sx={{ fontSize: 16, color: "#f59e0b" }} />
                    {exp.location}
                  </Typography>
                )}
                <Typography sx={{ fontSize: "0.85rem", color: "text.secondary", mb: 1 }}>
                  {calculateExperienceDuration(exp.startDate, exp.endDate, exp.isCurrent)}
                  {exp.startDate &&
                    ` • ${new Date(exp.startDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })} to ${exp.isCurrent ? "Present" : new Date(exp.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })}`}
                </Typography>
                {exp.description && (
                  <Typography sx={{ fontSize: "0.9rem", color: "text.primary", lineHeight: 1.5 }}>
                    {exp.description}
                  </Typography>
                )}
              </Paper>
            ))
          )}
        </Box>
      ) : (
        <Stack spacing={2}>
          {experiences.map((exp, idx) => (
            <Paper key={idx} variant="outlined" sx={{ p: 2, bgcolor: "#f8fafc", borderStyle: "dashed", border: newExperienceIndices.has(idx) ? "2px dashed #10b981" : "1px dashed #e2e8f0" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                {newExperienceIndices.has(idx) && <Chip label="🆕 NEW RECORD" size="small" sx={{ bgcolor: "#d1fae5", color: "#059669", fontWeight: 700 }} />}
                <IconButton size="small" onClick={() => removeExperience(idx)} sx={{ color: "#f43f5e", ml: "auto" }}>
                  <DeleteIcon fontSize="inherit" />
                </IconButton>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Company" value={exp.company_name} onChange={(e) => updateExperience(idx, "company_name", e.target.value)} size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Role" value={exp.role} onChange={(e) => updateExperience(idx, "role", e.target.value)} size="small" />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Location" value={exp.location} onChange={(e) => updateExperience(idx, "location", e.target.value)} size="small" InputProps={{ startAdornment: <LocationOnIcon sx={{ mr: 1, fontSize: 18, color: "#64748b" }} /> }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker 
                    label="Start Date" 
                    value={exp.startDate ? dayjs(exp.startDate) : null} 
                    onChange={(val) => updateExperience(idx, "startDate", val ? val.format("YYYY-MM-DD") : "")} 
                    format="DD/MM/YYYY" 
                    slotProps={{ textField: { fullWidth: true, size: "small", InputLabelProps: { shrink: true } } }} 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker 
                    label="End Date" 
                    value={exp.endDate ? dayjs(exp.endDate) : null} 
                    onChange={(val) => updateExperience(idx, "endDate", val ? val.format("YYYY-MM-DD") : "")} 
                    format="DD/MM/YYYY" 
                    disabled={exp.isCurrent} 
                    slotProps={{ textField: { fullWidth: true, size: "small", InputLabelProps: { shrink: true } } }} 
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <input type="checkbox" checked={exp.isCurrent || false} onChange={(e) => updateExperience(idx, "isCurrent", e.target.checked)} style={{ cursor: "pointer" }} />
                    <Typography sx={{ fontSize: "0.9rem", color: "#475569" }}>Currently Working Here</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={3} label="Description" value={exp.description} onChange={(e) => updateExperience(idx, "description", e.target.value)} size="small" />
                </Grid>
                {recordErrors?.[idx] && <Grid item xs={12}><Alert severity="error" sx={{ fontSize: "0.85rem" }}>{recordErrors[idx]}</Alert></Grid>}
                {changedExperience.has(idx) && !recordErrors?.[idx] && <Grid item xs={12}><Typography sx={{ fontSize: "0.85rem", color: "#f59e0b" }}>⚠️ Unsaved changes</Typography></Grid>}
                <Grid item xs={12}>
                  <Button
                    variant="contained" size="small" onClick={() => saveIndividualExperience(idx)}
                    startIcon={recordLoading?.[idx] ? <CircularProgress size={16} /> : <SaveIcon />}
                    disabled={recordLoading?.[idx] || !changedExperience.has(idx)}
                    sx={{ background: recordLoading?.[idx] ? "#cbd5e1" : changedExperience.has(idx) ? "linear-gradient(135deg, #10b981, #059669)" : "#cbd5e1" }}
                  >
                    {recordLoading?.[idx] ? "Saving..." : "Save Record"}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          ))}
          <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={addExperience} sx={{ color: "#6366f1", borderColor: "#c4b5fd", alignSelf: "flex-start" }}>Add Entry</Button>
          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            <Button
              variant="contained" size="small" onClick={saveAllExperiences}
              startIcon={sectionLoading ? <CircularProgress size={16} /> : <SaveIcon />}
              disabled={sectionLoading || changedExperience.size === 0}
              sx={{ background: sectionLoading ? "#cbd5e1" : "linear-gradient(135deg, #6366f1, #4f46e5)" }}
            >
              Save All
            </Button>
            <Button variant="outlined" size="small" onClick={handleCancel} startIcon={<CancelIcon />} disabled={sectionLoading}>Cancel</Button>
          </Box>
        </Stack>
      )}
    </Paper>
  );
};

export default WorkExperienceSection;
