import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  ThemeProvider, createTheme, CssBaseline, Box, Typography, Button, Chip, 
  Tooltip, IconButton, useMediaQuery, Menu, MenuItem, ListItemIcon, Divider, Avatar
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import { Helmet } from "react-helmet-async";
import { useDispatch } from "react-redux";
import { RESET_INITIAL_STATE } from "../../../redux/constants";

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
    fontFamily: '"Plus Jakarta Sans", "DM Sans", system-ui, sans-serif',
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
const NavBar = ({ activeState, onLogoClick, points, mobile, onLogout }) => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

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
    // Navigate to dashboard if logged in, otherwise to entry screen
    if (mobile) {
      onLogoClick('/dashboard');
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
          sx={{
            width: { xs: 30, sm: 34 }, height: { xs: 30, sm: 34 }, borderRadius: '10px',
            background: 'linear-gradient(135deg, #0f172a, #334155)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: { xs: '0.76rem', sm: '0.85rem' }, letterSpacing: '-0.03em' }}>T</Typography>
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: { xs: '0.95rem', sm: '1.1rem' }, letterSpacing: '-0.03em', color: '#0f172a', whiteSpace: 'nowrap' }}>
          Trotix<Box component="span" sx={{ color: '#6366f1' }}>AI</Box>
        </Typography>
        <Chip
          label="BETA"
          size="small"
          sx={{ display: { xs: 'none', sm: 'inline-flex' }, height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: '#f0f9ff', color: '#0ea5e9', border: '1px solid #bae6fd', letterSpacing: '0.05em' }}
        />
      </Box>

      {/* Nav actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.5 }, flexShrink: 0 }}>
        <Tooltip title="Click to add credits" placement="top" arrow transitionDuration={300}>
          {isMobile ? (
            <IconButton 
              color="secondary" 
              onClick={() => onLogoClick('/credits')}
              aria-label="Add credits"
              sx={{ 
                bgcolor: '#faf5ff', 
                border: '1px solid #ddd6fe',
                padding: '6px',
                '&:hover': { bgcolor: '#f3e8ff' }
              }}
            >
              <AccountBalanceWalletIcon sx={{ fontSize: 20 }} />
            </IconButton>
          ) : (
            <Chip
              icon={<AccountBalanceWalletIcon sx={{ fontSize: '18px !important', color: 'inherit !important' }} />}
              label={`${points || 100} Credits`}
              onClick={() => onLogoClick('/credits')}
              aria-label="Add credits"
              sx={{ 
                bgcolor: '#faf5ff', 
                color: '#6366f1', 
                border: '1px solid #ddd6fe', 
                fontWeight: 700, 
                fontSize: '0.82rem',
                cursor: 'pointer', 
                px: 1,
                py: 2,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': { 
                  bgcolor: '#f3e8ff', 
                  borderColor: '#6366f1',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.12)'
                },
                '& .MuiChip-label': { px: 1.5 }
              }}
            />
          )}
        </Tooltip>
        
        {mobile ? (
          <>
            <IconButton
              onClick={handleMenuClick}
              size="small"
              sx={{ 
                ml: 1, 
                border: '1px solid #e2e8f0', 
                bgcolor: '#fff',
                '&:hover': { bgcolor: '#f8fafc' }
              }}
              aria-controls={open ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              <MenuIcon sx={{ fontSize: 20, color: '#0f172a' }} />
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
                  width: 180,
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
              <MenuItem onClick={() => handleAction('/profile')}>
                <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                View Profile
              </MenuItem>
              <MenuItem onClick={() => handleAction('/')}>
                <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                Settings
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
            size="small"
            onClick={() => onLogoClick('/login')}
            sx={{ color: '#6366f1', fontWeight: 700, px: 2.5, py: 0.8, border: '1px solid #ddd6fe', borderRadius: 2, bgcolor: '#faf5ff', '&:hover': { bgcolor: '#f3e8ff', borderColor: '#6366f1' } }}
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
  const { points, mobile } = useSelector((state) => state.UserReducer);

  const handleLogoClick = (path = '/') => navigate(path);
  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    localStorage.removeItem('mobileNumber');
    
    dispatch({ type: RESET_INITIAL_STATE });
    navigate('/login');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Helmet>
        <title>TrotixAI — AI Job Matching</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Helmet>

      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
        <NavBar 
          activeState={activeState} 
          onLogoClick={handleLogoClick} 
          points={points} 
          mobile={mobile}
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