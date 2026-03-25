import React from "react";
import { Box, Typography, Button, Paper, Container, Chip, Avatar, Divider, Stack } from "@mui/material";
import Grid from "@mui/material/Grid2";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const getMatchColor = (score) => {
  if (score >= 90) return '#22C55E';
  if (score >= 75) return '#F59E0B';
  return '#94A3B8';
};

const JobDetailScreen = ({ job, onBack, isEmbedded }) => {
  const matchColor = getMatchColor(job.matchScore);

  const Content = (
    <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: isEmbedded ? 0 : 4, bgcolor: '#FFFFFF', border: isEmbedded ? 'none' : '1px solid #E2E8F0', boxShadow: isEmbedded ? 'none' : '0 10px 40px rgba(0,0,0,0.05)', height: isEmbedded ? '100%' : 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Avatar sx={{ width: 80, height: 80, bgcolor: '#EFF6FF', color: '#2563EB', fontSize: '2rem', fontWeight: 700, mr: 3 }}>{job.company[0]}</Avatar>
        <Box>
          <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>{job.title}</Typography>
          <Typography variant="h6" color="text.secondary">{job.company}</Typography>
        </Box>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
        <Chip icon={<LocationOnIcon sx={{ color: '#64748B' }} />} label={job.location} sx={{ bgcolor: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0', fontSize: '1rem', py: 2.5 }} />
        <Chip icon={<WorkIcon sx={{ color: '#64748B' }} />} label={job.salary} sx={{ bgcolor: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0', fontSize: '1rem', py: 2.5 }} />
        <Chip icon={<FlashOnIcon sx={{ color: `${matchColor} !important` }} />} label={`${job.matchScore}% Match Score`} sx={{ bgcolor: matchColor + '1A', color: matchColor, fontWeight: 600, border: `1px solid ${matchColor}4D`, fontSize: '1rem', py: 2.5 }} />
      </Stack>

      <Divider sx={{ my: 4, borderColor: '#E2E8F0' }} />

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Typography variant="h6" fontWeight={700} color="text.primary" gutterBottom>Job Description</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
            {job.description}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 3, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <Typography variant="subtitle1" fontWeight={700} color="text.primary" gutterBottom>Skill Analysis</Typography>

            <Typography variant="subtitle2" color="primary" sx={{ mt: 2, mb: 1 }}>You Match ({job.keySkillsMatched.length}):</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {job.keySkillsMatched.map(s => <Chip key={s} label={s} size="small" sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 500 }} />)}
            </Box>

            {job.keySkillsMissing.length > 0 && (
              <>
                <Typography variant="subtitle2" color="error" sx={{ mt: 3, mb: 1 }}>Skill Gaps ({job.keySkillsMissing.length}):</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {job.keySkillsMissing.map(s => <Chip key={s} label={s} size="small" sx={{ bgcolor: '#FEF2F2', color: '#EF4444', fontWeight: 500 }} />)}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                  Consider highlighting these in your cover letter or brushing up to improve your chances.
                </Typography>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4, borderColor: '#E2E8F0' }} />

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
        <Button variant="contained" size="large" startIcon={<FlashOnIcon />} sx={{ borderRadius: 8, px: 4, py: 1.5, bgcolor: '#22C55E', color: 'white', textTransform: 'none', fontSize: '1.1rem', boxShadow: '0 4px 6px rgba(34,197,94,0.25)', transition: 'all 0.2s', '&:hover': { bgcolor: '#16A34A', transform: 'translateY(-2px)' } }}>
          Easy Apply
        </Button>
        <Button variant="outlined" size="large" sx={{ borderRadius: 8, px: 4, py: 1.5, borderColor: '#CBD5F5', color: '#2563EB', textTransform: 'none', fontSize: '1.1rem', '&:hover': { borderColor: '#2563EB', bgcolor: '#EFF6FF' } }}>
          Save for Later
        </Button>
      </Box>
    </Paper>
  );

  if (isEmbedded) return Content;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ color: 'text.secondary', mb: 3, textTransform: 'none', '&:hover': { color: 'text.primary', bgcolor: '#F8FAFC' } }}>
        Back to Feed
      </Button>
      {Content}
    </Container>
  );
};

export default JobDetailScreen;
