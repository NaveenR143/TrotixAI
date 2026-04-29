// ============================================================================
// Typography Configuration with Plus Jakarta Sans
// Primary Font: Plus Jakarta Sans
// Fallback Font: Inter, sans-serif
// ============================================================================

const fontFamily = "'Plus Jakarta Sans', 'Inter', sans-serif";

const typography = {
  fontFamily: fontFamily,
  
  // Headlines - Bold / ExtraBold
  h1: {
    fontFamily: fontFamily,
    fontWeight: 800,
    fontSize: '2.25rem',
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    color: '#111827',
  },
  h2: {
    fontFamily: fontFamily,
    fontWeight: 800,
    fontSize: '1.875rem',
    lineHeight: 1.3,
    letterSpacing: '-0.02em',
    color: '#111827',
  },
  h3: {
    fontFamily: fontFamily,
    fontWeight: 700,
    fontSize: '1.5rem',
    lineHeight: 1.4,
    letterSpacing: '-0.01em',
    color: '#111827',
  },
  
  // Subheadings - SemiBold
  h4: {
    fontFamily: fontFamily,
    fontWeight: 700,
    fontSize: '1.125rem',
    lineHeight: 1.5,
    color: '#111827',
  },
  h5: {
    fontFamily: fontFamily,
    fontWeight: 600,
    fontSize: '1rem',
    lineHeight: 1.5,
    color: '#111827',
  },
  h6: {
    fontFamily: fontFamily,
    fontWeight: 600,
    fontSize: '0.875rem',
    lineHeight: 1.5,
    color: '#111827',
  },
  
  // Body Text - Regular (400) or Medium (500)
  body1: {
    fontFamily: fontFamily,
    fontWeight: 400,
    fontSize: '1rem',
    lineHeight: 1.6,
    color: '#475569',
  },
  body2: {
    fontFamily: fontFamily,
    fontWeight: 400,
    fontSize: '0.875rem',
    lineHeight: 1.6,
    color: '#475569',
  },
  
  // Subtitles
  subtitle1: {
    fontFamily: fontFamily,
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.5,
    color: '#6B7280',
  },
  subtitle2: {
    fontFamily: fontFamily,
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.5,
    color: '#6B7280',
  },
  
  // Caption
  caption: {
    fontFamily: fontFamily,
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.5,
    color: '#6B7280',
  },
  
  // Button
  button: {
    fontFamily: fontFamily,
    textTransform: 'none',
    fontWeight: 700,
    fontSize: '0.875rem',
    letterSpacing: '0.01em',
  },
  
  // Overline
  overline: {
    fontFamily: fontFamily,
    fontWeight: 700,
    fontSize: '0.75rem',
    lineHeight: 1.5,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#6B7280',
  },
};

export default typography;
