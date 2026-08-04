import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  LinearProgress,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
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
  warning: "#F59E0B",
  danger: "#EF4444",
};

const OrderStatusScreen = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [pollingActive, setPollingActive] = useState(true);

  // Poll status function
  const fetchStatus = async () => {
    try {
      const res = await premiumAPI.getOrderStatus(orderId);
      if (!res.error && res.data) {
        setOrderData(res.data);

        // Determine if we should keep polling
        // Poll only if any report is in QUEUED or PROCESSING status
        const activeTasks = res.data.reports.some(
          (r) => r.status === "QUEUED" || r.status === "PROCESSING"
        );
        setPollingActive(activeTasks);
      }
    } catch (err) {
      console.error("Error polling order status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Set up polling interval (every 10 seconds)
    let intervalId = null;
    if (pollingActive) {
      intervalId = setInterval(() => {
        fetchStatus();
      }, 10000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [orderId, pollingActive]);

  const handleDownload = (reportId) => {
    const downloadUrl = `/api/premium/reports/${reportId}/download`;
    // Standard secure file streaming via browser link trigger
    window.open(downloadUrl, "_blank");
  };

  const handleRetry = async (reportId) => {
    setLoading(true);
    const res = await premiumAPI.retryPremiumReport(reportId);
    if (!res.error) {
      setPollingActive(true);
      fetchStatus();
    } else {
      alert(res.message || "Failed to trigger retry.");
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "COMPLETED":
        return <Chip label="Ready" size="small" sx={{ bgcolor: "rgba(16, 185, 129, 0.1)", color: COLORS.success, fontWeight: 700 }} />;
      case "PROCESSING":
        return <Chip label="Generating..." size="small" sx={{ bgcolor: "rgba(124, 58, 237, 0.1)", color: COLORS.primaryPurple, fontWeight: 700 }} />;
      case "FAILED":
        return <Chip label="Failed" size="small" sx={{ bgcolor: "rgba(239, 68, 68, 0.1)", color: COLORS.danger, fontWeight: 700 }} />;
      default:
        return <Chip label="Queued" size="small" sx={{ bgcolor: "rgba(107, 114, 128, 0.1)", color: COLORS.mutedText, fontWeight: 700 }} />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircleRoundedIcon sx={{ color: COLORS.success, fontSize: 32 }} />;
      case "FAILED":
        return <ErrorRoundedIcon sx={{ color: COLORS.danger, fontSize: 32 }} />;
      default:
        return <HourglassEmptyRoundedIcon sx={{ color: COLORS.primaryPurple, fontSize: 32 }} />;
    }
  };

  const formatReportName = (type) => {
    return type
      .replace("_", " ")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  };

  if (loading && !orderData) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: COLORS.bg, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: COLORS.bg, py: 6 }}>
      <Container maxWidth="md">

        {/* Payment Confirmation Banner */}
        <Card sx={{
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
          border: `1px solid ${COLORS.border}`,
          bgcolor: COLORS.white,
          mb: 4
        }}>
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={2.5} alignItems="center">
                <Box sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  bgcolor: "rgba(16, 185, 129, 0.1)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
                }}>
                  <CheckCircleRoundedIcon sx={{ color: COLORS.success, fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: COLORS.darkText, fontFamily: "Inter" }}>
                    Payment Successful
                  </Typography>
                  <Typography variant="body2" sx={{ color: COLORS.mutedText, fontFamily: "Inter", mt: 0.5 }}>
                    Order ID: #{orderId} • Amount: ₹{orderData?.amount?.toFixed(2)}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                {pollingActive && (
                  <Typography variant="caption" sx={{ color: COLORS.primaryPurple, fontWeight: 700, animation: "pulse 1.5s infinite" }}>
                    Auto-polling updates...
                  </Typography>
                )}
                <Tooltip title="Refresh Status">
                  <IconButton onClick={fetchStatus} disabled={loading}>
                    <RefreshRoundedIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Reports Generation Progress Section */}
        <Typography variant="h6" sx={{ fontWeight: 800, color: COLORS.darkText, mb: 2.5, fontFamily: "Inter" }}>
          Premium Reports Status
        </Typography>

        <Grid container spacing={3.5}>
          {orderData?.reports?.map((report) => (
            <Grid item xs={12} sm={6} key={report.id}>
              <Card sx={{
                borderRadius: "14px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
                border: `1px solid ${COLORS.border}`,
                bgcolor: COLORS.white,
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.05)"
                }
              }}>
                <CardContent sx={{ p: 3.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2.5 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      {getStatusIcon(report.status)}
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: COLORS.darkText, fontFamily: "Inter" }}>
                          {formatReportName(report.report_type)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: COLORS.mutedText }}>
                          PDF Document
                        </Typography>
                      </Box>
                    </Stack>
                    {getStatusChip(report.status)}
                  </Stack>

                  {/* Progress bar */}
                  <Box sx={{ mb: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="caption" sx={{ color: COLORS.mutedText }}>
                        Generation Progress
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: COLORS.primaryBlue }}>
                        {report.progress}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={report.progress}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: "rgba(0, 0, 0, 0.04)",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 3,
                          background: `linear-gradient(90deg, ${COLORS.primaryBlue} 0%, ${COLORS.primaryPurple} 100%)`
                        }
                      }}
                    />
                  </Box>

                  {/* Action buttons */}
                  {report.status === "COMPLETED" && (
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleDownload(report.id)}
                      startIcon={<DownloadRoundedIcon />}
                      sx={{
                        py: 1.2,
                        borderRadius: "8px",
                        fontWeight: 700,
                        textTransform: "none",
                        fontFamily: "Inter",
                        boxShadow: "none",
                        bgcolor: COLORS.primaryBlue,
                        "&:hover": {
                          bgcolor: "#1d4ed8",
                          boxShadow: "none",
                        }
                      }}
                    >
                      Download PDF
                    </Button>
                  )}

                  {report.status === "FAILED" && (
                    <Stack spacing={1}>
                      <Typography variant="caption" sx={{ color: COLORS.danger, fontWeight: 500 }}>
                        Error: {report.error_message || "Generation failed."}
                      </Typography>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => handleRetry(report.id)}
                        startIcon={<ReplayRoundedIcon />}
                        sx={{
                          py: 1.2,
                          borderRadius: "8px",
                          fontWeight: 700,
                          textTransform: "none",
                          fontFamily: "Inter",
                          borderColor: COLORS.danger,
                          color: COLORS.danger,
                          "&:hover": {
                            borderColor: "#dc2626",
                            bgcolor: "rgba(239, 68, 68, 0.04)",
                          }
                        }}
                      >
                        Retry Generation
                      </Button>
                    </Stack>
                  )}

                  {(report.status === "QUEUED" || report.status === "PROCESSING") && (
                    <Button
                      fullWidth
                      variant="outlined"
                      disabled
                      sx={{
                        py: 1.2,
                        borderRadius: "8px",
                        fontWeight: 700,
                        textTransform: "none",
                        fontFamily: "Inter",
                      }}
                    >
                      Generating...
                    </Button>
                  )}

                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 5, textAlign: "center" }}>
          <Button
            variant="text"
            onClick={() => navigate("/dashboard")}
            sx={{ fontWeight: 700, color: COLORS.primaryBlue, textTransform: "none", fontFamily: "Inter" }}
          >
            Go to Candidate Dashboard
          </Button>
        </Box>

      </Container>
    </Box>
  );
};

export default OrderStatusScreen;
