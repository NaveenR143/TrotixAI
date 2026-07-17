// components/recruiter/CandidateFilters.js
import React from "react";
import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Slider,
  Stack,
  Divider,
  Button,
  Chip,
  Paper,
  TextField,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import TuneIcon from "@mui/icons-material/Tune";

const CandidateFilters = ({
  filters,
  onFiltersChange,
  compact = false,
}) => {
  
  const handleClearFilters = () => {
    onFiltersChange({
      industry: "",
      location: "",
      experienceRange: [0, 30],
      skills: "",
      noticePeriodMax: "",
      currentCompany: "",
    });
  };

  const handleFilterChange = (field, value) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    });
  };

  const activeFilterCount = 
    (filters.industry ? 1 : 0) +
    (filters.location ? 1 : 0) +
    (filters.skills ? 1 : 0) +
    (filters.noticePeriodMax ? 1 : 0) +
    (filters.currentCompany ? 1 : 0) +
    (filters.experienceRange && (filters.experienceRange[0] > 0 || filters.experienceRange[1] < 30) ? 1 : 0);

  const content = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 2,
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "8px",
              bgcolor: "#ede9fe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TuneIcon sx={{ color: "#6366f1", fontSize: 18 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 600, color: "#0f172a" }}>
              Filters
            </Typography>
            {activeFilterCount > 0 && (
              <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                {activeFilterCount} active
              </Typography>
            )}
          </Box>
        </Box>
        {activeFilterCount > 0 && (
          <Button
            size="small"
            startIcon={<ClearIcon sx={{ fontSize: 16 }} />}
            onClick={handleClearFilters}
            sx={{
              color: "#ef4444",
              fontSize: "0.8rem",
              textTransform: "none",
              fontWeight: 500,
              "&:hover": { bgcolor: "#fee2e2" },
            }}
          >
            Clear
          </Button>
        )}
      </Box>

      {/* Industry */}
      <Box>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "0.85rem",
            color: "#0f172a",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            mb: 1,
          }}
        >
          Industry
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="e.g. Technology, Finance"
          value={filters.industry || ""}
          onChange={(e) => handleFilterChange("industry", e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              bgcolor: "#f8fafc",
            },
          }}
        />
      </Box>

      {/* Location */}
      <Box>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "0.85rem",
            color: "#0f172a",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            mb: 1,
          }}
        >
          Location
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="e.g. Bangalore, Remote"
          value={filters.location || ""}
          onChange={(e) => handleFilterChange("location", e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              bgcolor: "#f8fafc",
            },
          }}
        />
      </Box>

      {/* Experience Range */}
      <Box>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "0.85rem",
            color: "#0f172a",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            mb: 1.5,
          }}
        >
          Experience (Years)
        </Typography>
        <Box sx={{ px: 1 }}>
          <Slider
            value={filters.experienceRange || [0, 30]}
            onChange={(_, val) => handleFilterChange("experienceRange", val)}
            min={0}
            max={30}
            step={1}
            valueLabelDisplay="auto"
            valueLabelFormat={(val) => `${val} Yrs`}
            sx={{
              color: "#6366f1",
              "& .MuiSlider-thumb": {
                bgcolor: "#fff",
                border: "3px solid #6366f1",
              },
              "& .MuiSlider-rail": { bgcolor: "#e2e8f0" },
              "& .MuiSlider-track": { bgcolor: "#6366f1" },
            }}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
            <Typography sx={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 500 }}>
              {filters.experienceRange?.[0] || 0} Yrs
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 500 }}>
              {filters.experienceRange?.[1] || 30} Yrs
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Skills */}
      <Box>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "0.85rem",
            color: "#0f172a",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            mb: 1,
          }}
        >
          Skills
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="e.g. React, Python, SQL"
          value={filters.skills || ""}
          onChange={(e) => handleFilterChange("skills", e.target.value)}
          helperText="Comma-separated for multiple skills"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              bgcolor: "#f8fafc",
            },
            "& .MuiFormHelperText-root": {
              mx: 0.5,
              mt: 0.5,
              fontSize: "0.7rem",
            },
          }}
        />
      </Box>

      {/* Current Company */}
      <Box>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "0.85rem",
            color: "#0f172a",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            mb: 1,
          }}
        >
          Current Company
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="e.g. Google, Microsoft"
          value={filters.currentCompany || ""}
          onChange={(e) => handleFilterChange("currentCompany", e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              bgcolor: "#f8fafc",
            },
          }}
        />
      </Box>

      {/* Notice Period */}
      <Box>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "0.85rem",
            color: "#0f172a",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            mb: 1.5,
          }}
        >
          Notice Period
        </Typography>
        <Stack spacing={0.5}>
          {[
            { label: "Immediate (<= 15 days)", value: 15 },
            { label: "1 Month (<= 30 days)", value: 30 },
            { label: "2 Months (<= 60 days)", value: 60 },
            { label: "3 Months (<= 90 days)", value: 90 },
          ].map((item) => (
            <FormControlLabel
              key={item.value}
              control={
                <Checkbox
                  checked={filters.noticePeriodMax === item.value}
                  onChange={() => handleFilterChange(
                    "noticePeriodMax", 
                    filters.noticePeriodMax === item.value ? "" : item.value
                  )}
                  size="small"
                  sx={{
                    color: "#cbd5e1",
                    "&.Mui-checked": { color: "#6366f1" },
                  }}
                />
              }
              label={
                <Typography sx={{ fontSize: "0.9rem", color: "#475569" }}>
                  {item.label}
                </Typography>
              }
              sx={{ m: 0 }}
            />
          ))}
        </Stack>
      </Box>

      <Divider sx={{ bgcolor: "#e2e8f0" }} />
      
      {/* Active Chips */}
      {activeFilterCount > 0 && (
        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
          {filters.industry && (
            <Chip
              icon={<ClearIcon sx={{ fontSize: 14 }} />}
              label={`Ind: ${filters.industry}`}
              size="small"
              onDelete={() => handleFilterChange("industry", "")}
              sx={{ bgcolor: "#ede9fe", color: "#4f46e5", fontWeight: 500 }}
            />
          )}
          {filters.location && (
            <Chip
              icon={<ClearIcon sx={{ fontSize: 14 }} />}
              label={`Loc: ${filters.location}`}
              size="small"
              onDelete={() => handleFilterChange("location", "")}
              sx={{ bgcolor: "#f0f9ff", color: "#0c4a6e", fontWeight: 500 }}
            />
          )}
          {filters.skills && (
            <Chip
              icon={<ClearIcon sx={{ fontSize: 14 }} />}
              label={`Skills: ${filters.skills}`}
              size="small"
              onDelete={() => handleFilterChange("skills", "")}
              sx={{ bgcolor: "#f0fdf4", color: "#15803d", fontWeight: 500 }}
            />
          )}
          {filters.currentCompany && (
            <Chip
              icon={<ClearIcon sx={{ fontSize: 14 }} />}
              label={`Co: ${filters.currentCompany}`}
              size="small"
              onDelete={() => handleFilterChange("currentCompany", "")}
              sx={{ bgcolor: "#fce7f3", color: "#9d174d", fontWeight: 500 }}
            />
          )}
          {filters.noticePeriodMax && (
            <Chip
              icon={<ClearIcon sx={{ fontSize: 14 }} />}
              label={`Notice: <= ${filters.noticePeriodMax}d`}
              size="small"
              onDelete={() => handleFilterChange("noticePeriodMax", "")}
              sx={{ bgcolor: "#fef3c7", color: "#92400e", fontWeight: 500 }}
            />
          )}
          {(filters.experienceRange && (filters.experienceRange[0] > 0 || filters.experienceRange[1] < 30)) && (
            <Chip
              icon={<ClearIcon sx={{ fontSize: 14 }} />}
              label={`Exp: ${filters.experienceRange[0]}-${filters.experienceRange[1]} Yrs`}
              size="small"
              onDelete={() => handleFilterChange("experienceRange", [0, 30])}
              sx={{ bgcolor: "#f1f5f9", color: "#475569", fontWeight: 500 }}
            />
          )}
        </Stack>
      )}
    </Box>
  );

  if (compact) {
    return content;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        bgcolor: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 3,
      }}
    >
      {content}
    </Paper>
  );
};

export default CandidateFilters;
