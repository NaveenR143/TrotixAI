import React from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

const AiResultDialog = ({
  open,
  onClose,
  title,
  content,
  creditsText,
  buttonText,
  buttonColor,
  onAction,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, border: "1px solid #e2e8f0" } }}
    >
      <DialogTitle sx={{ fontWeight: 700, color: "#0f172a", pb: 1 }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            whiteSpace: "pre-wrap",
            fontSize: "0.9rem",
            color: "#475569",
            lineHeight: 1.7,
            mt: 1,
          }}
        >
          {content}
        </Box>
        <Box
          sx={{
            mt: 3,
            p: 2,
            bgcolor: creditsText ? (creditsText.includes("50") ? "#f0fdf4" : "#f0f9ff") : "#f8fafc",
            borderRadius: 1.5,
            border: creditsText ? (creditsText.includes("50") ? "1px solid #dcfce7" : "1px solid #dbeafe") : "1px solid #e2e8f0",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.85rem",
              color: creditsText ? (creditsText.includes("50") ? "#15803d" : "#0369a1") : "#64748b",
              fontWeight: 600,
            }}
          >
            {creditsText}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          onClick={onAction}
          sx={{ background: buttonColor || "linear-gradient(135deg, #6366f1, #4f46e5)" }}
        >
          {buttonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AiResultDialog;
