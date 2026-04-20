import React from "react";
import { Box } from "@mui/material";
import Template1 from "./resume_components/template1Screen";

const ResumePreview = ({ templateId, data }) => {
  if (!data) return null;

  const renderTemplate = () => {
    switch (templateId) {
      case "template1":
      case "default":
        return <Template1 data={data} />;
      default:
        return <Template1 data={data} />;
    }
  };

  return (
    <Box 
      sx={{ 
        width: "210mm", // Fixed A4 Width
        minHeight: "297mm",
        bgcolor: "white",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        mx: "auto",
        transformOrigin: "top center",
        // Proportional constraint for parent container
        position: "relative",
        "& > div": {
           // Ensure children don't break the A4 boundary
           maxWidth: "100%"
        }
      }}
    >
      {renderTemplate()}
    </Box>
  );
};

export default ResumePreview;
