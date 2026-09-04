/**
 * Converts a string or value into Title Case format.
 * Replaces underscores with spaces and capitalizes the first letter of each word.
 *
 * @param {any} str - The string or value to convert.
 * @returns {string} - The title-cased string.
 */
export const toTitleCase = (str) => {
  if (!str) return "";
  const stringValue = typeof str === "string" ? str : String(str);
  return stringValue
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
