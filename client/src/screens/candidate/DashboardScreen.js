// screens/candidate/DashboardScreen.js
import React, { useState, useEffect } from "react";
import {
  Box, Typography, Container, Paper, Button, Tooltip,
  useMediaQuery, useTheme, Stack, Avatar, IconButton, Badge,
  Card, CardContent, Chip, CircularProgress
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import WorkIcon from "@mui/icons-material/Work";
import PersonIcon from "@mui/icons-material/Person";
import PeopleIcon from "@mui/icons-material/People";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import DescriptionIcon from "@mui/icons-material/Description";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SchoolIcon from "@mui/icons-material/School";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import NotificationsIcon from "@mui/icons-material/Notifications";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import DownloadIcon from "@mui/icons-material/Download";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ProfileReviewBanner from "./components/ProfileReviewBanner";
import IndustriesBanner from "./components/IndustriesBanner";
import * as premiumAPI from "../../api/premiumAPI";
import * as profileAPI from "../../api/profileAPI";
import { fetchAndStoreProfile } from "../../redux/profile/ProfileAction";
import SkillDevelopmentReport from "../skill_development/SkillDevelopmentReport";
import CareerAdviceReport from "../career_advisor/CareerAdviceReport";
import MultiPageResumePreview from "../resume_builder/MultiPageResumePreview";

const DashboardSection = ({ icon: Icon, title, description, count, accent, onClick }) => {
  return (
    <Paper
      onClick={onClick}
      elevation={0}
      sx={{
        p: 3.5,
        height: '100%',
        cursor: 'pointer',
        borderRadius: '24px',
        border: "1px solid #E5E7EB",
        bgcolor: "#FFFFFF",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
          borderColor: accent,
          "& .icon-box": { transform: "scale(1.1)", bgcolor: accent },
          "& .arrow-icon": { transform: "translateX(4px)", color: accent }
        },
      }}
    >
      <Box
        className="icon-box"
        sx={{
          width: 60,
          height: 60,
          borderRadius: '18px',
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFFFFF",
          bgcolor: accent || "#2563EB",
          transition: "all 0.3s ease",
          boxShadow: `0 8px 16px ${accent}20`,
        }}
      >
        <Icon sx={{ fontSize: 28 }} />
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontWeight: 700, fontSize: "1.15rem", color: "#111827", mb: 0.5, letterSpacing: '-0.01em' }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: "0.95rem", color: "#212121", fontWeight: 400, lineHeight: 1.6 }}>
          {description}
        </Typography>
      </Box>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        {count ? (
          <Typography sx={{ fontWeight: 700, fontSize: "1.25rem", color: "#111827" }}>
            {count}
          </Typography>
        ) : <Box />}
        <ArrowForwardIcon className="arrow-icon" sx={{ color: "#94A3B8", transition: "all 0.3s ease", fontSize: 20 }} />
      </Stack>
    </Paper>
  );
};

const DashboardScreen = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { id: userid, mobile, fullname, user_industries } = useSelector((state) => state.UserReducer);
  const profile = useSelector((state) => state.ProfileReducer.data);

  const [premiumPurchases, setPremiumPurchases] = useState([]);
  const [loadingPremium, setLoadingPremium] = useState(false);

  const [downloadingReportId, setDownloadingReportId] = useState(null);
  const [activeSkillAnalysisData, setActiveSkillAnalysisData] = useState(null);
  const [activeCareerAdviceData, setActiveCareerAdviceData] = useState(null);
  const [activeReportTimestamp, setActiveReportTimestamp] = useState(null);

  const exportPagesRef = React.useRef(null);

  const handlePrint = useReactToPrint({
    content: () => exportPagesRef.current,
    onBeforePrint: () => {
      const fullName = profile?.personalDetails?.fullName || "Resume";
      document.title = `Resume - ${fullName.replace(/[^a-z0-9]/gi, "_")}`;
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setDownloadingReportId(null);
    },
    pageStyle: `
      @page {
        size: 210mm 297mm;
        margin: 0;
      }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
        box-sizing: border-box;
      }
      body {
        margin: 0;
        padding: 0;
      }
      .resume-pdf-page {
        width: 210mm !important;
        height: 297mm !important;
        overflow: hidden !important;
        page-break-after: always !important;
        break-after: page !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        position: relative;
      }
      .resume-pdf-page:last-child {
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
      [data-pdf-hide="true"] {
        display: none !important;
      }
    `,
  });

  const ensureProfileLoaded = async () => {
    if (profile && profile.id) return profile;
    const phone = mobile || localStorage.getItem("mobile_number") || "9789502974";
    const result = await dispatch(fetchAndStoreProfile(phone));
    if (result && result.success && result.data) {
      return result.data;
    }
    return null;
  };

  const downloadResumePDFMobile = async (currentProfile) => {
    const container = exportPagesRef.current;
    if (!container) {
      setDownloadingReportId(null);
      return;
    }

    const pages = container.querySelectorAll(".resume-pdf-page");
    if (pages.length === 0) {
      setDownloadingReportId(null);
      return;
    }

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
          onclone: (clonedDoc) => {
            const el = clonedDoc.getElementById("pdf-export-container");
            if (el) {
              el.style.visibility = "visible";
            }
          }
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.8);

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, 'FAST');
      }

      const fullName = currentProfile?.personalDetails?.fullName || "Resume";
      pdf.save(`Resume_${fullName.replace(/[^a-z0-9]/gi, "_")}.pdf`);
    } catch (err) {
      console.error("Mobile download failed:", err);
      alert("Failed to generate PDF resume. Please try again.");
    } finally {
      setDownloadingReportId(null);
    }
  };

  const triggerResumePrint = async (currentProfile) => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);

    if (isMobileDevice) {
      try {
        await downloadResumePDFMobile(currentProfile);
      } catch (err) {
        console.error("Mobile download failed:", err);
        setDownloadingReportId(null);
      }
    } else {
      handlePrint();
    }
  };

  const triggerSkillReportDownload = async (currentProfile) => {
    const reportContainer = document.getElementById("skill-development-report");
    if (!reportContainer) {
      setDownloadingReportId(null);
      return;
    }

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const sections = reportContainer.querySelectorAll(".report-section");
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);

      let currentY = margin;
      let firstPage = true;

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const canvas = await html2canvas(section, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.8);
        const imgHeight = (canvas.height * contentWidth) / canvas.width;

        if (!firstPage && (currentY + imgHeight > pageHeight - margin)) {
          pdf.addPage();
          currentY = margin;
        }

        pdf.addImage(imgData, 'JPEG', margin, currentY, contentWidth, imgHeight, undefined, 'FAST');
        currentY += imgHeight + 10;
        firstPage = false;
      }

      const name = currentProfile?.personalDetails?.fullName || "Candidate";
      pdf.save(`SkillEnhancement_${name.replace(/ /g, '_')}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setDownloadingReportId(null);
      setActiveSkillAnalysisData(null);
    }
  };

  const triggerCareerReportDownload = async (currentProfile) => {
    const reportContainer = document.getElementById("career-advice-report");
    if (!reportContainer) {
      setDownloadingReportId(null);
      return;
    }

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const sections = reportContainer.querySelectorAll(".report-section");
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);

      let currentY = margin;
      let firstPage = true;

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const canvas = await html2canvas(section, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.8);
        const imgHeight = (canvas.height * contentWidth) / canvas.width;

        if (!firstPage && (currentY + imgHeight > pageHeight - margin)) {
          pdf.addPage();
          currentY = margin;
        }

        pdf.addImage(imgData, 'JPEG', margin, currentY, contentWidth, imgHeight, undefined, 'FAST');
        currentY += imgHeight + 10;
        firstPage = false;
      }

      const footer = reportContainer.lastElementChild;
      if (footer && !footer.classList.contains('report-section')) {
        const footerCanvas = await html2canvas(footer, { scale: 2, backgroundColor: "#ffffff" });
        const footerImgData = footerCanvas.toDataURL("image/jpeg", 0.8);
        const footerImgHeight = (footerCanvas.height * contentWidth) / footerCanvas.width;

        if (currentY + footerImgHeight > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }
        pdf.addImage(footerImgData, 'JPEG', margin, currentY, contentWidth, footerImgHeight, undefined, 'FAST');
      }

      const name = currentProfile?.personalDetails?.fullName || "Career";
      pdf.save(`CareerAdvice_${name.replace(/ /g, '_')}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setDownloadingReportId(null);
      setActiveCareerAdviceData(null);
    }
  };

  const handleDownloadReport = async (report) => {
    if (downloadingReportId) return;

    setDownloadingReportId(report.id);

    try {
      const currentProfile = await ensureProfileLoaded();
      if (!currentProfile) {
        alert("Failed to load profile. Please complete your profile first.");
        setDownloadingReportId(null);
        return;
      }

      const userId = currentProfile.id;
      const type = report.report_type.toUpperCase();

      if (type === "SKILL_ANALYSIS") {
        const result = await profileAPI.fetchExistingSkillAnalysis(userId);
        if (!result.error && result.data && result.data !== "none") {
          const reportData = result.data.data || result.data;
          const timestamp = result.data.timestamp || new Date().toISOString();
          setActiveSkillAnalysisData(reportData);
          setActiveReportTimestamp(timestamp);

          setTimeout(async () => {
            await triggerSkillReportDownload(currentProfile);
          }, 800);
        } else {
          alert("Could not load skill report content.");
          setDownloadingReportId(null);
        }
      } else if (type === "CAREER_ENHANCEMENT") {
        const phone = currentProfile.personalDetails?.phone || mobile || localStorage.getItem("mobile_number");
        const result = await profileAPI.fetchExistingCareerAdvice(phone, userId);
        if (!result.error && result.data && result.data !== "none") {
          const reportData = result.data.data || result.data;
          const timestamp = result.data.timestamp || new Date().toISOString();
          setActiveCareerAdviceData(reportData);
          setActiveReportTimestamp(timestamp);

          setTimeout(async () => {
            await triggerCareerReportDownload(currentProfile);
          }, 800);
        } else {
          alert("Could not load career report content.");
          setDownloadingReportId(null);
        }
      } else if (type === "ATS_RESUME") {
        await triggerResumePrint(currentProfile);
      } else {
        window.open(`/api/premium/reports/${report.id}/download`, "_blank");
        setDownloadingReportId(null);
      }
    } catch (err) {
      console.error("Error downloading report:", err);
      alert("An error occurred while downloading the report.");
      setDownloadingReportId(null);
    }
  };

  useEffect(() => {
    setLoadingPremium(true);
    premiumAPI.getPremiumDashboard()
      .then((res) => {
        if (!res.error && res.data) {
          setPremiumPurchases(res.data);
        }
      })
      .catch((err) => console.error("Error loading premium dashboard:", err))
      .finally(() => setLoadingPremium(false));
  }, []);

  const dashboardSections = [
    {
      icon: WorkIcon,
      title: 'Job Feed',
      description: 'Discover AI-matched opportunities tailored to your unique profile.',
      accent: '#2563EB',
      onClick: () => navigate('/feed'),
      count: '50k+',
    },
    {
      icon: DescriptionIcon,
      title: 'Resume AI',
      description: 'Create high-converting resumes with our smart builder tools.',
      accent: '#F59E0B',
      onClick: () => navigate('/resume-builder'),
    },
    {
      icon: PersonIcon,
      title: 'My Profile',
      description: 'Keep your professional details up to date for better matches.',
      accent: '#10B981',
      onClick: () => navigate('/profile'),
    },
    {
      icon: TrendingUpIcon,
      title: 'Career Insights - 20 Credits',
      description: 'Get AI-driven advice on how to accelerate your career growth.',
      accent: '#0EA5E9',
      onClick: () => navigate('/career-advice'),
    },

    {
      icon: SchoolIcon,
      title: 'Skill Center - 20 Credits',
      description: 'Upskill with curated courses and certifications in your field.',
      accent: '#EC4899',
      onClick: () => navigate('/skill-development'),
    },
    // {
    //   icon: AccountBalanceIcon,
    //   title: 'Government Jobs',
    //   description: 'Explore the latest career opportunities in government departments.',
    //   accent: '#059669',
    //   onClick: () => navigate('/govt-jobs'),
    //   count: '100+',
    // },
  ];

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', pb: 8 }}>

      {/* Top Bar */}
      <Box sx={{ bgcolor: "#FFFFFF", borderBottom: "1px solid #E5E7EB", py: 2 }}>
        <Container maxWidth="lg">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  width: 40, height: 40, bgcolor: "#2563EB",
                  fontWeight: 700, fontSize: '0.9rem'
                }}
              >
                {fullname?.[0] || "U"}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 700, color: "#111827", fontSize: '1rem' }}>
                  {fullname || "User"}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#212121', fontWeight: 500 }}>
                  Candidate Dashboard
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1}>
              {/* <IconButton sx={{ border: '1px solid #E5E7EB', borderRadius: '12px' }}>
                <Badge variant="dot" color="error">
                  <NotificationsIcon sx={{ fontSize: 20, color: '#475569' }} />
                </Badge>
              </IconButton> */}
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Profile Review Notification */}
      <Container maxWidth="lg" sx={{ mt: 3, mb: -1 }}>
        <Stack spacing={2}>
          <ProfileReviewBanner />
          {(!user_industries || user_industries.length === 0) && <IndustriesBanner />}
        </Stack>
      </Container>

      {/* Hero Header */}
      {/* <Box sx={{
        pt: 8, pb: 6, mb: 4,
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(37, 99, 235, 0.05) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(124, 58, 237, 0.05) 0%, transparent 50%)'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: 800 }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
              <Box sx={{ px: 1.5, py: 0.5, bgcolor: '#eff6ff', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: 1 }}>
                <RocketLaunchIcon sx={{ fontSize: 16, color: '#2563EB' }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  AI Matching Active
                </Typography>
              </Box>
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#111827", letterSpacing: "-0.04em", lineHeight: 1.1, mb: 2 }}>
              Find your next <Box component="span" sx={{ color: '#2563EB' }}>career leap</Box> with RightNxt AI.
            </Typography>
            <Typography sx={{ color: "#212121", fontSize: "1rem", fontWeight: 400, lineHeight: 1.6 }}>
              Your personalized recruitment companion is ready to match you with top companies.
            </Typography>
          </Box>
        </Container>
      </Box> */}

      {/* Main Grid */}
      <Container maxWidth="lg">
        <Grid2 container spacing={3}>
          {dashboardSections.map((section, index) => (
            <Grid2 key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
              <DashboardSection {...section} />
            </Grid2>
          ))}
        </Grid2>
      </Container>

      {/* Premium Career Booster Packs Panel */}
      <Container maxWidth="lg" sx={{ mt: 6 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: '24px',
            border: "1px solid #E5E7EB",
            bgcolor: "#FFFFFF",
            mb: 2
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3.5 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <WorkspacePremiumIcon sx={{ color: "#7C3AED", fontSize: 30 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#111827", fontFamily: "Inter" }}>
                My Career Booster Packs
              </Typography>
            </Stack>
            {premiumPurchases.length === 0 && (
              <Button
                variant="contained"
                onClick={() => navigate("/premium/upgrade")}
                sx={{
                  bgcolor: "#7C3AED",
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: "10px",
                  "&:hover": { bgcolor: "#6D28D9" }
                }}
              >
                Unlock for ₹99
              </Button>
            )}
          </Stack>

          {loadingPremium ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={30} color="primary" />
            </Box>
          ) : premiumPurchases.length > 0 ? (
            <Stack spacing={3}>
              {premiumPurchases.map((purchase) => (
                <Box
                  key={purchase.order_id}
                  sx={{
                    p: 3,
                    borderRadius: "16px",
                    border: "1px solid #F3F4F6",
                    bgcolor: "#FAF9F6"
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: "#111827", fontSize: "0.95rem" }}>
                        Booster Pack #{purchase.order_id}
                      </Typography>
                      <Typography sx={{ color: "#6B7280", fontSize: "0.8rem" }}>
                        Purchased: {new Date(purchase.purchase_date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Chip
                        label={purchase.overall_status}
                        size="small"
                        sx={{
                          bgcolor: purchase.overall_status === "Completed" ? "rgba(16, 185, 129, 0.1)" : "rgba(124, 58, 237, 0.1)",
                          color: purchase.overall_status === "Completed" ? "#10B981" : "#7C3AED",
                          fontWeight: 700
                        }}
                      />
                      <Button
                        size="small"
                        onClick={() => navigate(`/orders/${purchase.order_id}/status`)}
                        sx={{ fontWeight: 700, textTransform: "none", color: "#2563EB" }}
                      >
                        Track Progress
                      </Button>
                    </Stack>
                  </Stack>

                  <Grid2 container spacing={2}>
                    {purchase.reports
                      // .filter((report) => report.report_type.toUpperCase() !== "ENHANCED_RESUME")
                      .map((report) => (
                        <Grid2 key={report.id} size={{ xs: 12, sm: 6, md: 3 }}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              border: "1px solid #E5E7EB",
                              bgcolor: "#FFFFFF",
                              borderRadius: "10px",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              height: "100%"
                            }}
                          >
                            <Typography variant="caption" sx={{ fontWeight: 700, color: "#111827", mb: 1, display: "block" }}>
                              {report.report_type.replace("_", " ")}
                            </Typography>

                            {report.status === "COMPLETED" ? (
                              <Button
                                size="small"
                                startIcon={downloadingReportId === report.id ? <CircularProgress size={14} color="inherit" /> : <DownloadIcon />}
                                disabled={downloadingReportId !== null}
                                onClick={() => handleDownloadReport(report)}
                                sx={{
                                  textTransform: "none",
                                  color: downloadingReportId === report.id ? "#9CA3AF" : "#10B981",
                                  fontWeight: 700,
                                  alignSelf: "flex-start",
                                  p: 0
                                }}
                              >
                                {downloadingReportId === report.id ? "Exporting..." : "Download PDF"}
                              </Button>
                            ) : (
                              <Typography variant="caption" sx={{ color: report.status === "FAILED" ? "#EF4444" : "#7C3AED", fontWeight: 600 }}>
                                {report.status === "FAILED" ? "Failed" : `Progress: ${report.progress}%`}
                              </Typography>
                            )}
                          </Paper>
                        </Grid2>
                      ))}
                  </Grid2>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ color: "#6B7280", textAlign: "center", py: 2 }}>
              Upgrade to the Premium Career Booster Pack to unlock ATS Resume, Skill analysis, and Career Advisory reports.
            </Typography>
          )}
        </Paper>
      </Container>

      {/* Premium CTA */}
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 5, md: 8 },
            borderRadius: '32px',
            bgcolor: "#111827",
            color: "#FFFFFF",
            position: 'relative',
            overflow: 'hidden',
            backgroundImage: 'radial-gradient(circle at top right, rgba(37, 99, 235, 0.15), transparent), radial-gradient(circle at bottom left, rgba(124, 58, 237, 0.1), transparent)',
          }}
        >
          <Grid2 container spacing={4} alignItems="center">
            <Grid2 size={{ xs: 12, md: 8 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, letterSpacing: '-0.02em' }}>
                Stand out to recruiters
              </Typography>
              <Typography sx={{ opacity: 0.7, fontSize: '1rem', fontWeight: 400, maxWidth: 500 }}>
                Get a detailed analysis of your profile and see how you rank against other candidates for top roles.
              </Typography>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }} sx={{ textAlign: { md: 'right' } }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/profile')}
                sx={{
                  px: 5, py: 2, borderRadius: '16px', fontWeight: 700, textTransform: 'none',
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  color: '#FFFFFF', fontSize: '1.1rem',
                  boxShadow: '0 10px 20px rgba(37, 99, 235, 0.3)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 24px rgba(37, 99, 235, 0.4)',
                    filter: 'brightness(1.1)'
                  }
                }}
              >
                Optimize My Profile
              </Button>
            </Grid2>
          </Grid2>
        </Paper>
      </Container>

      {/* Hidden structures for client-side report download & PDF generation */}
      {activeSkillAnalysisData && (
        <SkillDevelopmentReport
          data={activeSkillAnalysisData}
          profile={profile}
          timestamp={activeReportTimestamp || new Date().toISOString()}
        />
      )}
      {activeCareerAdviceData && (
        <CareerAdviceReport
          data={activeCareerAdviceData}
          profile={profile}
          timestamp={activeReportTimestamp || new Date().toISOString()}
        />
      )}

      {/* Hidden export container for print capture of template11p resume */}
      <div
        id="pdf-export-container"
        style={{
          position: "fixed",
          left: "-9999px",
          top: 0,
          width: "210mm",
          visibility: "hidden",
          pointerEvents: "none",
          zIndex: -9999,
        }}
      >
        {profile && profile.id && (
          <MultiPageResumePreview
            templateId="template11p"
            data={profile}
            isExport={true}
            pagesRef={exportPagesRef}
          />
        )}
      </div>
    </Box>
  );
};

export default DashboardScreen;
