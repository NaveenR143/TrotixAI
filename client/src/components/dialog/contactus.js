import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Slide,
  TextField,
  Button,
  Typography,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import { useDispatch } from "react-redux";
import { Grid2 } from "@mui/material";
import { displaySpinner } from "../../redux/spinner/Action";
import baseurl from "../../models/config";
import axios from "axios";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function ContactUsComp(props) {
  const dispatch = useDispatch();

  const [contactusdata, setContactusData] = useState({
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const fnValidateContactUs = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!contactusdata.email) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(contactusdata.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!contactusdata.message.trim()) {
      newErrors.message = "Message is required.";
    } else if (contactusdata.message.trim().length < 10) {
      newErrors.message = "Message should be at least 10 characters long.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fnContactUs = async () => {
    if (!fnValidateContactUs()) return;

    dispatch(displaySpinner(true));

    try {
      const queryDetails = {
        email: contactusdata.email,
        message: contactusdata.message,
      };

      const options = {
        headers: {
          //   authorization: token ? `Bearer ${token}` : "",
        },
      };

      const response = await axios.post(
        `${baseurl}contactus`,
        queryDetails,
        options
      );

      if (
        response.data[0] !== undefined &&
        (response.data[0].status === "error" ||
          response.data[0].status === "no records found")
      ) {
        props.setNotification({
          ...props.notification,
          show: true,
          message: "Error occurred while sending message",
          severity: "error",
        });
      } else {
        props.setNotification({
          ...props.notification,
          show: true,
          message: "Message sent successfully! We'll get back to you soon.",
          severity: "success",
        });

        setContactusData({
          email: "",
          message: "",
        });

        setErrors({});
        props.closedialog();
      }
    } catch (error) {
      let errorMessage = "Error occurred while sending message";

      if (error.response && error.response.status === 500) {
        errorMessage = "Server error occurred. Please try again later.";
      }

      props.setNotification({
        ...props.notification,
        show: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      dispatch(displaySpinner(false));
    }
  };

  const fnContactUsChange = (e) => {
    setContactusData({
      ...contactusdata,
      [e.target.name]: e.target.value,
    });

    setErrors({ ...errors, [e.target.name]: "" }); // Clear specific field error
  };

  return (
    <>
      <Dialog
        open={props.open}
        TransitionComponent={Transition}
        onClose={props.closedialog}
        aria-describedby="ContactUs"
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <ContactSupportIcon color="primary" />
            <Typography variant="h6" component="span" fontWeight={600}>
              Contact Us
            </Typography>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={props.closedialog}
            aria-label="close"
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3, mt: 1 }}
          >
            Have a question or feedback? We'd love to hear from you!
          </Typography>
          <Grid2
            container
            direction="column"
            spacing={2.5}
          >
            <Grid2 item>
              <TextField
                fullWidth
                required
                name="email"
                id="emailid"
                label="Email Address"
                type="email"
                value={contactusdata.email}
                onChange={fnContactUsChange}
                error={!!errors.email}
                helperText={errors.email}
                placeholder="your.email@example.com"
              />
            </Grid2>
            <Grid2 item>
              <TextField
                fullWidth
                id="contentid"
                label="Message"
                name="message"
                placeholder="Tell us what's on your mind..."
                maxRows={6}
                minRows={4}
                value={contactusdata.message}
                multiline
                onChange={fnContactUsChange}
                required
                error={!!errors.message}
                helperText={errors.message}
              />
            </Grid2>
          </Grid2>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={props.closedialog}
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={fnContactUs}
            disabled={
              !contactusdata.email || !contactusdata.message
            }
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
