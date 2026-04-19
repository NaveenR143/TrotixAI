import React from "react";
import { Box, Container, Fade } from "@mui/material";
import AuthComponent from "../../components/common/AuthComponent";

const LoginWrapper = () => {
  return (
    <Box 
      sx={{ 
        bgcolor: '#f8fafc', 
        minHeight: 'calc(100vh - 64px)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        px: 2,
        py: 4
      }}
    >
      <Container maxWidth="xs">
        <Fade in timeout={600}>
          <Box>
            <AuthComponent />
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default LoginWrapper;
