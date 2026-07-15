import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Autocomplete,
  TextField,
  Alert,
  CircularProgress,
  Stack
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import * as profileAPI from "../../../api/profileAPI";
import { updateUserProfile } from "../../../redux/user/Action";
import { updateProfileData } from "../../../redux/profile/ProfileAction";

const IndustriesSection = ({ userId, profile, onSuccess }) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingOptions, setFetchingOptions] = useState(false);
  const [error, setError] = useState(null);
  const [availableIndustries, setAvailableIndustries] = useState([]);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [validationError, setValidationError] = useState("");

  // Sync with profile industries when not editing
  useEffect(() => {
    if (!isEditing && profile?.user_industries) {
      setSelectedIndustries(profile.user_industries);
    }
  }, [profile, isEditing]);

  // Load available industries once on mount
  useEffect(() => {
    const loadIndustries = async () => {
      setFetchingOptions(true);
      const result = await profileAPI.fetchIndustriesDropdown();
      if (!result.error) {
        // Map string IDs back to integer for comparison/saving consistency
        const mapped = result.data.map(item => ({
          id: parseInt(item.id),
          name: item.name
        }));
        setAvailableIndustries(mapped);
      } else {
        console.error("Failed to load industries dropdown list:", result.message);
      }
      setFetchingOptions(false);
    };

    loadIndustries();
  }, []);

  const handleToggleEdit = () => {
    if (isEditing) {
      handleCancel();
    } else {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setSelectedIndustries(profile?.user_industries || []);
    setValidationError("");
    setError(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    // Validate that at least one industry is selected
    if (!selectedIndustries || selectedIndustries.length < 1) {
      setValidationError("At least one industry preference must be selected.");
      return;
    }

    setLoading(true);
    setError(null);
    setValidationError("");

    try {
      const industryIds = selectedIndustries.map((ind) => ind.id);
      const result = await profileAPI.updateUserIndustries(userId, industryIds);

      if (result.error) {
        setError(result.message);
      } else {
        if (onSuccess) onSuccess("Preferred industries updated successfully!");

        // Update both UserReducer and ProfileReducer
        dispatch(updateUserProfile({
          user_industries: selectedIndustries
        }));

        dispatch(updateProfileData({
          user_industries: selectedIndustries
        }));

        // Explicitly update localStorage to ensure other components sync immediately
        localStorage.setItem("user_industries", JSON.stringify(selectedIndustries));

        setIsEditing(false);
      }
    } catch (err) {
      setError("Failed to update preferred industries");
      console.error(err);
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
        animation: "fadeIn 0.5s ease-out",
        "@keyframes fadeIn": {
          "0%": { opacity: 0, transform: "translateY(5px)" },
          "100%": { opacity: 1, transform: "translateY(0)" }
        }
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
          <BusinessCenterIcon sx={{ fontSize: 20, color: "#212121" }} />
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "0.9rem",
              color: "#0f172a",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Preferred Industries
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {loading && <CircularProgress size={20} />}
          <Button
            size="small"
            variant={isEditing ? "outlined" : "text"}
            startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
            onClick={handleToggleEdit}
            disabled={loading}
            sx={{
              color: isEditing ? "#ef4444" : "#2563EB",
              textTransform: "none",
              fontWeight: 600,
              "&.Mui-disabled": {
                color: "#94A3B8",
              },
            }}
          >
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </Box>
      </Box>

      <Typography
        variant="body2"
        sx={{
          color: "#212121",
          mb: 2,
          fontSize: "0.85rem",
          lineHeight: 1.5,
        }}
      >
        Adding more relevant industries to your profile improves chances of finding jobs.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {validationError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {validationError}
        </Alert>
      )}

      {!isEditing ? (
        <Box>
          {selectedIndustries && selectedIndustries.length > 0 ? (
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {selectedIndustries.map((ind) => (
                <Chip
                  key={ind.id}
                  label={ind.name}
                  sx={{
                    px: 1,
                    py: 0.5,
                    fontWeight: 500,
                    fontSize: "0.85rem",
                    bgcolor: "rgba(37, 99, 235, 0.08)",
                    color: "#1D4ED8",
                    border: "1px solid rgba(37, 99, 235, 0.2)",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                      bgcolor: "rgba(37, 99, 235, 0.15)",
                    }
                  }}
                />
              ))}
            </Stack>
          ) : (
            <Typography sx={{ color: "#212121", fontStyle: "italic", fontSize: "0.9rem" }}>
              No preferred industries selected. Please update your preferences to get matched with the right opportunities.
            </Typography>
          )}
        </Box>
      ) : (
        <Box>
          <Autocomplete
            multiple
            options={availableIndustries}
            loading={fetchingOptions}
            getOptionLabel={(option) => option.name || ""}
            value={selectedIndustries}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(event, newValue) => {
              setSelectedIndustries(newValue);
              if (newValue.length > 0) {
                setValidationError("");
              }
            }}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip
                  key={option.id}
                  label={option.name}
                  {...getTagProps({ index })}
                  sx={{
                    bgcolor: "rgba(37, 99, 235, 0.08)",
                    color: "#1D4ED8",
                    border: "1px solid rgba(37, 99, 235, 0.2)",
                    borderRadius: "8px",
                    fontWeight: 500,
                  }}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Industries"
                placeholder={selectedIndustries.length > 0 ? "" : "Search & Select Industries..."}
                size="small"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {fetchingOptions ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              onClick={handleSave}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
              disabled={loading}
              sx={{
                background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                color: "#FFFFFF",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                "&:hover": {
                  background: "linear-gradient(135deg, #1D4ED8, #1E40AF)",
                },
                "&.Mui-disabled": {
                  background: "#E2E8F0",
                  color: "#94A3B8",
                },
              }}
            >
              Save Preferences
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleCancel}
              startIcon={<CancelIcon />}
              disabled={loading}
              sx={{
                color: "#212121",
                borderColor: "#E2E8F0",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                "&:hover": {
                  bgcolor: "#F8FAFC",
                  borderColor: "#CBD5E1",
                },
                "&.Mui-disabled": {
                  color: "#94A3B8",
                  borderColor: "#E2E8F0",
                },
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default IndustriesSection;
