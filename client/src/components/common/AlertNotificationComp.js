import { IconButton } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import React from 'react';
import Alert from '@mui/lab/Alert';
import FeatherIcon from 'feather-icons-react';

export default function AlertNotificationComp(props) {
  // const classes = useStyles();
  const { className, message, onClose, display, variant, ...other } = props;
  // const Icon = variantIcon[variant];

  return (
    <Snackbar
      autoHideDuration={6000}
      open={display}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      onClose={onClose}
    >
      <Alert
        variant="filled"
        severity={variant}
        action={
          <IconButton aria-label="close" color="inherit" size="small" onClick={onClose}>
            <FeatherIcon icon="x" width="20" />
          </IconButton>
        }
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
