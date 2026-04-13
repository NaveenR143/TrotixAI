/**
 * Typography Constants
 * 
 * Standardized typography styles using Open Sans font
 * Use these constants for consistent styling across components
 * 
 * Font Stack: 'Open Sans', Verdana, sans-serif
 * Weights: 300 (Light), 400 (Regular), 600 (SemiBold), 700 (Bold), 800 (ExtraBold)
 */

const fontFamily = "'Open Sans', Verdana, sans-serif";

// ============================================================================
// HEADLINE STYLES (H1-H3) - Open Sans Bold or ExtraBold
// ============================================================================

export const headingStyles = {
  // H1 - Extra Large, ExtraBold
  h1: {
    fontFamily: fontFamily,
    fontWeight: 800,
    fontSize: '1.875rem',
    lineHeight: 1.5,
    letterSpacing: '-0.5px',
  },
  
  // H2 - Large, Bold
  h2: {
    fontFamily: fontFamily,
    fontWeight: 800,
    fontSize: '1.5rem',
    lineHeight: 1.5,
    letterSpacing: '-0.3px',
  },
  
  // H3 - Medium, Bold
  h3: {
    fontFamily: fontFamily,
    fontWeight: 700,
    fontSize: '1.25rem',
    lineHeight: 1.5,
    letterSpacing: '-0.2px',
  },
};

// ============================================================================
// SUBHEADING STYLES (H4-H6) - Open Sans SemiBold or Light
// ============================================================================

export const subheadingStyles = {
  // H4 - Standard, SemiBold
  h4: {
    fontFamily: fontFamily,
    fontWeight: 600,
    fontSize: '1rem',
    lineHeight: 1.5,
  },
  
  // H5 - Small, SemiBold
  h5: {
    fontFamily: fontFamily,
    fontWeight: 600,
    fontSize: '0.875rem',
    lineHeight: 1.5,
  },
  
  // H6 - Extra Small, Light
  h6: {
    fontFamily: fontFamily,
    fontWeight: 300,
    fontSize: '0.75rem',
    lineHeight: 1.5,
  },
};

// ============================================================================
// BODY TEXT STYLES - Open Sans Regular
// ============================================================================

export const bodyStyles = {
  // Body Large
  bodyLarge: {
    fontFamily: fontFamily,
    fontWeight: 400,
    fontSize: '0.875rem',
    lineHeight: 1.6,
  },
  
  // Body Regular
  bodyRegular: {
    fontFamily: fontFamily,
    fontWeight: 400,
    fontSize: '0.8125rem',
    lineHeight: 1.6,
  },
  
  // Body Small
  bodySmall: {
    fontFamily: fontFamily,
    fontWeight: 400,
    fontSize: '0.75rem',
    lineHeight: 1.6,
  },
};

// ============================================================================
// COMPONENT-SPECIFIC TYPOGRAPHY
// ============================================================================

export const componentStyles = {
  // Button Text - SemiBold
  button: {
    fontFamily: fontFamily,
    fontWeight: 600,
    fontSize: '0.875rem',
    textTransform: 'none',
  },
  
  // Label Text - Regular
  label: {
    fontFamily: fontFamily,
    fontWeight: 400,
    fontSize: '0.8125rem',
  },
  
  // Form Input - Regular
  input: {
    fontFamily: fontFamily,
    fontWeight: 400,
    fontSize: '0.875rem',
  },
  
  // Navigation - SemiBold
  navigation: {
    fontFamily: fontFamily,
    fontWeight: 600,
    fontSize: '0.875rem',
  },
  
  // Card Title - Bold
  cardTitle: {
    fontFamily: fontFamily,
    fontWeight: 700,
    fontSize: '1rem',
  },
  
  // Card Subtitle - SemiBold
  cardSubtitle: {
    fontFamily: fontFamily,
    fontWeight: 600,
    fontSize: '0.8125rem',
  },
  
  // Caption - Regular, Small
  caption: {
    fontFamily: fontFamily,
    fontWeight: 400,
    fontSize: '0.6875rem',
  },
  
  // Overline - Bold, Uppercase
  overline: {
    fontFamily: fontFamily,
    fontWeight: 700,
    fontSize: '0.6875rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
};

// ============================================================================
// UTILITY FUNCTION - Get Typography Style by Variant
// ============================================================================

export const getTypographyStyle = (variant) => {
  const allStyles = {
    ...headingStyles,
    ...subheadingStyles,
    ...bodyStyles,
    ...componentStyles,
  };
  
  return allStyles[variant] || bodyStyles.bodyRegular;
};

// ============================================================================
// FONT STACK
// ============================================================================

export const FONT_FAMILY = fontFamily;
export const FONT_STACK = {
  primary: "'Open Sans'",
  fallback: 'Verdana, sans-serif',
  full: fontFamily,
};

// ============================================================================
// FONT WEIGHTS
// ============================================================================

export const FONT_WEIGHTS = {
  light: 300,
  regular: 400,
  semibold: 600,
  bold: 700,
  extrabold: 800,
};

export default {
  headingStyles,
  subheadingStyles,
  bodyStyles,
  componentStyles,
  FONT_FAMILY,
  FONT_STACK,
  FONT_WEIGHTS,
  getTypographyStyle,
};
