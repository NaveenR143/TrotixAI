export const getSpacingStyle = (spacingConfig, blockName) => {
  if (!spacingConfig) return {};
  const value = spacingConfig[blockName];
  if (value === undefined || value === null) return {};
  const spacingPx = parseInt(value, 10) * 5;
  return { marginTop: `${spacingPx}px` };
};
