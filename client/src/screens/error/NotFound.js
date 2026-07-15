import React from "react";
import { Box, Typography, Button, Container, Stack, useTheme, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const NotFound = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#FFFFFF',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background blobs for premium look */}
      <Box sx={{
        position: 'absolute',
        top: '-10%',
        right: '-10%',
        width: { xs: '60%', md: '40%' },
        height: { xs: '60%', md: '40%' },
        background: 'radial-gradient(circle, rgba(37, 99, 235, 0.05) 0%, transparent 70%)',
        zIndex: 0
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '-10%',
        left: '-10%',
        width: { xs: '60%', md: '40%' },
        height: { xs: '60%', md: '40%' },
        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.05) 0%, transparent 70%)',
        zIndex: 0
      }} />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Stack spacing={{ xs: 4, md: 6 }} alignItems="center" textAlign="center">
          {/* Illustration */}
          <Box sx={{
            width: { xs: 260, md: 380 },
            height: { xs: 260, md: 380 },
            position: 'relative',
            transition: 'transform 0.5s ease-in-out',
            '&:hover': {
              transform: 'scale(1.02)'
            }
          }}>
            <Box
              component="img"
              src="/assets/images/404-illustration.png"
              alt="404 Page Not Found"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 20px 40px rgba(37, 99, 235, 0.15))'
              }}
            />
          </Box>

          <Stack spacing={2} alignItems="center">
            <Typography variant="h1" sx={{
              fontSize: { xs: '5rem', md: '8rem' },
              fontWeight: 1000,
              lineHeight: 0.8,
              background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.05em',
              mb: 1
            }}>
              404
            </Typography>

            <Typography variant="h2" sx={{
              fontSize: { xs: '1.5rem', md: '2.5rem' },
              fontWeight: 800,
              color: '#111827',
              letterSpacing: '-0.04em',
              lineHeight: 1.2
            }}>
              Lost in the AI Cloud?
            </Typography>

            <Typography sx={{
              fontSize: { xs: '0.95rem', md: '1.1rem' },
              color: '#212121',
              maxWidth: 520,
              lineHeight: 1.6,
              fontWeight: 400,
              px: { xs: 2, md: 0 }
            }}>
              The page you're looking for has drifted away. Don't worry, our career engine is already recalculating the path to your success.
            </Typography>
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              pt: 2,
              px: { xs: 4, sm: 0 }
            }}
          >
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
              sx={{
                borderRadius: '16px',
                px: 5,
                py: 1.8,
                fontWeight: 700,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                fontSize: '1rem',
                boxShadow: '0 8px 25px rgba(37, 99, 235, 0.25)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1D4ED8 0%, #6D28D9 100%)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 30px rgba(37, 99, 235, 0.35)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              Back to Dashboard
            </Button>

            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              sx={{
                borderRadius: '16px',
                px: 5,
                py: 1.8,
                fontWeight: 700,
                textTransform: 'none',
                color: '#111827',
                borderColor: '#E2E8F0',
                borderWidth: '2px',
                fontSize: '1rem',
                '&:hover': {
                  borderColor: '#2563EB',
                  borderWidth: '2px',
                  bgcolor: 'rgba(37, 99, 235, 0.02)',
                  transform: 'translateY(-3px)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              Go Back
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default NotFound;
