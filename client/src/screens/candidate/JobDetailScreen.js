// screens/candidate/JobDetailScreen.js
import React from "react";
import {
  Box, Typography, Button, Card, Chip, Avatar, IconButton,
  Stack, Divider, Grid, Paper
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MatchBadge from "../../components/jobs/MatchBadge";
import { getWorkModeIcon } from "../../utils/themeUtils";

const JobDetailScreen = ({ job, onBack, isEmbedded = false, savedJobs = new Set(), onToggleSave }) => {
  const isSaved = savedJobs.has(job.id);

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100%', position: 'relative' }}>
      {!isEmbedded && (
        <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={onBack} size="small"><ArrowBackIcon /></IconButton>
          <Typography sx={{ fontWeight: 700 }}>Job Details</Typography>
        </Box>
      )}

      <Box sx={{ p: { xs: 3, md: 5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center' }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: job.logoColor || '#6366f1', fontSize: '1.5rem', fontWeight: 700, borderRadius: 3 }}>
              {job.company?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, fontSize: { xs: '1.5rem', md: '1.8rem' }, color: '#0f172a', mb: 0.5, letterSpacing: '-0.02em' }}>
                {job.title}
              </Typography>
              <Typography sx={{ fontSize: '1.1rem', color: '#64748b', fontWeight: 600 }}>{job.company}</Typography>
            </Box>
          </Box>
          <IconButton onClick={() => onToggleSave?.(job.id)} sx={{ border: '1px solid #e2e8f0' }}>
            {isSaved ? <BookmarkIcon sx={{ color: '#f59e0b' }} /> : <BookmarkBorderIcon />}
          </IconButton>
        </Box>

        <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ mb: 4 }}>
          <MatchBadge score={job.matchScore} size="lg" />
          <Chip icon={<LocationOnIcon sx={{ fontSize: '1rem !important' }} />} label={job.location} variant="outlined" sx={{ borderRadius: 2 }} />
          <Chip label={`${getWorkModeIcon(job.workMode)} ${job.workMode}`} variant="outlined" sx={{ borderRadius: 2 }} />
          <Chip label={job.salary} sx={{ bgcolor: '#ecfdf5', color: '#047857', fontWeight: 700, borderRadius: 2 }} />
        </Stack>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>About the Role</Typography>
            <Typography sx={{ color: '#475569', lineHeight: 1.8, whiteSpace: 'pre-line', mb: 4 }}>{job.description}</Typography>

            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>Company Culture</Typography>
            <Typography sx={{ color: '#475569', lineHeight: 1.8, mb: 4 }}>{job.about}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 3, position: 'sticky', top: 24 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Required Skills</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
                {job.keySkillsMatched.map(s => (
                  <Chip key={s} label={s} size="small" sx={{ bgcolor: '#ede9fe', color: '#4f46e5', fontWeight: 600 }} />
                ))}
                {job.keySkillsMissing?.map(s => (
                  <Chip key={s} label={s} size="small" variant="outlined" sx={{ borderStyle: 'dashed', color: '#64748b' }} />
                ))}
              </Box>

              <Button variant="contained" fullWidth size="large" sx={{ py: 1.8, borderRadius: 100, fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 8px 16px rgba(99,102,241,0.25)' }}>
                Apply Now
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default JobDetailScreen;
