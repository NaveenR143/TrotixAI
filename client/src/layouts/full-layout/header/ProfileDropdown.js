import React from 'react';
import {
  Dialog,
  Box,
  MenuItem,
  Typography,
  Avatar,
  Button,
  Divider,
  DialogTitle,
  Grid,
  IconButton,
  DialogContent,
  DialogActions,
  TextField,
  FormLabel,
  Alert,
} from '@mui/material';
import FeatherIcon from 'feather-icons-react';
import { useSelector } from 'react-redux';

import CloseIcon from '@mui/icons-material/Close';

import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator';
// import userimg from '../../../assets/images/users/user2.jpg';

import { displaySpinner } from '../../../redux/spinner/Action';
import { useDispatch } from 'react-redux';




import axios from 'axios';
import AlertNotificationComp from '../../../components/common/AlertNotificationComp';

const ProfileDropdown = () => {
  const dispatch = useDispatch();

  const token = useSelector((state) => state.UserReducer.token);
  const useremail = useSelector((state) => state.UserReducer.useremail);
  const displayname = useSelector((state) => state.UserReducer.displayname);

  const [status, setStatusBase] = React.useState({
    show: false,
    message: '',
    variant: 'error',
  });

  const fnShowErrorMessage = () => setStatusBase({ show: false, message: '', variant: 'info' });

  const [changepasswordviewdialog, setChangePasswordViewDialog] = React.useState(false);
  const fnCloseChangePasswordViewDialog = () => setChangePasswordViewDialog(false);

  const [values, setValues] = React.useState({
    password: '',
    confirmPassword: '',
    error: '',
  });

  const [error, setError] = React.useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const validateInput = (e) => {
    let { name, value } = e.target;

    setError((prev) => {
      const stateObj = { ...prev, [name]: '' };

      switch (name) {
        case 'password':
          if (!value) {
            stateObj[name] = 'Please enter Password.';
          } else if (values.confirmPassword && value !== values.confirmPassword) {
            stateObj['confirmPassword'] = 'Password does not match.';
          } else {
            stateObj['confirmPassword'] = values.confirmPassword ? '' : error.confirmPassword;
          }
          break;

        case 'confirmPassword':
          if (!value) {
            stateObj[name] = 'Enter Confirm Password.';
          } else if (values.password && value !== values.password) {
            stateObj[name] = 'Password does not match.';
          }
          break;

        default:
          break;
      }

      return stateObj;
    });
  };

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
    validateInput(event);
  };

  const fnChangePassword = () => {
    dispatch(displaySpinner(true));

    setStatusBase({ show: true, message: 'Password changed successfully', type: 'info' });

    const passwordDetails = {
      password: values.password,
    };

    const options = {
      headers: {
        authorization: token ? `Bearer ${token}` : '',
      },
    };

    axios.post('/api/changepassword', passwordDetails, options).then(
      (response) => {
        dispatch(displaySpinner(false));
        if (response.data[0].status === 'success') {
          setStatusBase({ show: true, message: 'Password changed successfully', type: 'info' });
        } else if (response.data[0].status === 'failed') {
          setStatusBase({
            show: true,
            message: 'Update Failed. Please contact Admin.',
            type: 'error',
          });
        }
      },
      (error) => {
        dispatch(displaySpinner(false));
        setStatusBase({
          show: true,
          message: 'Error occured while changing password',
          type: 'error',
        });
      },
    );
  };

  const fnHandlePasswordChangeSubmit = (e) => {
    e.preventDefault();

    if (!error.password) {
      fnChangePassword();
    }
  };

  return (
    <>
      <Box>
        <Box
          sx={{
            pb: 3,
            mt: 3,
          }}
        >
          <Box display="flex" alignItems="center">
            <Avatar
              // src={userimg}
              // alt={userimg}
              sx={{
                width: '90px',
                height: '90px',
              }}
            />
            <Box
              sx={{
                ml: 2,
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  lineHeight: '1.235',
                }}
              >
                {displayname}
              </Typography>
              {/* <Typography color="textSecondary" variant="h6" fontWeight="400">
              Administrator
            </Typography> */}
              <Box display="flex" alignItems="center">
                <Typography
                  color="textSecondary"
                  display="flex"
                  alignItems="center"
                  sx={{
                    color: (theme) => theme.palette.grey.A200,
                    mr: 1,
                  }}
                >
                  <FeatherIcon icon="mail" width="18" />
                </Typography>
                <Typography color="textSecondary" variant="h6">
                  {useremail}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        <Divider
          style={{
            marginTop: 0,
            marginBottom: 0,
          }}
        />

        <Box>
          <MenuItem
            sx={{
              pt: '10px',
              pb: '10px',
            }}
            onClick={() => {
              setChangePasswordViewDialog(true);
            }}
          >
            <Box display="flex" alignItems="center">
              <Button
                sx={{
                  backgroundColor: (theme) => theme.palette.error.light,
                  color: (theme) => theme.palette.error.main,
                  boxShadow: 'none',
                  minWidth: '50px',
                  width: '45px',
                  height: '40px',
                  borderRadius: '10px',
                }}
              >
                <FeatherIcon icon="key" width="18" height="18" />
              </Button>
              <Box
                sx={{
                  ml: 2,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    lineHeight: '1.235',
                  }}
                >
                  Change Password
                </Typography>
                {/* <Typography color="textSecondary" variant="h6" fontWeight="400">
                To-do and Daily Tasks
              </Typography> */}
              </Box>
            </Box>
          </MenuItem>
        </Box>

        {/* <Box>
      <MenuItem
        sx={{
          pt: 3,
          pb: 3,
        }}
      >
        <Box display="flex" alignItems="center">
          <Button
            sx={{
              backgroundColor: (theme) => theme.palette.primary.light,
              color: (theme) => theme.palette.primary.main,
              boxShadow: 'none',
              minWidth: '50px',
              width: '45px',
              height: '40px',
              borderRadius: '10px',
            }}
          >
            <FeatherIcon icon="dollar-sign" width="18" height="18" />
          </Button>
          <Box
            sx={{
              ml: 2,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                lineHeight: '1.235',
              }}
            >
              My Profile
            </Typography>
            <Typography color="textSecondary" variant="h6" fontWeight="400">
              Account Settings
            </Typography>
          </Box>
        </Box>
      </MenuItem>
      <Divider
        style={{
          marginTop: 0,
          marginBottom: 0,
        }}
      />
      <MenuItem
        sx={{
          pt: 3,
          pb: 3,
        }}
      >
        <Box display="flex" alignItems="center">
          <Button
            sx={{
              backgroundColor: (theme) => theme.palette.success.light,
              color: (theme) => theme.palette.success.main,
              boxShadow: 'none',
              minWidth: '50px',
              width: '45px',
              height: '40px',
              borderRadius: '10px',
            }}
          >
            <FeatherIcon icon="shield" width="18" height="18" />
          </Button>
          <Box
            sx={{
              ml: 2,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                lineHeight: '1.235',
              }}
            >
              My Inbox
            </Typography>
            <Typography color="textSecondary" variant="h6" fontWeight="400">
              Messages & Emails
            </Typography>
          </Box>
        </Box>
      </MenuItem>
      <Divider
        style={{
          marginTop: 0,
          marginBottom: 0,
        }}
      />
      <MenuItem
        sx={{
          pt: 3,
          pb: 3,
        }}
      >
        <Box display="flex" alignItems="center">
          <Button
            sx={{
              backgroundColor: (theme) => theme.palette.error.light,
              color: (theme) => theme.palette.error.main,
              boxShadow: 'none',
              minWidth: '50px',
              width: '45px',
              height: '40px',
              borderRadius: '10px',
            }}
          >
            <FeatherIcon icon="credit-card" width="18" height="18" />
          </Button>
          <Box
            sx={{
              ml: 2,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                lineHeight: '1.235',
              }}
            >
              My Tasks
            </Typography>
            <Typography color="textSecondary" variant="h6" fontWeight="400">
              To-do and Daily Tasks
            </Typography>
          </Box>
        </Box>
      </MenuItem>
    </Box> */}
      </Box>
      <Dialog
        onClose={fnCloseChangePasswordViewDialog}
        aria-labelledby="dataview-dialog-title"
        open={changepasswordviewdialog}
        maxWidth="sm"
      >
        <DialogTitle id="dataview-dialog-title" onClose={fnCloseChangePasswordViewDialog}>
          <Grid container direction="row" justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography variant="h5" color="textprimary">
                Change Password
              </Typography>
            </Grid>
            <Grid item>
              <IconButton onClick={fnCloseChangePasswordViewDialog}>
                <CloseIcon />
              </IconButton>
            </Grid>
          </Grid>
        </DialogTitle>
        <DialogContent sx={{ width: '400px' }} dividers>
          {/* <ValidatorForm
            onSubmit={(e) => {
              

              e.preventDefault();

              fnChangePassword({
                variables: {
                  password: values.newpassword,
                },
              });
            }}
            onError={(errors) => {
              
              console.log(errors);
            }}
          >
            <TextValidator
              margin="normal"
              fullWidth
              label="New Password"
              onChange={handleChange('newpassword')}
              name="newpassword"
              type="password"
              value={values.newpassword || ''}
              validators={['required']}
              errorMessages={['Required']}
              inputProps={{
                maxLength: 25,
              }}
            />
            <TextValidator
              margin="normal"
              fullWidth
              label="Re-Type Password"
              onChange={handleChange('retypepassword')}
              name="retypepassword"
              type="password"
              value={values.retypepassword || ''}
              validators={['required', 'isPasswordMatch']}
              errorMessages={['Required', 'Passwords do not match']}
              inputProps={{
                maxLength: 25,
              }}
            />
            <Button type="submit" color="primary" variant="contained" fullWidth>
              Change Password
            </Button>
          </ValidatorForm> */}
          <form onSubmit={fnHandlePasswordChangeSubmit}>
            <TextField
              id="passwordId"
              fullWidth
              label="Password"
              name="password"
              type="password"
              onChange={handleChange('password')}
              style={{ marginBottom: '10px' }}
              required
            />
            {error.password && <Alert severity="error">{error.password}</Alert>}
            <TextField
              id="retypepasswordId"
              fullWidth
              label="Re-Type Password"
              name="confirmPassword"
              style={{ marginBottom: '10px' }}
              onChange={handleChange('confirmPassword')}
              type="password"
              required
            />
            {error.confirmPassword && <Alert severity="error">{error.confirmPassword}</Alert>}
            <Button type="submit" color="primary" variant="contained" fullWidth>
              Change Password
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertNotificationComp
        variant={status.variant}
        onClose={fnShowErrorMessage}
        message={status.message}
        display={status.show}
      />
    </>
  );
};

export default ProfileDropdown;
