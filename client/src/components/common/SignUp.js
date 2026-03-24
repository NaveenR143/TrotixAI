// src/Signup.js
import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";

import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Dialog,
  DialogContent,
  InputAdornment,
  DialogTitle,
  Slide,
  Stack,
  IconButton,
} from "@mui/material";

import { Visibility, VisibilityOff } from "@mui/icons-material";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Signup = ({ open, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [notification, setNotification] = useState({
    message: "",
    severity: "",
    show: false,
  });

  const handleSignup = async (e) => {
    e.preventDefault();
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
    setError(""); // Clear error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Proceed with Firebase sign up here...
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      

      setNotification({
        ...notification,
        show: true,
        message: "Signup successful!",
        severity: "success",
      });

      onClose();
    } catch (error) {
      

      console.log(error);

      let errorMessage = "Signup failed. Please try again.";

      if (error.code === "auth/email-already-in-use") {
        errorMessage =
          "This email is already registered. Try logging in instead.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === "auth/weak-password") {
        errorMessage =
          "Password is too weak. Please use at least 6 characters.";
      }

      setNotification({
        ...notification,
        show: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  return (
    <>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        onClose={onClose}
        aria-describedby="Signup"
      >
        <DialogTitle>Sign Up</DialogTitle>
        <DialogContent sx={{ padding: "10px" }}>
          <Container maxWidth="sm">
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ width: 400, mx: "auto", marginTop: 1 }}
            >
              <Stack spacing={3}>
                <TextField
                  label="Email"
                  type="email"
                  required
                  fullWidth
                  value={formData.email}
                  onChange={handleChange("email")}
                />

                <TextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  required
                  fullWidth
                  value={formData.password}
                  onChange={handleChange("password")}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Confirm Password"
                  type={showConfirm ? "text" : "password"}
                  required
                  fullWidth
                  value={formData.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirm((prev) => !prev)}
                          edge="end"
                        >
                          {showConfirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {error && <Alert severity="error">{error}</Alert>}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                >
                  Sign Up
                </Button>
              </Stack>
            </Box>
          </Container>
        </DialogContent>
      </Dialog>

      {notification.show && (
        <Alert
          style={{
            position: "absolute",
            top: 0,
            left: "36%",
            zIndex: 5000000,
            margin: "16px",
          }}
          variant="filled"
          severity={notification.severity}
        >
          {notification.message}
        </Alert>
      )}
    </>
  );
};

export default Signup;
