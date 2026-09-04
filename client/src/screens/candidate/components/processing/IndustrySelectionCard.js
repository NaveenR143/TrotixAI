import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  Stack,
  Fade
} from "@mui/material";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TuneIcon from "@mui/icons-material/Tune";
import * as profileAPI from "../../../../api/profileAPI";
import { updateUserProfile } from "../../../../redux/user/Action";
import { updateProfileData } from "../../../../redux/profile/ProfileAction";
import { fadeSlideUp } from "../../../../utils/themeUtils";

const IndustrySelectionCard = ({ userId, onSave }) => {
  const dispatch = useDispatch();
  const reduxUserIndustries = useSelector((state) => state.UserReducer?.user_industries);

  const [availableIndustries, setAvailableIndustries] = useState([]);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [fetchingOptions, setFetchingOptions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Initialize selected industries from Redux or localStorage
  useEffect(() => {
    if (reduxUserIndustries && reduxUserIndustries.length > 0) {
      setSelectedIndustries(reduxUserIndustries);
    } else {
      const local = localStorage.getItem("user_industries");
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            setSelectedIndustries(parsed);
          }
        } catch (e) {
          // ignore
        }
      }
    }
  }, [reduxUserIndustries]);

  // Load available dropdown options
  useEffect(() => {
    let isActive = true;
    const loadDropdowns = async () => {
      setFetchingOptions(true);
      try {
        const result = await profileAPI.fetchIndustriesDropdown();
        if (isActive && !result.error && Array.isArray(result.data)) {
          const mapped = result.data.map((item) => ({
            id: parseInt(item.id, 10),
            name: item.name
          }));
          setAvailableIndustries(mapped);
        }
      } catch (err) {
        console.error("Failed to load industry options:", err);
      } finally {
        if (isActive) setFetchingOptions(false);
      }
    };

    loadDropdowns();
    return () => {
      isActive = false;
    };
  }, []);

  const handleToggleChip = (industry) => {
    setSelectedIndustries((prev) => {
      const exists = prev.some((item) => item.id === industry.id);
      if (exists) {
        return prev.filter((item) => item.id !== industry.id);
      } else {
        return [...prev, industry];
      }
    });
    setSavedSuccess(false);
  };

  const handleSave = async () => {
    if (!selectedIndustries || selectedIndustries.length === 0) {
      setError("Please select at least one industry preference.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const industryIds = selectedIndustries.map((ind) => ind.id);
      if (userId) {
        await profileAPI.updateUserIndustries(userId, industryIds);
      }

      // Update Redux state
      dispatch(updateUserProfile({ user_industries: selectedIndustries }));
      dispatch(updateProfileData({ user_industries: selectedIndustries }));

      // Save to localStorage
      localStorage.setItem("user_industries", JSON.stringify(selectedIndustries));

      setSavedSuccess(true);
      if (onSave) {
        onSave();
      }
    } catch (err) {
      console.error("Failed to save industry preferences:", err);
      setError("Failed to save industry preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Popular suggested industries for fast 1-click selection
  // const popularIndustries = availableIndustries.slice(0, 8);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        bgcolor: "#ffffff",
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        boxShadow: "0 10px 40px rgba(15,23,42,0.06)",
        animation: `${fadeSlideUp} 0.5s ease-out`
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: "10px",
            bgcolor: "rgba(99, 102, 241, 0.1)",
            color: "#6366f1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <TuneIcon sx={{ fontSize: 22 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>
            While You Wait: Tailor Your Job Search
          </Typography>
          <Typography sx={{ fontSize: "0.8rem", color: "#64748b" }}>
            Select target industries to personalize your AI job matching recommendations
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {savedSuccess && (
        <Fade in timeout={400}>
          <Alert
            severity="success"
            icon={<CheckCircleIcon fontSize="inherit" />}
            sx={{ mb: 2, borderRadius: 2, bgcolor: "#f0fdf4", border: "1px solid #86efac" }}
          >
            Target industries saved! Your job matches are now tailored to these sectors.
          </Alert>
        </Fade>
      )}



      {/* Autocomplete Multi-Select Search Input */}
      <Box sx={{ mb: 2.5 }}>
        <Autocomplete
          multiple
          options={availableIndustries}
          loading={fetchingOptions}
          getOptionLabel={(option) => option.name || ""}
          value={selectedIndustries}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          onChange={(event, newValue) => {
            setSelectedIndustries(newValue);
            setSavedSuccess(false);
            if (error) setError(null);
          }}
          renderTags={(tagValue, getTagProps) =>
            tagValue.map((option, index) => (
              <Chip
                key={option.id}
                label={option.name}
                {...getTagProps({ index })}
                size="small"
                sx={{
                  bgcolor: "rgba(99, 102, 241, 0.1)",
                  color: "#4f46e5",
                  border: "1px solid rgba(99, 102, 241, 0.25)",
                  borderRadius: "6px",
                  fontWeight: 600
                }}
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Preferred Industries"
              placeholder={selectedIndustries.length > 0 ? "" : "Search & Select Industries..."}
              size="small"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {fetchingOptions ? <CircularProgress color="inherit" size={18} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                )
              }}
            />
          )}
        />
      </Box>

      {/* Action Footer */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>
          {selectedIndustries.length} {selectedIndustries.length === 1 ? "industry" : "industries"} selected
        </Typography>
        <Button
          variant="contained"
          size="small"
          onClick={handleSave}
          disabled={saving || selectedIndustries.length === 0}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            px: 2.5,
            py: 0.8,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#ffffff",
            boxShadow: "0 4px 12px rgba(99,102,241,0.25)",
            "&:hover": {
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)"
            },
            "&.Mui-disabled": {
              background: "#e2e8f0",
              color: "#94a3b8"
            }
          }}
        >
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </Box>
    </Paper>
  );
};

export default IndustrySelectionCard;
