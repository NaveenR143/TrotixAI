import React, { useState, useEffect } from "react";
import {
  TextField, Stack, Typography, Box, Paper, IconButton, List, ListItem,
  Autocomplete, CircularProgress, Grid, Tooltip
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { updateProfileData } from "../../../redux/profile/ProfileAction";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PsychologyIcon from "@mui/icons-material/Psychology";
import TranslateIcon from "@mui/icons-material/Translate";
import * as profileAPI from "../../../api/profileAPI";
import { toTitleCase } from "../../../utils/stringUtils";

const ReorderableList = ({ items, type, onRemove, onReorder }) => {
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.style.opacity = "0.4";
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = "1";
    setDraggedIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const list = [...items];
    const draggedItem = list[draggedIndex];
    list.splice(draggedIndex, 1);
    list.splice(targetIndex, 0, draggedItem);
    onReorder(list);
  };

  const moveItem = (index, direction) => {
    const list = [...items];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    onReorder(list);
  };

  if (items.length === 0) {
    return (
      <Box
        sx={{
          border: "2px dashed #e2e8f0",
          borderRadius: "12px",
          p: 4,
          textAlign: "center",
          color: "text.secondary",
          bgcolor: "#f8fafc",
          mt: 2,
        }}
      >
        <Typography variant="body2" sx={{ fontStyle: "italic" }}>
          No {type} added yet. Start typing above to add!
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ display: "flex", flexDirection: "column", gap: 1, p: 0, mt: 2 }}>
      {items.map((item, index) => (
        <ListItem
          key={`${item}_${index}`}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: "8px 12px",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            bgcolor: "#ffffff",
            cursor: "grab",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              borderColor: "#6366f1",
              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.05)",
              transform: "translateY(-1px)",
            },
            "&:active": {
              cursor: "grabbing",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <DragIndicatorIcon sx={{ color: "text.secondary", fontSize: 18 }} />
            <Typography variant="body2" sx={{ fontWeight: 500, color: "text.primary" }}>
              {item}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Tooltip title="Move Up">
              <span>
                <IconButton
                  size="small"
                  onClick={() => moveItem(index, -1)}
                  disabled={index === 0}
                  sx={{ color: "text.secondary" }}
                >
                  <ArrowUpwardIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Move Down">
              <span>
                <IconButton
                  size="small"
                  onClick={() => moveItem(index, 1)}
                  disabled={index === items.length - 1}
                  sx={{ color: "text.secondary" }}
                >
                  <ArrowDownwardIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={() => onRemove(item)}
                sx={{
                  color: "#ef4444",
                  "&:hover": { bgcolor: "#fee2e2" },
                }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </ListItem>
      ))}
    </List>
  );
};

const SkillsForm = () => {
  const dispatch = useDispatch();
  const skills = useSelector((state) => state.ProfileReducer.data.skills || []);
  const languages = useSelector((state) => state.ProfileReducer.data.languages || []);

  const [skillInput, setSkillInput] = useState("");
  const [skillsDropdown, setSkillsDropdown] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(false);

  const [langInput, setLangInput] = useState("");
  const [langsDropdown, setLangsDropdown] = useState([]);
  const [langsLoading, setLangsLoading] = useState(false);

  // Load initial dropdown options
  useEffect(() => {
    fetchSkillsOptions("");
    fetchLanguagesOptions("");
  }, []);

  const fetchSkillsOptions = async (search = "") => {
    setSkillsLoading(true);
    try {
      const result = await profileAPI.fetchSkillsDropdown(search);
      if (!result.error) {
        setSkillsDropdown(
          (result.data || []).map((s) =>
            toTitleCase(typeof s === "string" ? s : s.name)
          )
        );
      }
    } catch (err) {
      console.error("Error fetching skills dropdown:", err);
    } finally {
      setSkillsLoading(false);
    }
  };

  const fetchLanguagesOptions = async (search = "") => {
    setLangsLoading(true);
    try {
      const result = await profileAPI.fetchLanguagesDropdown(search);
      if (!result.error) {
        setLangsDropdown(
          (result.data || []).map((l) =>
            toTitleCase(typeof l === "string" ? l : l.language)
          )
        );
      }
    } catch (err) {
      console.error("Error fetching languages dropdown:", err);
    } finally {
      setLangsLoading(false);
    }
  };

  const handleAddSkill = (skill) => {
    const trimmed = toTitleCase(skill.trim());
    if (trimmed && !skills.includes(trimmed)) {
      dispatch(
        updateProfileData({
          skills: [...skills, trimmed],
        })
      );
    }
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    dispatch(
      updateProfileData({
        skills: skills.filter((skill) => skill !== skillToRemove),
      })
    );
  };

  const handleReorderSkills = (newSkills) => {
    dispatch(
      updateProfileData({
        skills: newSkills,
      })
    );
  };

  const handleAddLanguage = (lang) => {
    const trimmed = toTitleCase(lang.trim());
    if (trimmed && !languages.includes(trimmed)) {
      dispatch(
        updateProfileData({
          languages: [...languages, trimmed],
        })
      );
    }
    setLangInput("");
  };

  const handleRemoveLanguage = (langToRemove) => {
    dispatch(
      updateProfileData({
        languages: languages.filter((lang) => lang !== langToRemove),
      })
    );
  };

  const handleReorderLanguages = (newLangs) => {
    dispatch(
      updateProfileData({
        languages: newLangs,
      })
    );
  };

  return (
    <Grid container spacing={3}>
      {/* Skills Section */}
      <Grid item xs={12} md={6}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            bgcolor: "#fff",
            minHeight: "450px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Stack spacing={2} sx={{ flexGrow: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#e0e7ff",
                  color: "#4f46e5",
                  borderRadius: "10px",
                  width: 36,
                  height: 36,
                }}
              >
                <PsychologyIcon />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#1e293b" }}>
                  Skills
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Add and arrange your key skills
                </Typography>
              </Box>
            </Box>

            <Autocomplete
              freeSolo
              loading={skillsLoading}
              options={skillsDropdown.filter((s) => !skills.includes(s))}
              inputValue={skillInput}
              onInputChange={(e, value) => {
                setSkillInput(value);
                fetchSkillsOptions(value);
              }}
              onChange={(e, value) => {
                if (value) {
                  handleAddSkill(value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && skillInput.trim()) {
                  e.preventDefault();
                  handleAddSkill(skillInput);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Add Skill"
                  placeholder="Type a skill and press Enter"
                  variant="outlined"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        {skillsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </React.Fragment>
                    ),
                  }}
                />
              )}
            />

            <Box>
              <ReorderableList
                items={skills}
                type="skills"
                onRemove={handleRemoveSkill}
                onReorder={handleReorderSkills}
              />
            </Box>
          </Stack>
        </Paper>
      </Grid>

      {/* Languages Section */}
      <Grid item xs={12} md={6}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            bgcolor: "#fff",
            minHeight: "450px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Stack spacing={2} sx={{ flexGrow: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#e0f2fe",
                  color: "#0284c7",
                  borderRadius: "10px",
                  width: 36,
                  height: 36,
                }}
              >
                <TranslateIcon />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#1e293b" }}>
                  Languages
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Add and arrange your languages
                </Typography>
              </Box>
            </Box>

            <Autocomplete
              freeSolo
              loading={langsLoading}
              options={langsDropdown.filter((l) => !languages.includes(l))}
              inputValue={langInput}
              onInputChange={(e, value) => {
                setLangInput(value);
                fetchLanguagesOptions(value);
              }}
              onChange={(e, value) => {
                if (value) {
                  handleAddLanguage(value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && langInput.trim()) {
                  e.preventDefault();
                  handleAddLanguage(langInput);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Add Language"
                  placeholder="Type a language and press Enter"
                  variant="outlined"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        {langsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </React.Fragment>
                    ),
                  }}
                />
              )}
            />

            <Box>
              <ReorderableList
                items={languages}
                type="languages"
                onRemove={handleRemoveLanguage}
                onReorder={handleReorderLanguages}
              />
            </Box>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default SkillsForm;
