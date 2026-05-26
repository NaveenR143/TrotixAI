import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  Container,
  Divider,
  Stack,
  Slider,
  IconButton,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Chip
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import Draggable from "react-draggable";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CircularProgress from "@mui/material/CircularProgress";
import CreditIcon from "@mui/icons-material/CardGiftcard";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { fetchAndStoreProfile } from "../../redux/profile/ProfileAction";
import { updateUserProfile } from "../../redux/user/Action";
import * as profileAPI from "../../api/profileAPI";
import InsufficientCreditsDialog from "../candidate/components/dialogs/InsufficientCreditsDialog";


// Form Components (To be created)
import PersonalDetailsForm from "./sections/PersonalDetailsForm";
import EducationForm from "./sections/EducationForm";
import ExperienceForm from "./sections/ExperienceForm";
import SkillsForm from "./sections/SkillsForm";
import ProjectsForm from "./sections/ProjectsForm";


// Preview Component (To be created)
import ResumePreview from "./ResumePreview";

const steps = ["Personal Info", "Education", "Experience", "Projects", "Skills"];


const ResumeBuilderScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.ProfileReducer.data);
  const user = useSelector((state) => state.UserReducer);


  const { userid, points: userPoints } = useSelector((state) => state.UserReducer);

  // Get template ID from URL
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
  const nodeRef = React.useRef(null);

  useEffect(() => {
    const fetchUserProfileData = async () => {
      setLoading(true);
      setError(null);

      const phone = profile?.mobile || user?.mobile || "9789502974";

      const result = await dispatch(fetchAndStoreProfile(phone));

      if (result.success) {
        // setUserId(result.data.id);
      } else {
        setError(result.message || "Failed to load profile");
      }

      setLoading(false);
    };

    if (!profile?.id) {
      fetchUserProfileData();
    }
  }, [dispatch, profile, user?.mobile]);


  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return <PersonalDetailsForm />;
      case 1:
        return <EducationForm />;
      case 2:
        return <ExperienceForm />;
      case 3:
        return <ProjectsForm />;
      case 4:
        return <SkillsForm />;
      default:
        return <Typography>Unknown step</Typography>;
    }

  };

  const handleDownload = async () => {
    // Check if template is premium (contains "_p")


    // Step 1: Check balance for premium templates
    if (isPremiumTemplate) {
      if (!userid) {
        setSnackbarMessage("User ID not found. Please refresh.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      if (userPoints < 10) {
        setInsufficientCreditsDialogOpen(true);
        return;
      }

      // Show confirmation dialog before charging
      setPremiumConfirmDialogOpen(true);
    } else {
      // Free template - direct download
      setDownloading(true);
      await generateAndDownloadPDF();
    }
  };

  const handlePremiumConfirm = async () => {
    setPremiumConfirmDialogOpen(false);
    setDownloading(true);

    try {
      // Step 2: Deduct credits for premium template
      const creditResult = await profileAPI.deductFeatureCredits(userid, "resume_download");

      // Check if credit deduction was unsuccessful
      if (!creditResult.success) {
        setInsufficientCreditsDialogOpen(true);
        setDownloading(false);
        return;
      }

      // Update balance in Redux
      if (creditResult.balance !== undefined) {
        dispatch(updateUserProfile({ points: creditResult.balance }));
      }

      // Step 3: Proceed with PDF generation
      await generateAndDownloadPDF();

      // Show success message
      setSnackbarMessage(`✓ Download successful! ${creditResult.credits_deducted} credits deducted. Balance: ${creditResult.balance}`);
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



  const generateAndDownloadPDF = async () => {
    const element = document.getElementById("resume-export-content");
    if (!element) {
      setDownloading(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const PAGE_WIDTH_MM = 210;
      const PAGE_HEIGHT_MM = 297;
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      const pageHeightPx = Math.floor(
        (canvasWidth * PAGE_HEIGHT_MM) / PAGE_WIDTH_MM
      );

      const ctx = canvas.getContext("2d");
      const pixels = ctx.getImageData(0, 0, canvasWidth, canvasHeight).data;

      /**
       * Count how many dark pixels exist in a horizontal row.
       * Samples every 6px for speed. "Dark" = any channel below 200
       * (catches text, lines, icons — even on lightly tinted backgrounds).
       */
      const countDarkPixels = (y) => {
        if (y < 0 || y >= canvasHeight) return 0;
        let count = 0;
        for (let x = 0; x < canvasWidth; x += 6) {
          const idx = (y * canvasWidth + x) * 4;
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];
          // Consider it "dark" if it's meaningfully non-background
          if (r < 200 || g < 200 || b < 200) count++;
        }
        return count;
      };

      /**
       * Scan upward from `startY` over `scanRange` rows.
       * Returns the Y of the row with the FEWEST dark pixels
       * (i.e., most likely a gap between text lines or sections).
       * Falls back to startY if everything looks equally dense.
       */
      const findSafeBreak = (startY, scanRange = 150) => {
        let bestY = startY;
        let minDark = Infinity;

        const scanFrom = startY;
        const scanTo = Math.max(0, startY - scanRange);

        for (let y = scanFrom; y > scanTo; y--) {
          const dark = countDarkPixels(y);

          // Perfect empty row — stop immediately
          if (dark === 0) return y;

          if (dark < minDark) {
            minDark = dark;
            bestY = y;
          }
        }

        return bestY;
      };

      let renderedHeight = 0;
      let isFirstPage = true;
      let safetyCounter = 0; // prevent infinite loop

      while (renderedHeight < canvasHeight && safetyCounter < 50) {
        safetyCounter++;
        const remaining = canvasHeight - renderedHeight;
        const rawSliceEnd = renderedHeight + Math.min(pageHeightPx, remaining);

        // Only seek a safe break if there's more content after this page
        const breakY =
          remaining > pageHeightPx
            ? findSafeBreak(rawSliceEnd)
            : rawSliceEnd;

        // Guard: never produce a zero-height or negative slice (infinite loop prevention)
        const sliceHeight = Math.max(breakY - renderedHeight, pageHeightPx * 0.5);

        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvasWidth;
        pageCanvas.height = sliceHeight;

        const pageCtx = pageCanvas.getContext("2d");
        pageCtx.drawImage(
          canvas,
          0, renderedHeight,
          canvasWidth, sliceHeight,
          0, 0,
          canvasWidth, sliceHeight
        );

        const pageImgHeightMM = (sliceHeight * PAGE_WIDTH_MM) / canvasWidth;
        const pageData = pageCanvas.toDataURL("image/png", 1.0);

        if (!isFirstPage) pdf.addPage();
        pdf.addImage(pageData, "PNG", 0, 0, PAGE_WIDTH_MM, pageImgHeightMM, undefined, "FAST");

        renderedHeight += sliceHeight;
        isFirstPage = false;

        // Yield to browser between pages
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      const fullName = profile?.personalDetails?.fullName || "Resume";
      const fileName = `Resume - ${fullName.replace(/[^a-z0-9]/gi, "_")}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setDownloading(false);
    }
  };


  if (loading && (!profile || Object.keys(profile).length === 0)) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 64px)", bgcolor: "#f1f5f9" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "calc(100vh - 64px)", bgcolor: "#f1f5f9" }}>

      <Grid container sx={{ height: { xs: "auto", md: "calc(100vh - 64px)" } }}>
        {/* Left Section: Stepper Form (65%) */}
        <Grid
          item
          xs={12}
          md={7.8}
          sx={{
            height: { xs: "auto", md: "100%" },
            overflowY: "auto",
            p: { xs: 2, md: 4 },
            borderRight: { xs: "none", md: "1px solid #e2e8f0" },
            borderBottom: { xs: "1px solid #e2e8f0", md: "none" }
          }}
        >
          <Container maxWidth="lg">
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid #e2e8f0" }}>
              {/* Back Button */}
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/resume-builder")}
                variant="text"
                size="small"
                sx={{
                  mb: 2,
                  color: "text.secondary",
                  textTransform: "none",
                  fontWeight: 500,
                  borderRadius: 2,
                  px: 1.5,
                  "&:hover": { bgcolor: "#f1f5f9", color: "text.primary" },
                }}
              >
                Back to Templates
              </Button>

              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                Build Your Resume
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>
                Fill in your details below. Your preview updates in real time.
              </Typography>

              <Stepper
                activeStep={activeStep}
                orientation={isMobile ? "vertical" : "horizontal"}
                alternativeLabel={!isMobile}
                sx={{ mb: 4 }}
              >
                {steps.map((label, index) => (
                  <Step key={label} onClick={() => setActiveStep(index)} sx={{ cursor: 'pointer' }}>
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

        {/* Right Section: Live Preview (35%) */}
        <Grid
          item
          xs={12}
          md={4.2}
          sx={{
            height: { xs: "600px", md: "100%" },
            bgcolor: "#f1f5f9",
            display: "block",
            overflow: "hidden", // Prevent screen scroll
            position: "relative"
          }}
        >
          {/* Zoom Control Bar */}
          <Paper
            elevation={3}
            sx={{
              position: "absolute",
              top: 20,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1000,
              p: "8px 16px",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              gap: 2,
              border: "1px solid #e2e8f0"
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton size="small" onClick={() => setZoom(prev => Math.max(0.4, prev - 0.1))}>
                <ZoomOutIcon />
              </IconButton>
              <Slider
                value={zoom}
                min={0.4}
                max={1.5}
                step={0.05}
                onChange={(e, val) => setZoom(val)}
                sx={{ width: 100, color: "black" }}
              />
              <IconButton size="small" onClick={() => setZoom(prev => Math.min(1.5, prev + 0.1))}>
                <ZoomInIcon />
              </IconButton>
              <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 40 }}>
                {Math.round(zoom * 100)}%
              </Typography>
            </Stack>
            <Divider orientation="vertical" flexItem />
            <Box className="drag-handle" sx={{ cursor: "move", display: "flex", color: "#64748b" }}>
              <DragIndicatorIcon />
            </Box>
          </Paper>

          {/* Draggable Paper Area */}
          <Box sx={{ height: "calc(100% - 100px)", width: "100%", overflow: "auto", p: 4, pt: 12 }}>
            <Draggable nodeRef={nodeRef} handle=".drag-handle" bounds="parent">
              <Box
                ref={nodeRef}
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  transition: "transform 0.1s ease-out"
                }}
              >
                <Box
                  sx={{
                    transform: `scale(${zoom})`,
                    transformOrigin: "top center",
                    transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    width: "210mm",
                    mb: 4
                  }}
                >
                  <ResumePreview templateId={templateId} data={profile} />
                </Box>
              </Box>
            </Draggable>
          </Box>

          {/* Download Action Section */}
          <Paper
            elevation={0}
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              p: 3,
              bgcolor: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(8px)",
              borderTop: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
              zIndex: 10
            }}
          >
            {/* Premium Badge and Info */}
            {templateId.includes("_p") && (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ width: "100%" }}>
                <Chip
                  icon={<CreditIcon />}
                  label="Premium Template"
                  variant="outlined"
                  color="warning"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
                <Typography variant="caption" sx={{ color: "#f59e0b", fontWeight: 600 }}>
                  Costs 10 credits • Balance: {userPoints}
                </Typography>
              </Stack>
            )}

            <Button
              variant="contained"
              startIcon={
                downloading ? (
                  <CircularProgress size={18} sx={{ color: "#ffffff" }} />
                ) : (
                  <FileDownloadIcon />
                )
              }
              onClick={handleDownload}
              disabled={downloading}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.8,
                minHeight: 56,

                // Theme-based colors
                background: isPremiumTemplate
                  ? "linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)"
                  : "linear-gradient(135deg, #111827 0%, #1F2937 100%)",

                fontWeight: 700,
                color: "#FFFFFF",
                textTransform: "none",

                boxShadow: isPremiumTemplate
                  ? "0 10px 30px rgba(124, 58, 237, 0.35)"
                  : "0 10px 20px rgba(17, 24, 39, 0.18)",

                border: isPremiumTemplate
                  ? "1px solid rgba(255,255,255,0.12)"
                  : "1px solid rgba(255,255,255,0.06)",

                "&:hover": {
                  background: isPremiumTemplate
                    ? "linear-gradient(135deg, #6D28D9 0%, #1D4ED8 100%)"
                    : "linear-gradient(135deg, #000000 0%, #111827 100%)",

                  transform: "translateY(-2px)",

                  boxShadow: isPremiumTemplate
                    ? "0 15px 40px rgba(124, 58, 237, 0.45)"
                    : "0 15px 30px rgba(17, 24, 39, 0.25)",
                },

                transition: "all 0.2s ease",

                "&.Mui-disabled": {
                  background: isPremiumTemplate
                    ? "linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)"
                    : "linear-gradient(135deg, #111827 0%, #1F2937 100%)",
                  opacity: 0.85,
                  color: "#FFFFFF",
                },
              }}
            >
              {downloading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#FFFFFF" }}>
                    Generating PDF...
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      lineHeight: 1,
                      color: "inherit",
                    }}
                  >
                    Download Resume PDF
                  </Typography>

                  {isPremiumTemplate && (
                    <Box
                      sx={{
                        px: 1,
                        py: 0.3,
                        borderRadius: "999px",
                        bgcolor: "rgba(255,255,255,0.14)",
                        border: "1px solid rgba(255,255,255,0.18)",
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        lineHeight: 1.2,
                        color: "#FFFFFF",
                        whiteSpace: "nowrap",
                        backdropFilter: "blur(6px)",
                      }}
                    >
                      10 Credits
                    </Box>
                  )}
                </Box>
              )}
            </Button>
          </Paper>
        </Grid>


      </Grid>

      {/* Insufficient Credits Dialog */}
      <InsufficientCreditsDialog
        open={insufficientCreditsDialogOpen}
        onClose={() => setInsufficientCreditsDialogOpen(false)}
      />

      {/* Premium Download Confirmation Dialog */}
      <Dialog open={premiumConfirmDialogOpen} onClose={() => setPremiumConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CreditIcon sx={{ fontSize: 28, color: "#f59e0b" }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Premium Template Download
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          <Stack spacing={2}>
            <Alert severity="info" sx={{ mb: 1 }}>
              This is a premium template and will cost <strong>10 credits</strong> to download.
            </Alert>

            <Box sx={{ bgcolor: "#f0f9ff", p: 2, borderRadius: 2, border: "1px solid #bfdbfe" }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e40af", mb: 1 }}>
                💳 Billing Summary
              </Typography>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2">Cost:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>10 Credits</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2">Current Balance:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#166534" }}>{userPoints} Credits</Typography>
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ fontWeight: 700 }}>New Balance:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#166534" }}>{userPoints - 10} Credits</Typography>
              </Stack>
            </Box>

            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              By proceeding, you authorize the deduction of 10 credits from your account.
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setPremiumConfirmDialogOpen(false)}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePremiumConfirm}
            variant="contained"
            sx={{ background: "#f59e0b", "&:hover": { background: "#d97706" } }}
            disabled={downloading}
          >
            {downloading ? <CircularProgress size={20} sx={{ color: "#ffffff", mr: 1 }} /> : null}
            Confirm & Download
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
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

      {/* Hidden Export Renderer - This renders an off-screen desktop-width version of the resume for PDF generation */}
      <ResumePreview templateId={templateId} data={profile} isExport={true} />
    </Box>
  );
};


export default ResumeBuilderScreen;