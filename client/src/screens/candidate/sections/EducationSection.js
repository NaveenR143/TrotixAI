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
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SchoolIcon from "@mui/icons-material/School";
import * as profileAPI from "../../../api/profileAPI";
import { updateUserProfile } from "../../../redux/user/Action";

const EducationSection = ({ userId, profile, initialEducation, onSuccess, enhancedData }) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [sectionErrors, setSectionErrors] = useState(null);
  
  const [education, setEducation] = useState([]);
  const [changedEducation, setChangedEducation] = useState(new Set());
  const [newEducationIndices, setNewEducationIndices] = useState(new Set());
  const [recordLoading, setRecordLoading] = useState({});
  const [recordErrors, setRecordErrors] = useState({});
  const [showReviewBanner, setShowReviewBanner] = useState(false);

  useEffect(() => {
    if (!isEditing && initialEducation) {
      setEducation(JSON.parse(JSON.stringify(initialEducation)));
    }
  }, [initialEducation, isEditing]);

  // Handle AI Enhancement
  useEffect(() => {
    if (enhancedData && Array.isArray(enhancedData)) {
      const updatedEducation = enhancedData.map((newEdu, idx) => {
        const existing = education[idx] || {};
        return {
          ...existing,
          school: newEdu.school || newEdu.institution || existing.school,
          degree: newEdu.degree || existing.degree,
          field: newEdu.field || newEdu.field_of_study || existing.field,
          year: newEdu.year || newEdu.end_year || existing.year,
        };
      });
      
      setEducation(updatedEducation);
      setIsEditing(true);
      setShowReviewBanner(true);
      
      // Mark all as changed
      const allIndices = new Set(updatedEducation.map((_, i) => i));
      setChangedEducation(allIndices);
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
    setEducation(JSON.parse(JSON.stringify(initialEducation || [])));
    setChangedEducation(new Set());
    setNewEducationIndices(new Set());
    setRecordErrors({});
    setRecordLoading({});
    setIsEditing(false);
    setSectionErrors(null);
  };

  const addEducation = () => {
    const newIndex = education.length;
    setEducation((prev) => [
      ...prev,
      { id: null, school: "", degree: "", field: "", grade: "", year: "", isCurrent: false, description: "" }
    ]);
    setNewEducationIndices((prev) => new Set([...prev, newIndex]));
    setChangedEducation((prev) => new Set([...prev, newIndex]));
  };

  const removeEducation = (index) => {
    setEducation((prev) => prev.filter((_, i) => i !== index));
    setNewEducationIndices((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
    setChangedEducation((prev) => {
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

  const updateEducation = (index, field, value) => {
    const newEdu = [...education];
    newEdu[index][field] = value;
    setEducation(newEdu);
    setChangedEducation((prev) => new Set([...prev, index]));
  };

  const saveIndividualEducation = async (index) => {
    const edu = education[index];
    const isNewRecord = newEducationIndices.has(index);

    setRecordLoading((prev) => ({ ...prev, [index]: true }));
    setRecordErrors((prev) => ({ ...prev, [index]: null }));

    try {
      const educationData = {
        institution: edu.school,
        degree: edu.degree,
        field_of_study: edu.field,
        grade: edu.grade,
        end_year: edu.year,
      };

      if (edu.id) {
        educationData.education_id = edu.id;
      }

      const result = await profileAPI.updateEducation(userId, educationData);

      if (result.error) {
        setRecordErrors((prev) => ({ ...prev, [index]: result.message }));
      } else {
        if (onSuccess) onSuccess(isNewRecord ? "Created successfully!" : "Updated successfully!");
        
        setChangedEducation((prev) => {
          const s = new Set(prev);
          s.delete(index);
          return s;
        });
        if (isNewRecord) {
          setNewEducationIndices((prev) => {
            const s = new Set(prev);
            s.delete(index);
            return s;
          });
        }

        dispatch(updateUserProfile({
          ...profile,
          education: education,
        }));
      }
    } catch (error) {
      setRecordErrors((prev) => ({ ...prev, [index]: error.message || "Failed to save" }));
    } finally {
      setRecordLoading((prev) => ({ ...prev, [index]: false }));
    }
  };

  const saveAllEducation = async () => {
    if (changedEducation.size === 0) return;
    setSectionLoading(true);
    try {
      for (const index of changedEducation) {
        await saveIndividualEducation(index);
      }
    } finally {
      setSectionLoading(false);
      if (changedEducation.size === 0) {
        setShowReviewBanner(false);
      }
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
          <SchoolIcon sx={{ fontSize: 20, color: "#0ea5e9" }} />
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#0f172a" }}>
            Education
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

      {showReviewBanner && (
        <Alert 
          severity="info" 
          sx={{ mb: 2, bgcolor: "#f5f3ff", border: "1px solid #c4b5fd", "& .MuiAlert-icon": { color: "#6366f1" } }}
          onClose={() => setShowReviewBanner(false)}
        >
          ✨ <strong>AI Enhanced:</strong> We've professionally rewritten your education details. Please review and <strong>Save</strong> each record.
        </Alert>
      )}

      {!isEditing ? (
        <Box>
          {(!education || education.length === 0) ? (
            <Typography sx={{ fontSize: "0.85rem", color: "#94a3b8", fontStyle: "italic" }}>
              No education entries added yet.
            </Typography>
          ) : (
            education.map((edu, idx) => (
              <Paper
                key={idx}
                variant="outlined"
                sx={{ p: 2, mb: 2, bgcolor: "#f8fafc", borderStyle: "dashed" }}
              >
                <Typography sx={{ fontWeight: 600, color: "#0f172a", mb: 0.5 }}>
                  {edu.degree}
                </Typography>
                <Typography sx={{ fontSize: "0.85rem", color: "#64748b" }}>{edu.school}</Typography>
                {edu.year && (
                  <Typography sx={{ fontSize: "0.85rem", color: "#94a3b8", mt: 0.5 }}>
                    Year: {edu.year}
                  </Typography>
                )}
              </Paper>
            ))
          )}
        </Box>
      ) : (
        <Stack spacing={2}>
          {education.map((edu, idx) => (
            <Paper key={idx} variant="outlined" sx={{ p: 2, bgcolor: "#f8fafc", borderStyle: "dashed", border: newEducationIndices.has(idx) ? "2px dashed #0ea5e9" : "1px dashed #e2e8f0" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                {newEducationIndices.has(idx) && <Chip label="🆕 NEW RECORD" size="small" sx={{ bgcolor: "#dbeafe", color: "#0369a1", fontWeight: 700 }} />}
                <IconButton size="small" onClick={() => removeEducation(idx)} sx={{ color: "#f43f5e", ml: "auto" }}>
                  <DeleteIcon fontSize="inherit" />
                </IconButton>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Institution" value={edu.school} onChange={(e) => updateEducation(idx, "school", e.target.value)} size="small" />
                </Grid>
                <Grid item xs={12} sm={7}>
                  <TextField fullWidth label="Degree" value={edu.degree} onChange={(e) => updateEducation(idx, "degree", e.target.value)} size="small" />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField fullWidth label="Year" value={edu.year} onChange={(e) => updateEducation(idx, "year", e.target.value)} size="small" />
                </Grid>
                {recordErrors?.[idx] && <Grid item xs={12}><Alert severity="error" sx={{ fontSize: "0.85rem" }}>{recordErrors[idx]}</Alert></Grid>}
                {changedEducation.has(idx) && !recordErrors?.[idx] && <Grid item xs={12}><Typography sx={{ fontSize: "0.85rem", color: "#f59e0b" }}>⚠️ Unsaved changes</Typography></Grid>}
                <Grid item xs={12}>
                  <Button
                    variant="contained" size="small" onClick={() => saveIndividualEducation(idx)}
                    startIcon={recordLoading?.[idx] ? <CircularProgress size={16} /> : <SaveIcon />}
                    disabled={recordLoading?.[idx] || !changedEducation.has(idx)}
                    sx={{ background: recordLoading?.[idx] ? "#cbd5e1" : changedEducation.has(idx) ? "linear-gradient(135deg, #0ea5e9, #0284c7)" : "#cbd5e1" }}
                  >
                    {recordLoading?.[idx] ? "Saving..." : "Save Record"}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          ))}
          <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={addEducation} sx={{ color: "#6366f1", borderColor: "#c4b5fd", alignSelf: "flex-start" }}>Add Entry</Button>
          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            <Button
              variant="contained" size="small" onClick={saveAllEducation}
              startIcon={sectionLoading ? <CircularProgress size={16} /> : <SaveIcon />}
              disabled={sectionLoading || changedEducation.size === 0}
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

export default EducationSection;
