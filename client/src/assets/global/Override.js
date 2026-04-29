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
        borderRadius: '12px',
        fontWeight: 700,
        padding: '10px 24px',
        '&:hover': {
          boxShadow: 'none',
        },
      },
    },
  },

  MuiListItem: {
    styleOverrides: {
      root: {
        borderRadius: '12px',
      },
    },
  },

  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        border: '1px solid #E5E7EB',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        fontWeight: '600',
        borderRadius: '10px',
        fontSize: '0.8125rem',
      },
    },
  },
  MuiDialogTitle: {
    styleOverrides: {
      root: {
        backgroundColor: '#FFFFFF',
        fontWeight: 800,
        color: '#111827',
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
