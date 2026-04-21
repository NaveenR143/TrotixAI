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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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

const TemplateCard = ({ name, image, onSelect, delay, isMobile }) => {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2, // Slightly more rounded for modern feel
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
          borderBottom: "1px solid #e2e8f0",
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
              fontWeight: 700,
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
      </Box>
      <CardContent
        sx={{
          flexGrow: 0,
          p: 0.8, // ⬇️ reduced padding
          textAlign: "center",
        }}
      >
        <Stack
          direction="row"
          spacing={0.5}
          justifyContent="center"
          alignItems="center"
        >
          <CheckCircleIcon sx={{ fontSize: 12, color: "#10b981" }} />
          <Typography
            sx={{
              fontSize: "0.65rem", // ⬇️ smaller text
              color: "#64748b",
              fontWeight: 500,
            }}
          >
            ATS Ready
          </Typography>
        </Stack>
      </CardContent>
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
              <Typography color="text.primary" sx={{ fontSize: "0.9rem", fontWeight: 600 }}>
                Resume Builder
              </Typography>
            </Breadcrumbs>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/dashboard")}
              sx={{ color: "#64748b", fontWeight: 600 }}
            >
              Back to Dashboard
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box
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
              fontWeight: 900,
              mb: 2,
              lineHeight: 1.1,
              background: "linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Pick Your Dream Template
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "1rem", md: "1.25rem" },
              color: "#94a3b8",
              maxWidth: 600,
              mx: "auto",
              mb: 4,
            }}
          >
            Our AI-optimized templates are designed to grab recruiter attention
            and pass ATS filters with ease.
          </Typography>
        </Container>
      </Box>

      {/* Template Grid */}
      <Container maxWidth="lg" sx={{ mt: -6, position: "relative", zIndex: 10 }}>
        {templates.length > 0 ? (
          <Grid container spacing={{ xs: 1.5, md: 3 }}>
            {templates.map(([name, image], index) => (
              <Grid
                item
                xs={6} // 2 per row on small phones
                sm={4} // 3 per row on tablets
                md={3} // 4 per row on medium
                lg={2.4} // 5 per row on desktop
                key={name}
              >
                <TemplateCard
                  name={name}
                  image={image}
                  onSelect={handleSelect}
                  delay={index * 0.1}
                  isMobile={isMobile}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper
            sx={{
              p: 8,
              textAlign: "center",
              borderRadius: 1,
              border: "2px dashed #e2e8f0",
              bgcolor: "#ffffff",
            }}
          >
            <Typography variant="h5" sx={{ color: "#64748b", mb: 2 }}>
              No templates found in the builder folder.
            </Typography>
            <Typography sx={{ color: "#94a3b8" }}>
              Please add template images to the `template_selector` directory.
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default TemplateSelectorScreen;