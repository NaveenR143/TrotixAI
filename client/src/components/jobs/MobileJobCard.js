// components/jobs/MobileJobCard.js
import React, { useState } from "react";
import { Box, Typography, Button, Chip, Stack, IconButton } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MatchBadge from "./MatchBadge";
import { getWorkModeIcon } from "../../utils/themeUtils";

const toTitleCase = (str) => {
  if (!str) return "";
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

const CARD_HEADER_H = 51;
const CARD_FOOTER_H = 82;

const MobileJobCard = ({
  job,
  onSkip,
  onInterested,
  onToggleSave,
  isSaved,
  onExit,
  onDetail,
}) => {
  const [showScore, setShowScore] = useState(false);

  const allSkills = Array.from(
    new Set([
      ...(job.keySkillsMatched || []),
      ...(job.keySkillsMissing || [])
    ].map(s => toTitleCase(s)))
  );

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
        <Typography
          sx={{
            fontWeight: 900,
            fontSize: "1.5rem",
            color: "#0f172a",
            lineHeight: 1.15,
            mb: 2,
            letterSpacing: "-0.02em",
          }}
        >
          {job.title}
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography
            sx={{ fontSize: "1.0rem", color: "#64748b", fontWeight: 600 }}
          >
            {job.company}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {job.is_viewed && (
              <Chip
                icon={<VisibilityIcon sx={{ fontSize: "0.85rem !important", color: "#64748b !important" }} />}
                label="Viewed"
                size="small"
                sx={{
                  height: 22,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  bgcolor: "#f1f5f9",
                  color: "#64748b",
                  border: "1px solid #e2e8f0",
                  borderRadius: 1.5,
                  px: 0.5,
                  "& .MuiChip-label": { px: 0.5 }
                }}
              />
            )}
            {job.posted && (
              <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500 }}>
                {job.posted}
              </Typography>
            )}
          </Stack>
        </Box>

        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
          <Chip
            icon={<LocationOnIcon sx={{ fontSize: "0.9rem !important" }} />}
            label={job.location}
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
          {/* {job.salary && (
            <Chip
              label={job.salary}
              size="small"
              sx={{
                bgcolor: "rgba(16, 185, 129, 0.08)",
                color: "#059669",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                borderRadius: 2,
                fontSize: "0.8rem",
                fontWeight: 700,
                px: 0.5,
                py: 1.5,
              }}
            />
          )} */}
          <Chip
            label={`${getWorkModeIcon(job.workMode)} ${job.workMode}`}
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
          {job.type && (
            <Chip
              label={job.type}
              size="small"
              sx={{
                bgcolor: "#f0fdf4",
                color: "#15803d",
                border: "1px solid #dcfce7",
                borderRadius: 2,
                fontSize: "0.8rem",
                fontWeight: 700,
                px: 0.5,
                py: 1.5,
              }}
            />
          )}
          {job.expired_date && (
            <Chip
              label={`Ends: ${job.expired_date}`}
              size="small"
              sx={{
                bgcolor: "#fef2f2",
                color: "#dc2626",
                border: "1px solid #fee2e2",
                borderRadius: 2,
                fontSize: "0.8rem",
                fontWeight: 700,
                px: 0.5,
                py: 1.5,
              }}
            />
          )}
        </Stack>

        {job.qualification && (
          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 800,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                mb: 1,
              }}
            >
              Eligibility / Qualification
            </Typography>
            <Typography
              sx={{
                fontSize: "0.95rem",
                color: "#475569",
                fontWeight: 500,
                lineHeight: 1.5,
              }}
            >
              {job.qualification}
            </Typography>
          </Box>
        )}

        {job.keySkillsMatched?.length > 0 && (
          <Box sx={{ mb: 4, mt: 2 }}>
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 800,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                mb: 1,
              }}
            >
              Matched Skills
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
              {job.keySkillsMatched.map((s) => (
                <Chip
                  key={s}
                  label={toTitleCase(s)}
                  size="small"
                  sx={{
                    background:
                      "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
                    color: "#4f46e5",
                    border: "1px solid rgba(124, 58, 237, 0.15)",
                    borderRadius: 2,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {allSkills.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 800,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                mb: 1,
              }}
            >
              Required Skills
            </Typography>
            <Typography
              sx={{
                fontSize: "0.95rem",
                color: "#475569",
                fontWeight: 500,
                lineHeight: 1.5,
              }}
            >
              {allSkills.join(", ")}
            </Typography>
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
        {!showScore ? (
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              setShowScore(true);
            }}
            sx={{
              width: 54,
              height: 54,
              bgcolor: "rgba(99, 102, 241, 0.08)",
              color: "#6366f1",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              boxShadow: "0 8px 16px rgba(99, 102, 241, 0.08)",
              transition: "all 0.2s",
              "&:hover": { bgcolor: "rgba(99, 102, 241, 0.15)", transform: "scale(1.05)" },
              "&:active": { transform: "scale(0.95)" },
            }}
          >
            <AutoAwesomeIcon fontSize="medium" />
          </IconButton>
        ) : (
          <Box
            onClick={(e) => {
              e.stopPropagation();
              setShowScore(false);
            }}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              cursor: "pointer",
              animation: "slideLeft 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
              "@keyframes slideLeft": {
                "0%": { opacity: 0, transform: "translateX(20px) scale(0.9)" },
                "100%": { opacity: 1, transform: "translateX(0) scale(1)" },
              },
            }}
          >
            <MatchBadge score={job.matchScore} size="lg" />
          </Box>
        )}

        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave?.();
          }}
          sx={{
            width: 54,
            height: 54,
            bgcolor: isSaved ? "#fffbeb" : "#ffffff",
            color: "#f59e0b",
            border: `1px solid ${isSaved ? "#fde68a" : "#fef3c7"}`,
            boxShadow: "0 8px 16px rgba(245,158,11,0.1)",
            transition: "all 0.2s",
            "&:hover": { bgcolor: "#fffbeb", transform: "scale(1.05)" },
            "&:active": { transform: "scale(0.95)" },
          }}
        >
          {isSaved ? (
            <BookmarkIcon fontSize="medium" />
          ) : (
            <BookmarkBorderIcon fontSize="medium" />
          )}
        </IconButton>

        <Button
          onClick={(e) => {
            e.stopPropagation();
            onDetail?.();
          }}
          sx={{
            height: 54,
            px: 3,
            borderRadius: 100,
            color: "white",
            fontWeight: 800,
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
          More Info
        </Button>
      </Box>
    </Box>
  );
};

export default MobileJobCard;
