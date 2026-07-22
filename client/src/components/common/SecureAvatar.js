import React, { useState, useEffect } from "react";
import { Avatar, CircularProgress } from "@mui/material";
import { fetchProfilePhoto } from "../../api/profileAPI";

const SecureAvatar = ({ avatarUrl, variant = "circle", sx = {}, children, ...props }) => {
  const [secureImageUrl, setSecureImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let objectUrl = null;

    const getSecurePhoto = async () => {
      if (!avatarUrl) {
        setSecureImageUrl(null);
        return;
      }

      // If it's already a data URL or blob URL or HTTP URL (not from secure storage), use it directly
      const isSecureBlobUrl = avatarUrl && typeof avatarUrl === "string" && avatarUrl.includes("blob.core.windows.net");
      if (
        (avatarUrl.startsWith("data:") ||
        avatarUrl.startsWith("blob:") ||
        avatarUrl.startsWith("http")) &&
        !isSecureBlobUrl
      ) {
        setSecureImageUrl(avatarUrl);
        return;
      }

      setLoading(true);
      try {
        const result = await fetchProfilePhoto(avatarUrl);
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
        setLoading(false);
      }
    };

    getSecurePhoto();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [avatarUrl]);

  return (
    <Avatar
      src={secureImageUrl}
      variant={variant}
      sx={{
        bgcolor: "#F1F5F9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...sx,
      }}
      {...props}
    >
      {loading ? (
        <CircularProgress
          size={sx.width ? Math.min(24, sx.width / 3) : 20}
          sx={{ color: "#2563EB" }}
        />
      ) : (
        children
      )}
    </Avatar>
  );
};

export default SecureAvatar;
