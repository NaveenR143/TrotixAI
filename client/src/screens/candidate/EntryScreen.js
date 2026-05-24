import React, { useState, useEffect, useRef } from "react";
import {
  Box, Typography, Button, Paper, Container,
  Stack, Chip, IconButton, useMediaQuery, useTheme,
  styled, keyframes, Grid
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckIcon from "@mui/icons-material/Check";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DescriptionIcon from "@mui/icons-material/Description";
import BoltIcon from "@mui/icons-material/Bolt";
import AssessmentIcon from "@mui/icons-material/Assessment";
import MovingIcon from "@mui/icons-material/Moving";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PsychologyIcon from "@mui/icons-material/Psychology";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import EmailIcon from "@mui/icons-material/Email";
import TwitterIcon from "@mui/icons-material/Twitter";
import GitHubIcon from "@mui/icons-material/GitHub";
import SparklesIcon from "@mui/icons-material/AutoAwesome";
import ShieldCheckIcon from "@mui/icons-material/ShieldOutlined";
import FileTextIcon from "@mui/icons-material/DescriptionOutlined";
import WandSparklesIcon from "@mui/icons-material/AutoAwesomeOutlined";
import ScanSearchIcon from "@mui/icons-material/YoutubeSearchedFor";
import BriefcaseIcon from "@mui/icons-material/WorkOutline";
import FileCheckIcon from "@mui/icons-material/FactCheckOutlined";
import LineChartIcon from "@mui/icons-material/Timeline";
import ZapIcon from "@mui/icons-material/FlashOn";
import MapIcon from "@mui/icons-material/MapOutlined";
import LandmarkIcon from "@mui/icons-material/AccountBalanceOutlined";

import ResumeUpload from "../../components/upload/ResumeUpload";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Avatar from "@mui/material/Avatar";

// ─── Animations ───────────────────────────────────────────────────────────────
const floaty = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
`;

const pulseRing = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.28); }
  50% { box-shadow: 0 0 0 18px rgba(124, 58, 237, 0.02); }
`;

const scanBar = keyframes`
  0% { transform: translateY(0%); }
  50% { transform: translateY(74%); }
  100% { transform: translateY(0%); }
`;

const shine = keyframes`
  0% { transform: translateX(-120%) rotate(8deg); }
  100% { transform: translateX(120%) rotate(8deg); }
`;

const reveal = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ─── Styled Components ────────────────────────────────────────────────────────
const GlassBox = styled(Box)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.62)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  border: "1px solid rgba(229, 231, 235, 0.78)",
  boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)",
  borderRadius: "24px",
}));

const SoftGridBackground = styled(Box)({
  position: "absolute",
  inset: 0,
  backgroundImage: `
    linear-gradient(rgba(148, 163, 184, 0.16) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.16) 1px, transparent 1px)
  `,
  backgroundSize: "28px 28px",
  maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.85), transparent 95%)",
  opacity: 0.4,
  pointerEvents: "none",
});

const RevealBox = styled(Box)(({ theme, inView }) => ({
  opacity: inView ? 1 : 0,
  transform: inView ? "translateY(0)" : "translateY(18px)",
  transition: "opacity 700ms ease, transform 700ms ease",
}));

const GradientText = styled("span")({
  background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 52%, #0F172A 100%)",
  WebkitBackgroundClip: "text",
  WebkitFillColor: "transparent",
  backgroundClip: "text",
  color: "transparent",
});

const ShineButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: '-40%',
    background: 'linear-gradient(110deg, transparent 25%, rgba(255, 255, 255, 0.35) 45%, transparent 60%)',
    transform: 'translateX(-120%) rotate(8deg)',
    transition: 'transform 900ms ease',
    pointerEvents: 'none',
  },
  '&:hover::before': {
    transform: 'translateX(120%) rotate(8deg)',
  },
}));

// ─── Entry Screen Component ───────────────────────────────────────────────────
const EntryScreen = ({ onUpload, onDirectSearch, onManualEntry, onPostJob }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [revealed, setRevealed] = useState({});
  const observerRef = useRef(null);
  const actionSectionRef = useRef(null);

  useEffect(() => {
    if (isMobile && actionSectionRef.current) {
      const timer = setTimeout(() => {
        actionSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isMobile]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.15 }
    );

    const elements = document.querySelectorAll('.reveal-trigger');
    elements.forEach((el) => observer.observe(el));
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        elements.forEach((el) => observerRef.current.unobserve(el));
      }
    };
  }, []);

  const features = [
    {
      title: "Free Resume Builder",
      subtitle: "Create a professional resume with guided prompts, clean layouts, and smart content suggestions.",
      icon: <DescriptionIcon />,
      gradient: "linear-gradient(135deg, #2563EB, #0EA5E9)",
    },
    {
      title: "AI Instant Job Matching",
      subtitle: "Automatically discover roles that match your experience, goals, salary range, and location.",
      icon: <BoltIcon />,
      gradient: "linear-gradient(135deg, #7C3AED, #D946EF)",
    },
    {
      title: "ATS Resume Scoring",
      subtitle: "See how well your resume performs against ATS filters before you apply.",
      icon: <ShieldCheckIcon />,
      gradient: "linear-gradient(135deg, #0EA5E9, #6366F1)",
    },
    {
      title: "Skill Gap Analysis",
      subtitle: "Identify missing skills and understand exactly what to learn next.",
      icon: <AssessmentIcon />,
      gradient: "linear-gradient(135deg, #10B981, #14B8A6)",
    },
    {
      title: "Career Roadmap Insights",
      subtitle: "Get a clear path from your current profile to your next role with actionable milestones.",
      icon: <MapIcon />,
      gradient: "linear-gradient(135deg, #F59E0B, #F97316)",
    },
    {
      title: "Government Jobs",
      subtitle: "Explore public sector roles and curated opportunities aligned to your background.",
      icon: <LandmarkIcon />,
      gradient: "linear-gradient(135deg, #8B5CF6, #D946EF)",
    },
  ];

  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      {/* Top Navigation / CTA - Always Visible */}
      <Box sx={{
        position: 'absolute',
        top: { xs: 12, md: 22 },
        right: { xs: 10, md: 80 },
        zIndex: 99
      }}>
        <Button
          variant="contained"
          onClick={onPostJob}
          sx={{
            borderRadius: '12px', px: 2, py: 1, fontWeight: 800, textTransform: 'none',
            background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
            color: '#FFFFFF',
            fontSize: { xs: '0.7rem', md: '0.85rem' },
            boxShadow: '0 4px 15px rgba(37, 99, 235, 0.25)',
            border: 'none',
            '&:hover': {
              background: 'linear-gradient(135deg, #1D4ED8 0%, #6D28D9 100%)',
              boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)',
              transform: 'translateY(-1px)'
            }
          }}
        >
          {isMobile ? "Post Job" : "For Employers: Post Free Job"}
        </Button>
      </Box>

      {/* ─── Hero Section ─── */}
      <Box component="section" sx={{ position: "relative", pt: { xs: 8, md: 12 }, pb: { xs: 10, md: 16 }, overflow: "hidden" }}>
        <Box sx={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Box sx={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 20% 20%, rgba(37, 99, 235, 0.1), transparent 25%), radial-gradient(circle at 80% 20%, rgba(124, 58, 237, 0.1), transparent 22%)" }} />
          <SoftGridBackground />
        </Box>

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={7}>
              <RevealBox id="hero-text" className="reveal-trigger" inView={revealed["hero-text"]}>
                <Box sx={{ mb: 4, display: 'inline-flex', alignItems: 'center', gap: 1.5, px: 2, py: 1, borderRadius: 'full', border: '1px solid rgba(37, 99, 235, 0.2)', bgcolor: 'rgba(37, 99, 235, 0.05)' }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#2563EB' }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#2563EB', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    AI-powered job matching for modern careers
                  </Typography>
                </Box>
                <Typography variant="h1" sx={{ fontSize: { xs: "2.4rem", md: "4.4rem" }, fontWeight: 800, lineHeight: 1.1, mb: 3, letterSpacing: "-0.03em" }}>
                  The Smarter Way to <br />
                  <GradientText>Get Hired.</GradientText>
                </Typography>
                <Typography sx={{ fontSize: "1.15rem", color: "#64748B", lineHeight: 1.6, mb: 5, maxWidth: 540 }}>
                  Upload your resume, let our AI instantly match you with the right jobs, and uncover the exact skills that will help you land interviews faster.
                </Typography>

                <Grid container spacing={2} sx={{ mb: 6 }}>
                  {[
                    { icon: <FileTextIcon />, title: "Free Resume Builder", text: "Polished templates with guided content." },
                    { icon: <WandSparklesIcon />, title: "Instant AI Matching", text: "Smart recommendations from your profile." },
                    { icon: <ScanSearchIcon />, title: "Skill Gap Analysis", text: "Know what to improve before applying." }
                  ].map((item, i) => (
                    <Grid item xs={12} sm={4} key={i}>
                      <GlassBox sx={{ p: 2, height: '100%', border: '1px solid rgba(255,255,255,0.4)' }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5, color: '#2563EB' }}>
                          {item.icon}
                        </Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>{item.title}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block', lineHeight: 1.4 }}>{item.text}</Typography>
                      </GlassBox>
                    </Grid>
                  ))}
                </Grid>

                {/* Removed Hero Buttons as per user request */}
              </RevealBox>
            </Grid>

            <Grid item xs={12} md={5}>
              <RevealBox id="hero-visual" className="reveal-trigger" inView={revealed["hero-visual"]}>
                <Box ref={actionSectionRef} sx={{ position: "relative" }}>
                  {/* Decorative Elements */}
                  <Box sx={{ position: "absolute", top: -40, left: -40, width: 120, height: 120, background: "rgba(37, 99, 235, 0.1)", borderRadius: "50%", filter: "blur(40px)", zIndex: 0 }} />
                  <Box sx={{ position: "absolute", bottom: -40, right: -40, width: 160, height: 160, background: "rgba(124, 58, 237, 0.1)", borderRadius: "50%", filter: "blur(50px)", zIndex: 0 }} />

                  {/* Action Card */}
                  <GlassBox id="action-card" sx={{ p: 1, border: "1px solid rgba(255, 255, 255, 0.8)", position: "relative", zIndex: 1, overflow: 'hidden' }}>
                    <Box sx={{ bgcolor: "#FFF", borderRadius: "20px", overflow: "hidden", border: "1px solid #E2E8F0" }}>
                      <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #F1F5F9", display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Stack direction="row" spacing={1}>
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#FF5F56' }} />
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#FFBD2E' }} />
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#27C93F' }} />
                        </Stack>
                        <Chip label="ATS Score 92" size="small" icon={<ShieldCheckIcon sx={{ fontSize: '14px !important' }} />} sx={{ bgcolor: '#F1F5F9', fontWeight: 700, height: 24 }} />
                      </Box>

                      <Box sx={{ p: 4 }}>
                        <ResumeUpload onSuccess={(resumeData) => onUpload({ resumeData })} />

                        <Button
                          fullWidth
                          variant="text"
                          onClick={onManualEntry}
                          sx={{
                            mt: 2,
                            py: 1.5,
                            borderRadius: '16px',
                            color: '#64748B',
                            fontWeight: 700,
                            textTransform: 'none',
                            fontSize: '0.9rem',
                            "&:hover": {
                              bgcolor: 'rgba(37, 99, 235, 0.05)',
                              color: '#2563EB'
                            }
                          }}
                        >
                          Start with Resume
                        </Button>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 2, borderTop: '1px solid #F1F5F9', width: '100%', justifyContent: 'center', mb: 4 }}>
                          <Typography sx={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 500 }}>Returning user?</Typography>
                          <Button
                            onClick={onDirectSearch}
                            sx={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: 700, p: 0, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
                          >
                            Access My Feed
                          </Button>
                        </Box>

                        <Stack spacing={2}>
                          <Box sx={{ p: 2, borderRadius: '16px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <CheckIcon />
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>ATS Friendly</Typography>
                              <Typography variant="caption" sx={{ color: '#64748B' }}>Keyword coverage improved</Typography>
                            </Box>
                          </Box>

                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <GlassBox sx={{ p: 2, animation: `${floaty} 7s ease-in-out infinite` }}>
                                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Match Score</Typography>
                                <Stack direction="row" alignItems="flex-end" spacing={1} sx={{ mt: 1 }}>
                                  <Typography variant="h5" sx={{ fontWeight: 800 }}>94%</Typography>
                                  <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 700, mb: 0.5 }}>+12%</Typography>
                                </Stack>
                              </GlassBox>
                            </Grid>
                            <Grid item xs={6}>
                              <GlassBox sx={{ p: 2, animation: `${floaty} 8.5s ease-in-out infinite 0.7s` }}>
                                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>AI Actions</Typography>
                                <Stack spacing={1} sx={{ mt: 1.5 }}>
                                  <Box sx={{ height: 4, borderRadius: 2, bgcolor: '#E2E8F0', overflow: 'hidden' }}>
                                    <Box sx={{ width: '80%', height: '100%', background: 'linear-gradient(90deg, #2563EB, #7C3AED)' }} />
                                  </Box>
                                  <Box sx={{ height: 4, borderRadius: 2, bgcolor: '#E2E8F0', overflow: 'hidden' }}>
                                    <Box sx={{ width: '60%', height: '100%', background: 'linear-gradient(90deg, #3B82F6, #2DD4BF)' }} />
                                  </Box>
                                </Stack>
                              </GlassBox>
                            </Grid>
                          </Grid>
                        </Stack>
                      </Box>
                    </Box>

                    {/* Floating Status */}
                    <Box sx={{
                      position: "absolute", bottom: 20, left: -20,
                      px: 3, py: 1.5, borderRadius: "16px",
                      bgcolor: "white", boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                      display: "flex", alignItems: "center", gap: 1.5,
                      animation: `${pulseRing} 2.6s ease-in-out infinite`
                    }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#10B981" }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "#1E293B" }}>AI scanning career fit...</Typography>
                    </Box>
                  </GlassBox>
                </Box>
              </RevealBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ─── How It Works Section ─── */}
      <Box component="section" sx={{ py: { xs: 10, md: 16 }, bgcolor: "#FFF" }}>
        <Container maxWidth="lg">
          <RevealBox id="how-it-works-header" className="reveal-trigger" inView={revealed["how-it-works-header"]} sx={{ mb: 8 }}>
            <Typography variant="h2" sx={{ fontSize: { xs: "2rem", md: "2.75rem" }, fontWeight: 800, mb: 2 }}>
              Find Your Dream Job in Just 2 Simple Steps
            </Typography>
            <Typography sx={{ fontSize: "1.1rem", color: "#64748B", fontWeight: 500 }}>
              Fast. Smart. Personalized.
            </Typography>
          </RevealBox>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <RevealBox id="step-1" className="reveal-trigger" inView={revealed["step-1"]}>
                <GlassBox sx={{ p: 4, height: '100%', bgcolor: '#F8FAFC' }}>
                  <Stack direction="row" spacing={3} sx={{ mb: 4 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: '16px', background: 'linear-gradient(135deg, #2563EB, #0EA5E9)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CloudUploadIcon />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>1. Upload Resume</Typography>
                      <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.6 }}>
                        Start with a simple upload. We extract experience, skills, and structure to create a clean, searchable career profile instantly.
                      </Typography>
                    </Box>
                  </Stack>

                  <Box sx={{ bgcolor: '#FFF', borderRadius: '20px', p: 3, border: '1px solid #E2E8F0' }}>
                    <Grid container spacing={3} alignItems="center">
                      <Grid item xs={7}>
                        <Stack spacing={1.5}>
                          <Box sx={{ height: 8, width: '80%', bgcolor: '#F1F5F9', borderRadius: 4 }} />
                          <Box sx={{ height: 8, width: '100%', bgcolor: '#F1F5F9', borderRadius: 4 }} />
                          <Box sx={{ height: 8, width: '60%', bgcolor: '#F1F5F9', borderRadius: 4 }} />
                          <Box sx={{ mt: 2, height: 60, width: '100%', borderRadius: '12px', background: 'linear-gradient(135deg, #EFF6FF, #F5F3FF)' }} />
                        </Stack>
                      </Grid>
                      <Grid item xs={5}>
                        <Box sx={{ textAlign: 'center', p: 2, borderRadius: '16px', border: '1px dashed #2563EB', bgcolor: 'rgba(37, 99, 235, 0.02)' }}>
                          <FileTextIcon sx={{ color: '#2563EB', fontSize: 32, mb: 1 }} />
                          <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>Parsing...</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </GlassBox>
              </RevealBox>
            </Grid>

            <Grid item xs={12} md={6}>
              <RevealBox id="step-2" className="reveal-trigger" inView={revealed["step-2"]}>
                <GlassBox sx={{ p: 4, height: '100%', bgcolor: '#F8FAFC' }}>
                  <Stack direction="row" spacing={3} sx={{ mb: 4 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: '16px', background: 'linear-gradient(135deg, #7C3AED, #D946EF)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BriefcaseIcon />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>2. Find Jobs with AI + ATS Score</Typography>
                      <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.6 }}>
                        See ranked roles with match percentages, ATS score indicators, and job cards tailored to your strengths and goals.
                      </Typography>
                    </Box>
                  </Stack>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ bgcolor: '#FFF', borderRadius: '20px', p: 2.5, border: '1px solid #E2E8F0', height: '100%' }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#111827', display: 'block', mb: 2 }}>AI Matching</Typography>
                        <Stack spacing={2}>
                          {[{ l: "Designer", p: "96%" }, { l: "Writer", p: "89%" }].map((item, i) => (
                            <Box key={i}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#64748B' }}>{item.l}</Typography>
                                <Typography sx={{ fontSize: '10px', fontWeight: 800, color: '#111827' }}>{item.p}</Typography>
                              </Box>
                              <Box sx={{ height: 4, bgcolor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                                <Box sx={{ width: item.p, height: '100%', background: 'linear-gradient(90deg, #2563EB, #7C3AED)' }} />
                              </Box>
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ bgcolor: '#FFF', borderRadius: '20px', p: 2.5, border: '1px solid #E2E8F0', height: '100%', textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#111827', display: 'block', mb: 1 }}>ATS Score</Typography>
                        <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                          <Box sx={{ width: 60, height: 60, borderRadius: '50%', border: '6px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>92</Typography>
                          </Box>
                          <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '6px solid transparent', borderTopColor: '#2563EB', borderRightColor: '#7C3AED', transform: 'rotate(50deg)' }} />
                        </Box>
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Box sx={{ px: 1, py: 0.5, bgcolor: '#F8FAFC', borderRadius: 4, fontSize: '8px', fontWeight: 700 }}>Keywords</Box>
                          <Box sx={{ px: 1, py: 0.5, bgcolor: '#F8FAFC', borderRadius: 4, fontSize: '8px', fontWeight: 700 }}>Format</Box>
                        </Stack>
                      </Box>
                    </Grid>
                  </Grid>
                </GlassBox>
              </RevealBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ─── ATS Awareness Section ─── */}
      <Box component="section" sx={{ py: { xs: 10, md: 16 }, position: "relative" }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6} sx={{ order: { xs: 2, md: 1 } }}>
              <RevealBox id="ats-visual" className="reveal-trigger" inView={revealed["ats-visual"]}>
                <GlassBox sx={{ p: 3, position: "relative" }}>
                  <Box sx={{ borderRadius: "20px", overflow: "hidden", mb: 3 }}>
                    <Box component="img" src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=800" sx={{ width: "100%", height: 300, objectFit: "cover" }} />
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ p: 2, borderRadius: "16px", border: "1px solid #FECACA", bgcolor: "#FEF2F2" }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: "#EF4444", textTransform: "uppercase", mb: 1, display: "block" }}>Before</Typography>
                        <Typography variant="body2" sx={{ color: "#7F1D1D", fontSize: "0.8rem" }}>Generic formatting, low visibility.</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ p: 2, borderRadius: "16px", border: "1px solid #A7F3D0", bgcolor: "#F0FDF4" }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: "#10B981", textTransform: "uppercase", mb: 1, display: "block" }}>After</Typography>
                        <Typography variant="body2" sx={{ color: "#064E3B", fontSize: "0.8rem" }}>ATS-optimized, 3x more views.</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </GlassBox>
              </RevealBox>
            </Grid>
            <Grid item xs={12} md={6} sx={{ order: { xs: 1, md: 2 } }}>
              <RevealBox id="ats-text" className="reveal-trigger" inView={revealed["ats-text"]}>
                <Typography variant="h2" sx={{ fontSize: { xs: "2rem", md: "2.75rem" }, fontWeight: 800, mb: 3 }}>
                  Applying to Jobs… But Never Hearing Back?
                </Typography>
                <Typography sx={{ color: "#64748B", mb: 4, fontSize: "1.1rem", lineHeight: 1.6 }}>
                  Most resumes are filtered by ATS before a recruiter ever sees them. Our AI ensures your resume is structured and keyword-optimized for maximum visibility.
                </Typography>

                <Stack spacing={3}>
                  {[
                    { n: 1, t: "Upload Resume", d: "Import your current resume and analyze the starting point." },
                    { n: 2, t: "Enhance with AI", d: "Improve clarity, formatting, keywords, and achievement language." },
                    { n: 3, t: "Generate Optimized PDF", d: "Download a polished version ready for submission." }
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: "flex", gap: 3, p: 3, borderRadius: "20px", border: "1px solid #E2E8F0", bgcolor: "white", transition: "all 0.3s ease", "&:hover": { transform: "translateX(8px)", borderColor: "#2563EB" } }}>
                      <Box sx={{ width: 44, height: 44, borderRadius: "12px", bgcolor: i === 0 ? "rgba(37, 99, 235, 0.1)" : i === 1 ? "rgba(124, 58, 237, 0.1)" : "rgba(14, 165, 233, 0.1)", color: i === 0 ? "#2563EB" : i === 1 ? "#7C3AED" : "#0EA5E9", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>
                        {item.n}
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#111827" }}>{item.t}</Typography>
                        <Typography variant="body2" sx={{ color: "#64748B" }}>{item.d}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </RevealBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ─── Features Grid Section ─── */}
      <Box component="section" sx={{ py: { xs: 10, md: 16 }, bgcolor: "#FFF" }}>
        <Container maxWidth="lg">
          <RevealBox id="features-header" className="reveal-trigger" inView={revealed["features-header"]} sx={{ textAlign: "center", mb: 10 }}>
            <Typography variant="h2" sx={{ fontSize: { xs: "2.25rem", md: "3.5rem" }, fontWeight: 800, mb: 2 }}>
              Premium tools built to move your career forward
            </Typography>
            <Typography sx={{ fontSize: "1.15rem", color: "#64748B", maxWidth: 720, mx: "auto" }}>
              A focused set of AI features designed to help professionals build stronger resumes, find better jobs, and understand exactly how to improve.
            </Typography>
          </RevealBox>

          <Grid container spacing={3}>
            {features.map((f, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <RevealBox id={`feature-${i}`} className="reveal-trigger" inView={revealed[`feature-${i}`]}>
                  <GlassBox sx={{
                    p: 4, height: '100%', border: '1px solid #F1F5F9', transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 20px 40px rgba(0,0,0,0.06)', borderColor: 'rgba(37, 99, 235, 0.2)' }
                  }}>
                    <Box sx={{ width: 56, height: 56, borderRadius: '16px', background: f.gradient, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                      {React.cloneElement(f.icon, { sx: { fontSize: 28 } })}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>{f.title}</Typography>
                    <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.6 }}>{f.subtitle}</Typography>
                  </GlassBox>
                </RevealBox>
              </Grid>
            ))}

            {/* Wide Feature Card */}
            <Grid item xs={12}>
              <RevealBox id="feature-wide" className="reveal-trigger" inView={revealed["feature-wide"]}>
                <GlassBox sx={{
                  p: 6, border: '1px solid #F1F5F9',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(239, 246, 255, 0.8) 100%)',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }
                }}>
                  <Grid container spacing={6} alignItems="center">
                    <Grid item xs={12} md={7}>
                      <Box sx={{ width: 56, height: 56, borderRadius: '16px', background: 'linear-gradient(135deg, #2563EB, #7C3AED)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                        <WandSparklesIcon sx={{ fontSize: 28 }} />
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>AI Resume Enhancement</Typography>
                      <Typography sx={{ color: '#64748B', fontSize: '1.1rem', mb: 4 }}>
                        Rewrite bullet points, sharpen summaries, and elevate your resume with polished, recruiter-friendly language using our fine-tuned LLMs.
                      </Typography>
                      <Stack direction="row" spacing={2}>
                        {[{ l: "Clarity", v: "Better" }, { l: "Impact", v: "Stronger" }, { l: "Response", v: "Higher" }].map((s, i) => (
                          <Box key={i} sx={{ p: 2, borderRadius: '16px', bgcolor: 'white', border: '1px solid #E2E8F0', flex: 1 }}>
                            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>{s.l}</Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#111827' }}>{s.v}</Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <Box sx={{ p: 4, borderRadius: '24px', bgcolor: 'white', border: '1px solid #E2E8F0', position: 'relative', overflow: 'hidden' }}>
                        <Stack spacing={2}>
                          <Box sx={{ height: 12, width: '40%', bgcolor: '#F1F5F9', borderRadius: 4 }} />
                          <Box sx={{ height: 12, width: '90%', bgcolor: '#F1F5F9', borderRadius: 4 }} />
                          <Box sx={{ height: 12, width: '75%', bgcolor: '#F1F5F9', borderRadius: 4 }} />
                          <Box sx={{ height: 40, width: '100%', borderRadius: '12px', border: '1px dashed #2563EB', mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#2563EB' }}>Optimizing with AI...</Typography>
                          </Box>
                        </Stack>
                        <Box sx={{ position: 'absolute', inset: 0, border: '2px solid transparent', borderTopColor: '#2563EB', animation: `${scanBar} 3s infinite` }} />
                      </Box>
                    </Grid>
                  </Grid>
                </GlassBox>
              </RevealBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ─── Stats & Social Section ─── */}
      <Box component="section" sx={{ py: 12, bgcolor: "#F8FAFC", borderTop: "1px solid #F1F5F9" }}>
        <Container maxWidth="lg">
          <RevealBox id="stats-header" className="reveal-trigger" inView={revealed["stats-header"]} sx={{ textAlign: "center", mb: 8 }}>
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>Trusted by thousands of ambitious professionals.</Typography>
          </RevealBox>
          <Grid container spacing={4} justifyContent="center">
            {[
              { i: <WorkspacePremiumIcon sx={{ fontSize: 32 }} />, v: "50K+", l: "Candidates" },
              { i: <TrendingUpIcon sx={{ fontSize: 32 }} />, v: "98%", l: "ATS Precision" },
              { i: <RocketLaunchIcon sx={{ fontSize: 32 }} />, v: "Real-time", l: "AI Insights" }
            ].map((s, i) => (
              <Grid item xs={12} sm={4} key={i}>
                <RevealBox id={`stat-${i}`} className="reveal-trigger" inView={revealed[`stat-${i}`]}>
                  <GlassBox sx={{ p: 4, textAlign: 'center', border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
                    <Box sx={{ mx: 'auto', mb: 2, width: 64, height: 64, borderRadius: '50%', bgcolor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                      {s.i}
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>{s.v}</Typography>
                    <Typography variant="subtitle2" sx={{ color: '#64748B', fontWeight: 600 }}>{s.l}</Typography>
                  </GlassBox>
                </RevealBox>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ─── Dark Footer ─── */}
      <Box component="footer" sx={{ bgcolor: "#0F172A", pt: 10, pb: 6, color: "#94A3B8" }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} sx={{ mb: 8 }}>
            <Grid item xs={12} md={5}>
              <Stack spacing={4}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg, #2563EB, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                    <SparklesIcon />
                  </Box>
                  <Box>
                    <Typography sx={{ color: "#FFF", fontWeight: 800, letterSpacing: "-0.02em" }}>RightNxt AI</Typography>
                    <Typography variant="caption">Career intelligence platform</Typography>
                  </Box>
                </Stack>
                <Typography sx={{ lineHeight: 1.6, maxWidth: 360 }}>
                  Modern AI tools to help professionals build stronger applications, discover better-fit jobs, and get hired faster.
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={7}>
              <Grid container spacing={4}>
                <Grid item xs={6} sm={4}>
                  <Typography variant="subtitle2" sx={{ color: "#FFF", fontWeight: 700, mb: 3 }}>Product</Typography>
                  <Stack spacing={2}>
                    {["Resume Builder", "Job Matching", "ATS Scoring", "Skill Gap"].map(link => (
                      <Typography key={link} variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#FFF' } }}>{link}</Typography>
                    ))}
                  </Stack>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="subtitle2" sx={{ color: "#FFF", fontWeight: 700, mb: 3 }}>Company</Typography>
                  <Stack spacing={2}>
                    {["About Us", "Privacy Policy", "Terms of Service", "Contact"].map(link => (
                      <Typography key={link} variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#FFF' } }}>{link}</Typography>
                    ))}
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" sx={{ color: "#FFF", fontWeight: 700, mb: 3 }}>Follow Us</Typography>
                  <Stack direction="row" spacing={2}>
                    {[<LinkedInIcon />, <TwitterIcon />, <GitHubIcon />].map((icon, i) => (
                      <IconButton key={i} sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#94A3B8', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: '#FFF' } }}>
                        {icon}
                      </IconButton>
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Box sx={{ pt: 6, borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
            <Typography variant="caption" sx={{ opacity: 0.6 }}>
              © 2026 RightNxt AI. Powered by advanced AI for ambitious professionals.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default EntryScreen;
