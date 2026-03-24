import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Box } from "@mui/material";
import LogoDark from "../../../assets/images/logos/logo-dark.svg?component";
import LogoLight from "../../../assets/images/logos/logo-white.svg?component";

const LogoIcon = () => {
  const customizer = useSelector((state) => state.CustomizerReducer);
  return (
    <Box sx={{ width: "200px" }}>
      <Link underline="none" to="/">
        {customizer.activeMode === "dark" ? <LogoLight /> : <LogoDark />}
      </Link>
    </Box>
  );
};

export default LogoIcon;
