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
  useMediaQuery
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
import CircularProgress from "@mui/material/CircularProgress";
import { fetchAndStoreProfile } from "../../redux/profile/ProfileAction";



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

  // Get template ID from URL
  const queryParams = new URLSearchParams(location.search);
  const templateId = queryParams.get("template") || "default";

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [activeStep, setActiveStep] = useState(0);
  const [zoom, setZoom] = useState(0.4);
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const nodeRef = React.useRef(null);

  useEffect(() => {
    const fetchUserProfileData = async () => {
      setLoading(true);
      setError(null);
      
      const phone = profile?.mobile || user?.mobile || "9789502974";
      
      const result = await dispatch(fetchAndStoreProfile(phone));
      
      if (result.success) {
        setUserId(result.data.id);
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
    const element = document.getElementById("resume-export-content");
    if (!element) return;

    try {
      setDownloading(true);
      
      // Delay to ensure the loading state is visible and the hidden element is fully rendered
      setTimeout(async () => {
        try {
          // Capture the hidden, desktop-sized element at 4x scale for maximum clarity
          const canvas = await html2canvas(element, {
            scale: 4, // Ultra-high DPI for professional quality
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
            width: element.offsetWidth,
            height: element.offsetHeight,
          });

          const imgData = canvas.toDataURL("image/png", 1.0);
          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
          });

          // Standard A4 is 210mm x 297mm
          pdf.addImage(imgData, "PNG", 0, 0, 210, 297, undefined, 'FAST');
          
          const fullName = profile?.personalDetails?.fullName || "Resume";
          const fileName = `Resume - ${fullName.replace(/[^a-z0-9]/gi, '_')}.pdf`;
            
          pdf.save(fileName);
        } catch (innerError) {
          console.error("Inner PDF Generation error:", innerError);
        } finally {
          setDownloading(false);
        }
      }, 300); // Slightly longer delay to ensure the off-screen render is ready
    } catch (error) {
      console.error("PDF Download process failed:", error);
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
              justifyContent: "center",
              zIndex: 10
            }}
          >
            <Button
              variant="contained"
              startIcon={downloading ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />}
              onClick={handleDownload}
              disabled={downloading}
              sx={{ 
                borderRadius: 3, 
                px: 6, 
                py: 1.5,
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                fontWeight: 700,
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                "&:hover": {
                  background: "#000",
                  transform: "translateY(-2px)",
                  boxShadow: "0 15px 25px rgba(0,0,0,0.15)"
                },
                transition: "all 0.2s"
              }}
            >
              {downloading ? "Generating PDF..." : "Download Resume PDF"}
            </Button>
          </Paper>
        </Grid>


      </Grid>
      
      {/* Hidden Export Renderer - This renders an off-screen desktop-width version of the resume for PDF generation */}
      <ResumePreview templateId={templateId} data={profile} isExport={true} />
    </Box>
  );
};


export default ResumeBuilderScreen;