// screens/candidate/EntryScreen.js
import React, { useState } from "react";
import {
  Box, Typography, Button, TextField, Paper, Container,
  InputAdornment, Stack, Chip, IconButton,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckIcon from "@mui/icons-material/Check";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { fadeSlideUp } from "../../utils/themeUtils";
import StatPill from "../../components/common/StatPill";
import ResumeUpload from "../../components/upload/ResumeUpload";

const EntryScreen = ({ onUpload, onDirectSearch, onManualEntry, onPostJob }) => {
  const [searchValues, setSearchValues] = useState({ title: '', skills: '', location: '' });

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 10 }}>
      {/* Hero Header */}
      <Box
        sx={{
          pt: { xs: 6, md: 10 }, pb: { xs: 8, md: 12 },
          textAlign: 'center', px: 2, position: 'relative', overflow: 'hidden',
          backgroundImage: 'radial-gradient(circle at 50% -20%, rgba(37, 99, 235, 0.1), transparent 70%)',
        }}
      >
        {/* Recruiter CTA - Top Right */}
        <Box sx={{ position: 'absolute', top: 32, right: { xs: 16, md: 40 }, zIndex: 10 }}>
            <Button
              variant="outlined"
              onClick={onPostJob}
              sx={{
                borderRadius: '12px', px: 3, py: 1, fontWeight: 700, textTransform: 'none',
                borderColor: '#E5E7EB', color: '#475569', bgcolor: '#FFFFFF',
                '&:hover': { bgcolor: '#F8FAFC', borderColor: '#2563EB', color: '#2563EB' }
              }}
            >
              For Employers: Post Job
            </Button>
        </Box>

        <Container maxWidth="md">
            <Stack spacing={3} sx={{ alignItems: 'center' }}>
                <Box sx={{ px: 2, py: 0.75, bgcolor: '#eff6ff', borderRadius: '24px', display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 16, color: '#2563EB' }} />
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    AI-Driven Career Matching
                  </Typography>
                </Box>

                <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, fontWeight: 950, letterSpacing: '-0.04em', color: '#111827', lineHeight: 1.05 }}>
                  The smarter way to <br />
                  <Box component="span" sx={{ background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>get hired.</Box>
                </Typography>

                <Typography sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' }, color: '#64748B', maxWidth: 600, mx: 'auto', lineHeight: 1.6, fontWeight: 500 }}>
                  Upload your resume and let our AI handle the search. Get matched with roles that actually fit your profile.
                </Typography>

                <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" sx={{ pt: 2 }}>
                  <StatPill value="50k+" label="Active Roles" />
                  <StatPill value="98%" label="AI Precision" />
                  <StatPill value="Free" label="Forever" />
                </Stack>
            </Stack>
        </Container>
      </Box>

      {/* Main Action Section */}
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="center">
          <Grid size={{ xs: 12, md: 7, lg: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 4, md: 6 },
                borderRadius: '32px',
                border: '1px solid #E5E7EB',
                bgcolor: '#FFFFFF',
                boxShadow: '0 20px 50px rgba(0,0,0,0.04)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 30px 60px rgba(37, 99, 235, 0.08)' }
              }}
            >
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '16px', bgcolor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CloudUploadIcon sx={{ color: '#2563EB', fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#111827', lineHeight: 1.2 }}>Start with Resume</Typography>
                    <Typography sx={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: 700 }}>HIGHLY RECOMMENDED</Typography>
                  </Box>
                </Box>
                <Typography sx={{ color: '#64748B', fontSize: '1rem', lineHeight: 1.6, fontWeight: 500 }}>
                  Our AI will instantly parse your skills, experience, and projects to match you with top-tier openings.
                </Typography>
              </Box>

              <Box sx={{ bgcolor: '#F8FAFC', p: 3, borderRadius: '20px', border: '1px dashed #CBD5E1', mb: 4 }}>
                  <ResumeUpload onSuccess={(resumeData) => onUpload({ resumeData })} />
              </Box>

              <Stack spacing={2} sx={{ alignItems: 'center' }}>
                <Button 
                    variant="text" 
                    fullWidth 
                    onClick={onManualEntry} 
                    sx={{ py: 1.5, color: '#475569', fontWeight: 700, borderRadius: '12px', textTransform: 'none' }}
                >
                    Don't have a resume? Fill details manually
                </Button>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 2, borderTop: '1px solid #F1F5F9', width: '100%', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 500 }}>Returning user?</Typography>
                    <Button 
                        onClick={onDirectSearch} 
                        sx={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: 700, p: 0, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
                    >
                        Access My Feed
                    </Button>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Benefits Grid */}
          <Grid size={{ xs: 12, md: 5, lg: 5 }}>
            <Stack spacing={3} sx={{ height: '100%', justifyContent: 'center' }}>
                {[
                    { icon: RocketLaunchIcon, title: 'Instant Matching', text: 'Get ranked job lists within seconds of uploading.' },
                    { icon: AutoAwesomeIcon, title: 'Skill Gap Analysis', text: 'See exactly what skills you need for your target roles.' },
                    { icon: CheckIcon, title: 'Direct Access', text: 'Apply directly to hiring managers with one click.' }
                ].map((item, idx) => (
                    <Box key={idx} sx={{ display: 'flex', gap: 2.5 }}>
                        <Box sx={{ 
                            width: 52, height: 52, borderRadius: '16px', bgcolor: '#FFFFFF', 
                            border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                            <item.icon sx={{ color: '#2563EB', fontSize: 24 }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 800, color: '#111827', fontSize: '1.1rem', mb: 0.5 }}>{item.title}</Typography>
                            <Typography sx={{ color: '#64748B', fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.5 }}>{item.text}</Typography>
                        </Box>
                    </Box>
                ))}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default EntryScreen;
