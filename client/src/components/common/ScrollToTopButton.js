import React, { useState, useEffect } from "react";
import { Fab, Zoom } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  // Detect scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <Zoom in={visible}>
      <Fab
        color="primary"
        size="medium"
        onClick={scrollToTop}
        aria-label="scroll back to top"
        sx={{
          position: "fixed",
          bottom: 32,
          right: 32,
          zIndex: 1000,
          boxShadow: 3,
          opacity: 0.4, // Make arrow 40% transparent
          transition: "opacity 0.3s ease",
          "&:hover": {
            opacity: 1, // Fully visible on hover
          },
        }}
      >
        <KeyboardArrowUpIcon sx={{ fontSize: 32 }} /> {/* 👈 Bigger icon */}
      </Fab>
    </Zoom>
  );
}
