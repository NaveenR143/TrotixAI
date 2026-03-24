import {
  Button,
  Stack,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  Alert,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Slide,
} from "@mui/material";
import React, { useEffect, useState } from "react";

import { Visibility, VisibilityOff, Google } from "@mui/icons-material";

import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider, microsoftProvider } from "../../firebase"; // Import your firebase config

import { ValidatorForm } from "react-material-ui-form-validator";
import CustomFormLabel from "../forms/custom-elements/CustomFormLabel";
import CustomPasswordField from "../forms/custom-elements/CustomPasswordField";
import CustomTextField from "../forms/custom-elements/CustomTextField";
import { useDispatch } from "react-redux";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function SignIn({ open, onClose, openSignUp }) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [notification, setNotification] = useState({
    message: "",
    severity: "",
    show: false,
  });

  const [values, setValues] = React.useState({
    email: "",
    password: "",
    error: "",
  });

  const dispatch = useDispatch();

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const signup = async () => {
    const res = await axios.post("http://localhost:5000/api/signup", {
      email,
      password,
    });
    alert(res.data.message);
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // alert("Signed in with Google!");
      onClose(); // Close modal on success
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  const handleMicrosoftSignIn = async () => {
    try {
      await signInWithPopup(auth, microsoftProvider);
      alert("Signed in with Microsoft!");
    } catch (error) {
      console.error(error);
    }
  };

  const handleEmailSignIn = async () => {
    try {
      const result = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      // console.log(result);
      onClose(); // Close modal on success
      // You can add navigation or state updates here
    } catch (error) {
      let message = "Something went wrong. Please try again.";

      switch (error.code) {
        case "auth/invalid-email":
          message = "Invalid email address. Please check and try again.";
          break;
        case "auth/user-disabled":
          message = "This user account has been disabled.";
          break;
        case "auth/user-not-found":
          message = "No account found with this email.";
          break;
        case "auth/wrong-password":
          message = "Incorrect password. Please try again.";
          break;
        default:
          console.error("Unhandled Firebase error:", error);
          message = error.message; // or keep generic
      }

      // alert(message); // You can use Snackbar or MUI Alert instead

      setNotification({
        ...notification,
        show: true,
        message: message,
        severity: "error",
      });
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setNotification({ ...notification, show: false });
    }, 5000);
  }, [notification]);

  // const handleSignOut = async () => {
  //   try {
  //     await signOut(auth);
  //   } catch (error) {
  //     console.error("Sign Out Error:", error);
  //   }
  // };

  // const [user, setUser] = useState(null);
  // useEffect(() => {
  //   const unsubscribe = auth.onAuthStateChanged((currentUser) => {
  //     setUser(currentUser);
  //   });
  //   return () => unsubscribe(); // Cleanup subscription on unmount
  // }, []);

  return (
    <>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        onClose={onClose}
        aria-describedby="Signup"
      >
        <DialogTitle>Sign In</DialogTitle>
        <DialogContent sx={{ padding: "10px" }}>
          <Box
            sx={{
              width: "400px",
              maxWidth: 420,
              mx: "auto",
              px: 2,
              mt: 2,
            }}
          >
            <ValidatorForm
              onSubmit={handleEmailSignIn}
              onError={(errors) => console.log(errors)}
            >
              <Stack spacing={3}>
                <TextField
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  value={values.email || ""}
                  onChange={handleChange("email")}
                  fullWidth
                  required
                  size="small"
                  variant="outlined"
                />

                <TextField
                  id="password"
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={values.password || ""}
                  onChange={handleChange("password")}
                  fullWidth
                  required
                  size="small"
                  variant="outlined"
                  inputProps={{ maxLength: 25 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={togglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  size="large"
                  fullWidth
                >
                  Sign In
                </Button>
              </Stack>
            </ValidatorForm>

            <Button
              onClick={handleGoogleSignIn}
              variant="contained"
              color="success"
              size="large"
              fullWidth
              startIcon={<Google />}
              sx={{ mt: 2 }}
            >
              Login with Google
            </Button>

            {/* 👉 Sign Up Button Here */}
            <Button
              onClick={() => {
                onClose(); // Close current dialog/modal
                openSignUp(); // Open sign-up dialog/modal
              }}
              variant="outlined"
              color="primary"
              size="large"
              fullWidth
              sx={{ mt: 2 }}
            >
              Don't have an account? Sign Up
            </Button>
          </Box>
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

      {/* <div>
        <a href="http://localhost:5000/auth/google">Login with Google</a>
        <br />
        <a href="http://localhost:5000/auth/microsoft">Login with Microsoft</a>
      </div> */}
    </>
  );
}
