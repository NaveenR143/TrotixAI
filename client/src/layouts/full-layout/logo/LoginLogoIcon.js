import { Box } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import { ReactComponent as LoginLogoDark } from '../../../assets/images/logos/login-logo-dark.svg';

const LoginLogoIcon = () => {
  
  return (
    <Box sx={{ width: '250px' }}>
      <Link underline="none" to="/">
        <LoginLogoDark />
      </Link>
    </Box>
  );
};

export default LoginLogoIcon;
