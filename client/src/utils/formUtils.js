/**
 * Scrolls to the first element that has a validation error.
 * @param {Object} errors - The error object containing field names as keys.
 * @param {Array} fieldOrder - An ordered array of field IDs/names to check.
 */
export const scrollToFirstError = (errors, fieldOrder) => {
  const firstErrorKey = fieldOrder.find(key => errors[key]);
  if (firstErrorKey) {
    const element = document.getElementById(firstErrorKey);
    if (element) {
      // center ensures it's visible even if there's a sticky header/footer
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // If it's an input or textarea, attempt to focus it
      const input = element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' 
        ? element 
        : element.querySelector('input, textarea');
        
      if (input) {
        input.focus({ preventScroll: true });
      }
    }
  }
};

/**
 * Converts a string to Title Case.
 * @param {string} str - The string to convert.
 * @returns {string} - The title cased string.
 */
export const toTitleCase = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
};
