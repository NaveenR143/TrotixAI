import React, { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

import {
  ThemeProvider, createTheme, CssBaseline, Box, Typography, Button, Chip,
  Tooltip, IconButton, useMediaQuery, Menu, MenuItem, ListItemIcon, Divider, Avatar
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import { Helmet } from "react-helmet-async";

import { useSelector, useDispatch } from "react-redux";
import { RESET_INITIAL_STATE, RESET } from "../../../redux/constants";
import { auth } from "../../../firebase";
import logo from "./rightnxt.png";
import { logout } from "../../../api/profileAPI";


// ── Premium design system ──────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0f172a', dark: '#020617', light: '#334155' },
    secondary: { main: '#6366f1' },
    success: { main: '#10b981' },
    error: { main: '#f43f5e' },
    warning: { main: '#f59e0b' },
    info: { main: '#0ea5e9' },
    background: { default: '#f8fafc', paper: '#ffffff' },
    text: { primary: '#0f172a', secondary: '#64748b' },
    divider: '#e2e8f0',
  },
  typography: {
    fontFamily: "'Open Sans', Verdana, sans-serif",
    h1: { fontWeight: 800, letterSpacing: '-0.03em' },
    h2: { fontWeight: 800, letterSpacing: '-0.02em' },
    h3: { fontWeight: 800, letterSpacing: '-0.02em' },
    h4: { fontWeight: 700, letterSpacing: '-0.01em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, letterSpacing: '0.01em' },
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0 1px 2px rgba(15,23,42,0.04)',
    '0 2px 4px rgba(15,23,42,0.06)',
    '0 4px 8px rgba(15,23,42,0.06)',
    '0 6px 16px rgba(15,23,42,0.08)',
    '0 8px 24px rgba(15,23,42,0.08)',
    '0 12px 32px rgba(15,23,42,0.10)',
    '0 16px 40px rgba(15,23,42,0.10)',
    '0 20px 48px rgba(15,23,42,0.12)',
    ...Array(16).fill('0 24px 64px rgba(15,23,42,0.14)'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 10,
          fontWeight: 600,
          transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          boxShadow: '0 1px 2px rgba(15,23,42,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            boxShadow: '0 4px 12px rgba(15,23,42,0.2)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderRadius: 10,
          transition: 'all 0.18s',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0f172a', borderWidth: 2 },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 500, fontSize: '0.75rem' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16, boxShadow: '0 2px 8px rgba(15,23,42,0.06)' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 16 },
      },
    },
  },
});

// ── Top navigation bar ─────────────────────────────────────────────────────────
const NavBar = ({ onLogoClick, membership, isLoggedIn, user, role, onLogout }) => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const { points } = useSelector((state) => state.UserReducer);

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleAction = (path) => {
    handleMenuClose();
    if (path) onLogoClick(path);
  };

  const handleSignOut = () => {
    handleMenuClose();
    onLogout();
  };

  const handleLogoClickNav = () => {
    // Role-aware navigation
    if (isLoggedIn && role) {
      if (role === 'Candidate') {
        onLogoClick('/dashboard');
      } else if (role === 'Recruiter') {
        onLogoClick('/recruiter-dashboard');
      } else {
        onLogoClick('/');
      }
    } else {
      onLogoClick('/');
    }
  };

  return (
    <Box
      component="nav"
      sx={{
        minHeight: 64,
        px: { xs: 1.5, sm: 2, md: 4 },
        py: { xs: 0.75, sm: 0 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e2e8f0',
        bgcolor: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <Box
        onClick={handleLogoClickNav}
        sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, cursor: 'pointer', userSelect: 'none', minWidth: 0 }}
      >
        <Box
          component="img"
          src={logo}
          alt="RightNext Logo"
          sx={{
            height: { xs: 30, sm: 39 },
            marginTop: '5px',
            width: 'auto',
            objectFit: 'contain',
            display: 'block'
          }}
        />
      </Box>

      {/* Centered OM Symbol */}
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: { xs: '8px', sm: '10px' },
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          userSelect: 'none',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <Typography
          component="span"
          aria-label="Spiritual Symbol"
          role="img"
          sx={{
            fontSize: { xs: '1rem', sm: '1.25rem' },
            fontWeight: 500,
            color: 'secondary.main',
            opacity: 0.75,
            lineHeight: 1,
            textShadow: '0 0 15px rgba(99, 102, 241, 0.25)',
            WebkitFontSmoothing: 'antialiased',
            transition: 'all 0.3s ease',
          }}
        >
          ॐ
        </Typography>
      </Box>

      {/* Nav actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.5 }, flexShrink: 0 }}>
        <Tooltip title="Home" arrow>
          <IconButton
            onClick={handleLogoClickNav}
            sx={{
              color: '#0f172a',
              bgcolor: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: { xs: '6px', sm: '8px' },
              '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e1' }
            }}
          >
            <HomeIcon sx={{ fontSize: { xs: 20, sm: 22 } }} />
          </IconButton>
        </Tooltip>

        {isLoggedIn && (
          <Tooltip title="View available credits" placement="top" arrow transitionDuration={300}>
            <Chip
              icon={<WorkspacePremiumIcon sx={{ fontSize: { xs: '16px !important', sm: '18px !important' }, color: 'inherit !important' }} />}
              label={
                points && points !== 0 ? (
                  <>
                    {points}
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, ml: 0.5 }}>
                      Credits
                    </Box>
                    <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' }, ml: 0.2 }}>
                      Cr
                    </Box>
                  </>
                ) : (
                  <>
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                      Free Tier
                    </Box>
                    <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                      Free
                    </Box>
                  </>
                )
              }
              onClick={() => onLogoClick('/membership')}
              aria-label="Available credits"
              sx={{
                bgcolor: '#faf5ff',
                color: '#6366f1',
                border: '1px solid #ddd6fe',
                fontWeight: 700,
                fontSize: { xs: '0.75rem', sm: '0.82rem' },
                cursor: 'pointer',
                height: { xs: 28, sm: 32 },
                px: { xs: 0.5, sm: 1 },
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: '#f3e8ff',
                  borderColor: '#6366f1',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.12)'
                },
                '& .MuiChip-label': { px: { xs: 0.75, sm: 1.5 } }
              }}
            />
          </Tooltip>
        )}

        {isLoggedIn ? (
          <>
            <IconButton
              onClick={handleMenuClick}
              size="small"
              sx={{
                ml: 1,
                p: 0.5,
                border: '1px solid #e2e8f0',
                bgcolor: '#fff',
                '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }
              }}
              aria-controls={open ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              <Avatar
                sx={{
                  width: { xs: 28, sm: 32 },
                  height: { xs: 28, sm: 32 },
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  bgcolor: 'primary.main',
                  color: '#fff'
                }}
              >
                {(user?.fullname || user?.displayname || 'U').charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={open}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                  mt: 1.5,
                  borderRadius: 2,
                  width: 200,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                  {user?.fullname || user?.displayname || 'User'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  {role || 'Candidate'}
                </Typography>
              </Box>
              <Divider sx={{ mb: 1 }} />
              <MenuItem onClick={() => handleAction('/profile')}>
                <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                View Profile
              </MenuItem>
              <Divider sx={{ my: 1 }} />
              <MenuItem onClick={handleSignOut} sx={{ color: 'error.main' }}>
                <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                Sign Out
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button
            size={isMobile ? "small" : "medium"}
            onClick={() => onLogoClick('/login')}
            sx={{
              color: '#fff',
              fontWeight: 700,
              px: { xs: 1.5, sm: 2.5 },
              py: { xs: 0.5, sm: 0.8 },
              border: '1px solid #0f172a',
              borderRadius: 2,
              bgcolor: '#0f172a',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              '&:hover': {
                bgcolor: '#1e293b',
                borderColor: '#1e293b',
                boxShadow: '0 4px 12px rgba(15,23,42,0.15)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            Sign In
          </Button>
        )}
      </Box>
    </Box>
  );
};

// ── Main layout ────────────────────────────────────────────────────────────────
const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Compute active state for NavBar
  const currentPath = location.pathname.replace(/^\/|\/$/g, '').split('/')[0];
  const activeState = currentPath === '' ? 'entry' : currentPath;
  const user = useSelector((state) => state.UserReducer);
  const { points, membership, mobile, role } = user;

  const isLoggedIn = !!(mobile || role);
  const handleLogoClick = (path = '/') => navigate(path);
  const handleLogout = async () => {
    // 1. Call backend logout to clear HttpOnly cookies
    try {
      await logout();
    } catch (err) {
      console.error("Backend logout failed:", err);
    }

    // 2. Clear all web storage (localStorage & sessionStorage)
    localStorage.clear();
    sessionStorage.clear();

    // 3. Clear all client-side cookies (best effort)
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // 4. Reset Redux store to initial state
    dispatch({ type: RESET_INITIAL_STATE });

    // 5. Sign out from Firebase
    await auth.signOut();

    // 6. Hard redirect to home page
    window.location.href = "/";
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Helmet>
        <title>RightNxt AI — AI Job Career Engine</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Helmet>

      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
        <NavBar
          activeState={activeState}
          onLogoClick={handleLogoClick}
          membership={membership}
          isLoggedIn={isLoggedIn}
          user={user}
          role={role}
          onLogout={handleLogout}
        />

        <Box sx={{ minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default MainLayout;