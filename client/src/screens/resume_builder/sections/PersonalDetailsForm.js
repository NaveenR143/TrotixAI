import React from "react";
import { TextField, Grid, Stack, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { updateProfileData } from "../../../redux/profile/ProfileAction";

const PersonalDetailsForm = () => {
  const dispatch = useDispatch();
  const personalDetails = useSelector((state) => state.ProfileReducer.data.personalDetails);

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateProfileData({
      personalDetails: {
        ...personalDetails,
        [name]: value
      }
    }));
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>Personal Details</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Full Name"
            name="fullName"
            value={personalDetails.fullName || ""}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={personalDetails.email || ""}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone"
            name="phone"
            value={personalDetails.phone || ""}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Website/Portfolio"
            name="website"
            value={personalDetails.website || ""}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Headline"
            placeholder="e.g. Senior Software Engineer"
            name="headline"
            value={personalDetails.headline || ""}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Professional Summary"
            name="summary"
            value={personalDetails.summary || ""}
            onChange={handleChange}
          />
        </Grid>
      </Grid>
    </Stack>
  );
};

export default PersonalDetailsForm;
