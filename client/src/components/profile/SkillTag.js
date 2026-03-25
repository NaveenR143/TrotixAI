// components/profile/SkillTag.js
import React from "react";
import { Chip } from "@mui/material";

const SkillTag = ({ label, onDelete, matched = false }) => (
  <Chip
    label={label}
    onDelete={onDelete}
    size="small"
    sx={{
      bgcolor: matched ? '#ede9fe' : '#f8fafc',
      color: matched ? '#4f46e5' : '#475569',
      border: `1px solid ${matched ? '#c4b5fd' : '#e2e8f0'}`,
      fontWeight: 500,
      '& .MuiChip-deleteIcon': { color: matched ? '#7c3aed' : '#94a3b8', fontSize: 14 },
    }}
  />
);

export default SkillTag;
