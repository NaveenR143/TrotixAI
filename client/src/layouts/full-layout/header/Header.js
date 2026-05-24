import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  Menu,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import FeatherIcon from "feather-icons-react";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { clear } from "redux-localstorage-simple";

// Dropdown Component

import CustomTextField from "../../../components/forms/custom-elements/CustomTextField";
// import BreadcrumbRouterComp from "../breadcrumb/BreadcrumbRouterComp";
import LogoIcon from "../logo/LogoIcon";
import ProfileDropdown from "./ProfileDropdown";
// import userimg from '../../../assets/images/users/user2.jpg';

import { useDispatch } from "react-redux";
import { clearAllStoreData } from "../../../redux/Action";

const Header = ({ sx, customClass, toggleSidebar, toggleMobileSidebar }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const mdUp = useMediaQuery((theme) => theme.breakpoints.up("md"));
  const dispatch = useDispatch();

  const fullname = useSelector((state) => state.UserReducer.fullname);

  const handleClick = (event) => setAnchorEl(event.currentTarget);

  const handleClose = () => setAnchorEl(null);
  // 2
  const [anchorEl2, setAnchorEl2] = React.useState(null);

  const handleClick2 = (event) => setAnchorEl2(event.currentTarget);

  const handleClose2 = () => setAnchorEl2(null);

  // 4
  const [anchorEl4, setAnchorEl4] = React.useState(null);

  const handleClick4 = (event) => setAnchorEl4(event.currentTarget);

  const handleClose4 = () => setAnchorEl4(null);

  // drawer
  const [showDrawer, setShowDrawer] = useState(false);

  const handleDrawerClose = () => setShowDrawer(false);

  // drawer top
  const [showDrawer2, setShowDrawer2] = useState(false);

  const handleDrawerClose2 = () => setShowDrawer2(false);

  const fnClearStorage = () => {
    dispatch(clearAllStoreData());
  };

  const fnDeleteAllDbs = () => {
    fnClearStorage();
  };

  const logout = () => {
    fnDeleteAllDbs();

    window.location.href = "/";
  };

  return (
    <AppBar sx={sx} elevation={0} className={customClass}>
      <Toolbar>
        {mdUp ? <LogoIcon /> : ""}

        {/* <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={toggleSidebar}
          size="small"
          sx={{
            display: {
              lg: 'flex',
              xs: 'none',
            },
          }}
        >
          <FeatherIcon icon="menu" />
        </IconButton>

        <IconButton
          size="medium"
          color="inherit"
          aria-label="menu"
          onClick={toggleMobileSidebar}
          sx={{
            display: {
              lg: 'none',
              xs: 'flex',
            },
          }}
        >
          <FeatherIcon icon="menu" width="18" height="18" />
        </IconButton> */}
        {/* <BreadcrumbRouterComp></BreadcrumbRouterComp> */}
        <Drawer
          anchor="top"
          open={showDrawer2}
          onClose={() => setShowDrawer2(false)}
          sx={{
            "& .MuiDrawer-paper": {
              padding: "15px 30px",
            },
          }}
        >
          <Box display="flex" alignItems="center">
            <CustomTextField
              id="tb-search"
              size="small"
              placeholder="Search here"
              fullWidth
              inputProps={{ "aria-label": "Search here" }}
            />
            <Box
              sx={{
                ml: "auto",
              }}
            >
              <IconButton
                color="inherit"
                sx={{
                  color: (theme) => theme.palette.grey.A200,
                }}
                onClick={handleDrawerClose2}
              >
                <FeatherIcon icon="x-circle" />
              </IconButton>
            </Box>
          </Box>
        </Drawer>
        {/* ------------ End Menu icon ------------- */}

        <Box flexGrow={1} />
        <span style={{ color: "#9c3c3f" }}>EnergyConnexions</span>
        <Box
          sx={{
            width: "1px",
            backgroundColor: "rgba(0,0,0,0.1)",
            height: "25px",
            ml: 1,
            mr: 1,
          }}
        />
        {/* ------------------------------------------- */}
        {/* Profile Dropdown */}
        {/* ------------------------------------------- */}
        <Button
          aria-label="menu"
          color="inherit"
          aria-controls="profile-menu"
          aria-haspopup="true"
          onClick={handleClick4}
        >
          <Box display="flex" alignItems="center">
            <Box
              sx={{
                display: {
                  xs: "none",
                  sm: "flex",
                },
                alignItems: "center",
              }}
            >
              <Typography
                color="textSecondary"
                variant="h5"
                fontWeight="400"
                sx={{ ml: 1 }}
              >
                Hi,
              </Typography>
              <Typography
                variant="h5"
                fontWeight="700"
                sx={{
                  ml: 1,
                }}
              >
                {fullname}
              </Typography>
              <FeatherIcon icon="chevron-down" width="18" height="18" />
            </Box>
          </Box>
        </Button>
        <Menu
          id="profile-menu"
          anchorEl={anchorEl4}
          keepMounted
          open={Boolean(anchorEl4)}
          onClose={handleClose4}
          sx={{
            "& .MuiMenu-paper": {
              width: "385px",
              right: 0,
              top: "70px !important",
            },
            "& .MuiList-padding": {
              p: "30px",
            },
          }}
        >
          <Box
            sx={{
              mb: 1,
            }}
          >
            <Box display="flex" alignItems="center">
              <Typography variant="h4" fontWeight="500">
                User Profile
              </Typography>
            </Box>
          </Box>

          <ProfileDropdown />
          <Link
            style={{
              textDecoration: "none",
            }}
          // to="/"
          >
            <Button
              sx={{
                mt: 2,
                display: "block",
                width: "100%",
              }}
              variant="contained"
              color="primary"
              onClick={logout}
            >
              Logout
            </Button>
          </Link>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

Header.propTypes = {
  sx: PropTypes.object,
  customClass: PropTypes.string,
  toggleSidebar: PropTypes.func,
  toggleMobileSidebar: PropTypes.func,
};

export default Header;
