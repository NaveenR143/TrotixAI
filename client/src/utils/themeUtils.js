// utils/themeUtils.js
import { keyframes } from "@mui/system";

export const pulse = keyframes`
  0%   { transform: scale(1);   opacity: 1; }
  50%  { transform: scale(1.15); opacity: 0.75; }
  100% { transform: scale(1);   opacity: 1; }
`;

export const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;

export const getMatchColor = (score) => {
  if (score >= 90) return { main: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' };
  if (score >= 75) return { main: '#f59e0b', bg: '#fffbeb', border: '#fde68a' };
  return { main: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0' };
};

export const getWorkModeIcon = (mode) => {
  if (mode === 'Remote') return '🌐';
  if (mode === 'Hybrid') return '🏙';
  return '🏢';
};
