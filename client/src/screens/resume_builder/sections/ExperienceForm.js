import React from "react";
import { TextField, Grid, Stack, Typography, Button, IconButton, Paper, Checkbox, FormControlLabel, Box } from "@mui/material";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useDispatch, useSelector } from "react-redux";
import { updateProfileData } from "../../../redux/profile/ProfileAction";

const QUILL_MODULES = {
  toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link', 'clean'],
  ],
};

const QUILL_FORMATS = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list',
  'link'
];

const ExperienceForm = () => {
  const dispatch = useDispatch();
  const experience = useSelector((state) => state.ProfileReducer.data.experience || []);

  const handleAdd = () => {
    dispatch(updateProfileData({
      experience: [...experience, { id: Date.now(), company: "", role: "", location: "", startDate: "", endDate: "", isCurrent: false, description: "" }]
    }));
  };

  const handleRemove = (id) => {
    dispatch(updateProfileData({
      experience: experience.filter(exp => exp.id !== id)
    }));
  };

  const handleChange = (id, field, value) => {
    dispatch(updateProfileData({
      experience: experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
    }));
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Work Experience</Typography>
        <Button startIcon={<AddIcon />} onClick={handleAdd} size="small" variant="text" sx={{ color: "black" }}>
          Add Experience
        </Button>
      </Stack>

      {experience.map((exp) => (
        <Paper key={exp.id} elevation={0} sx={{ p: 2, border: "1px solid #e2e8f0", borderRadius: 2, position: "relative" }}>
          <IconButton 
            size="small" 
            onClick={() => handleRemove(exp.id)} 
            sx={{ position: "absolute", top: 8, right: 8, color: "#94a3b8", "&:hover": { color: "#ef4444" } }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Name"
                value={exp.company}
                onChange={(e) => handleChange(exp.id, "company", e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Role / Title"
                value={exp.role}
                onChange={(e) => handleChange(exp.id, "role", e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={exp.location}
                onChange={(e) => handleChange(exp.id, "location", e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                value={exp.startDate}
                onChange={(e) => handleChange(exp.id, "startDate", e.target.value)}
                size="small"
                placeholder="e.g. Jan 2020"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                value={exp.isCurrent ? "Present" : exp.endDate}
                disabled={exp.isCurrent}
                onChange={(e) => handleChange(exp.id, "endDate", e.target.value)}
                size="small"
                placeholder="e.g. Dec 2022"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={exp.isCurrent} 
                    onChange={(e) => handleChange(exp.id, "isCurrent", e.target.checked)}
                    size="small"
                  />
                }
                label={<Typography variant="body2">Currently working here</Typography>}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography sx={{ fontSize: "0.85rem", color: "text.secondary", mb: 1 }}>Description / Key Achievements</Typography>
              <Box sx={{
                "& .ql-container": {
                  borderRadius: "0 0 8px 8px",
                  minHeight: "150px",
                  fontSize: "0.9rem",
                  border: "1px solid #e2e8f0",
                  bgcolor: "white"
                },
                "& .ql-toolbar": {
                  borderRadius: "8px 8px 0 0",
                  border: "1px solid #e2e8f0",
                  borderBottom: "none",
                  bgcolor: "#f8fafc"
                },
                "& .ql-editor": {
                  minHeight: "150px",
                  fontFamily: "inherit",
                  color: "#0f172a",
                  wordBreak: "break-word"
                }
              }}>
                <ReactQuill
                  theme="snow"
                  value={exp.description || ""}
                  onChange={(content) => handleChange(exp.id, "description", content)}
                  modules={QUILL_MODULES}
                  formats={QUILL_FORMATS}
                  placeholder="Describe your role, responsibilities, and achievements..."
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>
      ))}

      {experience.length === 0 && (
        <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic", textAlign: "center", py: 4 }}>
          No work experience added yet.
        </Typography>
      )}
    </Stack>
  );
};

export default ExperienceForm;
