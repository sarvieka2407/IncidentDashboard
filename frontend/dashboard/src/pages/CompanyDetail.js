import React, { useState } from "react";
import { Search, RefreshCw, Bell } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import "./CompanyDetail.css";

import githubLogo from "../assets/github.svg";
import awsLogo from "../assets/aws.svg";
import cloudflareLogo from "../assets/cloudflare.svg";
import atlassianLogo from "../assets/atlassian.svg";
import shopifyLogo from "../assets/shopify.svg";
import pagerdutyLogo from "../assets/pagerduty.png";
import datadogLogo from "../assets/datadog.svg";
import dropboxLogo from "../assets/dropbox.svg";
import intercomLogo from "../assets/intercom.svg";

const COMPANY_LOGOS = {
  GitHub: githubLogo,
  AWS: awsLogo,
  Cloudflare: cloudflareLogo,
  Atlassian: atlassianLogo,
  Shopify: shopifyLogo,
  PagerDuty: pagerdutyLogo,
  Datadog: datadogLogo,
  Dropbox: dropboxLogo,
  Intercom: intercomLogo,
};

function CompanyDetail({ company, incidents, onBack, theme, onToggleTheme }) {

  const cleanDescription = (html) => {
  if (!html) return "";

  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

 

};

const [expandedIndex, setExpandedIndex] = useState(null);

  const sortedIncidents = [...(incidents || [])].sort((a, b) => {
    return new Date(b.published) - new Date(a.published);
  });

  const latestIncident = sortedIncidents[0];

  const getStatusColor = (severity) => {
    switch (severity) {
      case "Critical":
        return "#ff4d4f";
      case "High":
        return "#f59e0b";
      case "Medium":
        return "#eab308";
      default:
        return "#22c55e";
    }
  };

  const getStatusLabel = (incident) => {
    if (!incident) return "Operational";

    if (incident.status) {
      return incident.status.toUpperCase();
    }

    return "OPERATIONAL";
  };

  return (
    <div className="company-detail-page">

      {/* NAVBAR */}
      <header className="page-header">

        <div className="header-left">
          <h1>Incident Dashboard</h1>
        </div>

        <div className="header-center">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />

            <input
              type="text"
              placeholder="Global Search..."
              className="search-input"
            />
          </div>
        </div>

        <div className="header-right">

          <div className="header-status">
            <span className="live-dot"></span>
            
          </div>

          <button className="header-icon-btn">
            <RefreshCw size={18} />
          </button>

          <button className="header-icon-btn">
            <Bell size={18} />
          </button>

          <ThemeToggle theme={theme} toggleTheme={onToggleTheme} />

        </div>
      </header>

      <div className="company-container">

        {/* BREADCRUMB */}
<div className="breadcrumb">

  <span
    className="breadcrumb-link"
    onClick={onBack}
  >
    PROVIDERS
  </span>

  <span className="breadcrumb-separator">
    &gt;
  </span>

  <span className="breadcrumb-current">
    {company.toUpperCase()}
  </span>

</div>

        {/* COMPANY HEADER */}
        <section className="company-hero">

<div className="company-info">

  <div className="company-header-row">

    <div className="company-logo-container">
      <img
        src={COMPANY_LOGOS[company]}
        alt={company}
        className="company-logo"
      />
    </div>

    <div className="company-meta">

      <h1>{company}</h1>

      <div className="company-status-row">
        <span className="status-dot"></span>

        <span className="status-pill">
          {getStatusLabel(latestIncident)}
        </span>

        <span className="uptime-text">
          {incidents.length} incidents recorded
        </span>
      </div>

    </div>

  </div>

</div>

          <div className="hero-actions">

            {latestIncident?.url && (
              <a
                href={latestIncident.url}
                target="_blank"
                rel="noreferrer"
                className="status-btn"
              >
                VIEW STATUS PAGE
              </a>
            )}

            <button
              className="diagnostic-btn"
              onClick={() => alert("Diagnostics coming soon")}
            >
              RUN DIAGNOSTIC
            </button>

          </div>

        </section>

        {/* STATS */}
        <section className="stats-grid">

          <div className="stat-card">
            <div className="stat-label">TOTAL INCIDENTS</div>
            <div className="stat-value">
              {incidents.length}
            </div>
          </div>


          {/* <div className="stat-card">
            <div className="stat-label">CRITICAL</div>
            <div className="stat-value">
              {
                incidents.filter(
                  i => i.severity === "Critical"
                ).length
              }
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">HIGH</div>
            <div className="stat-value">
              {
                incidents.filter(
                  i => i.severity === "High"
                ).length
              }
            </div>
          </div> */}
 
          <div className="stat-card">
            <div className="stat-label">LATEST</div>
            <div className="stat-small">
              {latestIncident
                ? new Date(
                    latestIncident.published
                  ).toLocaleDateString()
                : "N/A"}
            </div>
          </div>

        </section>

        {/* TIMELINE */}
        <section className="timeline-section">

          <div className="timeline-header">
            <h2>Incident History</h2>
          </div>

          <div className="timeline">

            {sortedIncidents.map((incident, index) => (

              <div
                key={index}
                className="timeline-item"
              >

                <div
                  className="timeline-dot"
                  style={{
                    background: getStatusColor(
                      incident.severity
                    )
                  }}
                />

                <div className="timeline-card">

                  <div className="timeline-top">

                    <div>

                      <div className="timeline-date">
                       {new Date(
  incident.published
).toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
}).toUpperCase()}
                      </div>

                      <h3>
                        {incident.title}
                      </h3>

                    </div>

                    <div
                      className="timeline-badge"
                      style={{
                        borderColor: getStatusColor(
                          incident.severity
                        ),
                        color: getStatusColor(
                          incident.severity
                        )
                      }}
                    >
                      {incident.severity || "INFO"}
                    </div>

                  </div>

<div className="timeline-description">

 
  <p>
    {
      cleanDescription(
        incident.summary ||
        incident.description ||
        "No description available"
      )
        .split(". ")
        .slice(0, 3)
        .join(". ")
    }
    ...
  </p>

  <button
    className="expand-btn"
    onClick={() =>
      setExpandedIndex(
        expandedIndex === index ? null : index
      )
    }
  >
    {expandedIndex === index
      ? "Hide Report"
      : "View Full Report"}
  </button>

  {expandedIndex === index && (

    <div className="incident-report">

      <div className="report-section">

        <h4>Incident Timing</h4>

        <p>
          Incident reported at:
          {" "}
          {new Date(
            incident.published
          ).toLocaleString()}
        </p>

      </div>

      <div className="report-section">

        <h4>Incident Report Summary</h4>

        <p>
          {
            cleanDescription(
              incident.description
            )
          }
        </p>

      </div>

      {incident.url && (

        <a
          href={incident.url}
          target="_blank"
          rel="noreferrer"
          className="report-link"
        >
          View Original Report →
        </a>

      )}

    </div>

  )}

</div>

                </div>

              </div>

            ))}

          </div>

        </section>

      </div>

    </div>
  );
}

export default CompanyDetail;