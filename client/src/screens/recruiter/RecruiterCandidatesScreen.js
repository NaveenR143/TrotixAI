// screens/recruiter/RecruiterCandidatesScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  useMediaQuery,
  useTheme,
  IconButton,
  Chip,
  Drawer,
  Badge,
  CircularProgress,
  Grid,
  Container,
  Paper,
  Avatar,
} from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PeopleIcon from "@mui/icons-material/People";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import { useNavigate } from "react-router-dom";
import { fetchCandidates } from "../../api/profileAPI";
import CandidateFilters from "../../components/recruiter/CandidateFilters";
import MobileCandidateCard from "../../components/recruiter/MobileCandidateCard";
import { toTitleCase } from "../../screens/candidate/utils/profileUtils";

const RecruiterCandidatesScreen = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const [candidates, setCandidates] = useState([]);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    industry: "",
    location: "",
    experienceRange: [0, 30],
    skills: "",
    noticePeriodMax: "",
    currentCompany: "",
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  // Debounce filter changes to avoid rapid API requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 450);

    return () => clearTimeout(handler);
  }, [filters]);

  // Fetch initial candidates when filters change
  useEffect(() => {
    const loadInitialCandidates = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          limit: 20,
          offset: 0,
          location: debouncedFilters.location || undefined,
          industry: debouncedFilters.industry || undefined,
          skills: debouncedFilters.skills || undefined,
          experience_min: debouncedFilters.experienceRange && debouncedFilters.experienceRange[0] > 0 ? debouncedFilters.experienceRange[0] : undefined,
          experience_max: debouncedFilters.experienceRange && debouncedFilters.experienceRange[1] < 30 ? debouncedFilters.experienceRange[1] : undefined,
          notice_period_max: debouncedFilters.noticePeriodMax || undefined,
          current_company: debouncedFilters.currentCompany || undefined,
        };

        const res = await fetchCandidates(params);
        if (!res.error && res.data) {
          setCandidates(res.data);
          setTotalCandidates(res.total);
          setHasMore(res.data.length < res.total);
        } else {
          setError(res.message || "Failed to load candidates");
        }
      } catch (err) {
        console.error(err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadInitialCandidates();
  }, [debouncedFilters]);

  // Fetch next page of candidates on scroll
  const loadMoreCandidates = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextOffset = candidates.length;
      const params = {
        limit: 20,
        offset: nextOffset,
        location: debouncedFilters.location || undefined,
        industry: debouncedFilters.industry || undefined,
        skills: debouncedFilters.skills || undefined,
        experience_min: debouncedFilters.experienceRange && debouncedFilters.experienceRange[0] > 0 ? debouncedFilters.experienceRange[0] : undefined,
        experience_max: debouncedFilters.experienceRange && debouncedFilters.experienceRange[1] < 30 ? debouncedFilters.experienceRange[1] : undefined,
        notice_period_max: debouncedFilters.noticePeriodMax || undefined,
        current_company: debouncedFilters.currentCompany || undefined,
      };

      const res = await fetchCandidates(params);
      if (!res.error && res.data) {
        setCandidates((prev) => [...prev, ...res.data]);
        setHasMore(candidates.length + res.data.length < res.total);
      }
    } catch (err) {
      console.error("Error loading more candidates:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 120) {
      loadMoreCandidates();
    }
  };

  const activeFilterCount =
    (filters.industry ? 1 : 0) +
    (filters.location ? 1 : 0) +
    (filters.skills ? 1 : 0) +
    (filters.noticePeriodMax ? 1 : 0) +
    (filters.currentCompany ? 1 : 0) +
    (filters.experienceRange && (filters.experienceRange[0] > 0 || filters.experienceRange[1] < 30) ? 1 : 0);

  // Desktop Card render
  const renderCandidateCard = (c) => (
    <Grid item xs={12} sm={6} md={4} key={c.id}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: "20px",
          border: "1px solid #E5E7EB",
          bgcolor: "#FFFFFF",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 2.5,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          cursor: "pointer",
          "&:hover": {
            transform: "translateY(-6px)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
            borderColor: "#6366f1",
          },
        }}
        onClick={() => navigate(`/candidate-profile/${c.id}`, { state: { applicant: c } })}
      >
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ overflow: "hidden" }}>
              <Typography noWrap sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#111827", letterSpacing: "-0.01em" }}>
                {toTitleCase(c.full_name)}
              </Typography>
              <Typography noWrap sx={{ fontSize: "0.85rem", color: "#4f46e5", fontWeight: 600, mt: 0.2 }}>
                {toTitleCase(
                  c.years_of_experience > 0
                    ? (c.last_experience_title || "Fresher")
                    : (c.last_education_degree || "Fresher")
                )}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">


            {c.years_of_experience > 0 ?
              <><WorkHistoryIcon sx={{ fontSize: 16, color: "#64748b" }} />
                <Typography variant="body2" sx={{ color: "#475569", fontWeight: 500 }}>
                  {c.years_of_experience} Yrs Experience
                </Typography></>

              : (
                <Typography variant="body2" sx={{ color: "#475569", fontWeight: 500 }}>
                  Fresher
                </Typography>
              )}

          </Stack>
        </Stack>

        {c.skills?.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
            {c.skills.slice(0, 7).map((skill) => (
              <Chip
                key={skill}
                label={toTitleCase(skill)}
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.7rem",
                  bgcolor: "#f1f5f9",
                  color: "#475569",
                  fontWeight: 500,
                  border: "1px solid #e2e8f0",
                }}
              />
            ))}
            {c.skills.length > 7 && (
              <Typography variant="caption" sx={{ color: "#94a3b8", alignSelf: "center", ml: 0.5, fontWeight: 500 }}>
                +{c.skills.length - 7}
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    </Grid>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", bgcolor: "#F8FAFC" }}>
      {/* Top Header */}
      <Box sx={{ py: 2, px: 3, bgcolor: "#FFFFFF", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 100 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton onClick={() => navigate("/recruiter-dashboard")} size="small" sx={{ color: "#6B7280" }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#111827", display: "flex", alignItems: "center", gap: 1.5, letterSpacing: "-0.02em" }}>
              <PeopleIcon sx={{ color: "#2563EB" }} /> Talent Pool
            </Typography>
            <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 500 }}>
              {totalCandidates} Candidates Available
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Badge badgeContent={activeFilterCount} color="error">
            <IconButton
              size="small"
              onClick={() => setShowFilters(true)}
              sx={{
                color: activeFilterCount > 0 ? "#6366f1" : "#475569",
                bgcolor: activeFilterCount > 0 ? "#f5f3ff" : "#f8fafc",
                border: "1px solid",
                borderColor: activeFilterCount > 0 ? "#c4b5fd" : "#e2e8f0",
                "&:hover": { bgcolor: activeFilterCount > 0 ? "#ede9fe" : "#f1f5f9" },
              }}
            >
              <TuneIcon fontSize="small" />
            </IconButton>
          </Badge>
        </Stack>
      </Box>

      {/* Main Layout */}
      {isDesktop ? (
        <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Scrollable List Grid */}
          <Box
            onScroll={handleScroll}
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 4,
              "&::-webkit-scrollbar": { width: 6 },
              "&::-webkit-scrollbar-thumb": { bgcolor: "#cbd5e1", borderRadius: 10 },
            }}
          >
            {loading && candidates.length === 0 ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60%" }}>
                <CircularProgress size={40} sx={{ color: "#6366f1" }} />
              </Box>
            ) : error ? (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60%", gap: 2 }}>
                <Typography sx={{ fontSize: "3rem" }}>⚠️</Typography>
                <Typography sx={{ fontWeight: 600, color: "#0f172a" }}>{error}</Typography>
              </Box>
            ) : candidates.length === 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60%", gap: 2 }}>
                <Typography sx={{ fontSize: "3rem" }}>🔍</Typography>
                <Typography sx={{ fontWeight: 600, color: "#64748b" }}>No candidates match your search parameters</Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {candidates.map(renderCandidateCard)}
                {loadingMore && (
                  <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                    <CircularProgress size={24} sx={{ color: "#6366f1" }} />
                  </Grid>
                )}
              </Grid>
            )}
          </Box>

          {/* Filters Sidebar for Desktop */}
          <Drawer
            anchor="right"
            open={showFilters}
            onClose={() => setShowFilters(false)}
            PaperProps={{ sx: { width: 380, borderLeft: "1px solid #e2e8f0", boxShadow: "-4px 0 20px rgba(0,0,0,0.05)" } }}
          >
            <Box sx={{ p: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0" }}>
              <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "1.1rem" }}>Candidate Filters</Typography>
              <IconButton onClick={() => setShowFilters(false)} size="small"><CloseIcon /></IconButton>
            </Box>
            <Box sx={{ p: 3, overflowY: "auto", height: "calc(100vh - 140px)" }}>
              <CandidateFilters filters={filters} onFiltersChange={setFilters} compact />
            </Box>
          </Drawer>
        </Box>
      ) : (
        /* Mobile Stack Deck Card View */
        <Box sx={{ flex: 1, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {loading && candidates.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
              <CircularProgress size={40} sx={{ color: "#6366f1" }} />
            </Box>
          ) : error ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 2 }}>
              <Typography sx={{ fontSize: "3rem" }}>⚠️</Typography>
              <Typography sx={{ fontWeight: 600, color: "#0f172a" }}>{error}</Typography>
            </Box>
          ) : candidates.length === 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 2 }}>
              <Typography sx={{ fontSize: "3rem" }}>🔍</Typography>
              <Typography sx={{ fontWeight: 600, color: "#64748b" }}>No candidates found</Typography>
            </Box>
          ) : (
            <Box
              onScroll={handleScroll}
              sx={{
                flex: 1,
                overflowY: "auto",
                scrollSnapType: "y mandatory",
                scrollBehavior: "smooth",
                WebkitOverflowScrolling: "touch",
                display: "flex",
                flexDirection: "column",
                py: 2,
                px: 1,
                gap: 2,
                "&::-webkit-scrollbar": { display: "none" },
                scrollbarWidth: "none",
              }}
            >
              {candidates.map((c, index) => (
                <React.Fragment key={c.id}>
                  <Box
                    sx={{
                      height: "calc(100dvh - 160px)",
                      width: "100%",
                      position: "relative",
                      scrollSnapAlign: "start",
                      scrollSnapStop: "always",
                      flexShrink: 0,
                    }}
                  >
                    <MobileCandidateCard
                      candidate={c}
                      onDetail={() => navigate(`/candidate-profile/${c.id}`, { state: { applicant: c } })}
                    />
                  </Box>
                  {index < candidates.length - 1 && (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: 1, flexShrink: 0 }}>
                      <Box
                        sx={{
                          width: "60%",
                          height: "2px",
                          background: "linear-gradient(90deg, transparent, #cbd5e1 50%, transparent)",
                          position: "relative",
                          "&::after": {
                            content: '""',
                            position: "absolute",
                            top: -3,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 24,
                            height: 8,
                            borderRadius: 4,
                            bgcolor: "#94a3b8",
                          },
                        }}
                      />
                    </Box>
                  )}
                </React.Fragment>
              ))}
              {loadingMore && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 3, flexShrink: 0 }}>
                  <CircularProgress size={24} sx={{ color: "#6366f1" }} />
                </Box>
              )}
            </Box>
          )}

          {/* Mobile Filters Drawer */}
          <Drawer
            anchor="bottom"
            open={showFilters}
            onClose={() => setShowFilters(false)}
            PaperProps={{ sx: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "85vh" } }}
          >
            <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>Candidate Filters</Typography>
              <IconButton onClick={() => setShowFilters(false)} size="small"><CloseIcon /></IconButton>
            </Box>
            <Box sx={{ p: 2, overflowY: "auto", maxHeight: "calc(85vh - 60px)" }}>
              <CandidateFilters filters={filters} onFiltersChange={setFilters} compact />
            </Box>
          </Drawer>
        </Box>
      )}
    </Box>
  );
};

export default RecruiterCandidatesScreen;
