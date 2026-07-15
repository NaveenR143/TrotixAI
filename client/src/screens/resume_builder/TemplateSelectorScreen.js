import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Paper,
  Stack,
  useTheme,
  useMediaQuery,
  Breadcrumbs,
  Link,
  Tooltip,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ProfileReviewBanner from "../candidate/components/ProfileReviewBanner";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

// Dynamically load all images from the template_selector folder
const importAll = (r) => {
  let images = {};
  r.keys().forEach((item) => {
    images[item.replace("./", "")] = r(item);
  });
  return images;
};

// Use require.context to find all template images
let templateImages = {};
try {
  templateImages = importAll(
    require.context("./template_selector", false, /\.(png|jpe?g|svg)$/)
  );
} catch (e) {
  console.warn("Could not load template images dynamically:", e);
}

const TemplateCard = ({ name, image, onSelect, delay, isMobile, isPremium }) => {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "2px", // Sharp, professional look
        overflow: "hidden",
        border: "1px solid #e2e8f0",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        animation: `slideUp 0.5s ease-out ${delay}s both`,
        "&:hover": {
          transform: isMobile ? "none" : "translateY(-8px)", // No hover lift on mobile to avoid layout shifts
          boxShadow: "0 20px 40px rgba(99, 102, 241, 0.15)",
          borderColor: "#6366f1",
          "& .template-overlay": {
            opacity: 1,
          },
          "& .template-image": {
            transform: "scale(1.05)",
          },
          "& .template-overlay button": {
            transform: "translateY(0)", // ⬆️ slides up
            opacity: 1,
          },
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          width: "100%",
          aspectRatio: "1 / 1.414", // Maintains standard A4 resume proportions
          bgcolor: "#f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "none",
        }}
      >
        <CardMedia
          component="img"
          className="template-image"
          image={image}
          alt={name}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            transition: "transform 0.5s ease",
          }}
        />
        <Box
          className="template-overlay"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.65)", // ⬆️ darker
            backdropFilter: "blur(4px)", // ✨ premium feel
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
            transition: "all 0.3s ease",
          }}
        >
          <Button
            variant="contained"
            onClick={() => onSelect(name)}
            sx={{
              bgcolor: "#6366f1",
              color: "#fff",
              fontWeight: 600,
              fontSize: { xs: "0.75rem", md: "0.85rem" },
              px: { xs: 2, md: 3.5 },
              py: { xs: 1, md: 1.2 },
              borderRadius: 2,
              boxShadow: "0 8px 25px rgba(99,102,241,0.5)",
              textTransform: "none",
              letterSpacing: "0.3px",
              opacity: 1, // On mobile, maybe keep button visible? Or visible on tap.
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: "#4f46e5",
                boxShadow: "0 12px 30px rgba(99,102,241,0.7)",
              },
            }}
          >
            {isMobile ? "Select" : "Use This Template"}
          </Button>
        </Box>
        {isPremium && (
          <Chip
            label="Premium"
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.65rem",
              height: 22,
              px: 1,
              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.4)",
              textTransform: "uppercase",
              letterSpacing: "1px",
              border: "1px solid rgba(255,255,255,0.3)",
              zIndex: 5,
              "& .MuiChip-label": {
                px: 1,
              },
            }}
          />
        )}
      </Box>
    </Card>
  );
};

const TemplateSelectorScreen = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSelect = (rawName) => {
    // Transform "template_1.png" -> "template1"
    const templateId = rawName.split('.')[0].replace(/_/g, "");
    console.log("Selected template:", templateId);
    // Navigate to builder with selection
    navigate(`/resume-builder/create?template=${templateId}`);
  };


  const templates = Object.entries(templateImages);
  const freeTemplates = templates.filter(([name]) => !name.split(".")[0].endsWith("_p"));
  const premiumTemplates = templates.filter(([name]) => name.split(".")[0].endsWith("_p"));

  const TemplateGrid = ({ title, subtitle, items, offset = 0, isPremiumSection }) => (
    <Box sx={{ mb: 10, position: "relative" }}>
      <Stack spacing={1.5} sx={{ mb: 5, pl: { xs: 1, md: 0 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: "#0f172a",
              fontSize: { xs: "1.5rem", md: "2.25rem" },
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            {title}
          </Typography>
          {isPremiumSection && (
            <Chip
              label="ATS Optimized"
              size="small"
              sx={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "0.7rem",
                height: 24,
                px: 1,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                boxShadow: "0 4px 10px rgba(16, 185, 129, 0.2)",
                border: "none",
              }}
            />
          )}
        </Stack>
        <Typography
          sx={{
            color: "#475569",
            fontSize: { xs: "0.95rem", md: "1.1rem" },
            maxWidth: "700px",
            lineHeight: 1.6,
            fontWeight: 400,
          }}
        >
          {subtitle}
        </Typography>
      </Stack>

      <Grid container spacing={{ xs: 1.5, md: 3 }}>
        {items.map(([name, image], index) => (
          <Grid
            item
            xs={6}
            sm={4}
            md={3}
            lg={2.4}
            key={name}
          >
            <TemplateCard
              name={name}
              image={image}
              onSelect={handleSelect}
              delay={(index + offset) * 0.1}
              isMobile={isMobile}
              isPremium={name.split(".")[0].endsWith("_p")}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 10 }}>
      {/* Header / Breadcrumbs */}
      <Box sx={{ bgcolor: "#ffffff", borderBottom: "1px solid #e2e8f0", py: 2 }}>
        <Container maxWidth="lg">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
              <Link
                underline="hover"
                color="inherit"
                href="/dashboard"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/dashboard");
                }}
                sx={{ display: "flex", alignItems: "center", fontSize: "0.9rem" }}
              >
                Dashboard
              </Link>
              <Typography color="text.primary" sx={{ fontSize: "0.9rem", fontWeight: 500 }}>
                Resume Builder
              </Typography>
            </Breadcrumbs>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/dashboard")}
              sx={{ color: "#212121", fontWeight: 500 }}
            >
              Back to Dashboard
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Profile Review Notification */}
      <Container maxWidth="lg" sx={{ mt: 3, mb: -1 }}>
        <ProfileReviewBanner />
      </Container>

      {/* Hero Section */}
      {/* <Box
        sx={{
          py: { xs: 4, md: 6 }, // ⬇️ reduced from 6/10 → 4/6
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#ffffff",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="md">
          <Typography
            sx={{
              fontSize: { xs: "2rem", md: "3.5rem" },
              fontWeight: 800,
              mb: 2,
              lineHeight: 1.1,
              background: "linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Pick Your Dream Template
          </Typography>
          
        </Container>
      </Box> */}

      {/* Template Sections */}
      <Container maxWidth="lg" sx={{ mt: 6, position: "relative", zIndex: 10 }}>
        {templates.length > 0 ? (
          <>
            {freeTemplates.length > 0 && (
              <TemplateGrid
                title="Free Resume Templates"
                subtitle="Professional, AI-optimized templates to kickstart your career at no cost."
                items={freeTemplates}
              />
            )}

            {premiumTemplates.length > 0 && (
              <TemplateGrid
                title="Premium Resume Templates"
                subtitle="Exclusively designed high-impact templates for competitive industries."
                items={premiumTemplates}
                offset={freeTemplates.length}
                isPremiumSection={true}
              />
            )}
          </>
        ) : (
          <Paper
            sx={{
              p: 8,
              textAlign: "center",
              borderRadius: 4,
              border: "2px dashed #e2e8f0",
              bgcolor: "#ffffff",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          >
            <Typography variant="h5" sx={{ color: "#212121", mb: 2, fontWeight: 600 }}>
              No templates found
            </Typography>
            <Typography sx={{ color: "#94a3b8" }}>
              Please add template images to the `template_selector` directory to get started.
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default TemplateSelectorScreen;