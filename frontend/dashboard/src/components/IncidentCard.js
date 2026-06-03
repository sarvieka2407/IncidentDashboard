import React from "react";

const SEVERITY_CONFIG = {
  Critical: { color: "#ff3333", label: "Critical" },
  High: { color: "#ff9500", label: "High" },
  Medium: { color: "#ffd600", label: "Medium" },
  Low: { color: "#34c759", label: "Low" },
  Unknown: { color: "#878787", label: "" },
};

const STATUS_CONFIG = {
  "Resolved": {
    color: "#22c55e",
    background: "rgba(34,197,94,0.12)"
  },

  "Scheduled Maintenance": {
    color: "#f59e0b",
    background: "rgba(245,158,11,0.12)"
  },

  "Work in Progress": {
    color: "#3b82f6",
    background: "rgba(59,130,246,0.12)"
  }
};

function stripHtml(html) {
  if (!html) return "";

  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function getRelativeTime(dateStr) {
  if (!dateStr) return "Unknown";

  const date = new Date(dateStr);
  const now = new Date();

  const mins = Math.floor((now - date) / 60000);

  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);

  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
}

function IncidentCard({ incident, onClick }) {
const status = incident.status || "";

const config =
  STATUS_CONFIG[status];

  const summary = stripHtml(
    incident.summary ||
    incident.description ||
    "No summary available."
  );

  return (
    <div
      className="dashboard-incident-card"
      onClick={onClick}
      style={{
        borderLeft: `3px solid #8a8a8a`
      }}
    >
<div className="incident-header">

  <div className="incident-left">

    <div className="incident-company">
      {incident.company.toUpperCase()}
    </div>

    <div
  className="incident-status-pill"
  style={{
    color: config.color,
    background: config.background,
    border: `1px solid ${config.color}33`
  }}
>
  {status}
</div>

    {config.label && (
      <div
        className="incident-severity-badge"
        style={{
          backgroundColor: `${config.color}22`,
          color: config.color,
          border: `1px solid ${config.color}44`
        }}
      >
        {config.label}
      </div>
    )}

  </div>

  <span className="incident-time-top">
    {getRelativeTime(incident.published)}
  </span>

</div>

      <h3 className="incident-title">
        {incident.title}
      </h3>

      <div className="incident-summary-box">
        <div className="summary-label">
          AI Summary
        </div>

        <p className="incident-summary-text">
          {summary.length > 200 ? summary.substring(0, 250) + "..." : summary}
        </p>
      </div>

      <div className="incident-footer">

        {incident.status && (
          <span className="incident-status">
            {incident.status}
          </span>
        )}

 
      </div>
    </div>
  );
}

export default IncidentCard;