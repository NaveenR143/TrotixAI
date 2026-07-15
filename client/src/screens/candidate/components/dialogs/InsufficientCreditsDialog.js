import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const InsufficientCreditsDialog = ({ open, onClose }) => {
  const navigate = useNavigate();

  const handlePurchaseCredits = () => {
    onClose();
    navigate("/membership"); // Adjust route as needed
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <ErrorOutlineIcon sx={{ color: "#ef4444", fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          Insufficient Credits
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          You don't have enough credits to perform this action.
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ color: "text.primary", mb: 1 }}>
            Insufficient credits. Please purchase credits to continue.
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 2 }}>
            Buy credits to unlock premium features and continue using all advanced tools without interruption.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handlePurchaseCredits}
          variant="contained"
          color="primary"
          startIcon={<ShoppingCartIcon />}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
            },
          }}
        >
          Buy Credits
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InsufficientCreditsDialog;
