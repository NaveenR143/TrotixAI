// screens/candidate/ProcessingScreen.js
import React, { useEffect, useState } from "react";
import { Box, Typography, Container, LinearProgress, Stack, Fade } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { fadeSlideUp, pulse } from "../../utils/themeUtils";

const steps = [
  "Uploading your resume...",
  "Extracting skills and experience...",
  "Analyzing matching patterns...",
  "Finding the best jobs for you...",
  "Almost ready!"
];

const ProcessingScreen = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(timer);
          setTimeout(onComplete, 800);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <Box sx={{ bgcolor: '#f8fafc', height: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="xs" sx={{ textAlign: 'center' }}>
        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 5 }}>
          <Box sx={{ width: 80, height: 80, borderRadius: '24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 32px rgba(99,102,241,0.35)', animation: `${pulse} 2s infinite ease-in-out` }}>
            <AutoAwesomeIcon sx={{ color: '#fff', fontSize: 40 }} />
          </Box>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 1.5, letterSpacing: '-0.02em', animation: `${fadeSlideUp} 0.5s both` }}>
          AI is Analyzing
        </Typography>

        <Box sx={{ mb: 4, height: 24, overflow: 'hidden' }}>
          <Fade in={true} key={currentStep} timeout={500}>
            <Typography sx={{ color: '#64748b', fontSize: '0.95rem' }}>
              {steps[currentStep]}
            </Typography>
          </Fade>
        </Box>

        <Box sx={{ width: '100%', bgcolor: '#e2e8f0', height: 6, borderRadius: 100, overflow: 'hidden', mb: 2 }}>
          <LinearProgress variant="determinate" value={((currentStep + 1) / steps.length) * 100} sx={{ height: '100%', bgcolor: 'transparent', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: 100 } }} />
        </Box>

        <Stack direction="row" justifyContent="center" spacing={3} sx={{ mt: 6, opacity: 0.6 }}>
          {['Parsing PDF', 'NLP Analysis', 'Vector Search'].map((label, i) => (
            <Typography key={label} sx={{ fontSize: '0.65rem', fontWeight: 800, color: i <= currentStep / 2 ? '#6366f1' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {label}
            </Typography>
          ))}
        </Stack>
      </Container>
    </Box>
  );
};

export default ProcessingScreen;
