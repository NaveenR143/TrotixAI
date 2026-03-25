import React, { useState } from "react";
import { Typography, Button, TextField, Paper, Container, Stack, Fade } from "@mui/material";
import Grid from "@mui/material/Grid2";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const ProfileEditScreen = ({ initialData, onSave }) => {
  const [profile, setProfile] = useState(initialData);

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Fade in={true} timeout={800}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <Typography variant="h5" fontWeight={700} color="text.primary" gutterBottom>Review Extracted Profile</Typography>
          <Typography variant="body2" color="text.secondary" mb={4}>Our AI parsed your resume. Tweak the details below to improve job matching.</Typography>
          
          <Stack spacing={3}>
            <TextField label="Role Preferences" fullWidth variant="outlined" value={profile.rolePreferences} onChange={e => setProfile({...profile, rolePreferences: e.target.value})} />
            <TextField label="Skills (comma separated)" fullWidth variant="outlined" multiline rows={3} value={profile.skills} onChange={e => setProfile({...profile, skills: e.target.value})} />
            <Grid container spacing={2}>
              <Grid size={{xs: 6}}>
                <TextField label="Years of Experience" fullWidth variant="outlined" value={profile.experience} onChange={e => setProfile({...profile, experience: e.target.value})} />
              </Grid>
              <Grid size={{xs: 6}}>
                <TextField label="Location / Working Mode" fullWidth variant="outlined" value={profile.location} onChange={e => setProfile({...profile, location: e.target.value})} />
              </Grid>
            </Grid>
          </Stack>
          
          <Button variant="contained" size="large" fullWidth sx={{ mt: 5, borderRadius: 8, py: 1.5, background: 'linear-gradient(90deg, #2563EB, #3B82F6)', color: 'white', textTransform: 'none', fontSize: '1.1rem', boxShadow: '0 4px 6px rgba(37,99,235,0.25)', '&:hover': { background: '#1D4ED8' } }} onClick={() => onSave(profile)}>
            <CheckCircleIcon sx={{ mr: 1 }} /> Save & View Jobs
          </Button>
        </Paper>
      </Fade>
    </Container>
  );
};

export default ProfileEditScreen;
