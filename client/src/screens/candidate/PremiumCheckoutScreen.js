import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  Radio,
  CircularProgress,
  Divider,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import * as premiumAPI from "../../api/premiumAPI";

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

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PremiumCheckoutScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.UserReducer);
  const userid = user?.id;
  const fullname = user?.full_name;
  const email = user?.email;
  const phone = user?.phone;

  const [paymentMethod, setPaymentMethod] = useState("payu"); // 'payu' | 'razorpay'
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Handle PayU Redirect / Callback query params on load
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get("status");
    const orderId = queryParams.get("order_id");
    const txnid = queryParams.get("txnid");

    if (status && orderId) {
      if (status === "success") {
        setLoading(true);
        premiumAPI.verifyPremiumPayment({
          order_id: parseInt(orderId),
          gateway: "payu",
          payu_txnid: txnid,
          payu_status: "success"
        }).then((res) => {
          if (!res.error) {
            navigate(`/orders/${orderId}/status`);
          } else {
            setErrorMessage(res.message || "Failed to verify PayU payment.");
          }
        }).catch((err) => {
          setErrorMessage("Verification error occurred.");
        }).finally(() => {
          setLoading(false);
        });
      } else {
        setErrorMessage("PayU payment failed or was cancelled.");
      }

      // Clean query parameters from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.search, navigate]);

  const handleCheckout = async () => {
    if (!userid) {
      alert("Please login to proceed with your upgrade.");
      navigate("/login?redirect=/premium/upgrade");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    if (paymentMethod === "payu") {
      try {
        const res = await premiumAPI.createPremiumCheckout("payu");
        if (res.error || !res.data?.success) {
          setErrorMessage(res.message || "Failed to initiate PayU payment.");
          setLoading(false);
          return;
        }

        const { checkout_url, payment_params } = res.data;

        // Dynamically submit POST form to PayU checkout URL
        const form = document.createElement("form");
        form.method = "POST";
        form.action = checkout_url;

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
        console.error("PayU checkout failed:", err);
        setErrorMessage("An unexpected error occurred. Please try again.");
        setLoading(false);
      }
    } else {
      // Razorpay
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setErrorMessage("Failed to load Razorpay SDK. Please check your internet connection.");
        setLoading(false);
        return;
      }

      try {
        const res = await premiumAPI.createPremiumCheckout("razorpay");
        if (res.error || !res.data?.success) {
          setErrorMessage(res.message || "Failed to initiate Razorpay checkout.");
          setLoading(false);
          return;
        }

        const orderDetails = res.data.payment_params;
        const razorpayKey = res.data.razorpay_key_id;
        const orderId = res.data.order_id;

        const options = {
          key: razorpayKey,
          amount: orderDetails.amount,
          currency: orderDetails.currency,
          name: "TrotixAI",
          description: "Career Booster Pack - Premium Reports",
          image: "https://trotix.ai/logo.png",
          order_id: orderDetails.id,
          handler: async function (response) {
            setLoading(true);
            try {
              const verifyRes = await premiumAPI.verifyPremiumPayment({
                order_id: orderId,
                gateway: "razorpay",
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (!verifyRes.error) {
                navigate(`/orders/${orderId}/status`);
              } else {
                setErrorMessage(verifyRes.message || "Payment verification failed.");
              }
            } catch (err) {
              console.error("Verification error:", err);
              setErrorMessage("An error occurred during payment verification.");
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: fullname || "",
            email: email || "",
            contact: phone || "",
          },
          theme: {
            color: COLORS.primaryBlue,
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response) {
          setErrorMessage(response.error.description || "Razorpay payment failed.");
          setLoading(false);
        });
        rzp.open();
      } catch (err) {
        console.error("Razorpay initiation failed:", err);
        setErrorMessage("Razorpay payment initialization failed.");
        setLoading(false);
      }
    }
  };

  const packFeatures = [
    { title: "ATS-Friendly Resume", desc: "Clean text layout structured strictly for automated parser compatibility." },
    { title: "Enhanced Profile", desc: "A redesigned profile with action-oriented language and measurable achievements." },
    { title: "Skill Analysis Report", desc: "Detailed skills audit comparing your profile against active market trends." },
    { title: "Career Enhancement Report", desc: "Custom structured roadmap with actionable tasks for short and long-term career progression." },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: COLORS.bg, py: 6, display: "flex", alignItems: "center" }}>
      <Container maxWidth="md">
        <Grid container spacing={4} alignItems="stretch">

          {/* Package Details Section */}
          <Grid item xs={12} md={7}>
            <Box sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                <WorkspacePremiumRoundedIcon sx={{ fontSize: 36, color: COLORS.primaryPurple }} />
                <Typography variant="h4" sx={{ fontWeight: 800, color: COLORS.darkText, fontFamily: "Inter" }}>
                  Career Booster Pack
                </Typography>
              </Stack>
              <Typography variant="body1" sx={{ color: COLORS.mutedText, mb: 4, fontFamily: "Inter", fontSize: 16 }}>
                Unlock four comprehensive premium tools to optimize your profile, evaluate skill gaps, and blueprint your career path for just ₹99.
              </Typography>

              <Stack spacing={3.5}>
                {packFeatures.map((feat, idx) => (
                  <Stack key={idx} direction="row" spacing={2} alignItems="flex-start">
                    <CheckCircleRoundedIcon sx={{ color: COLORS.success, fontSize: 22, mt: 0.2 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: COLORS.darkText, fontFamily: "Inter" }}>
                        {feat.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: COLORS.mutedText, fontFamily: "Inter", mt: 0.5 }}>
                        {feat.desc}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Grid>

          {/* Checkout Box */}
          <Grid item xs={12} md={5}>
            <Card sx={{
              borderRadius: "16px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
              border: `1px solid ${COLORS.border}`,
              bgcolor: COLORS.white,
              overflow: "hidden"
            }}>

              {/* Header Gradient */}
              <Box sx={{
                background: `linear-gradient(135deg, ${COLORS.primaryBlue} 0%, ${COLORS.primaryPurple} 100%)`,
                py: 3.5,
                px: 3,
                color: COLORS.white,
                textAlign: "center"
              }}>
                <Typography variant="subtitle2" sx={{ textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, opacity: 0.85 }}>
                  Premium Upgrade
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, fontFamily: "Inter" }}>
                  ₹99
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.75 }}>
                  One-time purchase • Lifetime access
                </Typography>
              </Box>

              <CardContent sx={{ p: 4 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: COLORS.darkText, mb: 2, fontFamily: "Inter" }}>
                  Select Payment Gateway
                </Typography>

                <Stack spacing={2} sx={{ mb: 4 }}>
                  {/* Razorpay Select */}
                  {/* <Stack 
                    direction="row" 
                    alignItems="center" 
                    justifyContent="space-between"
                    onClick={() => setPaymentMethod("razorpay")}
                    sx={{
                      p: 2,
                      borderRadius: "10px",
                      cursor: "pointer",
                      border: paymentMethod === "razorpay" ? `2px solid ${COLORS.primaryBlue}` : `1px solid ${COLORS.border}`,
                      bgcolor: paymentMethod === "razorpay" ? "rgba(37, 99, 235, 0.02)" : "transparent",
                      transition: "all 0.2s"
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Radio checked={paymentMethod === "razorpay"} color="primary" />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: COLORS.darkText, fontFamily: "Inter" }}>
                          Razorpay
                        </Typography>
                        <Typography variant="caption" sx={{ color: COLORS.mutedText }}>
                          Cards, UPI, NetBanking
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack> */}

                  {/* PayU Select */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    onClick={() => setPaymentMethod("payu")}
                    sx={{
                      p: 2,
                      borderRadius: "10px",
                      cursor: "pointer",
                      border: paymentMethod === "payu" ? `2px solid ${COLORS.primaryBlue}` : `1px solid ${COLORS.border}`,
                      bgcolor: paymentMethod === "payu" ? "rgba(37, 99, 235, 0.02)" : "transparent",
                      transition: "all 0.2s"
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Radio checked={paymentMethod === "payu"} color="primary" />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: COLORS.darkText, fontFamily: "Inter" }}>
                          PayU
                        </Typography>
                        <Typography variant="caption" sx={{ color: COLORS.mutedText }}>
                          Instant checkout redirect
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Stack>

                <Divider sx={{ mb: 3 }} />

                {errorMessage && (
                  <Typography variant="body2" sx={{ color: "error.main", mb: 3, textAlign: "center", fontWeight: 500 }}>
                    {errorMessage}
                  </Typography>
                )}

                <Button
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  onClick={handleCheckout}
                  endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
                  sx={{
                    py: 1.8,
                    borderRadius: "10px",
                    fontWeight: 700,
                    textTransform: "none",
                    fontFamily: "Inter",
                    fontSize: 16,
                    background: `linear-gradient(135deg, ${COLORS.primaryBlue} 0%, ${COLORS.primaryPurple} 100%)`,
                    "&:hover": {
                      background: `linear-gradient(135deg, ${COLORS.primaryBlue} 20%, ${COLORS.primaryPurple} 120%)`,
                    }
                  }}
                >
                  {loading ? "Processing..." : "Pay ₹99 to Unlock"}
                </Button>
              </CardContent>
            </Card>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
};

export default PremiumCheckoutScreen;
