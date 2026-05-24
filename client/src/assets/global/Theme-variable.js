import _ from 'lodash';
import { createTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import typography from './Typography';
import components from './Override';
import shadows from './Shadows';

// ##############################import {
import {
  BLUE_THEME,
  GREEN_THEME,
  RED_THEME,
  BLACK_THEME,
  PURPLE_THEME,
  INDIGO_THEME,
  ORANGE_THEME,
} from '../../redux/constants';
// // // Global Variables
// ##############################

const SidebarWidth = 220;
const TopbarHeight = 40;

const baseTheme = {

  direction: 'ltr',
  palette: {
    primary: {
      main: '#2563EB',
      light: '#eff6ff',
      dark: '#1e40af',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7C3AED',
      light: '#f5f3ff',
      dark: '#5b21b6',
      contrastText: '#ffffff',
    },

    success: {
      main: '#10b981',
      light: '#ecfdf5',
      dark: '#047857',
      contrastText: '#ffffff',
    },
    danger: {
      main: '#ef4444',
      light: '#fef2f2',
    },
    info: {
      main: '#0ea5e9',
      light: '#e0f2fe',
    },
    error: {
      main: '#ef4444',
      light: '#fef2f2',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fffbeb',
      dark: '#b45309',
      contrastText: '#ffffff',
    },
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      muted: '#475569',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    grey: {
      A100: '#f8fafc',
      A200: '#f1f5f9',
      A400: '#e2e8f0',
      A700: '#cbd5e1',
    },
    divider: '#E5E7EB',
  },

  shape: {
    borderRadius: 16,
  },
  mixins: {
    toolbar: {
      color: '#949db2',
      '@media(min-width:1280px)': {
        minHeight: TopbarHeight,
        padding: '0 30px',
      },
      '@media(max-width:1280px)': {
        minHeight: '40px',
      },
    },
  },
  status: {
    danger: '#e53e3e',
  },
  components,
  typography,
  shadows,
};

const themesOptions = [
  {
    name: BLUE_THEME,
    palette: {
      primary: {
        main: '#2563eb',
        light: '#e6f4ff',
        dark: '#1682d4',
      },
      secondary: {
        main: '#1e4db7',
        light: '#ddebff',
        dark: '#173f98',
      },
    },
  },
  {
    name: GREEN_THEME,
    palette: {
      primary: {
        main: '#00cec3',
        light: '#d7f8f6',
        dark: '#02b3a9',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#066a73',
      },
    },
  },
  {
    name: PURPLE_THEME,
    palette: {
      primary: {
        main: '#7352ff',
        light: '#e5e0fa',
        dark: '#5739d6',
      },
      secondary: {
        main: '#402e8d',
      },
    },
  },
  {
    name: INDIGO_THEME,
    palette: {
      primary: {
        main: '#1e4db7',
        light: '#e6f4ff',
        dark: '#0c399e',
      },
      secondary: {
        main: '#11397b',
      },
    },
  },
  {
    name: ORANGE_THEME,
    palette: {
      primary: {
        main: '#03c9d7',
        light: '#e5fafb',
        dark: '#05b2bd',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#fb9678',
        light: '#fcf1ed',
        dark: '#e67e5f',
        contrastText: '#ffffff',
      },
    },
  },
  {
    name: RED_THEME,
    palette: {
      primary: {
        main: '#ff5c8e',
        light: '#fce6ed',
        dark: '#d43653',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#5e244d',
      },
    },
  },
  {
    name: BLACK_THEME,
    palette: {
      primary: {
        main: '#1c2025',
      },
    },
  },
];

export const BuildTheme = (config = {}) => {
  let themeOptions = themesOptions.find((theme) => theme.name === config.theme);
  const customizer = useSelector((state) => state.CustomizerReducer);

  const baseMode = {
    palette: {
      mode: customizer.activeMode,
      background: {
        default: customizer.activeMode === 'dark' ? '#20232a' : '#fafbfb',
        dark: customizer.activeMode === 'dark' ? '#1c2025' : '#ffffff',
        paper: customizer.activeMode === 'dark' ? '#282C34' : '#ffffff',
      },
      text: {
        primary: customizer.activeMode === 'dark' ? '#f1f5f9' : '#0f172a',
        secondary: customizer.activeMode === 'dark' ? '#cbd5e1' : '#64748b',
      },
    },
  };
  if (!themeOptions) {
    console.warn(new Error(`The theme ${config.theme} is not valid`));
    [themeOptions] = themesOptions;
  }

  const theme = createTheme(
    _.merge({}, baseTheme, baseMode, themeOptions, {
      direction: config.direction,
    }),
  );

  // theme.typography = {
  //   fontSize: '0.8rem'
  // }

  return theme;
};

export { TopbarHeight, SidebarWidth, baseTheme };
