import React from "react";
import { TextField, Grid, Stack, Typography, Button, IconButton, Paper } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useDispatch, useSelector } from "react-redux";
import { updateProfileData } from "../../../redux/profile/ProfileAction";

const EducationForm = () => {
  const dispatch = useDispatch();
  const education = useSelector((state) => state.ProfileReducer.data.education || []);

  const handleAdd = () => {
    dispatch(updateProfileData({
      education: [...education, { id: Date.now(), school: "", degree: "", field: "", year: "" }]
    }));
  };

  const handleRemove = (id) => {
    dispatch(updateProfileData({
      education: education.filter(edu => edu.id !== id)
    }));
  };

  const handleChange = (id, field, value) => {
    dispatch(updateProfileData({
      education: education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
    }));
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Education</Typography>
        <Button startIcon={<AddIcon />} onClick={handleAdd} size="small" variant="text" sx={{ color: "black" }}>
          Add Education
        </Button>
      </Stack>

      {education.map((edu, index) => (
        <Paper key={edu.id} elevation={0} sx={{ p: 2, border: "1px solid #e2e8f0", borderRadius: 2, position: "relative" }}>
          <IconButton 
            size="small" 
            onClick={() => handleRemove(edu.id)} 
            sx={{ position: "absolute", top: 8, right: 8, color: "#94a3b8", "&:hover": { color: "#ef4444" } }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="School / University"
                value={edu.school}
                onChange={(e) => handleChange(edu.id, "school", e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Degree"
                value={edu.degree}
                onChange={(e) => handleChange(edu.id, "degree", e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Field of Study"
                value={edu.field}
                onChange={(e) => handleChange(edu.id, "field", e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Year of Completion"
                value={edu.year}
                onChange={(e) => handleChange(edu.id, "year", e.target.value)}
                size="small"
              />
            </Grid>
          </Grid>
        </Paper>
      ))}

      {education.length === 0 && (
        <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic", textAlign: "center", py: 4 }}>
          No education details added yet.
        </Typography>
      )}
    </Stack>
  );
};

export default EducationForm;
