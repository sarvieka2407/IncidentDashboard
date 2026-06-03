import React from "react";
import { Search, RefreshCw, Bell } from "lucide-react";
import "./LiveStatus.css";

function LiveStatus({
  incidents,
  companies,
  loading,
  onCompanyClick,
}) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "Never";

    const date = new Date(dateStr);
    const now = new Date();

    const days = Math.floor((now - date) / 86400000);

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";

    return `${days} days ago`;
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
            companies
              .filter((c) => c !== "All")
              .map((company) => {
                const companyIncidents =
                  incidents.filter(
                    (i) => i.company === company
                  );

                const latest =
                  companyIncidents[0];

                return (
<div
  key={company}
  className="company-card"
  onClick={() => onCompanyClick(company)}
>

  <h3 className="company-name">
    {company}
  </h3>

  <div className="company-incidents">

    <span className="incident-number">
      {companyIncidents.length}
    </span>

    <span className="incident-label">
      INCIDENTS
    </span>

  </div>

  <div className="company-divider"></div>

  <div className="company-meta">

    <div className="meta-label">
      Last incident
    </div>

    <div className="meta-value">
      {latest
        ? formatDate(latest.published)
        : "Never"}
    </div>

  </div>

  <div className="company-link">
    View Details →
  </div>

</div>
                );
              })
          )}

        </div>

      </div>

    </div>
  );
}

export default LiveStatus;