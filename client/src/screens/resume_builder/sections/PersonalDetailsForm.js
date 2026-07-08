import React from "react";
import { TextField, Grid, Stack, Typography, MenuItem, Checkbox, FormControlLabel } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { updateProfileData } from "../../../redux/profile/ProfileAction";

const PersonalDetailsForm = () => {
  const dispatch = useDispatch();
  const personalDetails = useSelector((state) => state.ProfileReducer.data.personalDetails);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = {
      ...personalDetails,
      [name]: value
    };
    if (name === "location") {
      updated.currentLocation = value;
    }
    dispatch(updateProfileData({
      personalDetails: updated
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
          <Stack justifyContent="center" sx={{ minHeight: 56 }}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
              Phone
            </Typography>
            <Typography variant="body1" sx={{ color: "text.primary", mt: 0.5 }}>
              {personalDetails.phone || "—"}
            </Typography>
          </Stack>
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
          <FormControlLabel
            control={
              <Checkbox
                checked={personalDetails.showPersonalDetails !== false}
                onChange={(e) => {
                  dispatch(updateProfileData({
                    personalDetails: {
                      ...personalDetails,
                      showPersonalDetails: e.target.checked
                    }
                  }));
                }}
                color="primary"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Show Date of Birth, Gender, Marital Status & Location on Resume
              </Typography>
            }
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Location"
            name="location"
            value={personalDetails.location || ""}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Date of Birth"
            name="date_of_birth"
            type="date"
            value={personalDetails.date_of_birth || ""}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Gender"
            name="gender"
            value={personalDetails.gender || ""}
            onChange={handleChange}
          >
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
            <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Marital Status"
            name="maritalStatus"
            value={personalDetails.maritalStatus || ""}
            onChange={handleChange}
          >
            <MenuItem value="Single">Single</MenuItem>
            <MenuItem value="Married">Married</MenuItem>
            <MenuItem value="Divorced">Divorced</MenuItem>
            <MenuItem value="Widowed">Widowed</MenuItem>
          </TextField>
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
