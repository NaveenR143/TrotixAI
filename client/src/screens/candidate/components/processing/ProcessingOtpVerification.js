import React from "react";
import { Box, Typography, Stack, Button, Alert, AlertTitle } from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import MobileOTPValidation from "../../../../components/forms/MobileOTPValidation";
import { fadeSlideUp } from "../../../../utils/themeUtils";

const ProcessingOtpVerification = ({
  newUser,
  processingError,
  handleRetry,
  resumeData,
  handleOTPSuccess,
  handleChangeNumber
}) => {
  return (
    <Stack spacing={4}>
      {newUser === false && (
        <Box sx={{
          p: 3,
          bgcolor: "rgba(59, 130, 246, 0.05)",
          borderRadius: 3,
          border: "1px solid #3b82f6",
          textAlign: "center",
          animation: `${fadeSlideUp} 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) both`
        }}>
          <Typography sx={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "#3b82f6",
            mb: 0.5
          }}>
            Welcome Back!
          </Typography>
          <Typography sx={{
            fontSize: "0.85rem",
            color: "#212121",
            lineHeight: 1.5
          }}>
            We found your account. Please verify your mobile number to continue.
          </Typography>
        </Box>
      )}

      {/* Error Alert if Processing Failed */}
      {processingError && (
        <Alert severity="error" sx={{ borderRadius: 2.5 }}>
          <AlertTitle sx={{ fontWeight: 600 }}>Processing Error</AlertTitle>
          {processingError}
          <Button
            size="small"
            startIcon={<ReplayIcon />}
            onClick={handleRetry}
            sx={{ mt: 1.5, textTransform: "none" }}
          >
            Try Again
          </Button>
        </Alert>
      )}

      {/* OTP Validation Component */}
      <MobileOTPValidation
        mobileNumber={resumeData?.phone}
        onSuccess={handleOTPSuccess}
        // onError={handleOTPError}
        onChangeNumber={handleChangeNumber}
        newUser={newUser}
        resumeData={resumeData}
      />
    </Stack>
  );
};

export default ProcessingOtpVerification;
