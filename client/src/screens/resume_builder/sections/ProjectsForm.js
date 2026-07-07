import React from "react";
import { TextField, Grid, Stack, Typography, Button, IconButton, Paper, Box } from "@mui/material";
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

const ProjectsForm = () => {
  const dispatch = useDispatch();
  const projects = useSelector((state) => state.ProfileReducer.data.projects || []);

  const handleAdd = () => {
    dispatch(updateProfileData({
      projects: [...projects, { id: Date.now(), name: "", link: "", year: "", description: "" }]
    }));
  };

  const handleRemove = (id) => {
    dispatch(updateProfileData({
      projects: projects.filter(proj => proj.id !== id)
    }));
  };

  const handleChange = (id, field, value) => {
    dispatch(updateProfileData({
      projects: projects.map(proj => proj.id === id ? { ...proj, [field]: value } : proj)
    }));
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Projects</Typography>
        <Button startIcon={<AddIcon />} onClick={handleAdd} size="small" variant="text" sx={{ color: "black" }}>
          Add Project
        </Button>
      </Stack>

      {projects.map((proj) => (
        <Paper key={proj.id} elevation={0} sx={{ p: 2, border: "1px solid #e2e8f0", borderRadius: 2, position: "relative" }}>
          <IconButton 
            size="small" 
            onClick={() => handleRemove(proj.id)} 
            sx={{ position: "absolute", top: 8, right: 8, color: "#94a3b8", "&:hover": { color: "#ef4444" } }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Project Name"
                value={proj.name}
                onChange={(e) => handleChange(proj.id, "name", e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Year"
                value={proj.year}
                onChange={(e) => handleChange(proj.id, "year", e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Link (e.g. GitHub, Demo)"
                value={proj.link}
                onChange={(e) => handleChange(proj.id, "link", e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography sx={{ fontSize: "0.85rem", color: "text.secondary", mb: 1 }}>Project Description</Typography>
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
                  value={proj.description || ""}
                  onChange={(content) => handleChange(proj.id, "description", content)}
                  modules={QUILL_MODULES}
                  formats={QUILL_FORMATS}
                  placeholder="Describe the project, technologies used, and your contribution..."
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>
      ))}

      {projects.length === 0 && (
        <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic", textAlign: "center", py: 4 }}>
          No projects added yet. Click "Add Project" to get started.
        </Typography>
      )}
    </Stack>
  );
};

export default ProjectsForm;
