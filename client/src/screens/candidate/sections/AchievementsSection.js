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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import * as profileAPI from "../../../api/profileAPI";
import { updateUserProfile } from "../../../redux/user/Action";

const AchievementsSection = ({ userId, profile, initialAchievements, onSuccess }) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [sectionErrors, setSectionErrors] = useState(null);

  const [achievements, setAchievements] = useState([]);
  const [changedIndices, setChangedIndices] = useState(new Set());
  const [newIndices, setNewIndices] = useState(new Set());
  const [recordLoading, setRecordLoading] = useState({});
  const [recordErrors, setRecordErrors] = useState({});

  console.log("achievements", achievements);

  useEffect(() => {
    if (!isEditing && initialAchievements) {
      setAchievements(JSON.parse(JSON.stringify(initialAchievements)));
    }
  }, [initialAchievements, isEditing]);

  const handleToggleEdit = () => {
    if (isEditing) {
      handleCancel();
    } else {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setAchievements(JSON.parse(JSON.stringify(initialAchievements || [])));
    setChangedIndices(new Set());
    setNewIndices(new Set());
    setRecordErrors({});
    setRecordLoading({});
    setIsEditing(false);
    setSectionErrors(null);
  };

  const addAchievement = () => {
    const newIndex = achievements.length;
    setAchievements((prev) => [
      ...prev,
      { id: null, achievement: "" }
    ]);
    setNewIndices((prev) => new Set([...prev, newIndex]));
    setChangedIndices((prev) => new Set([...prev, newIndex]));
  };

  const removeAchievement = async (index) => {
    const achievement = achievements[index];

    if (achievement.id) {
      // If it's an existing record, delete from backend
      setRecordLoading((prev) => ({ ...prev, [index]: true }));
      try {
        const result = await profileAPI.deleteAchievement(userId, achievement.id);
        if (result.error) {
          setRecordErrors((prev) => ({ ...prev, [index]: result.message }));
          return;
        }
        if (onSuccess) onSuccess("Achievement deleted successfully!");
      } catch (error) {
        setRecordErrors((prev) => ({ ...prev, [index]: error.message || "Failed to delete" }));
        return;
      } finally {
        setRecordLoading((prev) => ({ ...prev, [index]: false }));
      }
    }

    // Update local state
    setAchievements((prev) => prev.filter((_, i) => i !== index));
    setNewIndices((prev) => {
      const newSet = new Set();
      prev.forEach(i => {
        if (i < index) newSet.add(i);
        if (i > index) newSet.add(i - 1);
      });
      return newSet;
    });
    setChangedIndices((prev) => {
      const newSet = new Set();
      prev.forEach(i => {
        if (i < index) newSet.add(i);
        if (i > index) newSet.add(i - 1);
      });
      return newSet;
    });
  };

  const updateAchievementField = (index, value) => {
    const newAch = [...achievements];
    newAch[index].achievement = value;
    setAchievements(newAch);
    setChangedIndices((prev) => new Set([...prev, index]));
  };

  const saveIndividualAchievement = async (index) => {
    const ach = achievements[index];
    const isNewRecord = newIndices.has(index);

    setRecordLoading((prev) => ({ ...prev, [index]: true }));
    setRecordErrors((prev) => ({ ...prev, [index]: null }));

    try {
      const achievementData = {
        achievement: ach.achievement,
      };

      if (ach.id) {
        achievementData.id = ach.id;
      }

      const result = await profileAPI.updateAchievement(userId, achievementData);

      if (result.error) {
        setRecordErrors((prev) => ({ ...prev, [index]: result.message }));
      } else {
        if (onSuccess) onSuccess(isNewRecord ? "Created successfully!" : "Updated successfully!");

        // Update with ID from response if it was new
        if (isNewRecord && result.data?.data?.achievements) {
          // This is a bit tricky since the API returns the WHOLE profile
          // We'll rely on the next profile fetch or manual update
        }

        // Remove tracking
        setChangedIndices((prev) => {
          const s = new Set(prev);
          s.delete(index);
          return s;
        });
        if (isNewRecord) {
          setNewIndices((prev) => {
            const s = new Set(prev);
            s.delete(index);
            return s;
          });
        }

        // Update Redux
        dispatch(updateUserProfile({
          ...profile,
          achievements: achievements,
        }));
      }
    } catch (error) {
      setRecordErrors((prev) => ({ ...prev, [index]: error.message || "Failed to save" }));
    } finally {
      setRecordLoading((prev) => ({ ...prev, [index]: false }));
    }
  };

  const saveAllAchievements = async () => {
    if (changedIndices.size === 0) return;
    setSectionLoading(true);
    try {
      for (const index of Array.from(changedIndices)) {
        await saveIndividualAchievement(index);
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
          <EmojiEventsIcon sx={{ fontSize: 20, color: "#f59e0b" }} />
          <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px", color: "#0f172a" }}>
            Achievements / Certifications / Accomplishments
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
                color: "#cfcfcfff",
                backgroundColor: "#cdcbcbff",
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

      {!isEditing ? (


        < Box >
          {(!achievements || achievements.length === 0) ? (
            <Typography sx={{ fontSize: "0.85rem", color: "text.secondary", fontStyle: "italic" }}>
              No achievements added yet.
            </Typography>
          ) : (

            <Stack spacing={1.5}>
              {achievements.map((ach, idx) => (
                <Box key={idx} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                  <Box sx={{ color: "#f59e0b", mt: 0.2 }}>•</Box>
                  <Typography sx={{ fontSize: "0.95rem", color: "#334155", lineHeight: 1.5 }}>
                    {ach.achievement}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      ) : (
        <Stack spacing={2}>
          {achievements.map((ach, idx) => (
            <Paper key={idx} variant="outlined" sx={{ p: 2, bgcolor: "#f8fafc", borderStyle: "dashed", border: newIndices.has(idx) ? "2px dashed #10b981" : "1px dashed #e2e8f0" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                {newIndices.has(idx) ? (
                  <Chip label="🆕 NEW RECORD" size="small" sx={{ bgcolor: "#d1fae5", color: "#059669", fontWeight: 600 }} />
                ) : (
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#212121" }}>
                    ACHIEVEMENT #{idx + 1}
                  </Typography>
                )}
                <IconButton size="small" onClick={() => removeAchievement(idx)} sx={{ color: "#f43f5e" }}>
                  <DeleteIcon fontSize="inherit" />
                </IconButton>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="E.g. Increased sales by 20% in Q3 2023"
                    value={ach.achievement}
                    onChange={(e) => updateAchievementField(idx, e.target.value)}
                    size="small"
                  />
                </Grid>
                {recordErrors?.[idx] && <Grid item xs={12}><Alert severity="error" sx={{ py: 0, px: 1 }}>{recordErrors[idx]}</Alert></Grid>}
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => saveIndividualAchievement(idx)}
                    startIcon={
                      recordLoading?.[idx]
                        ? <CircularProgress size={16} color="inherit" />
                        : <SaveIcon />
                    }
                    disabled={recordLoading?.[idx] || !changedIndices.has(idx) || ach.achievement === ""}
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
                    Save
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          ))}
          <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={addAchievement} sx={{ color: "#6366f1", borderColor: "#c4b5fd", alignSelf: "flex-start", textTransform: "none" }}>
            Add Achievement
          </Button>
          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
            <Button
              variant="contained"
              size="small"
              onClick={saveAllAchievements}
              disabled={sectionLoading || changedIndices.size === 0}
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
              variant="outlined"
              size="small"
              onClick={handleCancel}
              startIcon={<CancelIcon />}
              sx={{
                textTransform: "none",
                "&.Mui-disabled": {
                  color: "#cfcfcfff",
                  backgroundColor: "#cdcbcbff",
                  opacity: 0.8,
                },
              }}
            >
              Cancel
            </Button>
          </Box>
        </Stack>
      )
      }
    </Paper >
  );
};

export default AchievementsSection;
