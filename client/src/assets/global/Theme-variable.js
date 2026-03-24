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
      main: '#2563eb',
      light: '#e6f4ff',
      dark: '#1682d4',
    },
    secondary: {
      main: '#1e4db7',
      light: '#ddebff',
      dark: '#173f98',
    },

    success: {
      main: '#00c292',
      light: '#ebfaf2',
      dark: '#00964b',
      contrastText: '#ffffff',
    },
    danger: {
      main: '#e46a76',
      light: '#fdf3f5',
    },
    info: {
      main: '#0bb2fb',
      light: '#a7e3f4',
    },
    fieldinfo: {
      main: '##c5c3c3',
      light: '#a7e3f4',
    },
    error: {
      main: '#e46a76',
      light: '#fdf3f5',
      dark: '#e45a68',
    },
    warning: {
      main: '#fec90f',
      light: '#fff4e5',
      dark: '#dcb014',
      contrastText: '#ffffff',
    },
    text: {
      secondary: '#374151',
      danger: '#fc4b6c',
    },
    grey: {
      A100: '#ecf0f2',
      A200: '#99abb4',
      A400: '#767e89',
      A700: '#e6f4ff',
    },
    action: {
      disabledBackground: 'rgba(73,82,88,0.12)',
      hoverOpacity: 0.02,
      hover: 'rgba(0, 0, 0, 0.03)',
    },
    analysis: {
      main: '#274472',
      light: '#d0dff7',
      dark: '#041837',
      contrastText: '#ffffff',
    },
    mapsnapshot: {
      main: '#41729F',
      light: '#B0CAE2',
      dark: '#093862',
      contrastText: '#ffffff',
    },
    maplayers: {
      main: '#5885AF',
      light: '#C1DCF5',
      dark: '#13518B',
      contrastText: '#ffffff',
    },
    addtosearchstack: {
      main: '#336fa6',
      light: '#9fb4ed',
      dark: '#013769',
      contrastText: '#ffffff',
    },
    searchstacksearch: {
      main: '#0074B7',
      light: '#48B2EF',
      dark: '#13518B',
      contrastText: '#ffffff',
    },
    filteredselected: {
      main: '#1dbc60',
      light: '#4cea8e',
      dark: '#009c41',
      contrastText: '#ffffff',
    },
    addons: {
      main: '#DBE1E6',
      light: '#B7D7F4',
    },
    cardbar: {
      main: '#ffffff',
      antborder: '#f0f0f0',
      antheader: '#edeeef',
    },
  },

  shape: {
    borderRadius: 5,
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
        primary: customizer.activeMode === 'dark' ? '#e6e5e8' : '#374151',
        secondary: customizer.activeMode === 'dark' ? '#adb0bb' : '#374151',
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
