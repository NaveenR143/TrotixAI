// screens/candidate/ProfileEditScreen.js
import React, { useState } from "react";
import {
  Typography, Button, TextField, Paper, Container, Stack, Box, Chip,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { fadeSlideUp } from "../../utils/themeUtils";
import SkillTag from "../../components/profile/SkillTag";
import CompletionBar from "../../components/profile/CompletionBar";

const ProfileEditScreen = ({ initialData, onSave }) => {
  const [profile, setProfile] = useState({
    ...initialData,
    skillList: initialData.skills?.split(',').map(s => s.trim()).filter(Boolean) || [],
  });
  const [newSkill, setNewSkill] = useState('');

  const addSkill = (skill) => {
    const s = skill.trim();
    if (s && !profile.skillList.includes(s)) {
      setProfile(p => ({ ...p, skillList: [...p.skillList, s] }));
    }
    setNewSkill('');
  };

  const removeSkill = (skill) =>
    setProfile(p => ({ ...p, skillList: p.skillList.filter(s => s !== skill) }));

  const completeness = Math.min(
    20 * [profile.rolePreferences, profile.skillList.length > 0, profile.experience, profile.preferredLocation, true].filter(Boolean).length,
    100
  );

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: 'calc(100vh - 64px)', py: 6 }}>
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 5, animation: `${fadeSlideUp} 0.4s both` }}>
          <Box sx={{ width: 52, height: 52, borderRadius: '14px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, boxShadow: '0 6px 20px rgba(16,185,129,0.3)' }}>
            <CheckCircleIcon sx={{ color: '#fff', fontSize: 26 }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', color: '#0f172a', letterSpacing: '-0.03em', mb: 0.5 }}>Resume parsed successfully</Typography>
          <Typography sx={{ fontSize: '0.88rem', color: '#64748b' }}>Review what our AI extracted and refine your profile to improve match quality.</Typography>
        </Box>

        <Paper elevation={0} sx={{ p: 4, border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(15,23,42,0.06)', animation: `${fadeSlideUp} 0.4s 0.1s both` }}>
          <CompletionBar pct={completeness} />
          <Stack spacing={3}>
            <Box>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>Target Roles</Typography>
              <TextField fullWidth size="small" placeholder="e.g. Senior Frontend Engineer" value={profile.rolePreferences} onChange={(e) => setProfile({ ...profile, rolePreferences: e.target.value })} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Skills</Typography>
                <Chip icon={<AutoAwesomeIcon sx={{ fontSize: '0.8rem !important', color: '#6366f1 !important' }} />} label={`${profile.skillList.length} detected`} size="small" sx={{ bgcolor: '#ede9fe', color: '#4f46e5', border: '1px solid #c4b5fd', height: 20, fontSize: '0.7rem' }} />
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, p: 2, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#f8fafc', minHeight: 60 }}>
                {profile.skillList.map((skill, i) => (
                  <SkillTag key={skill} label={skill} matched={i < 5} onDelete={() => removeSkill(skill)} />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                <TextField size="small" placeholder="Add a skill…" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addSkill(newSkill); }} sx={{ flexGrow: 1 }} />
                <Button variant="outlined" size="small" onClick={() => addSkill(newSkill)} sx={{ borderColor: '#e2e8f0', color: '#64748b', '&:hover': { borderColor: '#6366f1', color: '#6366f1' } }}>Add</Button>
              </Box>
            </Box>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>Experience</Typography>
                <TextField fullWidth size="small" placeholder="e.g. 5 years" value={profile.experience} onChange={(e) => setProfile({ ...profile, experience: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>Job Preferred Location</Typography>
                <TextField fullWidth size="small" placeholder="e.g. Remote, US" value={profile.preferredLocation} onChange={(e) => setProfile({ ...profile, preferredLocation: e.target.value })} />
              </Grid>
            </Grid>
          </Stack>
          <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Button variant="contained" size="large" fullWidth onClick={() => onSave(profile)} endIcon={<ArrowForwardIcon />} sx={{ py: 1.5, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)', '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #4338ca)', transform: 'translateY(-1px)' } }}>Save & View Matched Jobs</Button>
            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>You can always update your profile from the job feed</Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ProfileEditScreen;
