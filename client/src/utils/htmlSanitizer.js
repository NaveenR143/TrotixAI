import DOMPurify from "dompurify";

/**
 * Sanitizes HTML content using DOMPurify with a strict tag/attribute whitelist.
 * @param {string} html - Raw HTML content
 * @returns {string} - Sanitized HTML content
 */
export const sanitizeHtml = (html) => {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "br", "strong", "em", "u",
      "ol", "ul", "li", "a", "span", "div",
      "b", "i"
    ],
    ALLOWED_ATTR: ["href", "target", "rel"]
  });
};
