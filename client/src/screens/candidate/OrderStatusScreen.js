import React, { useState, useEffect, useRef } from "react";
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
import { useSelector, useDispatch } from "react-redux";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import * as premiumAPI from "../../api/premiumAPI";
import * as profileAPI from "../../api/profileAPI";
import { fetchAndStoreProfile } from "../../redux/profile/ProfileAction";
import SkillDevelopmentReport from "../skill_development/SkillDevelopmentReport";
import CareerAdviceReport from "../career_advisor/CareerAdviceReport";
import MultiPageResumePreview from "../resume_builder/MultiPageResumePreview";

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
  const dispatch = useDispatch();

  // Redux state
  const { id: userid, mobile, fullname } = useSelector((state) => state.UserReducer);
  const profile = useSelector((state) => state.ProfileReducer.data);

  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [pollingActive, setPollingActive] = useState(true);

  // Download states
  const [downloadingReportId, setDownloadingReportId] = useState(null);
  const [activeSkillAnalysisData, setActiveSkillAnalysisData] = useState(null);
  const [activeCareerAdviceData, setActiveCareerAdviceData] = useState(null);
  const [activeReportTimestamp, setActiveReportTimestamp] = useState(null);

  const exportPagesRef = useRef(null);

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

  const handlePrint = useReactToPrint({
    content: () => exportPagesRef.current,
    onBeforePrint: () => {
      const fullName = profile?.personalDetails?.fullName || "Resume";
      document.title = `Resume - ${fullName.replace(/[^a-z0-9]/gi, "_")}`;
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setDownloadingReportId(null);
    },
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
      [data-pdf-hide="true"] {
        display: none !important;
      }
    `,
  });

  const ensureProfileLoaded = async () => {
    if (profile && profile.id) return profile;
    const phone = mobile || localStorage.getItem("mobile_number") || "9789502974";
    const result = await dispatch(fetchAndStoreProfile(phone));
    if (result && result.success && result.data) {
      return result.data;
    }
    return null;
  };

  const downloadResumePDFMobile = async (currentProfile) => {
    const container = exportPagesRef.current;
    if (!container) {
      setDownloadingReportId(null);
      return;
    }

    const pages = container.querySelectorAll(".resume-pdf-page");
    if (pages.length === 0) {
      setDownloadingReportId(null);
      return;
    }

    try {
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

      const fullName = currentProfile?.personalDetails?.fullName || "Resume";
      pdf.save(`Resume_${fullName.replace(/[^a-z0-9]/gi, "_")}.pdf`);
    } catch (err) {
      console.error("Mobile download failed:", err);
      alert("Failed to generate PDF resume. Please try again.");
    } finally {
      setDownloadingReportId(null);
    }
  };

  const triggerResumePrint = async (currentProfile) => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);

    if (isMobileDevice) {
      try {
        await downloadResumePDFMobile(currentProfile);
      } catch (err) {
        console.error("Mobile download failed:", err);
        setDownloadingReportId(null);
      }
    } else {
      handlePrint();
    }
  };

  const triggerSkillReportDownload = async (currentProfile) => {
    const reportContainer = document.getElementById("skill-development-report");
    if (!reportContainer) {
      setDownloadingReportId(null);
      return;
    }

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const sections = reportContainer.querySelectorAll(".report-section");
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);

      let currentY = margin;
      let firstPage = true;

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const canvas = await html2canvas(section, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.8);
        const imgHeight = (canvas.height * contentWidth) / canvas.width;

        if (!firstPage && (currentY + imgHeight > pageHeight - margin)) {
          pdf.addPage();
          currentY = margin;
        }

        pdf.addImage(imgData, 'JPEG', margin, currentY, contentWidth, imgHeight, undefined, 'FAST');
        currentY += imgHeight + 10;
        firstPage = false;
      }

      const name = currentProfile?.personalDetails?.fullName || "Candidate";
      pdf.save(`SkillEnhancement_${name.replace(/ /g, '_')}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setDownloadingReportId(null);
      setActiveSkillAnalysisData(null);
    }
  };

  const triggerCareerReportDownload = async (currentProfile) => {
    const reportContainer = document.getElementById("career-advice-report");
    if (!reportContainer) {
      setDownloadingReportId(null);
      return;
    }

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const sections = reportContainer.querySelectorAll(".report-section");
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);

      let currentY = margin;
      let firstPage = true;

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const canvas = await html2canvas(section, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.8);
        const imgHeight = (canvas.height * contentWidth) / canvas.width;

        if (!firstPage && (currentY + imgHeight > pageHeight - margin)) {
          pdf.addPage();
          currentY = margin;
        }

        pdf.addImage(imgData, 'JPEG', margin, currentY, contentWidth, imgHeight, undefined, 'FAST');
        currentY += imgHeight + 10;
        firstPage = false;
      }

      const footer = reportContainer.lastElementChild;
      if (footer && !footer.classList.contains('report-section')) {
        const footerCanvas = await html2canvas(footer, { scale: 2, backgroundColor: "#ffffff" });
        const footerImgData = footerCanvas.toDataURL("image/jpeg", 0.8);
        const footerImgHeight = (footerCanvas.height * contentWidth) / footerCanvas.width;

        if (currentY + footerImgHeight > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }
        pdf.addImage(footerImgData, 'JPEG', margin, currentY, contentWidth, footerImgHeight, undefined, 'FAST');
      }

      const name = currentProfile?.personalDetails?.fullName || "Career";
      pdf.save(`CareerAdvice_${name.replace(/ /g, '_')}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setDownloadingReportId(null);
      setActiveCareerAdviceData(null);
    }
  };

  const handleDownloadReport = async (report) => {
    if (downloadingReportId) return;

    setDownloadingReportId(report.id);

    try {
      const currentProfile = await ensureProfileLoaded();
      if (!currentProfile) {
        alert("Failed to load profile. Please complete your profile first.");
        setDownloadingReportId(null);
        return;
      }

      const userId = currentProfile.id;
      const type = report.report_type.toUpperCase();

      if (type === "SKILL_ANALYSIS") {
        const result = await profileAPI.fetchExistingSkillAnalysis(userId);
        if (!result.error && result.data && result.data !== "none") {
          const reportData = result.data.data || result.data;
          const timestamp = result.data.timestamp || new Date().toISOString();
          setActiveSkillAnalysisData(reportData);
          setActiveReportTimestamp(timestamp);

          setTimeout(async () => {
            await triggerSkillReportDownload(currentProfile);
          }, 800);
        } else {
          alert("Could not load skill report content.");
          setDownloadingReportId(null);
        }
      } else if (type === "CAREER_ENHANCEMENT") {
        const phone = currentProfile.personalDetails?.phone || mobile || localStorage.getItem("mobile_number");
        const result = await profileAPI.fetchExistingCareerAdvice(phone, userId);
        if (!result.error && result.data && result.data !== "none") {
          const reportData = result.data.data || result.data;
          const timestamp = result.data.timestamp || new Date().toISOString();
          setActiveCareerAdviceData(reportData);
          setActiveReportTimestamp(timestamp);

          setTimeout(async () => {
            await triggerCareerReportDownload(currentProfile);
          }, 800);
        } else {
          alert("Could not load career report content.");
          setDownloadingReportId(null);
        }
      } else if (type === "ATS_RESUME" || type === "ENHANCED_RESUME") {
        await triggerResumePrint(currentProfile);
      } else {
        window.open(`/api/premium/reports/${report.id}/download`, "_blank");
        setDownloadingReportId(null);
      }
    } catch (err) {
      console.error("Error downloading report:", err);
      alert("An error occurred while downloading the report.");
      setDownloadingReportId(null);
    }
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
    if (type && type.toUpperCase() === "ENHANCED_RESUME") {
      return "Enhanced ATS Resume";
    }
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
                      disabled={downloadingReportId !== null}
                      onClick={() => handleDownloadReport(report)}
                      startIcon={downloadingReportId === report.id ? <CircularProgress size={16} sx={{ color: "#FFFFFF" }} /> : <DownloadRoundedIcon />}
                      sx={{
                        py: 1.2,
                        borderRadius: "8px",
                        fontWeight: 700,
                        textTransform: "none",
                        fontFamily: "Inter",
                        boxShadow: "none",
                        bgcolor: COLORS.primaryBlue,
                        color: "#FFFFFF",
                        "&:hover": {
                          bgcolor: "#1d4ed8",
                          boxShadow: "none",
                        },
                        "&.Mui-disabled": {
                          bgcolor: downloadingReportId === report.id ? COLORS.primaryBlue : "rgba(0, 0, 0, 0.08)",
                          color: downloadingReportId === report.id ? "#FFFFFF" : "rgba(0, 0, 0, 0.38)",
                        }
                      }}
                    >
                      {downloadingReportId === report.id ? "Downloading..." : "Download PDF"}
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
                        disabled={downloadingReportId !== null}
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
                          },
                          "&.Mui-disabled": {
                            borderColor: "rgba(0, 0, 0, 0.12)",
                            color: "rgba(0, 0, 0, 0.38)",
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
                        "&.Mui-disabled": {
                          borderColor: "rgba(0, 0, 0, 0.12)",
                          color: "rgba(0, 0, 0, 0.38)",
                        }
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

      {/* Hidden structures for client-side report download & PDF generation */}
      {activeSkillAnalysisData && (
        <SkillDevelopmentReport
          data={activeSkillAnalysisData}
          profile={profile}
          timestamp={activeReportTimestamp || new Date().toISOString()}
        />
      )}
      {activeCareerAdviceData && (
        <CareerAdviceReport
          data={activeCareerAdviceData}
          profile={profile}
          timestamp={activeReportTimestamp || new Date().toISOString()}
        />
      )}

      {/* Hidden export container for print capture of template11p resume */}
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
        {profile && profile.id && (
          <MultiPageResumePreview
            templateId="template11p"
            data={profile}
            isExport={true}
            pagesRef={exportPagesRef}
          />
        )}
      </div>
    </Box>
  );
};

export default OrderStatusScreen;
