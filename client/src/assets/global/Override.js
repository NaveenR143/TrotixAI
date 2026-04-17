const components = {
  MuiCssBaseline: {
    styleOverrides: {
      '*': {
        boxSizing: 'border-box',
      },
      html: {
        height: '100%',
        width: '100%',
      },
      body: {
        height: '100%',
        margin: 0,
        padding: 0,
      },
      '#root': {
        height: '100%',
      },
      "*[dir='rtl'] .buyNowImg": {
        transform: 'scaleX(-1)',
      },

      '.buyNowImg': {
        position: 'absolute',
        right: '-44px',
        top: '-18px',
        width: '143px',
        height: '175px',
      },
      '.MuiCardHeader-action': {
        alignSelf: 'center !important',
      },
      '.scrollbar-container': {
        borderRight: '0 !important',
      },
      "*[dir='rtl'] .welcomebg:before": {
        backgroundPosition: 'top -24px left -9px !important',
      },
    },
  },
  MuiContainer: {
    styleOverrides: {
      root: {
        paddingLeft: '15px !important',
        paddingRight: '15px !important',
        // maxWidth: '1600px',
      },
    },
  },
  MuiSvgIcon: {
    styleOverrides: {
      root: {
        fontSize: '1.2rem'
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        boxShadow: 'none',
        fontSize: '12px',
        '&:hover': {
          boxShadow: 'none',
        },
        lineHeight: '1.5'
      },
    },
  },

  MuiListItem: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
      },
    },
  },

  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: '12px',
        padding: '14px',
        margin: '15px',
        boxShadow: '0px 7px 30px 0px rgba(90, 114, 123, 0.11)',
      },
    },
  },
  MuiIcon: {
    styleOverrides: {
      root: {
        fontSize: '1.3rem'
      },
    },
  },
  MuiListItemIcon: {
    styleOverrides: {
      root: {
        minWidth: '40px',
        fontSize: '1.3rem'
      },
    },
  },
  MuiListItemText: {
    styleOverrides: {
      secondary: {
        fontSize: '0.775rem'
      },
    },
  },
  MuiGridItem: {
    styleOverrides: {
      root: {
        paddingTop: '30px',
        paddingLeft: '30px !important',
      },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        backgroundColor: '#ecf0f2',
        borderRadius: '8px',
      },
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: {
        borderRadius: '0',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        fontWeight: '500',
        fontSize: '0.55rem',
      },
    },
  },
  MuiDialogTitle: {
    styleOverrides: {
      root: {
        backgroundColor: '#f1f1f1'
      },
    },
  },
  // MuiAccordionSummary: {
  //   styleOverrides: {
  //     content: {
  //       expanded: {
  //         marginTop: '10px',
  //         marginBottom: '10px'
  //       }
  //     },
  //   },
  // }

};

export default components;
