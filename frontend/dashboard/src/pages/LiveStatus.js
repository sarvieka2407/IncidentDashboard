import React, { useState } from "react";
import { Search, RefreshCw, Bell } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import "./LiveStatus.css";

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

function LiveStatus({
  incidents,
  companies,
  loading,
  onCompanyClick,
  theme,
  onToggleTheme,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const formatDate = (dateStr) => {
    if (!dateStr) return "Never";

    const date = new Date(dateStr);
    const now = new Date();

    const days = Math.floor((now - date) / 86400000);

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";

    return `${days} days ago`;
  };

  const getCompanyStatus = (companyIncidents) => {
    if (!companyIncidents || companyIncidents.length === 0) {
      return { label: "Operational", type: "operational" };
    }

    const activeIncidents = companyIncidents.filter(
      (i) => i.status && i.status.toLowerCase() !== "resolved"
    );

    if (activeIncidents.length === 0) {
      return { label: "Operational", type: "operational" };
    }

    const hasCritical = activeIncidents.some(
      (i) => i.severity && i.severity.toLowerCase() === "critical"
    );

    if (hasCritical) {
      return { label: "Major Outage", type: "outage" };
    }

    return { label: "Active Incident", type: "active" };
  };

  return (
    <div className="live-status-page">

      {/* HEADER */}

      <header className="page-header">

        <div className="header-left">
          <h1>Providers</h1>
        </div>

        <div className="header-center">
          <div className="search-wrapper">

            <Search
              size={18}
              className="search-icon"
            />

            <input
              type="text"
              placeholder="Search companies..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

          </div>
        </div>

        <div className="header-right">

          <div className="header-status">
            <span className="live-dot"></span>
             
          </div>

          <button
            className="header-icon-btn"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>

          <button
            className="header-icon-btn"
            title="Notifications"
          >
            <Bell size={18} />
          </button>

          <ThemeToggle theme={theme} toggleTheme={onToggleTheme} />

        </div>

      </header>

      {/* HERO */}

      <div className="companies-page">

        <div className="companies-hero">

          <p className="hero-label">
            INFRASTRUCTURE PROVIDERS
          </p>

          <h1>
            Explore monitored platforms
          </h1>

          <p>
            Browse incident history across cloud providers,
            developer platforms, monitoring systems and APIs.
          </p>

        </div>

        {/* GRID */}

        <div className="companies-grid">

          {loading ? (
            <div className="loading-companies">
              Loading companies...
            </div>
          ) : (
            (() => {
              const filteredCompanies = companies
                .filter((c) => c !== "All")
                .filter((company) => 
                  company.toLowerCase().includes(searchTerm.trim().toLowerCase())
                );

              if (filteredCompanies.length === 0) {
                return (
                  <div className="empty-state" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 0" }}>
                    <p className="empty-emoji" style={{ fontSize: "2rem", marginBottom: "8px" }}>🔍</p>
                    <p style={{ color: "var(--text-muted)" }}>No providers found.</p>
                  </div>
                );
              }

              return filteredCompanies.map((company) => {
                const companyIncidents =
                  incidents.filter(
                    (i) => i.company === company
                  );

                const latest =
                  companyIncidents[0];

                const status = getCompanyStatus(companyIncidents);

                return (
                  <div
                    key={company}
                    className="company-card"
                    onClick={() => onCompanyClick(company)}
                  >
                    <div className="card-top">
                      <div className="card-name-row">
                        <div className="card-logo-wrapper">
                          {COMPANY_LOGOS[company] ? (
                            <img
                              src={COMPANY_LOGOS[company]}
                              alt={company}
                              className="provider-logo-img"
                            />
                          ) : (
                            <div className="provider-logo-fallback">
                              {company.charAt(0)}
                            </div>
                          )}
                        </div>
                        <h3 className="company-name">{company}</h3>
                      </div>

                      <div className={`status-badge status-${status.type}`}>
                        <span className="status-dot-indicator" />
                        <span>{status.label}</span>
                      </div>
                    </div>

                    <div className="card-metrics-row">
                      <span className={`incident-number incident-count-${status.type}`}>
                        {companyIncidents.length}
                      </span>
                      <span className="incident-label">
                        INCIDENTS RECORDED
                      </span>
                    </div>

                    <div className="company-meta">
                      <div className="meta-label">Last Incident</div>
                      <div className="meta-value">
                        {latest ? formatDate(latest.published) : "Never"}
                      </div>
                    </div>

                    <div className="company-link">
                      View History <span className="cta-arrow">→</span>
                    </div>
                  </div>
                );
              });
            })()
          )}

        </div>

      </div>

    </div>
  );
}

export default LiveStatus;