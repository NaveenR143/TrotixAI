import React from "react";
import { sanitizeHtml } from "../../../utils/htmlSanitizer";

/**
 * A shared component to render experience/project descriptions in resume templates.
 * If the description contains HTML elements, it renders the sanitized HTML.
 * Otherwise, it splits the text by newlines and renders a standard bulleted list.
 */
export default function DescriptionRenderer({ description, className = "" }) {
  if (!description) return null;

  // Regex to check for HTML tags
  const hasHtml = /<[a-z][\s\S]*>/i.test(description);

  if (hasHtml) {
    const sanitized = sanitizeHtml(description);
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: sanitized }}
        style={{
          wordBreak: "break-word",
          overflowWrap: "anywhere",
        }}
      />
    );
  }

  // Fallback: split by newlines and render bullets
  return (
    <ul className={className}>
      {description.split("\n").map((point, idx) => (
        point.trim() && (
          <li key={idx} style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
            {point.replace(/^[•\-\*]\s?/, "")}
          </li>
        )
      ))}
    </ul>
  );
}
