import React, { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  CircularProgress,
  Radio,
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
    amount: 99,
    creditsToAdd: 100,
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

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const MembershipScreen = () => {
  const [showComparison, setShowComparison] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success' | 'failure' | null
  const [paymentMessage, setPaymentMessage] = useState("");
  const [creditsAdded, setCreditsAdded] = useState(0);
  const [newBalance, setNewBalance] = useState(0);

  // New gateway selection states
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("payu"); // 'payu' | 'razorpay'

  const dispatch = useDispatch();
  const user = useSelector((state) => state.UserReducer);
  const userid = user?.userid;
  const fullname = user?.fullname || "";
  const email = user?.email || "";
  const phone = user?.mobile || "";

  // Effect to verify landing back on page after PayU Redirect Callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const txnid = params.get("txnid");
    const credits = params.get("credits");
    const message = params.get("message");

    if (status) {
      if (status === "success") {
        const added = parseInt(credits || "100", 10);

        const syncPaymentStatus = async () => {
          setLoading(true);
          try {
            const statusRes = await profileAPI.fetchPayUPaymentStatus(txnid);
            if (!statusRes.error && statusRes.status === "paid") {
              const addedCredits = statusRes.credits_to_add || 100;
              setCreditsAdded(addedCredits);

              const walletRes = await profileAPI.fetchWalletBalance(userid);
              if (!walletRes.error && walletRes.data) {
                const newBal = walletRes.data.balance;
                setNewBalance(newBal);
                dispatch(updateUserProfile({ points: newBal }));
              }

              setPaymentStatus("success");
              setPaymentMessage(`Payment completed successfully via PayU! Transaction ID: ${txnid}`);
            } else {
              setPaymentStatus("failure");
              setPaymentMessage(statusRes.message || "Unable to verify payment status.");
            }
          } catch (err) {
            console.error("Error syncing PayU status:", err);
            setPaymentStatus("failure");
            setPaymentMessage("An error occurred while verifying the transaction.");
          } finally {
            setLoading(false);
          }
        };

        if (txnid && userid) {
          syncPaymentStatus();
        } else {
          setPaymentStatus("success");
          setPaymentMessage("Payment completed successfully!");
          setCreditsAdded(added);
        }
      } else if (status === "failure") {
        setPaymentStatus("failure");
        setPaymentMessage(message || "Payment failed or was cancelled.");
      }

      // Clean query parameters from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [userid, dispatch]);

  const handlePlanSelect = (packageItem) => {
    if (packageItem.disabled) return;

    if (!userid) {
      alert("Unable to identify user. Please login and try again.");
      return;
    }

    setSelectedPackage(packageItem);
    setCheckoutOpen(true);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedPackage) return;
    setCheckoutOpen(false);
    setLoading(true);
    setPaymentStatus(null);
    setPaymentMessage("");

    const amount = selectedPackage.amount || 99;
    const creditsToAdd = selectedPackage.creditsToAdd || 100;
    const packageName = selectedPackage.title;

    if (paymentMethod === "payu") {
      try {
        const initiateRes = await profileAPI.initiatePayUPayment(
          userid,
          amount,
          creditsToAdd,
          packageName
        );

        if (!initiateRes || initiateRes.error || !initiateRes.success || !initiateRes.payment_params) {
          setLoading(false);
          setPaymentStatus("failure");
          setPaymentMessage(initiateRes?.message || "Failed to initiate PayU payment. Please try again.");
          return;
        }

        const { payment_url, payment_params } = initiateRes;

        // Dynamically create and submit POST form for PayU checkout redirect
        const form = document.createElement("form");
        form.method = "POST";
        form.action = payment_url;

        Object.keys(payment_params).forEach((key) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = payment_params[key];
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } catch (err) {
        console.error("PayU initiation error:", err);
        setPaymentStatus("failure");
        setPaymentMessage("An unexpected error occurred while initiating PayU payment.");
        setLoading(false);
      }
    } else {
      // 1. Load Razorpay script dynamically
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setLoading(false);
        setPaymentStatus("failure");
        setPaymentMessage("Failed to load Razorpay SDK. Please check your internet connection.");
        return;
      }

      try {
        // 2. Create payment order on the backend
        const orderRes = await profileAPI.createPaymentOrder(
          userid,
          amount,
          creditsToAdd,
          packageName
        );

        if (!orderRes || orderRes.error || !orderRes.success || !orderRes.order) {
          setLoading(false);
          setPaymentStatus("failure");
          setPaymentMessage(orderRes?.message || "Failed to initiate Razorpay payment. Please try again.");
          return;
        }

        const orderDetails = orderRes.order;
        const razorpayKey = (typeof process !== "undefined" && process.env && process.env.REACT_APP_RAZORPAY_KEY_ID) || orderRes.razorpay_key_id || "rzp_test_zS0qL012345678";

        console.log(JSON.stringify(orderDetails));

        // 3. Configure Razorpay options
        const options = {
          key: razorpayKey,
          amount: orderDetails.amount,
          currency: orderDetails.currency,
          name: "RightNxt",
          description: `Purchase ${creditsToAdd} Credits`,
          image: "https://trotix.ai/logo.png",
          order_id: orderDetails.id,
          handler: async function (response) {
            setLoading(true);
            try {
              const verifyRes = await profileAPI.verifyPayment(
                userid,
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature
              );

              if (!verifyRes.error && verifyRes.success) {
                const updatedBalance = verifyRes.balance;
                const added = verifyRes.credits_added;

                // Update Redux store
                dispatch(updateUserProfile({ points: updatedBalance }));

                setPaymentStatus("success");
                setPaymentMessage(verifyRes.message || "Payment completed successfully!");
                setCreditsAdded(added);
                setNewBalance(updatedBalance);
              } else {
                setPaymentStatus("failure");
                setPaymentMessage(verifyRes.message || "Payment verification failed. Please contact support.");
              }
            } catch (err) {
              console.error("Verification error:", err);
              setPaymentStatus("failure");
              setPaymentMessage("An error occurred during payment verification.");
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: fullname,
            email: email,
            contact: phone,
          },
          notes: JSON.stringify(orderDetails.notes),
          theme: {
            color: COLORS.primaryBlue,
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
              setPaymentStatus("failure");
              setPaymentMessage("Payment was cancelled by the user.");
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response) {
          setPaymentStatus("failure");
          setPaymentMessage(response.error.description || "Payment failed. Please try again.");
          setLoading(false);
        });
        rzp.open();
      } catch (err) {
        console.error("Payment initiation error:", err);
        setPaymentStatus("failure");
        setPaymentMessage("An unexpected error occurred while initiating Razorpay payment.");
        setLoading(false);
      }
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
              fontWeight: 600,
              bgcolor: "#DBEAFE",
              color: COLORS.primaryBlue,
            }}
          /> */}

          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
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
                      fontWeight: 600,
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
                      fontWeight: 700,
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
                        fontWeight: 800,
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
                        fontWeight: 500,
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
                            fontWeight: 400,
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
                      fontWeight: 600,
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
              fontWeight: 600,
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
                    <TableCell sx={{ fontWeight: 700 }}>
                      Features
                    </TableCell>

                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                      Free
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
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
                          fontWeight: 500,
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
                                fontWeight: 600,
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
              fontWeight: 700,
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
              fontWeight: 700,
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

        {/* Payment Loading/Status Dialog */}
        <Dialog
          open={loading || paymentStatus !== null}
          onClose={loading ? undefined : () => setPaymentStatus(null)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              p: 3,
              textAlign: "center",
              boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
            },
          }}
        >
          <DialogContent>
            <Box display="flex" flexDirection="column" alignItems="center" py={2}>
              {loading && (
                <>
                  <CircularProgress
                    size={60}
                    thickness={4}
                    sx={{
                      color: COLORS.primaryBlue,
                      mb: 3,
                    }}
                  />
                  <Typography variant="h6" fontWeight={600} color={COLORS.darkText} mb={1}>
                    Processing Payment...
                  </Typography>
                  <Typography variant="body2" color={COLORS.mutedText}>
                    Please do not close this window or refresh the page.
                  </Typography>
                </>
              )}

              {!loading && paymentStatus === "success" && (
                <>
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: "50%",
                      bgcolor: "rgba(16, 185, 129, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: COLORS.success,
                      mb: 3,
                    }}
                  >
                    <CheckCircleRoundedIcon sx={{ fontSize: 48 }} />
                  </Box>
                  <Typography variant="h5" fontWeight={700} color={COLORS.darkText} mb={1}>
                    Payment Successful!
                  </Typography>
                  <Typography variant="body1" color={COLORS.mutedText} mb={3}>
                    {paymentMessage || "Your credits have been added successfully."}
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      width: "100%",
                      p: 2,
                      borderRadius: 3,
                      bgcolor: COLORS.bg,
                      mb: 3,
                      border: `1px solid ${COLORS.border}`,
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={6} textAlign="left">
                        <Typography variant="body2" color={COLORS.mutedText}>
                          Credits Added
                        </Typography>
                        <Typography variant="h6" fontWeight={700} color={COLORS.success}>
                          +{creditsAdded}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} textAlign="right">
                        <Typography variant="body2" color={COLORS.mutedText}>
                          New Balance
                        </Typography>
                        <Typography variant="h6" fontWeight={700} color={COLORS.primaryBlue}>
                          {newBalance} Credits
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => setPaymentStatus(null)}
                    sx={{
                      py: 1.2,
                      borderRadius: 2.5,
                      fontWeight: 600,
                      textTransform: "none",
                      background: `linear-gradient(135deg, ${COLORS.primaryBlue}, ${COLORS.primaryPurple})`,
                    }}
                  >
                    Close
                  </Button>
                </>
              )}

              {!loading && paymentStatus === "failure" && (
                <>
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: "50%",
                      bgcolor: "rgba(239, 68, 68, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ef4444",
                      mb: 3,
                    }}
                  >
                    <CloseRoundedIcon sx={{ fontSize: 48 }} />
                  </Box>
                  <Typography variant="h5" fontWeight={700} color={COLORS.darkText} mb={1}>
                    Payment Failed
                  </Typography>
                  <Typography variant="body1" color={COLORS.mutedText} mb={3}>
                    {paymentMessage || "Something went wrong while processing your payment."}
                  </Typography>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setPaymentStatus(null)}
                    sx={{
                      py: 1.2,
                      borderRadius: 2.5,
                      fontWeight: 600,
                      textTransform: "none",
                      borderColor: COLORS.primaryBlue,
                      color: COLORS.primaryBlue,
                    }}
                  >
                    Close & Try Again
                  </Button>
                </>
              )}
            </Box>
          </DialogContent>
        </Dialog>

        {/* Checkout Modal */}
        <Dialog
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              p: 2,
              boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
            },
          }}
        >
          <DialogContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5" fontWeight={700} color={COLORS.darkText}>
                Checkout
              </Typography>
              <Button
                onClick={() => setCheckoutOpen(false)}
                sx={{
                  minWidth: "auto",
                  color: COLORS.mutedText,
                  p: 0.5,
                  borderRadius: "50%",
                  "&:hover": { bgcolor: "#f1f5f9" },
                }}
              >
                <CloseRoundedIcon />
              </Button>
            </Box>

            {selectedPackage && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: COLORS.bg,
                  border: `1px solid ${COLORS.border}`,
                  mb: 3,
                }}
              >
                <Typography variant="subtitle2" color={COLORS.mutedText} fontWeight={500} gutterBottom>
                  Order Summary
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                  <Box>
                    <Typography variant="h6" fontWeight={700} color={COLORS.darkText}>
                      {selectedPackage.title}
                    </Typography>
                    <Typography variant="body2" color={COLORS.mutedText}>
                      {selectedPackage.description}
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight={800} color={COLORS.primaryBlue}>
                    {selectedPackage.price}
                  </Typography>
                </Box>
              </Paper>
            )}

            <Typography variant="subtitle1" fontWeight={700} color={COLORS.darkText} mb={2}>
              Select Payment Method
            </Typography>

            <Stack spacing={2} mb={4}>
              {/* PayU Option */}
              <Card
                onClick={() => setPaymentMethod("payu")}
                sx={{
                  borderRadius: 3,
                  border: paymentMethod === "payu" ? `2.5px solid ${COLORS.primaryBlue}` : `1px solid ${COLORS.border}`,
                  bgcolor: paymentMethod === "payu" ? "rgba(37, 99, 235, 0.03)" : COLORS.white,
                  boxShadow: paymentMethod === "payu" ? "0 4px 20px rgba(37, 99, 235, 0.08)" : "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: COLORS.primaryBlue,
                    bgcolor: "rgba(37, 99, 235, 0.01)",
                  },
                }}
              >
                <CardContent sx={{ p: "16px !important", display: "flex", alignItems: "center", gap: 2 }}>
                  <Radio
                    checked={paymentMethod === "payu"}
                    onChange={() => setPaymentMethod("payu")}
                    value="payu"
                    sx={{
                      color: COLORS.border,
                      "&.Mui-checked": {
                        color: COLORS.primaryBlue,
                      },
                    }}
                  />
                  <Box flexGrow={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle1" fontWeight={750} color={COLORS.darkText}>
                        PayU Gateway
                      </Typography>
                      <Chip
                        label="Primary / Default"
                        size="small"
                        color="primary"
                        sx={{
                          height: 18,
                          fontSize: "0.65rem",
                          fontWeight: 600,
                          bgcolor: COLORS.primaryBlue,
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color={COLORS.mutedText}>
                      Fast, secure redirection payment via Cards, UPI, Netbanking or Wallets
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Razorpay Option */}
              {/* <Card
                onClick={() => setPaymentMethod("razorpay")}
                sx={{
                  borderRadius: 3,
                  border: paymentMethod === "razorpay" ? `2.5px solid ${COLORS.primaryBlue}` : `1px solid ${COLORS.border}`,
                  bgcolor: paymentMethod === "razorpay" ? "rgba(37, 99, 235, 0.03)" : COLORS.white,
                  boxShadow: paymentMethod === "razorpay" ? "0 4px 20px rgba(37, 99, 235, 0.08)" : "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: COLORS.primaryBlue,
                    bgcolor: "rgba(37, 99, 235, 0.01)",
                  },
                }}
              >
                <CardContent sx={{ p: "16px !important", display: "flex", alignItems: "center", gap: 2 }}>
                  <Radio
                    checked={paymentMethod === "razorpay"}
                    onChange={() => setPaymentMethod("razorpay")}
                    value="razorpay"
                    sx={{
                      color: COLORS.border,
                      "&.Mui-checked": {
                        color: COLORS.primaryBlue,
                      },
                    }}
                  />
                  <Box flexGrow={1}>
                    <Typography variant="subtitle1" fontWeight={750} color={COLORS.darkText}>
                      Razorpay Checkout
                    </Typography>
                    <Typography variant="body2" color={COLORS.mutedText}>
                      Pay directly inside a popup overlay without leaving the page
                    </Typography>
                  </Box>
                </CardContent>
              </Card> */}
            </Stack>

            <Button
              fullWidth
              variant="contained"
              onClick={handlePaymentSubmit}
              sx={{
                py: 1.5,
                borderRadius: 2.5,
                fontWeight: 700,
                fontSize: "1rem",
                textTransform: "none",
                background: `linear-gradient(135deg, ${COLORS.primaryBlue}, ${COLORS.primaryPurple})`,
                boxShadow: "0 10px 25px rgba(37, 99, 235, 0.2)",
                "&:hover": {
                  opacity: 0.95,
                },
              }}
            >
              Proceed to Pay
            </Button>
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
};

export default MembershipScreen;