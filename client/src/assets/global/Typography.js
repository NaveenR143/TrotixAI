// ============================================================================
// Typography Configuration with Open Sans
// Primary Font: Open Sans
// Fallback Font: Verdana
// ============================================================================

const fontFamily = "'Open Sans', Verdana, sans-serif";

const typography = {
  fontFamily: fontFamily,
  
  // Headlines - Open Sans Bold (700) or ExtraBold (800)
  h1: {
    fontFamily: fontFamily,
    fontWeight: 800,
    fontSize: '1.875rem',
    lineHeight: 1.5,
    letterSpacing: '-0.5px',
  },
  h2: {
    fontFamily: fontFamily,
    fontWeight: 800,
    fontSize: '1.5rem',
    lineHeight: 1.5,
    letterSpacing: '-0.3px',
  },
  h3: {
    fontFamily: fontFamily,
    fontWeight: 700,
    fontSize: '1.25rem',
    lineHeight: 1.5,
    letterSpacing: '-0.2px',
  },
  
  // Subheadings - Open Sans SemiBold (600) or Light (300)
  h4: {
    fontFamily: fontFamily,
    fontWeight: 600,
    fontSize: '1rem',
    lineHeight: 1.5,
  },
  h5: {
    fontFamily: fontFamily,
    fontWeight: 600,
    fontSize: '0.875rem',
    lineHeight: 1.5,
  },
  h6: {
    fontFamily: fontFamily,
    fontWeight: 300,
    fontSize: '0.75rem',
    lineHeight: 1.5,
  },
  
  // Body Text - Open Sans Regular (400)
  body1: {
    fontFamily: fontFamily,
    fontWeight: 400,
    fontSize: '0.875rem',
    lineHeight: 1.6,
  },
  body2: {
    fontFamily: fontFamily,
    fontWeight: 400,
    fontSize: '0.8125rem',
    lineHeight: 1.6,
  },
  
  // Subtitles
  subtitle1: {
    fontFamily: fontFamily,
    fontSize: '0.875rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  subtitle2: {
    fontFamily: fontFamily,
    fontSize: '0.75rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  
  // Caption
  caption: {
    fontFamily: fontFamily,
    fontSize: '0.6875rem',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  
  // Button
  button: {
    fontFamily: fontFamily,
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.875rem',
  },
  
  // Overline
  overline: {
    fontFamily: fontFamily,
    fontWeight: 700,
    fontSize: '0.6875rem',
    lineHeight: 1.5,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
};

export default typography;
