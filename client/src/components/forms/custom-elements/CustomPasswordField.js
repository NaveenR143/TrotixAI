import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import React from 'react';

const PasswordField = styled((props) => <OutlinedInput {...props} />)(({ theme }) => ({
  '& .MuiOutlinedInput-input::-webkit-input-placeholder': {
    color: '#767e89',
    opacity: '1',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: `${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : '#dee3e9'}`,
  },
  '& .MuiOutlinedInput-input.Mui-disabled': {
    backgroundColor: `${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.12) ' : '#f8f9fb '}`,
  },
  '& .MuiOutlinedInput-input.Mui-disabled::-webkit-input-placeholder': {
    color: '#767e89',
    opacity: '1',
  },
}));



function CustomPasswordField({ bgcolor, ...props }) {

  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (

    <PasswordField {...props}
      type={showPassword ? 'text' : 'password'}
      endAdornment={
        <InputAdornment position="end">
          <IconButton
            aria-label="toggle password visibility"
            onClick={handleClickShowPassword}
            onMouseDown={handleMouseDownPassword}
            edge="end"
          >
            {showPassword ? <VisibilityOff width="14" height="14" /> : <Visibility width="14" height="14" />}
          </IconButton>
        </InputAdornment>
      }
    />

  );
}

CustomPasswordField.propTypes = {
  bgcolor: PropTypes.string,
};

export default CustomPasswordField;
