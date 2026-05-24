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
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import * as profileAPI from "../../../api/profileAPI";

const ProfilePhotoSection = ({ userId, avatarUrl, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [secureImageUrl, setSecureImageUrl] = useState(null);
  const [isFetchingImage, setIsFetchingImage] = useState(false);
  const fileInputRef = useRef(null);

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
      }
    } catch (err) {
      setError("Failed to upload photo. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setError(null);
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
          <Zoom in={true}>
            <Box
              sx={{
                position: "relative",
                p: 0.5,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                boxShadow: "0 8px 20px rgba(99, 102, 241, 0.2)",
              }}
            >
              <Avatar
                src={previewUrl || secureImageUrl}
                sx={{
                  width: { xs: 120, md: 140 },
                  height: { xs: 120, md: 140 },
                  border: "4px solid #fff",
                  bgcolor: "#f1f5f9",
                  fontSize: "3rem",
                  fontWeight: 700,
                  color: "#64748b",
                }}
              >
                {isFetchingImage && <CircularProgress size={40} sx={{ color: "#6366f1" }} />}
                {!secureImageUrl && !previewUrl && !isFetchingImage && (
                  <PhotoCameraIcon sx={{ fontSize: "2.5rem" }} />
                )}
              </Avatar>
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
                  }}
                >
                  Cancel
                </Button>
              </>
            )}
          </Stack>
        </Box>
      </Box>
      
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
