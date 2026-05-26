import React from "react";
import { Box, Paper } from "@mui/material";
import { getTemplateComponent } from "./resume_components/templateRegistry";

const ResumePreview = ({ templateId, data, isExport = false }) => {
  if (!data) return null;

  const TemplateComponent = getTemplateComponent(templateId);

  return (
    <Box 
      id={isExport ? "resume-export-content" : "resume-content"}
      sx={{ 
        // A4 fixed width — never let content spill horizontally
        width: "210mm",
        minHeight: "297mm",
        bgcolor: "white",
        boxShadow: isExport ? "none" : "0 10px 30px rgba(0,0,0,0.15)",
        mx: "auto",
        transformOrigin: "top center",
        position: isExport ? "fixed" : "relative",
        left: isExport ? "-9999px" : "auto",
        top: isExport ? "-9999px" : "auto",
        zIndex: isExport ? -1000 : 1,
        // Never clip content — let it grow beyond 297mm if needed
        overflowX: "hidden",
        overflowY: "visible",
        boxSizing: "border-box",
        // Cascade word-wrap to all descendants so long URLs/names never overflow
        "& *": {
          wordBreak: "normal",
          overflowWrap: "break-word",
          boxSizing: "border-box",
        },
        // Ensure all child divs respect the A4 width
        "& > div": {
          width: "100%",
          maxWidth: "100%",
        },
        // Only animate if not exporting
        animation: isExport ? "none" : "fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        "@keyframes fadeIn": {
          "0%": {
            opacity: 0,
            transform: "scale(0.98)",
          },
          "100%": {
            opacity: 1,
            transform: "scale(1)",
          },
        },
      }}
      key={isExport ? `${templateId}-export` : templateId}
    >
      <TemplateComponent data={data} />
    </Box>
  );
};


export default ResumePreview;

