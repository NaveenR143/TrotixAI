import React from "react";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    }
  }
  return dateStr;
};

export default function PersonalDetailsGrid({ user, labelColor = "#64748b", valueColor = "#0f172a" }) {
  if (!user) return null;

  const { date_of_birth, gender, maritalStatus, location, showPersonalDetails } = user;
  
  if (showPersonalDetails === false) return null;
  
  const items = [
    { label: "Date of Birth", value: formatDate(date_of_birth) },
    { label: "Gender", value: gender },
    { label: "Marital Status", value: maritalStatus },
    { label: "Location", value: location },
  ].filter(item => item.value);

  if (items.length === 0) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "8px 24px",
        marginTop: "8px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {items.map((item, idx) => (
        <div key={idx} style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: "9px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: labelColor,
              fontWeight: "600",
              marginBottom: "2px",
            }}
          >
            {item.label}
          </span>
          <span style={{ fontSize: "11px", color: valueColor, fontWeight: "500" }}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
