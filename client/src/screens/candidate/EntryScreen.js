// screens/candidate/EntryScreen.js
import React, { useState } from "react";
import {
  Box, Typography, Button, TextField, Paper, Container,
  InputAdornment, Stack, Chip,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckIcon from "@mui/icons-material/Check";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { fadeSlideUp } from "../../utils/themeUtils";
import StatPill from "../../components/common/StatPill";
import ResumeUpload from "../../components/upload/ResumeUpload";

const EntryScreen = ({ onUpload, onDirectSearch, onManualEntry }) => {
  const [searchValues, setSearchValues] = useState({ title: '', skills: '', location: '' });

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: 'calc(100vh - 64px)' }}>
      <Box
        sx={{
          pt: { xs: 2, md: 4 }, pb: { xs: 6, md: 8 },
          textAlign: 'center', px: 2, position: 'relative', overflow: 'hidden',
          '&::before': {
            content: '""', position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Chip
          icon={<AutoAwesomeIcon sx={{ fontSize: '0.85rem !important', color: '#6366f1 !important' }} />}
          label="AI-Powered Job Matching"
          sx={{ mb: 3, bgcolor: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', fontWeight: 600, animation: `${fadeSlideUp} 0.4s both` }}
        />
        <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3.25rem' }, fontWeight: 900, letterSpacing: '-0.04em', color: '#0f172a', lineHeight: 1.1, mb: 2, animation: `${fadeSlideUp} 0.4s 0.05s both` }}>
          Land your dream job<br />
          <Box component="span" sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>10× faster</Box>
        </Typography>
        <Typography sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, color: '#64748b', maxWidth: 480, mx: 'auto', mb: 4, lineHeight: 1.7, animation: `${fadeSlideUp} 0.4s 0.1s both` }}>
          Upload your resume and our AI finds the best matching jobs instantly, scored by your exact skill profile.
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" gap={1} sx={{ animation: `${fadeSlideUp} 0.4s 0.15s both` }}>
          <StatPill value="50k+" label="Active Jobs" delay={200} />
          <StatPill value="94%" label="Match Accuracy" delay={250} />
          <StatPill value="2min" label="To First Match" delay={300} />
        </Stack>
      </Box>

      <Container maxWidth="md" sx={{ pb: 10 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ p: 4, height: '100%', border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(15,23,42,0.06)', display: 'flex', flexDirection: 'column', gap: 3, position: 'relative', overflow: 'hidden', animation: `${fadeSlideUp} 0.5s 0.2s both`, '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: '16px 16px 0 0' } }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AutoAwesomeIcon sx={{ color: '#6366f1', fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>AI Resume Match</Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 600 }}>RECOMMENDED</Typography>
                  </Box>
                </Box>
                <Typography sx={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.65 }}>Upload your resume and our AI extracts your career profile — then ranks matching jobs by compatibility.</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {['Extracts skills & experience automatically', 'Scores match % for every job', 'Highlights skill gaps to close'].map((item) => (
                  <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CheckIcon sx={{ color: '#16a34a', fontSize: 12 }} />
                    </Box>
                    <Typography sx={{ fontSize: '0.82rem', color: '#475569' }}>{item}</Typography>
                  </Box>
                ))}
              </Box>
              <ResumeUpload onSuccess={onUpload} />
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Button variant="text" size="small" onClick={onManualEntry} sx={{ color: '#6366f1', fontWeight: 600, fontSize: '0.78rem', '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' } }}>
                  Don't have a resume? Fill details manually
                </Button>
                <Button variant="text" size="small" onClick={onDirectSearch} sx={{ color: '#94a3b8', fontSize: '0.72rem', '&:hover': { color: '#64748b' } }}>
                  Skip — I'm a returning user
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ p: 4, height: '100%', border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(15,23,42,0.06)', display: 'flex', flexDirection: 'column', gap: 3, animation: `${fadeSlideUp} 0.5s 0.3s both` }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SearchIcon sx={{ color: '#0ea5e9', fontSize: 20 }} />
                  </Box>
                  <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>Direct Search</Typography>
                </Box>
                <Typography sx={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.65 }}>Prefer manual control? Enter your criteria below and browse the full job feed.</Typography>
              </Box>
              <form onSubmit={(e) => { e.preventDefault(); onDirectSearch(); }}>
                <Stack spacing={2} sx={{ flexGrow: 1 }}>
                  <TextField fullWidth placeholder="Job title (e.g. Frontend Developer)" size="small" value={searchValues.title} onChange={(e) => setSearchValues({ ...searchValues, title: e.target.value })}
                    InputProps={{ startAdornment: (<InputAdornment position="start"><WorkIcon sx={{ fontSize: 16, color: '#94a3b8' }} /></InputAdornment>), }} />
                  <TextField fullWidth placeholder="Skills (e.g. React, Node.js)" size="small" value={searchValues.skills} onChange={(e) => setSearchValues({ ...searchValues, skills: e.target.value })}
                    InputProps={{ startAdornment: (<InputAdornment position="start"><AutoAwesomeIcon sx={{ fontSize: 16, color: '#94a3b8' }} /></InputAdornment>), }} />
                  <TextField fullWidth placeholder="Location or 'Remote'" size="small" value={searchValues.location} onChange={(e) => setSearchValues({ ...searchValues, location: e.target.value })}
                    InputProps={{ startAdornment: (<InputAdornment position="start"><LocationOnIcon sx={{ fontSize: 16, color: '#94a3b8' }} /></InputAdornment>), }} />
                </Stack>
                <Button type="submit" variant="outlined" size="large" fullWidth endIcon={<ArrowForwardIcon />} sx={{ mt: 2, py: 1.5, fontSize: '0.95rem', borderColor: '#e2e8f0', color: '#0f172a', '&:hover': { borderColor: '#0f172a', bgcolor: '#f8fafc', transform: 'translateY(-1px)' } }}>Browse Jobs</Button>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default EntryScreen;
