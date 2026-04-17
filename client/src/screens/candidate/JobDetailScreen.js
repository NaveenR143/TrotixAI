// screens/candidate/JobDetailScreen.js
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  IconButton,
  Stack,
  Grid,
  Paper,
  Container,
  useMediaQuery,
  useTheme,
  Divider,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import WorkIcon from "@mui/icons-material/Work";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SchoolIcon from "@mui/icons-material/School";
import BusinessIcon from "@mui/icons-material/Business";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MoreTimeIcon from "@mui/icons-material/MoreTime";
import GroupsIcon from "@mui/icons-material/Groups";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import MatchBadge from "../../components/jobs/MatchBadge";
import { getWorkModeIcon } from "../../utils/themeUtils";

const JobDetailScreen = ({
  job,
  onBack,
  isEmbedded = false,
  savedJobs = new Set(),
  onToggleSave,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSaved = savedJobs.has(job.id);
  const [expandedDescription, setExpandedDescription] = useState(false);

  // Helper component for section headers with icons
  const SectionHeader = ({ icon: Icon, title }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "10px",
          bgcolor: "#ede9fe",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon sx={{ color: "#6366f1", fontSize: 20 }} />
      </Box>
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: "1rem",
          color: "#0f172a",
          lineHeight: 1.2,
        }}
      >
        {title}
      </Typography>
    </Box>
  );

  // Chip component for job metadata
  const MetadataChip = ({ icon: Icon, label }) => (
    <Chip
      icon={<Icon sx={{ fontSize: "1rem !important" }} />}
      label={label}
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderColor: "#e2e8f0",
        color: "#475569",
        fontWeight: 500,
        fontSize: "0.9rem",
      }}
    />
  );

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", position: "relative" }}>
      {!isEmbedded && (
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: 2,
            bgcolor: "#fff",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <IconButton onClick={onBack} size="small" sx={{ color: "#6366f1" }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography
            sx={{ fontWeight: 700, color: "#0f172a", fontSize: "1rem" }}
          >
            Job Details
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            onClick={() => onToggleSave?.(job.id)}
            size="small"
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: 1.5,
              color: isSaved ? "#f59e0b" : "#94a3b8",
            }}
          >
            {isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          </IconButton>
        </Box>
      )}

      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {/* Header Section */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                bgcolor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 2,
                mb: 3,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", md: "center" },
                  gap: 2,
                  mb: 3,
                  flexDirection: { xs: "column", md: "row" },
                }}
              >
                <Box sx={{ display: "flex", gap: 2.5, alignItems: "flex-start" }}>
                  <Avatar
                    sx={{
                      width: 72,
                      height: 72,
                      bgcolor: job.logoColor || "#6366f1",
                      fontSize: "1.8rem",
                      fontWeight: 700,
                      borderRadius: 2,
                      flexShrink: 0,
                    }}
                  >
                    {job.company?.[0]}
                  </Avatar>
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 900,
                        fontSize: { xs: "1.5rem", md: "2rem" },
                        color: "#0f172a",
                        mb: 0.5,
                        letterSpacing: "-0.02em",
                        lineHeight: 1.2,
                      }}
                    >
                      {job.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "1.05rem",
                        color: "#64748b",
                        fontWeight: 600,
                      }}
                    >
                      {job.company}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Metadata Chips */}
              <Stack
                direction="row"
                spacing={1.5}
                flexWrap="wrap"
                sx={{
                  mb: 3,
                  gap: 1.5,
                  "& > *": { flexShrink: 0 },
                }}
              >
                <MatchBadge score={job.matchScore} size="lg" />
                <MetadataChip icon={LocationOnIcon} label={job.location} />
                <MetadataChip icon={MoreTimeIcon} label={job.workMode} />
                <Chip
                  label={job.salary}
                  sx={{
                    bgcolor: "#ecfdf5",
                    color: "#047857",
                    fontWeight: 700,
                    borderRadius: 2,
                    fontSize: "0.9rem",
                  }}
                />
                {job.posted && (
                  <Typography
                    sx={{
                      fontSize: "0.85rem",
                      color: "#94a3b8",
                      alignSelf: "center",
                      ml: 1,
                    }}
                  >
                    Posted {job.posted}
                  </Typography>
                )}
              </Stack>
            </Paper>

            {/* About the Role Section */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                bgcolor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 2,
                mb: 3,
              }}
            >
              <SectionHeader icon={WorkIcon} title="About the Role" />
              <Typography
                sx={{
                  color: "#475569",
                  lineHeight: 1.8,
                  whiteSpace: "pre-line",
                  fontSize: "0.95rem",
                  display: '-webkit-box',
                  WebkitLineClamp: expandedDescription ? 'unset' : 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: expandedDescription ? 'visible' : 'hidden',
                  maxHeight: expandedDescription ? 'none' : 'calc(1.8em * 3)',
                  marginBottom: '1rem',
                }}
              >
                {job.description}
              </Typography>
              <Button
                onClick={() => setExpandedDescription(!expandedDescription)}
                sx={{
                  textTransform: 'none',
                  color: '#6366f1',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  p: 0,
                  '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                }}
              >
                {expandedDescription ? '↑ Show Less' : '↓ Show More'}
              </Button>
            </Paper>

            {/* Responsibilities Section */}
            {job.responsibilities && (
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  bgcolor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 2,
                  mb: 3,
                }}
              >
                <SectionHeader icon={CheckCircleIcon} title="Key Responsibilities" />
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {(Array.isArray(job.responsibilities)
                    ? job.responsibilities
                    : job.responsibilities.split("\n").filter((r) => r.trim())
                  ).map((responsibility, idx) => (
                    <Box
                      key={idx}
                      sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}
                    >
                      <CheckCircleIcon
                        sx={{
                          color: "#10b981",
                          fontSize: "1.2rem",
                          mt: 0.25,
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        sx={{
                          color: "#475569",
                          fontSize: "0.95rem",
                          lineHeight: 1.6,
                        }}
                      >
                        {responsibility}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            )}

            {/* Company Culture / About Section */}
            {job.about && (
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  bgcolor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 2,
                  mb: 3,
                }}
              >
                <SectionHeader icon={BusinessIcon} title="About the Company" />
                <Typography
                  sx={{
                    color: "#475569",
                    lineHeight: 1.8,
                    fontSize: "0.95rem",
                  }}
                >
                  {job.about}
                </Typography>
              </Paper>
            )}

            {/* Benefits Section */}
            {job.benefits && (
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  bgcolor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 2,
                  mb: 3,
                }}
              >
                <SectionHeader icon={TrendingUpIcon} title="Benefits & Perks" />
                <Grid container spacing={2}>
                  {(Array.isArray(job.benefits)
                    ? job.benefits
                    : job.benefits.split(",").filter((b) => b.trim())
                  ).map((benefit, idx) => (
                    <Grid item xs={12} sm={6} key={idx}>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "#f0f9ff",
                          border: "1px solid #bae6fd",
                          borderRadius: 1.5,
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <CheckCircleIcon
                          sx={{
                            color: "#0ea5e9",
                            fontSize: "1.3rem",
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          sx={{
                            color: "#0c4a6e",
                            fontSize: "0.9rem",
                            fontWeight: 500,
                          }}
                        >
                          {benefit}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}
          </Grid>

          {/* Sidebar Section */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 3.5 },
                bgcolor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 2,
                position: "sticky",
                top: isMobile ? "auto" : 80,
              }}
            >
              {/* Required Skills Section */}
              <Box sx={{ mb: 3.5 }}>
                <SectionHeader icon={SchoolIcon} title="Required Skills" />
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {job.keySkillsMatched.map((s) => (
                    <Chip
                      key={s}
                      label={s}
                      size="small"
                      sx={{
                        bgcolor: "#ede9fe",
                        color: "#4f46e5",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        borderRadius: 1.5,
                      }}
                    />
                  ))}
                </Box>
                {job.keySkillsMissing && job.keySkillsMissing.length > 0 && (
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        mt: 2,
                        mb: 1,
                      }}
                    >
                      Skills to Develop
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {job.keySkillsMissing.map((s) => (
                        <Chip
                          key={s}
                          label={s}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderStyle: "dashed",
                            color: "#64748b",
                            fontSize: "0.85rem",
                            borderRadius: 1.5,
                            borderColor: "#cbd5e1",
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>

              <Divider sx={{ my: 2.5, bgcolor: "#e2e8f0" }} />

              {/* Job Details Box */}
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        mb: 0.75,
                      }}
                    >
                      Job Type
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: "#0f172a",
                        fontSize: "0.95rem",
                      }}
                    >
                      {job.jobType || "Full-time"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        mb: 0.75,
                      }}
                    >
                      Experience
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: "#0f172a",
                        fontSize: "0.95rem",
                      }}
                    >
                      {job.experience || "2-4 years"}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {job.teamSize && (
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 2,
                      bgcolor: "#f8fafc",
                      borderRadius: 1.5,
                      mb: 2,
                    }}
                  >
                    <GroupsIcon sx={{ color: "#6366f1", fontSize: "1.3rem" }} />
                    <Box>
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                        }}
                      >
                        Team Size
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: "#0f172a",
                          fontSize: "0.9rem",
                        }}
                      >
                        {job.teamSize}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              <Divider sx={{ my: 2.5, bgcolor: "#e2e8f0" }} />

              {/* Call to Action */}
              <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{
                  py: 1.8,
                  borderRadius: 1.5,
                  fontWeight: 800,
                  fontSize: "1rem",
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                  boxShadow: "0 8px 16px rgba(99,102,241,0.25)",
                  mb: 1.5,
                  textTransform: "none",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 12px 24px rgba(99,102,241,0.35)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Apply Now
              </Button>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                sx={{
                  py: 1.5,
                  borderRadius: 1.5,
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  borderColor: "#e2e8f0",
                  color: "#64748b",
                  textTransform: "none",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: "#f8fafc",
                    borderColor: "#cbd5e1",
                  },
                }}
              >
                {isSaved ? "Saved" : "Save for Later"}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default JobDetailScreen;
