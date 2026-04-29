import React from "react";
import {
  Box, Container, Typography, Grid, Card, CardContent, CardActions,
  Button, Chip, Stack, useTheme
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import StarIcon from "@mui/icons-material/Star";

const PRICING_PLANS = [
  {
    id: "basic",
    name: "Basic Plan",
    price: "₹99",
    credits: 100,
    features: ["Standard Support", "Basic AI Access", "7-day History"],
    highlight: false
  },
  {
    id: "popular",
    name: "Popular Plan",
    price: "₹999",
    credits: 1200,
    features: ["Priority Support", "Advanced AI Access", "30-day History", "Best Value"],
    highlight: true,
    badge: "Best Value"
  },
  {
    id: "premium",
    name: "Premium Plan",
    price: "₹9999",
    credits: 15000,
    features: ["24/7 Dedicated Support", "Unlimited AI History", "Custom AI Fine-tuning", "Early Access to Beta"],
    highlight: false
  }
];

const AddCreditsScreen = () => {
  const theme = useTheme();

  const handlePurchase = (planId) => {
    console.log(`Purchasing plan: ${planId}`);
    alert(`Redirecting to payment gateway for ${planId}...`);
  };

  return (
    <Box sx={{ py: { xs: 2, sm: 4, md: 6 }, bgcolor: '#f8fafc', minHeight: 'calc(100vh - 64px)' }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 4, md: 5 } }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, color: '#0f172a', fontSize: { xs: '1.75rem', sm: '2.5rem', md: '2.75rem' }, letterSpacing: '-0.02em' }}>
            Add <Box component="span" sx={{ color: '#6366f1' }}>Credits</Box>
          </Typography>
          <Typography sx={{ color: '#64748b', fontWeight: 500, maxWidth: 700, mx: 'auto', fontSize: { xs: '1rem', md: '1.2rem' }, lineHeight: 1.6 }}>
            Boost your job search with AI-powered insights and professional content generation. Choose the plan that fits your career goals.
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 3, md: 4, lg: 5 }} alignItems="stretch" justifyContent="center">
          {PRICING_PLANS.map((plan) => (
            <Grid item xs={12} sm={8} md={4} key={plan.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  borderRadius: 5,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: plan.highlight ? `2px solid #6366f1` : '1px solid #e2e8f0',
                  boxShadow: plan.highlight ? '0 20px 48px rgba(99, 102, 241, 0.12)' : '0 4px 12px rgba(15, 23, 42, 0.03)',
                  transform: plan.highlight ? { md: 'scale(1.05)' } : 'none',
                  zIndex: plan.highlight ? 2 : 1,
                  '&:hover': {
                    transform: plan.highlight ? { md: 'scale(1.08)' } : 'translateY(-8px)',
                    boxShadow: plan.highlight ? '0 24px 64px rgba(99, 102, 241, 0.18)' : '0 12px 32px rgba(15, 23, 42, 0.08)',
                  }
                }}
              >
                {plan.badge && (
                  <Chip
                    label={plan.badge}
                    color="secondary"
                    size="small"
                    icon={<StarIcon sx={{ fontSize: '14px !important' }} />}
                    sx={{
                      position: 'absolute',
                      top: 20,
                      right: 20,
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      height: 26,
                      background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                      color: '#fff',
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                    }}
                  />
                )}

                <CardContent sx={{ p: { xs: 3.5, md: 4 }, flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ color: plan.highlight ? '#4f46e5' : '#1e293b', fontWeight: 800, mb: 1, fontSize: '1.25rem' }}>
                    {plan.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: '2.5rem', md: '3rem' } }}>{plan.price}</Typography>
                    <Typography variant="body1" sx={{ color: '#64748b', ml: 1, fontWeight: 500 }}>one-time</Typography>
                  </Box>

                  <Box sx={{ py: 2.5, px: 2.5, bgcolor: plan.highlight ? '#f5f3ff' : '#f8fafc', borderRadius: 4, mb: 4, display: 'flex', alignItems: 'center', gap: 2.5, border: plan.highlight ? '1px solid #ddd6fe' : '1px solid #f1f5f9' }}>
                    <Box sx={{
                      width: 44, height: 44, borderRadius: '14px',
                      bgcolor: plan.highlight ? '#6366f1' : '#0f172a',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff',
                      boxShadow: plan.highlight ? '0 4px 12px rgba(99, 102, 241, 0.25)' : 'none'
                    }}>
                      <AutoAwesomeIcon sx={{ fontSize: 22 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 900, color: '#0f172a', lineHeight: 1, fontSize: '1.1rem' }}>{plan.credits}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mt: 0.5, letterSpacing: '0.02em' }}>TOTAL CREDITS</Typography>
                    </Box>
                  </Box>

                  <Stack spacing={2}>
                    {plan.features.map((feature, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', bgcolor: plan.highlight ? '#eef2ff' : '#f0fdf4' }}>
                          <CheckCircleIcon sx={{ fontSize: 14, color: plan.highlight ? '#6366f1' : '#10b981' }} />
                        </Box>
                        <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500, fontSize: '0.9rem' }}>{feature}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>

                <CardActions sx={{ p: { xs: 3.5, md: 4 }, pt: 0 }}>
                  <Button
                    fullWidth
                    variant={plan.highlight ? "contained" : "outlined"}
                    size="large"
                    onClick={() => handlePurchase(plan.id)}
                    sx={{
                      py: { xs: 1.5, md: 1.8 },
                      borderRadius: 3,
                      fontWeight: 800,
                      fontSize: '1rem',
                      letterSpacing: '0.01em',
                      transition: 'all 0.2s',
                      ...(plan.highlight ? {
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 20px rgba(15, 23, 42, 0.25)',
                        }
                      } : {
                        borderColor: '#e2e8f0',
                        color: '#0f172a',
                        borderWidth: 2,
                        '&:hover': {
                          borderColor: '#0f172a',
                          borderWidth: 2,
                          bgcolor: '#f8fafc',
                          transform: 'translateY(-2px)'
                        }
                      })
                    }}
                  >
                    Get Started
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: { xs: 8, md: 12 }, textAlign: 'center', p: { xs: 4, md: 6 }, bgcolor: '#fff', borderRadius: 5, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: '#0f172a' }}>Need a custom plan?</Typography>
          <Typography sx={{ color: '#64748b', mb: 3, fontSize: '1rem' }}>For enterprise solutions or high-volume credits, please contact our sales team.</Typography>
          <Button variant="contained" sx={{ bgcolor: '#f1f5f9', color: 'white', fontWeight: 700, px: 4, py: 1.2, borderRadius: 2.5, '&:hover': { bgcolor: '#e2e8f0' } }}>Contact Support</Button>
        </Box>
      </Container>
    </Box>
  );
};

export default AddCreditsScreen;
