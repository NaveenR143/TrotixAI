import React, { useState } from "react";
import {
  Box,
  Divider,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListSubheader,
  Badge,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import MenuIcon from "@mui/icons-material/Menu";
import InfoIcon from "@mui/icons-material/Info";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import LoginIcon from "@mui/icons-material/Login";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import StarIcon from "@mui/icons-material/Star";

const SidebarComp = ({
  user,
  onSignout,
  onOpenLogin,
  onOpenDataCoverageDialog,
  gpt,
  dataCoverage,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selected, setSelected] = useState("manufacturing");

  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (action) => {
    setAnchorEl(null);
    if (action) {
      setSelected(action);

      if (action === "naturalgaspipelines") {
        window.open(`/naturalgaspipelines`, "_blank");
      } else if (action === "pointAnalysis") {
        window.open(`/pointanalysis`, "_blank");
      } else if (action === "pipelineAnalysis") {
        window.open(`/pipelinenetworkanalysis`, "_blank");
      } else if (action === "promptHub") {
        window.open(`/prompthub`, "_blank");
      } else if (action === "about") {
        window.open(`/info`, "_blank");
      } else if (action === "main") {
        window.open(`/`, "_blank");
      }
    }
  };

  // if (user) {
  //   handleMenuClick(e);
  // } else {
  //   onOpenLogin();
  // }

  return (
    <Grid
      item
      xs={1}
      sx={{
        height: "90vh",
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(245, 245, 245, 0.8) 100%)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        borderRadius: 2,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 2,
        transition: "all 0.3s ease",
      }}
    >
      {/* Top Icons */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          flexGrow: 1,
        }}
      >
        <Tooltip title="OilGasGPT" placement="right">
          <IconButton
            color={gpt ? "primary" : "default"}
            onClick={() => handleMenuClose("main")}
            sx={{
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "scale(1.1)",
                backgroundColor: "rgba(103, 126, 234, 0.1)",
              },
            }}
          >
            <AutoAwesomeIcon />
          </IconButton>
        </Tooltip>

        <Divider sx={{ width: "100%" }} />

        {/* Icon Button with Tooltip */}
        <Tooltip title="Advanced Features" placement="right">
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            badgeContent={
              <StarIcon
                sx={{
                  fontSize: "10px",
                  color: "#fbc02d", // gold
                }}
              />
            }
          >
            <IconButton
              color={gpt ? "default" : "primary"}
              onClick={(e) => {
                handleMenuClick(e);
              }}
              sx={{
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "scale(1.1)",
                  backgroundColor: "rgba(103, 126, 234, 0.1)",
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          </Badge>
        </Tooltip>

        {/* Menu */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={() => handleMenuClose()}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          MenuListProps={{
            dense: true,
          }}
        >
          <ListSubheader>Analysis Tools</ListSubheader>

          <MenuItem onClick={() => handleMenuClose("naturalgaspipelines")}>
            Natural Gas Pipelines
          </MenuItem>
          {/* <MenuItem
            onClick={() =>
              //   {
              //   if (user) {
              //     handleMenuClose("pointAnalysis");
              //   } else {
              //     onOpenLogin();
              //   }
              // }

              handleMenuClose("pointAnalysis")
            }
          >
            Point Analysis
          </MenuItem>
          <MenuItem onClick={() => handleMenuClose("pipelineAnalysis")}>
            Pipeline Network Analysis
          </MenuItem> */}

          <Divider />

          <ListSubheader>Others</ListSubheader>

          <MenuItem onClick={() => handleMenuClose("promptHub")}>
            Prompt Hub
          </MenuItem>
          <MenuItem onClick={() => handleMenuClose("about")}>
            About
          </MenuItem>

          {/* <ListSubheader>Exploration</ListSubheader>
          <MenuItem onClick={() => handleMenuClose("tariffExplorer")}>
            Tariff Explorer
          </MenuItem>
          <MenuItem onClick={() => handleMenuClose("shipperExplorer")}>
            Shipper Explorer
          </MenuItem> */}
        </Menu>

        <Divider sx={{ width: "100%" }} />
      </Box>
      {dataCoverage && (
        <>
          <Tooltip title="Data Coverage" placement="right">
            <IconButton
              color={selected === "datacoverage" ? "primary" : "default"}
              onClick={() => {
                setSelected("datacoverage");
                onOpenDataCoverageDialog();
              }}
              sx={{
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "scale(1.1)",
                  backgroundColor: "rgba(103, 126, 234, 0.1)",
                },
              }}
            >
              <InfoIcon />
            </IconButton>
          </Tooltip>

          <Divider sx={{ width: "100%" }} />
        </>
      )}

      {user ? (
        <Tooltip title="Sign Out" placement="right">
          <IconButton
            color={selected === "signout" ? "primary" : "default"}
            onClick={() => {
              setSelected("signout");
              onSignout();
            }}
            sx={{
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "scale(1.1)",
                backgroundColor: "rgba(244, 67, 54, 0.1)",
              },
            }}
          >
            <ExitToAppIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Sign In" placement="right">
          <IconButton
            color={selected === "signin" ? "primary" : "default"}
            onClick={() => {
              setSelected("signin");
              onOpenLogin();
            }}
            sx={{
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "scale(1.1)",
                backgroundColor: "rgba(76, 175, 80, 0.1)",
              },
            }}
          >
            <LoginIcon />
          </IconButton>
        </Tooltip>
      )}
    </Grid>
  );
};

export default SidebarComp;
