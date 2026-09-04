// components/recruiter/MobileCandidateCard.js
import React from "react";
import { Box, Typography, Button, Chip, Stack } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { toTitleCase } from "../../utils/stringUtils";

const CARD_FOOTER_H = 82;

const MobileCandidateCard = ({
  candidate,
  onDetail,
}) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        bgcolor: '#ffffff',
        backgroundImage: 'linear-gradient(160deg, #ffffff 0%, rgba(248,250,252,0.9) 40%, rgba(238,242,246,0.95) 100%)',
        boxShadow: '0 4px 20px rgba(15,23,42,0.06)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: '16px',
        border: '1px solid rgba(226,232,240,0.8)',
      }}
    >
      <Box
        onClick={onDetail}
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 2.5,
          pt: 3,
          pb: `${CARD_FOOTER_H + 40}px`,
          cursor: "pointer",
          WebkitOverflowScrolling: "touch",
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
        }}
      >
        <Stack direction="row" spacing={2.5} alignItems="center" sx={{ mb: 3 }}>
          <Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: "1.35rem",
                color: "#0f172a",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
              }}
            >
              {candidate.full_name}
            </Typography>
            <Typography
              sx={{
                fontSize: "0.95rem",
                color: "#4f46e5",
                fontWeight: 600,
                mt: 0.5,
              }}
            >
              {candidate.years_of_experience > 0 
                ? (candidate.last_experience_title || "Fresher") 
                : (candidate.last_education_degree || "Fresher")}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mb: 3.5 }}>
          <Chip
            icon={<WorkHistoryIcon sx={{ fontSize: "0.9rem !important" }} />}
            label={`${candidate.years_of_experience} Yrs Experience`}
            size="small"
            sx={{
              bgcolor: "#ffffff",
              color: "#475569",
              border: "1px solid #e2e8f0",
              borderRadius: 2,
              fontSize: "0.8rem",
              px: 0.5,
              py: 1.5,
              boxShadow: "0 2px 6px rgba(15,23,42,0.03)",
            }}
          />
        </Stack>

        {candidate.skills?.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                mb: 1.5,
              }}
            >
              Skills
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
              {candidate.skills.map((s) => (
                <Chip
                  key={s}
                  label={toTitleCase(s)}
                  size="small"
                  sx={{
                    background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                    color: "#374151",
                    border: "1px solid #d1d5db",
                    borderRadius: 2,
                    fontSize: "0.75rem",
                    fontWeight: 500,
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.96) 28%, #ffffff 100%)",
          px: 2.5,
          pb: "calc(env(safe-area-inset-bottom) + 20px)",
          pt: 2,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 1.5,
          zIndex: 10,
          minHeight: `${CARD_FOOTER_H}px`,
        }}
      >
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onDetail?.();
          }}
          fullWidth
          sx={{
            height: 54,
            px: 3,
            borderRadius: 100,
            color: "white",
            fontWeight: 700,
            fontSize: "0.95rem",
            background:
              "linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)",
            boxShadow:
              "0 10px 24px rgba(99,102,241,0.35), inset 0 2px 0 rgba(255,255,255,0.2)",
            transition: "all 0.2s",
            "&:hover": {
              transform: "scale(1.02) translateY(-2px)",
              boxShadow: "0 14px 30px rgba(99,102,241,0.45)",
            },
            "&:active": { transform: "scale(0.98)" },
          }}
        >
          View Full Profile
        </Button>
      </Box>
    </Box>
  );
};

export default MobileCandidateCard;
