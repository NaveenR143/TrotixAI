import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
} from "@mui/material";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { useDispatch, useSelector } from "react-redux";
import * as profileAPI from "../../api/profileAPI";
import { updateUserProfile } from "../../redux/user/Action";

const COLORS = {
  primaryBlue: "#2563EB",
  primaryPurple: "#7C3AED",
  darkText: "#111827",
  mutedText: "#6B7280",
  border: "#E5E7EB",
  bg: "#F8FAFC",
  white: "#FFFFFF",
  success: "#10B981",
};

const CREDIT_PACKAGES = [
  {
    id: "free",
    title: "Free",
    price: "₹0",
    duration: "Forever",
    icon: <BoltRoundedIcon sx={{ fontSize: 30 }} />,
    description: "Perfect to start your career journey.",
    buttonText: "Current Status",
    disabled: true,
    popular: false,
    features: [
      "Resume Builder with download",
      "AI Job Search with Match Score",
      "Missing Skills Analysis",
      "Unlimited Job Applications",
    ],
  },
  {
    id: "credits",
    title: "100 Credits",
    price: "₹99",
    duration: "One-time",
    icon: <WorkspacePremiumRoundedIcon sx={{ fontSize: 30 }} />,
    description: "Access to premium features, faster processing, and advanced tools.",
    buttonText: "Purchase Credits",
    disabled: false,
    popular: true,
    features: [
      "Apply with AI",
      "ATS Friendly Resume Templates",
      "Skill Gap Analysis",
      "Career Roadmap Insights",
      "Watsapp alerts for jobs matching 70% more score",
      "Watsapp alerts for Govt Jobs",
      "More to come..."
    ],
  },
];

const COMPARISON_FEATURES = [
  {
    feature: "Resume Builder",
    free: true,
    credits: true,
  },
  {
    feature: "Generations & Usage",
    free: "Limited",
    credits: "Extended",
  },
  {
    feature: "Processing Speed",
    free: "Standard",
    credits: "Faster",
  },
  {
    feature: "AI Tools & Features",
    free: "Basic",
    credits: "Advanced",
  },
  {
    feature: "Rate Limits",
    free: "Standard Limits",
    credits: "Higher Limits",
  },
];

const MembershipScreen = () => {
  const [showComparison, setShowComparison] = useState(false);

  const dispatch = useDispatch();
  const userid = useSelector((state) => state.UserReducer?.userid || state.UserReducer?.userid);

  const handlePlanSelect = async (packageItem) => {
    if (packageItem.disabled) return;

    // Attempt to add credits via API and update Redux store
    if (!userid) {
      alert("Unable to identify user. Please login and try again.");
      return;
    }

    try {
      // Map package to amount
      let amount = 0;
      if (packageItem.id === "credits") {
        amount = 100; // 100 Credits package
      }

      if (amount <= 0) {
        alert("Invalid credit package selected.");
        return;
      }

      const result = await profileAPI.addFeatureCredits(userid, amount, "purchase", packageItem.title);

      const newBalance = result?.balance ?? result?.data?.balance;

      if (newBalance !== undefined) {
        dispatch(updateUserProfile({ points: newBalance }));
        alert(`Credits added. New balance: ${newBalance}`);
      } else if (result?.success) {
        alert(result.message || "Credits added successfully");
      } else {
        alert(result?.message || "Failed to add credits. Please try again.");
      }
    } catch (err) {
      console.error("Error adding credits:", err);
      alert("Failed to add credits. Please try again later.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 4, md: 6 },
        background:
          "linear-gradient(180deg, #F8FAFC 0%, #EEF2FF 100%)",
      }}
    >
      <Container maxWidth="lg">
        {/* HERO */}

        <Box textAlign="center" mb={6}>
          {/* <Chip
            label="Available Credits"
            size="small"
            sx={{
              mb: 2,
              px: 1,
              fontWeight: 700,
              bgcolor: "#DBEAFE",
              color: COLORS.primaryBlue,
            }}
          /> */}

          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: COLORS.darkText,
              mb: 1.5,
              fontSize: { xs: "2rem", md: "2.7rem" },
              lineHeight: 1.2,
            }}
          >
            Power Up Your
            <Box
              component="span"
              sx={{
                background: `linear-gradient(135deg, ${COLORS.primaryBlue}, ${COLORS.primaryPurple})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                ml: 1,
              }}
            >
              Career
            </Box>
          </Typography>

          <Typography
            sx={{
              maxWidth: 620,
              mx: "auto",
              color: COLORS.mutedText,
              fontSize: "0.98rem",
              lineHeight: 1.7,
            }}
          >
            Get more credits for AI-powered tools, resume optimization, and smart job alerts
            to accelerate your hiring journey.
          </Typography>
        </Box>

        {/* CREDIT CARDS */}

        <Grid container spacing={3} justifyContent="center">
          {CREDIT_PACKAGES.map((packageItem) => (
            <Grid item xs={12} md={5} key={packageItem.id}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 4,
                  border: packageItem.popular
                    ? `2px solid ${COLORS.primaryBlue}`
                    : `1px solid ${COLORS.border}`,
                  boxShadow: packageItem.popular
                    ? "0 18px 40px rgba(37,99,235,0.12)"
                    : "0 6px 20px rgba(15,23,42,0.05)",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",

                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow:
                      "0 14px 35px rgba(37,99,235,0.12)",
                  },
                }}
              >
                {/* TOP GRADIENT */}

                <Box
                  sx={{
                    height: 6,
                    background: `linear-gradient(135deg, ${COLORS.primaryBlue}, ${COLORS.primaryPurple})`,
                  }}
                />

                {/* POPULAR BADGE */}

                {packageItem.popular && (
                  <Chip
                    icon={<StarRoundedIcon />}
                    label="POPULAR"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      bgcolor: COLORS.primaryBlue,
                      color: "#fff",
                      fontWeight: 700,
                    }}
                  />
                )}

                <CardContent sx={{ p: 3.5 }}>
                  {/* ICON */}

                  <Box
                    sx={{
                      width: 54,
                      height: 54,
                      borderRadius: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: `linear-gradient(135deg, ${COLORS.primaryBlue}, ${COLORS.primaryPurple})`,
                      color: "#fff",
                      mb: 3,
                    }}
                  >
                    {packageItem.icon}
                  </Box>

                  {/* TITLE */}

                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      fontSize: "1.4rem",
                      color: COLORS.darkText,
                    }}
                  >
                    {packageItem.title}
                  </Typography>

                  <Typography
                    sx={{
                      color: COLORS.mutedText,
                      mt: 1,
                      mb: 3,
                      fontSize: "0.93rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {packageItem.description}
                  </Typography>

                  {/* PRICE */}

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "baseline",
                      mb: 3,
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 900,
                        fontSize: "2.2rem",
                        color: COLORS.darkText,
                      }}
                    >
                      {packageItem.price}
                    </Typography>

                    <Typography
                      sx={{
                        ml: 1,
                        color: COLORS.mutedText,
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                    >
                      {packageItem.duration}
                    </Typography>
                  </Box>

                  {/* FEATURES */}

                  <Stack spacing={1.5}>
                    {packageItem.features.map((feature, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1.2,
                        }}
                      >
                        <CheckCircleRoundedIcon
                          sx={{
                            color: COLORS.success,
                            fontSize: 18,
                            mt: "2px",
                          }}
                        />

                        <Typography
                          sx={{
                            fontSize: "0.92rem",
                            lineHeight: 1.5,
                            color: COLORS.darkText,
                            fontWeight: 500,
                          }}
                        >
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>

                {/* BUTTON */}

                <CardActions sx={{ px: 3.5, pb: 3.5, pt: 0 }}>
                  <Button
                    fullWidth
                    variant={packageItem.popular ? "contained" : "outlined"}
                    disabled={packageItem.disabled}
                    onClick={() => handlePlanSelect(packageItem)}
                    sx={{
                      py: 1.3,
                      borderRadius: 2.5,
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: "0.95rem",

                      ...(packageItem.popular
                        ? {
                          background: `linear-gradient(135deg, ${COLORS.primaryBlue}, ${COLORS.primaryPurple})`,
                          boxShadow:
                            "0 10px 25px rgba(37,99,235,0.2)",
                        }
                        : {
                          borderColor: COLORS.primaryBlue,
                          color: COLORS.primaryBlue,
                        }),

                      "&:hover": {
                        opacity: 0.95,
                      },

                      "&.Mui-disabled": {
                        bgcolor: "#E5E7EB",
                        color: "#9CA3AF",
                      },
                    }}
                  >
                    {packageItem.buttonText}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* COMPARISON */}

        <Box textAlign="center" mt={6}>
          <Button
            onClick={() => setShowComparison(!showComparison)}
            endIcon={
              showComparison ? (
                <KeyboardArrowUpRoundedIcon />
              ) : (
                <KeyboardArrowDownRoundedIcon />
              )
            }
            sx={{
              textTransform: "none",
              fontWeight: 700,
              color: COLORS.primaryBlue,
              fontSize: "0.95rem",
            }}
          >
            {showComparison
              ? "Hide Detailed Comparison"
              : "View Detailed Comparison"}
          </Button>
        </Box>

        <Collapse in={showComparison}>
          <Box mt={4}>
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: 4,
                overflow: "hidden",
                border: `1px solid ${COLORS.border}`,
                boxShadow: "0 6px 20px rgba(15,23,42,0.04)",
              }}
            >
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      background:
                        "linear-gradient(135deg, #EFF6FF, #F5F3FF)",
                    }}
                  >
                    <TableCell sx={{ fontWeight: 800 }}>
                      Features
                    </TableCell>

                    <TableCell align="center" sx={{ fontWeight: 800 }}>
                      Free
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 800,
                        color: COLORS.primaryBlue,
                      }}
                    >
                      Credits
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {COMPARISON_FEATURES.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          color: COLORS.darkText,
                          fontSize: "0.92rem",
                        }}
                      >
                        {row.feature}
                      </TableCell>

                      {["free", "credits"].map((tier) => (
                        <TableCell key={tier} align="center">
                          {typeof row[tier] === "boolean" ? (
                            row[tier] ? (
                              <CheckCircleRoundedIcon
                                sx={{
                                  color: COLORS.success,
                                  fontSize: 20,
                                }}
                              />
                            ) : (
                              <CloseRoundedIcon
                                sx={{
                                  color: "#CBD5E1",
                                  fontSize: 20,
                                }}
                              />
                            )
                          ) : (
                            <Typography
                              sx={{
                                fontWeight: 700,
                                fontSize: "0.9rem",
                                color:
                                  tier === "credits"
                                    ? COLORS.primaryBlue
                                    : COLORS.darkText,
                              }}
                            >
                              {row[tier]}
                            </Typography>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Collapse>

        {/* FOOTER */}

        <Box
          sx={{
            mt: 7,
            borderRadius: 4,
            p: { xs: 3, md: 5 },
            textAlign: "center",
            background: `linear-gradient(135deg, ${COLORS.primaryBlue}, ${COLORS.primaryPurple})`,
            color: "#fff",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              mb: 1,
            }}
          >
            Need Custom Credit Packages?
          </Typography>

          <Typography
            sx={{
              opacity: 0.9,
              maxWidth: 600,
              mx: "auto",
              mb: 3,
              fontSize: "0.95rem",
              lineHeight: 1.7,
            }}
          >
            We provide customized credit packages for institutions,
            consultancies, and training organizations.
          </Typography>

          <Button
            variant="contained"
            sx={{
              bgcolor: "#fff",
              color: COLORS.primaryBlue,
              px: 4,
              py: 1.2,
              borderRadius: 2.5,
              fontWeight: 800,
              textTransform: "none",
              boxShadow: "none",

              "&:hover": {
                bgcolor: "#F9FAFB",
                boxShadow: "none",
              },
            }}
          >
            Contact Support
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default MembershipScreen;