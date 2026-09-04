import { toTitleCase } from "../../../utils/stringUtils";

export { toTitleCase };

/**
 * Utility function to convert text to all capitals
 * @param {string} str - The string to convert
 * @returns {string} - The all capitals string
 */
export const toAllCapitals = (str) => {
  if (!str) return "";
  const stringValue = typeof str === "string" ? str : String(str);
  return stringValue.toUpperCase();
};

/**
 * Utility function to calculate experience duration in years-months format
 * @param {string} startDate - The start date
 * @param {string} endDate - The end date
 * @param {boolean} isCurrent - Whether the experience is current
 * @returns {string} - The formatted duration
 */
export const calculateExperienceDuration = (startDate, endDate, isCurrent) => {
  if (!startDate) return "";

  try {
    const start = new Date(startDate);
    if (isNaN(start.getTime())) return "";

    const end = isCurrent ? new Date() : (endDate ? new Date(endDate) : new Date());
    if (isNaN(end.getTime())) return "";

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    const parts = [];
    if (years > 0) parts.push(`${years} year${years > 1 ? "s" : ""}`);
    if (months > 0) parts.push(`${months} month${months > 1 ? "s" : ""}`);

    return parts.length > 0 ? parts.join(", ") : "Less than a month";
  } catch (error) {
    console.warn("Error calculating experience duration:", error);
    return "";
  }
};
