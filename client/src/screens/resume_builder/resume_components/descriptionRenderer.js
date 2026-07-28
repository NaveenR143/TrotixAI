import React from "react";
import { sanitizeHtml } from "../../../utils/htmlSanitizer";

/**
 * A shared component to render experience/project descriptions in resume templates.
 * If the description contains HTML elements, it renders the sanitized HTML.
 * Otherwise, it splits the text by newlines and renders a standard bulleted list.
 */
export default function DescriptionRenderer({ description, className = "" }) {
  if (!description) return null;

  // Helper to replace word-connecting hyphens with non-breaking hyphens (\u2011)
  // to prevent browsers from breaking hyphenated words across lines
  const formatDescription = (text) => {
    if (!text) return "";
    // If it contains HTML tags, replace hyphens only in text parts to avoid breaking tags/attributes
    if (/<[a-z][\s\S]*>/i.test(text)) {
      return text.split(/(<[^>]*>)/g).map((part) => {
        if (part.startsWith("<")) return part;
        return part.replace(/(\w)-(\w)/g, "$1\u2011$2");
      }).join("");
    }
    return text.replace(/(\w)-(\w)/g, "$1\u2011$2");
  };

  const processedDescription = formatDescription(description);

  // Regex to check for HTML tags
  const hasHtml = /<[a-z][\s\S]*>/i.test(processedDescription);

  // Dynamic style override to ensure child elements (p, li, etc.) inside the templates scale up slightly
  const styleTag = className ? (
    <style>{`
      .${className} p,
      .${className} li,
      .${className} span,
      .${className} div {
        font-size: .8em !important;
      }
    `}</style>
  ) : null;

  if (hasHtml) {
    // const sanitized = sanitizeHtml(processedDescription);

    const sanitized = sanitizeHtml(processedDescription).replace(/&nbsp;/g, " ");

    return (
      <>
        {styleTag}
        <div
          className={className}
          dangerouslySetInnerHTML={{ __html: sanitized }}
          style={{
            wordBreak: "normal",
            overflowWrap: "break-word",
            whiteSpace: "normal",
            fontSize: "1.08em",
          }}
        />
      </>
    );
  }

  // Fallback: split by newlines and render bullets
  return (
    <>
      {styleTag}
      <ul className={className} style={{ fontSize: "1.08em" }}>
        {processedDescription.split("\n").map((point, idx) => (
          point.trim() && (
            <li key={idx} style={{ wordBreak: "keep-all", overflowWrap: "normal", fontSize: "1.08em" }}>
              {point.replace(/^[•\-\*]\s?/, "")}
            </li>
          )
        ))}
      </ul>
    </>
  );
}
