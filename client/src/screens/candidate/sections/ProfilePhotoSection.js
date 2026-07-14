import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  IconButton,
  Button,
  CircularProgress,
  Stack,
  Alert,
  Tooltip,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import * as profileAPI from "../../../api/profileAPI";
import { useDispatch } from "react-redux";
import { updateUserProfile } from "../../../redux/user/Action";
import InsufficientCreditsDialog from "../components/dialogs/InsufficientCreditsDialog";

const ProfilePhotoSection = ({ userId, avatarUrl, onSuccess, userPoints }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [secureImageUrl, setSecureImageUrl] = useState(null);
  const [isFetchingImage, setIsFetchingImage] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [enhanceStep, setEnhanceStep] = useState(0);
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [aiEnhancementStep, setAiEnhancementStep] = useState(0);
  const [generatedPhotoUrl, setGeneratedPhotoUrl] = useState(null);
  const [isSavingEnhanced, setIsSavingEnhanced] = useState(false);
  const [insufficientCreditsDialogOpen, setInsufficientCreditsDialogOpen] = useState(false);
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    let objectUrl = null;

    const getSecurePhoto = async () => {
      if (!avatarUrl) {
        setSecureImageUrl(null);
        return;
      }

      // If it's already a data URL or blob URL, use it directly
      if (avatarUrl.startsWith("data:") || avatarUrl.startsWith("blob:")) {
        setSecureImageUrl(avatarUrl);
        return;
      }

      setIsFetchingImage(true);
      try {
        const result = await profileAPI.fetchProfilePhoto(avatarUrl);
        if (!result.error && result.data) {
          objectUrl = URL.createObjectURL(result.data);
          setSecureImageUrl(objectUrl);
        } else {
          console.error("Failed to fetch secure photo:", result.message);
          setSecureImageUrl(null);
        }
      } catch (err) {
        console.error("Error fetching secure photo:", err);
        setSecureImageUrl(null);
      } finally {
        setIsFetchingImage(false);
      }
    };

    getSecurePhoto();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [avatarUrl]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validation
    const supportedFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!supportedFormats.includes(file.type)) {
      setError("Supported formats: JPG, JPEG, PNG, WEBP");
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      setError("File size should be less than 2MB");
      return;
    }

    setError(null);
    setSelectedFile(file);
    setIsEnhanced(false);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !userId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await profileAPI.updateProfilePhoto(userId, selectedFile);

      if (result.error) {
        setError(result.message);
      } else {
        if (onSuccess) onSuccess("Profile photo updated successfully!", { avatarUrl: result.data.avatar_url });
        setPreviewUrl(null);
        setSelectedFile(null);
        setIsEnhanced(false);
      }
    } catch (err) {
      setError("Failed to upload photo. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAiEnhance = async () => {
    if (!avatarUrl) return;

    if (userPoints < 10) {
      setInsufficientCreditsDialogOpen(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const creditResult = await profileAPI.deductFeatureCredits(userId, "enhance_profile_photo");
      if (creditResult.error || !creditResult.success) {
        setInsufficientCreditsDialogOpen(true);
        setLoading(false);
        return;
      }

      if (creditResult.balance !== undefined) {
        dispatch(updateUserProfile({ points: creditResult.balance }));
      }

      setIsDialogOpen(true);
      setAiEnhancementStep(1); // Loading state
      setEnhancing(true);
      setEnhanceStep(0);

      const stepInterval = setInterval(() => {
        setEnhanceStep((prev) => {
          if (prev >= 2) {
            clearInterval(stepInterval);
            return 2;
          }
          return prev + 1;
        });
      }, 2000);

      try {
        const result = await profileAPI.enhanceProfilePhoto(userId, avatarUrl);
        clearInterval(stepInterval);

        if (result.error) {
          setError(result.message || "Failed to generate AI photo. Please try again.");
          setAiEnhancementStep(3); // Error state
          setEnhancing(false);
        } else {
          setGeneratedPhotoUrl(result.data.enhanced_url);
          setEnhanceStep(3);
          setTimeout(() => {
            setAiEnhancementStep(2); // Preview state
            setEnhancing(false);
          }, 1000);
        }
      } catch (err) {
        clearInterval(stepInterval);
        setError("An unexpected error occurred during AI image generation.");
        setAiEnhancementStep(3); // Error state
        setEnhancing(false);
        console.error(err);
      }
    } catch (err) {
      setError("Failed to deduct credits. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEnhancedPhoto = async () => {
    if (!generatedPhotoUrl || !userId) return;

    setIsSavingEnhanced(true);
    try {
      const result = await profileAPI.saveEnhancedProfilePhoto(userId, generatedPhotoUrl);
      if (result.error) {
        setError(result.message || "Failed to save AI-enhanced photo.");
      } else {
        if (onSuccess) {
          onSuccess("Profile photo updated with AI-enhanced version successfully!", {
            avatarUrl: result.data.avatar_url,
          });
        }
        setIsEnhanced(true);
        handleCloseDialog();
      }
    } catch (err) {
      setError("An unexpected error occurred while saving the photo.");
      console.error(err);
    } finally {
      setIsSavingEnhanced(false);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setAiEnhancementStep(0);
    setGeneratedPhotoUrl(null);
    setEnhancing(false);
    setEnhanceStep(0);
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setError(null);
    setIsEnhanced(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: "1px solid #e2e8f0",
        borderRadius: 4,
        bgcolor: "#fff",
        boxShadow: "0 10px 30px rgba(15,23,42,0.04)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: "center", gap: 3 }}>
        {/* Avatar Display / Preview */}
        <Box sx={{ position: "relative" }}>
          {isEnhanced && (
            <Box
              sx={{
                position: "absolute",
                top: -6,
                left: -6,
                background: "linear-gradient(135deg, #a855f7, #6366f1)",
                color: "#fff",
                px: 1,
                py: 0.5,
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                boxShadow: "0 4px 10px rgba(168, 85, 247, 0.4)",
                border: "2px solid #fff",
                zIndex: 15,
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 11 }} />
              <Typography sx={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.5px" }}>
                AI ENHANCED
              </Typography>
            </Box>
          )}

          <Zoom in={true}>
            <Box
              sx={{
                position: "relative",
                p: 0.3,
                borderRadius: 0,
                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                boxShadow: "0 8px 20px rgba(99, 102, 241, 0.2)",
                overflow: "hidden",
              }}
            >
              <Avatar
                src={previewUrl || secureImageUrl}
                variant="square"
                sx={{
                  width: { xs: 120, md: 140 },
                  height: { xs: 120, md: 140 },
                  borderRadius: 0,
                  border: "4px solid #fff",
                  bgcolor: "#f1f5f9",
                  fontSize: "3rem",
                  fontWeight: 700,
                  color: "#64748b",
                  filter: isEnhanced ? "brightness(1.04) contrast(1.08) saturate(1.03)" : "none",
                  transition: "filter 0.5s ease",
                  "& img": {
                    objectFit: "contain",
                  }
                }}
              >
                {isFetchingImage && <CircularProgress size={40} sx={{ color: "#6366f1" }} />}
                {!secureImageUrl && !previewUrl && !isFetchingImage && (
                  <PhotoCameraIcon sx={{ fontSize: "2.5rem" }} />
                )}
              </Avatar>

              {/* Scanning overlay */}
              {enhancing && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 4,
                    left: 4,
                    right: 4,
                    bottom: 4,
                    borderRadius: 0,
                    bgcolor: "rgba(15, 23, 42, 0.65)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10,
                    backdropFilter: "blur(1.5px)",
                    "@keyframes scan": {
                      "0%": { top: "10%" },
                      "50%": { top: "90%" },
                      "100%": { top: "10%" }
                    },
                    "@keyframes pulse": {
                      "0%": { opacity: 0.6 },
                      "50%": { opacity: 1 },
                      "100%": { opacity: 0.6 }
                    }
                  }}
                >
                  <CircularProgress size={30} sx={{ color: "#a855f7", mb: 0.5 }} />
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.65rem",
                      px: 1,
                      textAlign: "center",
                      animation: "pulse 1.2s infinite",
                    }}
                  >
                    {enhanceStep === 0 && "Scanning face..."}
                    {enhanceStep === 1 && "Studio lighting..."}
                    {enhanceStep === 2 && "Auto-refining..."}
                    {enhanceStep === 3 && "Finalizing..."}
                  </Typography>

                  {/* Scanning horizontal line */}
                  <Box
                    sx={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      height: "2px",
                      background: "linear-gradient(90deg, transparent, #a855f7, #6366f1, #a855f7, transparent)",
                      boxShadow: "0 0 6px #a855f7",
                      animation: "scan 2s linear infinite",
                    }}
                  />
                </Box>
              )}
            </Box>
          </Zoom>

          <input
            type="file"
            hidden
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,.webp"
          />

          {!previewUrl && (
            <Tooltip title="Change Photo" TransitionComponent={Zoom}>
              <IconButton
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  position: "absolute",
                  bottom: 5,
                  right: 5,
                  bgcolor: "#fff",
                  color: "#6366f1",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  "&:hover": { bgcolor: "#f8fafc", color: "#4f46e5" },
                }}
                size="small"
              >
                <PhotoCameraIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Content & Actions */}
        <Box sx={{ flex: 1, textAlign: { xs: "center", sm: "left" } }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}>
            Profile Photo
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 2, maxWidth: 400 }}>
            Upload a professional photo to help recruiters recognize you.
            Supported formats: JPG, PNG, WEBP (Max 2MB).
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2, py: 0 }}>
              {error}
            </Alert>
          )}

          <Stack direction="row" spacing={2} justifyContent={{ xs: "center", sm: "flex-start" }}>
            {!previewUrl ? (
              <>
                <Button
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                    borderColor: "#e2e8f0",
                    color: "#475569",
                    "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
                  }}
                >
                  Choose Photo
                </Button>
                {avatarUrl && (
                  <Button
                    variant="contained"
                    startIcon={<AutoAwesomeIcon />}
                    onClick={handleAiEnhance}
                    disabled={loading || enhancing}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      px: 3,
                      background: "linear-gradient(135deg, #a855f7, #6366f1)",
                      boxShadow: "0 4px 12px rgba(168, 85, 247, 0.2)",
                      color: "#fff",
                      "&:hover": { background: "linear-gradient(135deg, #9333ea, #4f46e5)" },
                      "&.Mui-disabled": {
                        color: "#cfcfcfff",
                        backgroundColor: "#cdcbcbff",
                        opacity: 0.8,
                      },
                    }}
                  >
                    Enhance with AI · 10 Credits
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  onClick={handleUpload}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <CheckCircleIcon />}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
                    "&:hover": { background: "linear-gradient(135deg, #4f46e5, #4338ca)" },
                    "&.Mui-disabled": {
                      color: "#cfcfcfff",
                      backgroundColor: "#cdcbcbff",
                      opacity: 0.8,
                    },
                  }}
                >
                  {loading ? "Uploading..." : "Save Changes"}
                </Button>
                <Button
                  variant="text"
                  onClick={handleCancel}
                  disabled={loading}
                  startIcon={<DeleteIcon />}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    color: "#ef4444",
                    "&:hover": { bgcolor: "#fef2f2" },
                    "&.Mui-disabled": {
                      color: "#cfcfcfff",
                      backgroundColor: "#cdcbcbff",
                      opacity: 0.8,
                    },
                  }}
                >
                  Cancel
                </Button>
              </>
            )}
          </Stack>
        </Box>
      </Box>

      {/* AI Enhancement Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={aiEnhancementStep === 2 || aiEnhancementStep === 3 ? handleCloseDialog : undefined}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 1,
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#0f172a", pb: 1, display: "flex", alignItems: "center", gap: 1 }}>
          <AutoAwesomeIcon sx={{ color: "#a855f7" }} />
          AI Profile Photo Enhancer
        </DialogTitle>

        <DialogContent sx={{ mt: 1 }}>
          {aiEnhancementStep === 1 && (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 4, gap: 3 }}>
              {/* Spinner & Scan Animation */}
              <Box sx={{ position: "relative", p: 0.5, borderRadius: 0, background: "linear-gradient(135deg, #a855f7, #6366f1)", overflow: "hidden" }}>
                <Avatar
                  src={secureImageUrl}
                  variant="square"
                  sx={{
                    width: 130,
                    height: 130,
                    borderRadius: 0,
                    border: "4px solid #fff",
                    filter: "blur(0.5px)",
                    "& img": {
                      objectFit: "contain",
                    }
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: 4,
                    left: 4,
                    right: 4,
                    bottom: 4,
                    borderRadius: 0,
                    bgcolor: "rgba(15, 23, 42, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10,
                  }}
                >
                  <CircularProgress size={45} sx={{ color: "#fff" }} />
                </Box>
                {/* Horizontal scanning line */}
                <Box
                  sx={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: "linear-gradient(90deg, transparent, #a855f7, #6366f1, #a855f7, transparent)",
                    boxShadow: "0 0 10px #a855f7",
                    animation: "dialogScan 2s linear infinite",
                    "@keyframes dialogScan": {
                      "0%": { top: "15%" },
                      "50%": { top: "85%" },
                      "100%": { top: "15%" }
                    }
                  }}
                />
              </Box>

              <Box sx={{ width: "100%", maxWidth: 320, textAlign: "center" }}>
                <Typography variant="body1" sx={{ fontWeight: 700, color: "#1e293b", mb: 1 }}>
                  {enhanceStep === 0 && "Step 1/3: Analyzing facial features..."}
                  {enhanceStep === 1 && "Step 2/3: Generating AI prompt..."}
                  {enhanceStep >= 2 && "Step 3/3: Running image synthesis..."}
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
                  Please do not close this window. This may take up to 30 seconds.
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={enhanceStep === 0 ? 30 : enhanceStep === 1 ? 60 : 90}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: "#f1f5f9",
                    "& .MuiLinearProgress-bar": {
                      background: "linear-gradient(90deg, #a855f7, #6366f1)",
                    }
                  }}
                />
              </Box>
            </Box>
          )}

          {aiEnhancementStep === 2 && (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 2, gap: 3 }}>
              <Typography variant="body2" sx={{ color: "#64748b", textAlign: "center", maxWidth: 450 }}>
                Your photo has been enhanced with professional studio lighting, a corporate backdrop, and formal attire. Compare the results below.
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={4} alignItems="center" justifyContent="center">
                {/* Original Photo */}
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "#64748b", display: "block", mb: 1, textTransform: "uppercase" }}>
                    ORIGINAL
                  </Typography>
                  <Box sx={{ p: 0.5, borderRadius: 0, bgcolor: "#e2e8f0", overflow: "hidden" }}>
                    <Avatar
                      src={secureImageUrl}
                      variant="square"
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: 0,
                        border: "3px solid #fff",
                        "& img": {
                          objectFit: "contain",
                        }
                      }}
                    />
                  </Box>
                </Box>

                {/* Arrow */}
                <Box sx={{ display: { xs: "none", sm: "block" }, color: "#a855f7", fontSize: "2rem", fontWeight: 700 }}>
                  ➔
                </Box>

                {/* Enhanced Photo */}
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "#a855f7", display: "block", mb: 1, textTransform: "uppercase" }}>
                    ✨ ENHANCED BY AI
                  </Typography>
                  <Box sx={{ p: 0.5, borderRadius: 0, background: "linear-gradient(135deg, #a855f7, #6366f1)", boxShadow: "0 8px 20px rgba(168, 85, 247, 0.3)", overflow: "hidden" }}>
                    <Avatar
                      src={generatedPhotoUrl}
                      variant="square"
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: 0,
                        border: "3px solid #fff",
                        "& img": {
                          objectFit: "contain",
                        }
                      }}
                    />
                  </Box>
                </Box>
              </Stack>
            </Box>
          )}

          {aiEnhancementStep === 3 && (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 4, gap: 2 }}>
              <Alert severity="error" sx={{ width: "100%", borderRadius: 3 }}>
                {error || "An unexpected error occurred during generation."}
              </Alert>
              <Typography variant="body2" sx={{ color: "#64748b", textAlign: "center", mt: 1 }}>
                Please check your network and OpenAI service limits, and try again.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, justifyContent: "center", gap: 2 }}>
          {aiEnhancementStep === 2 && (
            <>
              <Button
                variant="outlined"
                onClick={handleCloseDialog}
                disabled={isSavingEnhanced}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  borderColor: "#cbd5e1",
                  color: "#64748b",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { borderColor: "#94a3b8", bgcolor: "#f8fafc" }
                }}
              >
                Discard
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveEnhancedPhoto}
                disabled={isSavingEnhanced}
                startIcon={isSavingEnhanced ? <CircularProgress size={18} color="inherit" /> : <CheckCircleIcon />}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  background: "linear-gradient(135deg, #a855f7, #6366f1)",
                  boxShadow: "0 4px 12px rgba(168, 85, 247, 0.3)",
                  textTransform: "none",
                  fontWeight: 600,
                  color: "#fff",
                  "&:hover": { background: "linear-gradient(135deg, #9333ea, #4f46e5)" }
                }}
              >
                {isSavingEnhanced ? "Saving..." : "Save Photo"}
              </Button>
            </>
          )}
          {aiEnhancementStep === 3 && (
            <Button
              variant="contained"
              onClick={handleCloseDialog}
              sx={{
                borderRadius: 2,
                px: 4,
                bgcolor: "#475569",
                color: "#fff",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": { bgcolor: "#334155" }
              }}
            >
              Close
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <InsufficientCreditsDialog
        open={insufficientCreditsDialogOpen}
        onClose={() => setInsufficientCreditsDialogOpen(false)}
      />

      {/* Decorative background element */}
      <Box
        sx={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, rgba(255, 255, 255, 0) 70%)",
          zIndex: 0,
        }}
      />
    </Paper>
  );
};

export default ProfilePhotoSection;
