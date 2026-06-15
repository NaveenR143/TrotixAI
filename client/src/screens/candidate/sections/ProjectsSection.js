import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Link,
  Stack,
  Button,
  TextField,
  Grid,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import LinkIcon from "@mui/icons-material/Link";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import * as profileAPI from "../../../api/profileAPI";
import { updateUserProfile } from "../../../redux/user/Action";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { sanitizeHtml } from "../../../utils/htmlSanitizer";

const ProjectsSection = ({ userId, profile, initialProjects, onSuccess, enhancedData }) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [sectionErrors, setSectionErrors] = useState(null);

  const [projects, setProjects] = useState([]);
  const [changedProjects, setChangedProjects] = useState(new Set());
  const [newProjectIndices, setNewProjectIndices] = useState(new Set());
  const [recordLoading, setRecordLoading] = useState({});
  const [recordErrors, setRecordErrors] = useState({});
  const [showReviewBanner, setShowReviewBanner] = useState(false);

  useEffect(() => {
    if (!isEditing && initialProjects) {
      setProjects(JSON.parse(JSON.stringify(initialProjects)));
    }
  }, [initialProjects, isEditing]);

  // Handle AI Enhancement
  useEffect(() => {
    if (enhancedData && Array.isArray(enhancedData)) {
      const updatedProjects = enhancedData.map((newProj, idx) => {
        const existing = projects[idx] || {};
        return {
          ...existing,
          title: newProj.name || existing.title || "Untitled Project",
          description: newProj.enhanced_description || newProj.description || existing.description,
          skills: newProj.technologies || newProj.skills || existing.skills || [],
          startDate: existing.startDate || null,
          endDate: existing.endDate || null,
        };
      });

      setProjects(updatedProjects);
      setIsEditing(true);
      setShowReviewBanner(true);

      // Mark all as changed
      const allIndices = new Set(updatedProjects.map((_, i) => i));
      setChangedProjects(allIndices);
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
    setProjects(JSON.parse(JSON.stringify(initialProjects || [])));
    setChangedProjects(new Set());
    setNewProjectIndices(new Set());
    setRecordErrors({});
    setRecordLoading({});
    setIsEditing(false);
    setSectionErrors(null);
    setShowReviewBanner(false);
  };

  const addProject = () => {
    const newIndex = projects.length;
    setProjects((prev) => [
      ...prev,
      { id: null, title: "", description: "", skills: [], url: "", repoUrl: "", startDate: null, endDate: null }
    ]);
    setNewProjectIndices((prev) => new Set([...prev, newIndex]));
    setChangedProjects((prev) => new Set([...prev, newIndex]));
  };

  const removeProject = (index) => {
    setProjects((prev) => prev.filter((_, i) => i !== index));
    setNewProjectIndices((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
    setChangedProjects((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const updateProjectField = (index, field, value) => {
    const newProjects = [...projects];
    newProjects[index][field] = value;
    setProjects(newProjects);
    setChangedProjects((prev) => new Set([...prev, index]));
  };

  const saveIndividualProject = async (index) => {
    const proj = projects[index];
    const isNewRecord = newProjectIndices.has(index);

    setRecordLoading((prev) => ({ ...prev, [index]: true }));
    setRecordErrors((prev) => ({ ...prev, [index]: null }));

    try {
      const projectData = {
        title: proj.title,
        description: proj.description,
        url: proj.url,
        repo_url: proj.repoUrl,
        skills_used: Array.isArray(proj.skills) ? proj.skills : [],
        start_date: proj.startDate,
        end_date: proj.endDate,
      };

      if (proj.id) {
        projectData.project_id = proj.id;
      }

      const result = await profileAPI.updateProject(userId, projectData);

      if (result.error) {
        setRecordErrors((prev) => ({ ...prev, [index]: result.message }));
      } else {
        if (onSuccess) onSuccess(isNewRecord ? "Project created!" : "Project updated!");

        setChangedProjects((prev) => {
          const s = new Set(prev);
          s.delete(index);
          return s;
        });
        if (isNewRecord) {
          setNewProjectIndices((prev) => {
            const s = new Set(prev);
            s.delete(index);
            return s;
          });
        }

        dispatch(updateUserProfile({
          ...profile,
          projects: projects,
        }));
      }
    } catch (error) {
      setRecordErrors((prev) => ({ ...prev, [index]: error.message || "Failed to save" }));
    } finally {
      setRecordLoading((prev) => ({ ...prev, [index]: false }));
    }
  };

  const saveAllProjects = async () => {
    if (changedProjects.size === 0) return;
    setSectionLoading(true);
    try {
      for (const index of Array.from(changedProjects)) {
        await saveIndividualProject(index);
      }
    } finally {
      setSectionLoading(false);
      if (changedProjects.size === 0) {
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
          <FolderOpenIcon sx={{ fontSize: 20, color: "#6366f1" }} />
          <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px", color: "#0f172a" }}>
            Projects
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
            sx={{
              color: isEditing ? "#ef4444" : "#6366f1",
              textTransform: "none",
              "&.Mui-disabled": {
                background: "#cdcbcbff",
                color: "#cfcfcfff",
                opacity: 0.8,
              },
            }}
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

      {showReviewBanner && projects.length > 0 && (
        <Alert
          severity="info"
          sx={{ mb: 2, bgcolor: "#f5f3ff", border: "1px solid #c4b5fd", "& .MuiAlert-icon": { color: "#6366f1" } }}
          onClose={() => setShowReviewBanner(false)}
        >
          ✨ <strong>AI Enhanced:</strong> We've professionally rewritten your projects. Please review and <strong>Save</strong> each record.
        </Alert>
      )}

      {!isEditing ? (
        <Box>
          {(!projects || projects.length === 0) ? (
            <Typography sx={{ fontSize: "0.85rem", color: "#94a3b8", fontStyle: "italic" }}>
              No projects added yet.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {projects.map((project, index) => (
                <Paper
                  key={project?.id ?? index}
                  variant="outlined"
                  sx={{ p: 2.5, bgcolor: "#f8fafc", borderStyle: "dashed" }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                    <Typography sx={{ fontWeight: 700, mb: 0.5, textTransform: "uppercase", letterSpacing: "0.5px", fontSize: "0.95rem", color: "#0f172a" }}>
                      {project.title || "Untitled Project"}
                    </Typography>
                    <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                      {project.startDate ? new Date(project.startDate).toLocaleDateString("en-US", { year: "numeric", month: "short" }) : ""}
                      {project.endDate ? ` - ${new Date(project.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })}` : project.startDate ? " - Present" : ""}
                    </Typography>
                  </Box>

                  {project.description && (
                    <Typography
                      sx={{
                        fontSize: "0.9rem",
                        color: "text.primary",
                        lineHeight: 1.6,
                        mb: 1,
                        "& ul, & ol": { pl: 3, my: 1 },
                        "& li": { mb: 0.5 },
                        "& p": { my: 0.5 }
                      }}
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(project.description) }}
                    />
                  )}

                  {project.skills && project.skills.length > 0 && (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
                      {project.skills.map((skill) => (
                        <Chip
                          key={skill}
                          label={skill}
                          size="small"
                          sx={{ bgcolor: "#ede9fe", color: "#4f46e5", fontWeight: 600 }}
                        />
                      ))}
                    </Box>
                  )}

                  {(project.url || project.repoUrl) && (
                    <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                      {project.url && (
                        <Link href={project.url} target="_blank" rel="noopener noreferrer" underline="hover" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <LinkIcon sx={{ fontSize: 16 }} />
                          <Typography sx={{ fontSize: "0.85rem", color: "#2563eb" }}>Live link</Typography>
                        </Link>
                      )}
                      {project.repoUrl && (
                        <Link href={project.repoUrl} target="_blank" rel="noopener noreferrer" underline="hover" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <LinkIcon sx={{ fontSize: 16 }} />
                          <Typography sx={{ fontSize: "0.85rem", color: "#2563eb" }}>Repository</Typography>
                        </Link>
                      )}
                    </Stack>
                  )}
                </Paper>
              ))}
            </Stack>
          )}
        </Box>
      ) : (
        <Stack spacing={2}>
          {projects.map((proj, idx) => (
            <Paper key={idx} variant="outlined" sx={{ p: 2, bgcolor: "#f8fafc", borderStyle: "dashed", border: newProjectIndices.has(idx) ? "2px dashed #10b981" : "1px dashed #e2e8f0" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                {newProjectIndices.has(idx) && <Chip label="🆕 NEW PROJECT" size="small" sx={{ bgcolor: "#d1fae5", color: "#059669", fontWeight: 700 }} />}
                <IconButton size="small" onClick={() => removeProject(idx)} sx={{ color: "#f43f5e", ml: "auto" }}>
                  <DeleteIcon fontSize="inherit" />
                </IconButton>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Project Title" value={proj.title} onChange={(e) => updateProjectField(idx, "title", e.target.value)} size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Live URL" value={proj.url || ""} onChange={(e) => updateProjectField(idx, "url", e.target.value)} size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Repo URL" value={proj.repoUrl || ""} onChange={(e) => updateProjectField(idx, "repoUrl", e.target.value)} size="small" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Start Date"
                    value={proj.startDate ? dayjs(proj.startDate) : null}
                    onChange={(val) => updateProjectField(idx, "startDate", val ? val.format("YYYY-MM-DD") : "")}
                    format="DD/MM/YYYY"
                    slotProps={{ textField: { fullWidth: true, size: "small", InputLabelProps: { shrink: true } } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="End Date"
                    value={proj.endDate ? dayjs(proj.endDate) : null}
                    onChange={(val) => updateProjectField(idx, "endDate", val ? val.format("YYYY-MM-DD") : "")}
                    format="DD/MM/YYYY"
                    slotProps={{ textField: { fullWidth: true, size: "small", InputLabelProps: { shrink: true } } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography sx={{ fontSize: "0.85rem", color: "text.secondary", mb: 1 }}>Description</Typography>
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
                      onChange={(content) => updateProjectField(idx, "description", content)}
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, false] }],
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                          ['link', 'clean'],
                        ],
                      }}
                      formats={[
                        'header',
                        'bold', 'italic', 'underline', 'strike',
                        'list',
                        'link'
                      ]}
                      placeholder="Describe the project, technologies used, and your contribution..."
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Technologies (comma separated)" value={Array.isArray(proj.skills) ? proj.skills.join(", ") : ""} onChange={(e) => updateProjectField(idx, "skills", e.target.value.split(",").map(s => s.trim()))} size="small" />
                </Grid>

                {recordErrors?.[idx] && <Grid item xs={12}><Alert severity="error" sx={{ fontSize: "0.85rem" }}>{recordErrors[idx]}</Alert></Grid>}
                {changedProjects.has(idx) && !recordErrors?.[idx] && <Grid item xs={12}><Typography sx={{ fontSize: "0.85rem", color: "#f59e0b" }}>⚠️ Unsaved changes</Typography></Grid>}

                <Grid item xs={12}>
                  <Button
                    variant="contained" size="small" onClick={() => saveIndividualProject(idx)}
                    startIcon={recordLoading?.[idx] ? <CircularProgress size={16} /> : <SaveIcon />}
                    disabled={recordLoading?.[idx] || !changedProjects.has(idx)}
                    sx={{
                      background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                      textTransform: "none",
                      "&.Mui-disabled": {
                        background: "#cdcbcbff",
                        color: "#cfcfcfff",
                        opacity: 0.8,
                      },
                    }}
                  >
                    {recordLoading?.[idx] ? "Saving..." : "Save"}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          ))}
          <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={addProject} sx={{ color: "#6366f1", borderColor: "#c4b5fd", alignSelf: "flex-start", textTransform: "none" }}>Add Project</Button>
          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            <Button
              variant="contained" size="small" onClick={saveAllProjects}
              startIcon={sectionLoading ? <CircularProgress size={16} /> : <SaveIcon />}
              disabled={sectionLoading || changedProjects.size === 0}
              sx={{
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                textTransform: "none",
                "&.Mui-disabled": {
                  background: "#cdcbcbff",
                  color: "#cfcfcfff",
                  opacity: 0.8,
                },
              }}
            >
              Save All
            </Button>
            <Button
              variant="outlined" size="small" onClick={handleCancel} startIcon={<CancelIcon />} disabled={sectionLoading}
              sx={{
                textTransform: "none",
                "&.Mui-disabled": {
                  background: "#cdcbcbff",
                  color: "#cfcfcfff",
                  opacity: 0.8,
                },
              }}
            >
              Cancel
            </Button>
          </Box>
        </Stack>
      )}
    </Paper>
  );
};

export default ProjectsSection;
