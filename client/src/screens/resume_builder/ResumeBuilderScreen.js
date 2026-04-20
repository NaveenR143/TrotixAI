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
  IconButton
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import Draggable from "react-draggable";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

// Form Components (To be created)
import PersonalDetailsForm from "./sections/PersonalDetailsForm";
import EducationForm from "./sections/EducationForm";
import ExperienceForm from "./sections/ExperienceForm";
import SkillsForm from "./sections/SkillsForm";

// Preview Component (To be created)
import ResumePreview from "./ResumePreview";

const steps = ["Personal Info", "Education", "Experience", "Skills"];

const ResumeBuilderScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.ProfileReducer.data);
  const user = useSelector((state) => state.UserReducer);

  // Get template ID from URL
  const queryParams = new URLSearchParams(location.search);
  const templateId = queryParams.get("template") || "default";

  const [activeStep, setActiveStep] = useState(0);
  const [zoom, setZoom] = useState(1);
  const nodeRef = React.useRef(null);

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
        return <SkillsForm />;
      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  return (
    <Box sx={{ minHeight: "calc(100vh - 64px)", bgcolor: "#f1f5f9" }}>
      <Grid container sx={{ height: "calc(100vh - 64px)" }}>
        {/* Left Section: Stepper Form (65%) */}
        <Grid 
          item 
          xs={12} 
          md={7.8} 
          sx={{ 
            height: "100%", 
            overflowY: "auto", 
            p: { xs: 2, md: 4 },
            borderRight: "1px solid #e2e8f0"
          }}
        >
          <Container maxWidth="sm">
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1px solid #e2e8f0" }}>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                Build Your Resume
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>
                Fill in your details below. Your preview updates in real time.
              </Typography>

              <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
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
            height: "100%", 
            bgcolor: "#f1f5f9",
            display: { xs: "none", md: "block" },
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
          <Box sx={{ height: "100%", width: "100%", overflow: "auto", p: 4, pt: 12 }}>
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
                    mb: 10 // Space at bottom
                  }}
                >
                  <ResumePreview templateId={templateId} data={profile} />
                </Box>
              </Box>
            </Draggable>
          </Box>
        </Grid>

      </Grid>
    </Box>
  );
};

export default ResumeBuilderScreen;