import React, { useState, useEffect, useRef } from "react";
import {
  Box, Grid, Stepper, Step, StepLabel, Button, Typography, Paper,
  Container, Divider, Stack, Slider, IconButton, useTheme, useMediaQuery,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, Chip,
  Accordion, AccordionSummary, AccordionDetails, Select, MenuItem, FormControl, InputLabel
} from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CircularProgress from "@mui/material/CircularProgress";
import CreditIcon from "@mui/icons-material/CardGiftcard";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import ProfileReviewBanner from "../candidate/components/ProfileReviewBanner";
import { useReactToPrint } from "react-to-print";
import { fetchAndStoreProfile, updateProfileData } from "../../redux/profile/ProfileAction";
import { updateUserProfile } from "../../redux/user/Action";
import * as profileAPI from "../../api/profileAPI";
import InsufficientCreditsDialog from "../candidate/components/dialogs/InsufficientCreditsDialog";
import PersonalDetailsForm from "./sections/PersonalDetailsForm";
import EducationForm from "./sections/EducationForm";
import ExperienceForm from "./sections/ExperienceForm";
import SkillsForm from "./sections/SkillsForm";
import ProjectsForm from "./sections/ProjectsForm";
import MultiPageResumePreview from "./MultiPageResumePreview";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const steps = ["Personal Info", "Education", "Experience", "Projects", "Skills & Languages"];

const ResumeBuilderScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.ProfileReducer.data);
  const user = useSelector((state) => state.UserReducer);
  const { userid, points: userPoints } = useSelector((state) => state.UserReducer);

  // Ref for the hidden export container — always 210mm, never scaled
  const exportPagesRef = useRef(null);

  const queryParams = new URLSearchParams(location.search);
  const templateId = queryParams.get("template") || "default";
  const isPremiumTemplate = templateId.endsWith("p");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [activeStep, setActiveStep] = useState(0);
  const [zoom, setZoom] = useState(0.4);
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [insufficientCreditsDialogOpen, setInsufficientCreditsDialogOpen] = useState(false);
  const [premiumConfirmDialogOpen, setPremiumConfirmDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // ── react-to-print setup ────────────────────────────────────────────────
  // Uses the browser's native print engine — pixel-perfect, no html2canvas.
  // Renders the hidden 210mm export container into an isolated iframe,
  // injects the pageStyle, and triggers the OS print/save dialog.
  const handlePrint = useReactToPrint({
    content: () => exportPagesRef.current,

    onBeforePrint: () => {
      // Set document title so "Save as PDF" dialog pre-fills the filename
      const fullName = profile?.personalDetails?.fullName || "Resume";
      document.title = `Resume - ${fullName.replace(/[^a-z0-9]/gi, "_")}`;
      return Promise.resolve();
    },

    onAfterPrint: () => {
      setDownloading(false);
    },

    // All styles injected into the print iframe
    // -webkit-print-color-adjust forces backgrounds/colors to print exactly
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

      /* Hide UI-only chrome: page badge, top shadow */
      [data-pdf-hide="true"] {
        display: none !important;
      }
    `,
  });

  // ── Profile fetch ───────────────────────────────────────────────────────
  useEffect(() => {
    const fetchUserProfileData = async () => {
      setLoading(true);
      setError(null);
      const phone = profile?.mobile || user?.mobile || "9789502974";
      const result = await dispatch(fetchAndStoreProfile(phone));
      if (!result.success) setError(result.message || "Failed to load profile");
      setLoading(false);
    };
    if (!profile?.id) fetchUserProfileData();
  }, [dispatch, profile, user?.mobile]);

  // ── Spacing config load & save ──────────────────────────────────────────
  useEffect(() => {
    if (profile?.id) {
      const storageKey = `resume_spacing_${userid || "default"}_${templateId}`;
      const savedSpacing = JSON.parse(localStorage.getItem(storageKey) || "{}");
      dispatch(updateProfileData({
        spacingConfig: savedSpacing
      }));
    }
  }, [profile?.id, templateId, userid, dispatch]);

  const handleSpacingChange = (blockKey, val) => {
    const currentConfig = profile?.spacingConfig || {};
    const newConfig = {
      ...currentConfig,
      [blockKey]: val
    };
    dispatch(updateProfileData({
      spacingConfig: newConfig
    }));
    const storageKey = `resume_spacing_${userid || "default"}_${templateId}`;
    localStorage.setItem(storageKey, JSON.stringify(newConfig));
  };

  const spacingBlocks = [
    { key: "header", label: "Header" },
    { key: "summary", label: "Professional Summary" },
    { key: "experience", label: "Work Experience" },
    { key: "projects", label: "Key Projects" },
    { key: "education", label: "Education" },
    { key: "skills", label: "Skills" },
    { key: "languages", label: "Languages" },
    { key: "references", label: "References" },
    { key: "personalDetails", label: "Personal Details" },
  ];

  // ── Step helpers ────────────────────────────────────────────────────────
  const handleNext = () => setActiveStep((p) => p + 1);
  const handleBack = () => setActiveStep((p) => p - 1);

  const renderStepContent = (step) => {
    switch (step) {
      case 0: return <PersonalDetailsForm />;
      case 1: return <EducationForm />;
      case 2: return <ExperienceForm />;
      case 3: return <ProjectsForm />;
      case 4: return <SkillsForm />;
      default: return <Typography>Unknown step</Typography>;
    }
  };

  // ── Download flow ───────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (isPremiumTemplate) {
      if (!userid) {
        setSnackbarMessage("User ID not found. Please refresh.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }
      if (userPoints < 10) { setInsufficientCreditsDialogOpen(true); return; }
      setPremiumConfirmDialogOpen(true);
    } else {
      setDownloading(true);
      await triggerPrint();
    }
  };

  const handlePremiumConfirm = async () => {
    setPremiumConfirmDialogOpen(false);
    setDownloading(true);
    try {
      const creditResult = await profileAPI.deductFeatureCredits(userid, "resume_download");
      if (!creditResult.success) {
        setInsufficientCreditsDialogOpen(true);
        setDownloading(false);
        return;
      }
      if (creditResult.balance !== undefined)
        dispatch(updateUserProfile({ points: creditResult.balance }));
      await triggerPrint();
      setSnackbarMessage(
        `✓ Download successful! ${creditResult.credits_deducted} credits deducted. Balance: ${creditResult.balance}`
      );
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error deducting credits:", err);
      setSnackbarMessage("Failed to process premium download. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setDownloading(false);
    }
  };

  const downloadPDFMobile = async () => {
    const container = exportPagesRef.current;
    if (!container) return;

    const pages = container.querySelectorAll(".resume-pdf-page");
    if (pages.length === 0) return;

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

    const fullName = profile?.personalDetails?.fullName || "Resume";
    pdf.save(`Resume_${fullName.replace(/[^a-z0-9]/gi, "_")}.pdf`);
  };

  // Wait for the hidden export container's ResizeObserver + recompute(50ms)
  // to finish, then trigger the native browser print dialog.
  const triggerPrint = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent) || isMobile;

    if (isMobileDevice) {
      try {
        await downloadPDFMobile();
      } catch (err) {
        console.error("Mobile download failed:", err);
        setSnackbarMessage("Failed to generate PDF. Please try again.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        setDownloading(false);
      }
    } else {
      handlePrint();
      // onAfterPrint will call setDownloading(false)
    }
  };

  // ── Loading state ───────────────────────────────────────────────────────
  if (loading && (!profile || Object.keys(profile).length === 0)) {
    return (
      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center",
        height: "calc(100vh - 64px)", backgroundColor: "#f1f5f9",
      }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", backgroundColor: "#f1f5f9" }}>
      <Grid container sx={{ height: { xs: "auto", md: "calc(100vh - 64px)" } }}>

        {/* ── Left: Stepper form ── */}
        <Grid item xs={12} md={7.8} sx={{
          height: { xs: "auto", md: "100%" },
          overflowY: "auto",
          p: { xs: 2, md: 4 },
          borderRight: { xs: "none", md: "1px solid #e2e8f0" },
          borderBottom: { xs: "1px solid #e2e8f0", md: "none" },
        }}>
          <Container maxWidth="lg">
            {/* Profile Review Notification */}
            <Box sx={{ mb: 3 }}>
              <ProfileReviewBanner />
            </Box>

            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid #e2e8f0" }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/resume-builder")}
                variant="text" size="small"
                sx={{
                  mb: 2, color: "text.secondary", textTransform: "none",
                  fontWeight: 400, borderRadius: 2, px: 1.5,
                  "&:hover": { bgcolor: "#f1f5f9", color: "text.primary" },
                }}
              >
                Back to Templates
              </Button>

              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Build Your Resume
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>
                Fill in your details below. Your preview updates in real time.
              </Typography>

              {/* Spacing Controls accordion */}
              {/* <Accordion 
                sx={{ 
                  mb: 4, 
                  borderRadius: "12px !important", 
                  border: "1px solid #e2e8f0", 
                  boxShadow: "none", 
                  "&:before": { display: "none" },
                  overflow: "hidden"
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "text.primary" }}>
                    ↕ Page & Section Spacing
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ bgcolor: "#f8fafc", borderTop: "1px solid #e2e8f0", p: 3 }}>
                  <Grid container spacing={2}>
                    {spacingBlocks.map((block) => (
                      <Grid item xs={12} sm={4} key={block.key}>
                        <FormControl fullWidth size="small">
                          <InputLabel id={`spacing-label-${block.key}`}>{block.label}</InputLabel>
                          <Select
                            labelId={`spacing-label-${block.key}`}
                            label={block.label}
                            value={profile?.spacingConfig?.[block.key] ?? 0}
                            onChange={(e) => handleSpacingChange(block.key, e.target.value)}
                            sx={{ bgcolor: "#fff", borderRadius: 2 }}
                          >
                            {[0, 1, 2, 3, 4, 5].map((val) => (
                              <MenuItem key={val} value={val}>
                                {val} ({val * 5}px)
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion> */}

              <Stepper
                activeStep={activeStep}
                orientation={isMobile ? "vertical" : "horizontal"}
                alternativeLabel={!isMobile}
                sx={{ mb: 4 }}
              >
                {steps.map((label, index) => (
                  <Step key={label} onClick={() => setActiveStep(index)} sx={{ cursor: "pointer" }}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Box sx={{ mt: 2, minHeight: "400px" }}>
                {renderStepContent(activeStep)}
              </Box>

              <Divider sx={{ my: 4 }} />

              <Stack direction="row" justifyContent="space-between">
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  variant="outlined"
                  sx={{ borderRadius: 2, px: 4 }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={activeStep === steps.length - 1 ? () => navigate("/dashboard") : handleNext}
                  sx={{ borderRadius: 2, px: 4, background: "black", "&:hover": { background: "#333" } }}
                >
                  {activeStep === steps.length - 1 ? "Finish" : "Next"}
                </Button>
              </Stack>
            </Paper>
          </Container>
        </Grid>

        {/* ── Right: Live preview ── */}
        <Grid item xs={12} md={4.2} sx={{
          height: { xs: "600px", md: "100%" },
          bgcolor: "#f1f5f9",
          display: "block",
          overflow: "hidden",
          position: "relative",
        }}>
          {/* Zoom control bar */}
          <Paper elevation={3} sx={{
            position: "absolute", top: 20, left: "50%",
            transform: "translateX(-50%)", zIndex: 1000,
            p: "8px 16px", borderRadius: 10,
            display: "flex", alignItems: "center", gap: 2,
            border: "1px solid #e2e8f0",
          }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton size="small" onClick={() => setZoom((p) => Math.max(0.2, p - 0.1))}>
                <ZoomOutIcon />
              </IconButton>
              <Slider
                value={zoom} min={0.2} max={1.5} step={0.05}
                onChange={(_, val) => setZoom(val)}
                sx={{ width: 100, color: "black" }}
              />
              <IconButton size="small" onClick={() => setZoom((p) => Math.min(1.5, p + 0.1))}>
                <ZoomInIcon />
              </IconButton>
              <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 40 }}>
                {Math.round(zoom * 100)}%
              </Typography>
            </Stack>
          </Paper>

          {/* Scrollable preview — display only, NEVER captured */}
          <div style={{
            height: "calc(100% - 100px)",
            width: "100%",
            overflowX: "auto",
            overflowY: "auto",
            paddingTop: "96px",
            paddingBottom: "32px",
            paddingLeft: "12px",
            paddingRight: "12px",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            backgroundColor: "#edf0f4",
            boxSizing: "border-box",
          }}>
            <div style={{
              display: "inline-flex",
              justifyContent: "center",
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
              transition: "transform 0.2s cubic-bezier(0.4,0,0.2,1)",
            }}>
              {/* Visible preview — for display only, no ref, never printed */}
              <MultiPageResumePreview templateId={templateId} data={profile} />
            </div>
          </div>

          {/* Download bar */}
          <div style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            padding: "16px 24px",
            backgroundColor: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(8px)",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            zIndex: 10,
          }}>
            {templateId.includes("_p") && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                <Chip
                  icon={<CreditIcon />}
                  label="Premium Template"
                  variant="outlined"
                  color="warning"
                  size="small"
                  sx={{ fontWeight: 500 }}
                />
                <Typography variant="caption" sx={{ color: "#f59e0b", fontWeight: 500 }}>
                  Costs 10 credits • Balance: {userPoints}
                </Typography>
              </div>
            )}

            <Button
              variant="contained"
              startIcon={
                downloading
                  ? <CircularProgress size={18} sx={{ color: "#fff" }} />
                  : <FileDownloadIcon />
              }
              onClick={handleDownload}
              disabled={downloading}
              sx={{
                width: "100%",
                borderRadius: 3, px: 4, py: 1.8, minHeight: 56,
                background: isPremiumTemplate
                  ? "linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)"
                  : "linear-gradient(135deg, #111827 0%, #1F2937 100%)",
                fontWeight: 600, color: "#fff", textTransform: "none",
                boxShadow: isPremiumTemplate
                  ? "0 10px 30px rgba(124,58,237,0.35)"
                  : "0 10px 20px rgba(17,24,39,0.18)",
                "&:hover": {
                  background: isPremiumTemplate
                    ? "linear-gradient(135deg, #6D28D9 0%, #1D4ED8 100%)"
                    : "linear-gradient(135deg, #000 0%, #111827 100%)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.2s ease",
                "&.Mui-disabled": {
                  background: isPremiumTemplate
                    ? "linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)"
                    : "linear-gradient(135deg, #111827 0%, #1F2937 100%)",
                  opacity: 0.85, color: "#fff",
                },
              }}
            >
              {downloading ? (
                <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: "#fff" }}>
                  Preparing PDF...
                </Typography>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", lineHeight: 1, color: "inherit" }}>
                    Download Resume PDF
                  </Typography>
                  {isPremiumTemplate && (
                    <div style={{
                      padding: "2px 8px",
                      borderRadius: "999px",
                      backgroundColor: "rgba(255,255,255,0.14)",
                      border: "1px solid rgba(255,255,255,0.18)",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: "#fff",
                      whiteSpace: "nowrap",
                    }}>
                      10 Credits
                    </div>
                  )}
                </div>
              )}
            </Button>
          </div>
        </Grid>
      </Grid>

      {/* ── Dialogs ── */}
      <InsufficientCreditsDialog
        open={insufficientCreditsDialogOpen}
        onClose={() => setInsufficientCreditsDialogOpen(false)}
      />

      <Dialog
        open={premiumConfirmDialogOpen}
        onClose={() => setPremiumConfirmDialogOpen(false)}
        maxWidth="sm" fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CreditIcon sx={{ fontSize: 28, color: "#f59e0b" }} />
          <Typography variant="h6" sx={{ fontWeight: 500 }}>Premium Template Download</Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Stack spacing={2}>
            <Alert severity="info">
              This is a premium template and will cost <strong>10 credits</strong> to download.
            </Alert>
            <div style={{
              backgroundColor: "#f0f9ff", padding: 16,
              borderRadius: 8, border: "1px solid #bfdbfe",
            }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: "#1e40af", mb: 1 }}>
                💳 Billing Summary
              </Typography>
              {[
                ["Cost", "10 Credits"],
                ["Current Balance", `${userPoints} Credits`],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <Typography variant="body2">{label}:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{value}</Typography>
                </div>
              ))}
              <Divider sx={{ my: 1 }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>New Balance:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#166534" }}>
                  {userPoints - 10} Credits
                </Typography>
              </div>
            </div>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              By proceeding, you authorize the deduction of 10 credits from your account.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setPremiumConfirmDialogOpen(false)} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handlePremiumConfirm}
            variant="contained"
            disabled={downloading}
            sx={{ background: "#f59e0b", "&:hover": { background: "#d97706" } }}
          >
            {downloading && <CircularProgress size={20} sx={{ color: "#fff", mr: 1 }} />}
            Confirm & Download
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen} autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          icon={snackbarSeverity === "success" ? <CheckCircleIcon /> : undefined}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* ── Hidden export container ─────────────────────────────────────────
          - position:fixed + left:-9999px → off-screen, never visible
          - top:0 REQUIRED — getBoundingClientRect needs vertical on-screen position
          - width:210mm → exact A4 width, browser computes px correctly for any DPI
          - visibility:hidden → invisible but fully laid out and measurable
          - NO transform/scale — always captured at true 1:1 A4 size
          - pagesRef attached here — react-to-print reads from this container
      ──────────────────────────────────────────────────────────────────── */}
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
        <MultiPageResumePreview
          templateId={templateId}
          data={profile}
          isExport={true}
          pagesRef={exportPagesRef}
        />
      </div>
    </div>
  );
};

export default ResumeBuilderScreen;