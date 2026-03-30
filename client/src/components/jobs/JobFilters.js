// components/jobs/JobFilters.js
import React, { useMemo } from "react";
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
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import TuneIcon from "@mui/icons-material/Tune";

const JobFilters = ({
  jobs,
  filters,
  onFiltersChange,
  compact = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Extract unique values from jobs data
  const filterOptions = useMemo(() => {
    const locations = [...new Set(jobs?.map((j) => j.location).filter(Boolean))].sort();
    const types = [...new Set(jobs?.map((j) => j.type).filter(Boolean))].sort();
    const workModes = [...new Set(jobs?.map((j) => j.workMode).filter(Boolean))].sort();
    const experiences = [...new Set(jobs?.map((j) => j.experience).filter(Boolean))].sort();
    const departments = [...new Set(jobs?.map((j) => j.department).filter(Boolean))].sort();

    // Extract salary range min/max
    const salaries = jobs
      ?.map((j) => {
        const match = j.salary?.match(/\$(\d+)k*/gi);
        if (match && match[0]) {
          return parseInt(match[0].replace(/[^0-9]/g, "")) * 1000;
        }
        return 0;
      })
      .filter((s) => s > 0);

    const minSalary = salaries && salaries.length > 0 ? Math.min(...salaries) : 0;
    const maxSalary = salaries && salaries.length > 0 ? Math.max(...salaries) : 200000;

    return {
      locations,
      types,
      workModes,
      experiences,
      departments,
      salaryRange: [minSalary, maxSalary],
    };
  }, [jobs]);

  // Extract selected filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.locations?.length > 0) count += filters.locations.length;
    if (filters.types?.length > 0) count += filters.types.length;
    if (filters.workModes?.length > 0) count += filters.workModes.length;
    if (filters.experiences?.length > 0) count += filters.experiences.length;
    if (filters.departments?.length > 0) count += filters.departments.length;
    if (
      filters.salaryRange &&
      (filters.salaryRange[0] !== filterOptions.salaryRange[0] ||
        filters.salaryRange[1] !== filterOptions.salaryRange[1])
    ) {
      count += 1;
    }
    if (filters.matchScore !== undefined && filters.matchScore > 0) {
      count += 1;
    }
    return count;
  }, [filters, filterOptions.salaryRange]);

  const handleFilterChange = (filterType, value) => {
    if (Array.isArray(filters[filterType])) {
      onFiltersChange({
        ...filters,
        [filterType]: filters[filterType].includes(value)
          ? filters[filterType].filter((v) => v !== value)
          : [...filters[filterType], value],
      });
    }
  };

  const handleSalaryChange = (_, newValue) => {
    onFiltersChange({ ...filters, salaryRange: newValue });
  };

  const handleMatchScoreChange = (_, newValue) => {
    onFiltersChange({ ...filters, matchScore: newValue });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      locations: [],
      types: [],
      workModes: [],
      experiences: [],
      departments: [],
      salaryRange: filterOptions.salaryRange,
      matchScore: 0,
    });
  };

  const FilterSection = ({ title, options, filterType, customRender }) => (
    <Box sx={{ mb: 3 }}>
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: "0.85rem",
          color: "#0f172a",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          mb: 1.5,
        }}
      >
        {title}
      </Typography>
      <Stack spacing={1}>
        {customRender ? customRender() : options?.map((option) => (
          <FormControlLabel
            key={option}
            control={
              <Checkbox
                checked={filters[filterType]?.includes(option) || false}
                onChange={() => handleFilterChange(filterType, option)}
                size="small"
                sx={{
                  color: "#cbd5e1",
                  "&.Mui-checked": { color: "#6366f1" },
                  "&:hover": { bgcolor: "transparent" },
                }}
              />
            }
            label={
              <Typography sx={{ fontSize: "0.9rem", color: "#475569" }}>
                {option}
              </Typography>
            }
            sx={{
              m: 0,
              "& .MuiFormControlLabel-label": { ml: 1 },
              "&:hover": { bgcolor: "transparent" },
            }}
          />
        ))}
      </Stack>
    </Box>
  );

  const content = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2.5,
          pb: 2.5,
          borderBottom: "1px solid #e2e8f0",
          ...(compact && { mb: 2, pb: 2 }),
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
            <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
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
              fontWeight: 600,
              "&:hover": { bgcolor: "#fee2e2" },
            }}
          >
            Clear
          </Button>
        )}
      </Box>

      {/* Work Mode */}
      <FilterSection title="Work Mode" options={filterOptions.workModes} filterType="workModes" />

      {/* Job Type */}
      <FilterSection title="Job Type" options={filterOptions.types} filterType="types" />

      {/* Location */}
      <FilterSection title="Location" options={filterOptions.locations} filterType="locations" />

      {/* Experience Level */}
      <FilterSection
        title="Experience Level"
        options={filterOptions.experiences}
        filterType="experiences"
      />

      {/* Department */}
      <FilterSection
        title="Department"
        options={filterOptions.departments}
        filterType="departments"
      />

      {/* Salary Range */}
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "0.85rem",
            color: "#0f172a",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            mb: 1.5,
          }}
        >
          Salary Range
        </Typography>
        <Box sx={{ px: 1 }}>
          <Slider
            value={filters.salaryRange || filterOptions.salaryRange}
            onChange={handleSalaryChange}
            min={filterOptions.salaryRange[0]}
            max={filterOptions.salaryRange[1]}
            step={5000}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `$${(value / 1000).toFixed(0)}k`}
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
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            <Typography sx={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>
              ${(filters.salaryRange?.[0] || filterOptions.salaryRange[0]) / 1000}k
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>
              ${(filters.salaryRange?.[1] || filterOptions.salaryRange[1]) / 1000}k
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Match Score */}
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "0.85rem",
            color: "#0f172a",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            mb: 1.5,
          }}
        >
          Min Match Score
        </Typography>
        <Box sx={{ px: 1 }}>
          <Slider
            value={filters.matchScore || 0}
            onChange={handleMatchScoreChange}
            min={0}
            max={100}
            step={5}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}%`}
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
          <Typography sx={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600, mt: 1 }}>
            {filters.matchScore || 0}%+
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2, bgcolor: "#e2e8f0" }} />

      {/* Filter Summary */}
      {activeFilterCount > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "0.85rem",
              color: "#0f172a",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              mb: 1.5,
            }}
          >
            Active Filters
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} sx={{ "& > *": { flexShrink: 0 } }}>
            {filters.locations?.map((loc) => (
              <Chip
                key={loc}
                icon={<ClearIcon sx={{ fontSize: 14 }} />}
                label={loc}
                size="small"
                onDelete={() => handleFilterChange("locations", loc)}
                sx={{
                  bgcolor: "#ede9fe",
                  color: "#4f46e5",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  "& .MuiChip-deleteIcon": { color: "#4f46e5" },
                }}
              />
            ))}
            {filters.types?.map((type) => (
              <Chip
                key={type}
                icon={<ClearIcon sx={{ fontSize: 14 }} />}
                label={type}
                size="small"
                onDelete={() => handleFilterChange("types", type)}
                sx={{
                  bgcolor: "#f0fdf4",
                  color: "#15803d",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  "& .MuiChip-deleteIcon": { color: "#15803d" },
                }}
              />
            ))}
            {filters.workModes?.map((mode) => (
              <Chip
                key={mode}
                icon={<ClearIcon sx={{ fontSize: 14 }} />}
                label={mode}
                size="small"
                onDelete={() => handleFilterChange("workModes", mode)}
                sx={{
                  bgcolor: "#f0f9ff",
                  color: "#0c4a6e",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  "& .MuiChip-deleteIcon": { color: "#0c4a6e" },
                }}
              />
            ))}
            {filters.experiences?.map((exp) => (
              <Chip
                key={exp}
                icon={<ClearIcon sx={{ fontSize: 14 }} />}
                label={exp}
                size="small"
                onDelete={() => handleFilterChange("experiences", exp)}
                sx={{
                  bgcolor: "#fef3c7",
                  color: "#92400e",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  "& .MuiChip-deleteIcon": { color: "#92400e" },
                }}
              />
            ))}
            {filters.departments?.map((dept) => (
              <Chip
                key={dept}
                icon={<ClearIcon sx={{ fontSize: 14 }} />}
                label={dept}
                size="small"
                onDelete={() => handleFilterChange("departments", dept)}
                sx={{
                  bgcolor: "#fce7f3",
                  color: "#9d174d",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  "& .MuiChip-deleteIcon": { color: "#9d174d" },
                }}
              />
            ))}
            {filters.matchScore && filters.matchScore > 0 && (
              <Chip
                icon={<ClearIcon sx={{ fontSize: 14 }} />}
                label={`${filters.matchScore}%+ Match`}
                size="small"
                onDelete={() => onFiltersChange({ ...filters, matchScore: 0 })}
                sx={{
                  bgcolor: "#ecfdf5",
                  color: "#047857",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  "& .MuiChip-deleteIcon": { color: "#047857" },
                }}
              />
            )}
          </Stack>
        </Box>
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
        borderRadius: 2,
      }}
    >
      {content}
    </Paper>
  );
};

export default JobFilters;
