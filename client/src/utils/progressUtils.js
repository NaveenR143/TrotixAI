/**
 * Progress Tracking Utilities
 * Provides realistic, non-linear progress calculation for better UX
 */

/**
 * Generate realistic progress value based on elapsed time
 * Uses a sigmoid-like curve for smooth, natural-feeling progression
 * 
 * @param {number} elapsedSeconds - Time elapsed in seconds
 * @param {number} totalSeconds - Total expected duration (default: 50 seconds)
 * @returns {number} Progress value 0-100
 */
export const calculateRealisticProgress = (elapsedSeconds, totalSeconds = 50) => {
  // Normalize elapsed time to 0-1 range
  const normalized = Math.min(elapsedSeconds / totalSeconds, 1);

  // Use a sigmoid-like curve: starts slow, accelerates in middle, plateaus near end
  // This creates a more natural feel than linear progression
  const progress = 100 * (normalized ** 0.7 * (1 - 0.15 * Math.pow(normalized, 2)));

  return Math.min(Math.round(progress), 99); // Cap at 99, leave 100 for completion
};

/**
 * Get status message based on progress percentage
 * @param {number} progress - Current progress 0-100
 * @param {string} resumeStatus - Current resume processing status
 * @returns {string} Descriptive status message
 */
export const getStatusMessage = (progress, resumeStatus = null) => {
  if (resumeStatus === "completed") {
    return "Finalizing results…";
  }

  if (progress < 15) {
    return "Uploading resume…";
  } else if (progress < 35) {
    return "Extracting data from resume…";
  } else if (progress < 60) {
    return "Analyzing candidate profile…";
  } else if (progress < 85) {
    return "Validating details…";
  } else {
    return "Finalizing results…";
  }
};

/**
 * Get a friendly status icon/indicator based on progress
 * @param {number} progress - Current progress 0-100
 * @returns {object} Object with icon name and color
 */
export const getStatusIndicator = (progress) => {
  if (progress < 25) return { step: 1, label: "Parsing", emoji: "📤" };
  if (progress < 50) return { step: 2, label: "Extracting", emoji: "📋" };
  if (progress < 75) return { step: 3, label: "Analyzing", emoji: "🧠" };
  return { step: 4, label: "Validating", emoji: "✓" };
};

/**
 * Calculate time remaining
 * @param {number} elapsedSeconds - Time elapsed so far
 * @param {number} totalSeconds - Total expected duration
 * @returns {string} Formatted time remaining (e.g., "25 seconds")
 */
export const getTimeRemaining = (elapsedSeconds, totalSeconds = 50) => {
  const remaining = Math.max(0, totalSeconds - elapsedSeconds);
  if (remaining <= 0) return "Almost done...";
  if (remaining < 10) return `${remaining}s left`;
  if (remaining < 30) return `${Math.round(remaining / 5) * 5}s left`;
  return `~${Math.round(remaining / 10) * 10}s left`;
};

/**
 * Generate intermediate milestones for progress visualization
 * @returns {array} Array of milestone objects
 */
export const getProgressMilestones = () => {
  return [
    { progress: 20, label: "Parsing PDF", time: 10 },
    { progress: 45, label: "NLP Analysis", time: 22 },
    { progress: 75, label: "Vector Matching", time: 38 },
    { progress: 100, label: "Complete", time: 50 }
  ];
};

/**
 * Determine if processing should be considered stalled/failed
 * @param {number} elapsedSeconds - Time elapsed
 * @param {number} timeoutSeconds - Timeout threshold (default: 60)
 * @returns {boolean} True if timeout exceeded
 */
export const isProcessingTimeout = (elapsedSeconds, timeoutSeconds = 60) => {
  return elapsedSeconds >= timeoutSeconds;
};
