import React, { useState } from "react";
import { TextField, Stack, Typography, Box, Chip } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { updateProfileData } from "../../../redux/profile/ProfileAction";

const SkillsForm = () => {
  const dispatch = useDispatch();
  const skills = useSelector((state) => state.ProfileReducer.data.skills || []);
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      if (!skills.includes(inputValue.trim())) {
        dispatch(updateProfileData({
          skills: [...skills, inputValue.trim()]
        }));
      }
      setInputValue("");
    }
  };

  const handleRemove = (skillToRemove) => {
    dispatch(updateProfileData({
      skills: skills.filter(skill => skill !== skillToRemove)
    }));
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>Skills</Typography>
      <Box>
        <TextField
          fullWidth
          label="Add Skill"
          placeholder="Type skill and press Enter"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          helperText="Press Enter to add multiple skills"
        />
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {skills.map((skill, index) => (
          <Chip
            key={index}
            label={skill}
            onDelete={() => handleRemove(skill)}
            sx={{ 
              bgcolor: "#f1f5f9", 
              fontWeight: 600,
              borderRadius: "8px",
              border: "1px solid #e2e8f0"
            }}
          />
        ))}
      </Box>

      {skills.length === 0 && (
        <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic", textAlign: "center", py: 4 }}>
          No skills added yet. Start typing above!
        </Typography>
      )}
    </Stack>
  );
};

export default SkillsForm;
