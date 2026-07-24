import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  RefreshCw,
  Bell,
  Search,
  ChevronDown,
  Menu,
  CheckCircle2,
  Loader2
} from "lucide-react";

import IncidentCard from "../components/IncidentCard";
import SkeletonCard from "../components/SkeletonCard";
import ThemeToggle from "../components/ThemeToggle";
import "./Dashboard.css";

function Dashboard({
  incidents,
  loading,
  error,
  lastUpdated,
  onRefresh,
  onCompanyClick,
  onSummaryUpdate,
  theme,
  onToggleTheme,
  onToggleMobileSidebar
}) {
  const [sortBy, setSortBy] = useState("date");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilter, setShowFilter] = useState(false);

  const providers = [
    { name: "GitHub", done: !loading },
    { name: "Cloudflare", done: !loading },
    { name: "AWS", done: !loading },
    { name: "Datadog", done: !loading }
  ];

  const filteredIncidents = incidents
    .filter((incident) => {
      const query = searchTerm.toLowerCase();
      return [
        incident.title,
        incident.company,
        incident.summary,
        incident.status,
        incident.severity
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    })
    .filter((incident) => {
      if (statusFilter === "All") return true;
      return incident.status === statusFilter;
    })
    .sort((a, b) => {
      if (sortBy === "severity") {
        const severityOrder = {
          Critical: 0,
          High: 1,
          Medium: 2,
          Low: 3,
          Unknown: 4
        };
        return (
          (severityOrder[a.severity] || 4) -
          (severityOrder[b.severity] || 4)
        );
      }
      return new Date(b.published) - new Date(a.published);
    });

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <div className="header-left">
          {onToggleMobileSidebar && (
            <button
              className="mobile-menu-btn"
              onClick={onToggleMobileSidebar}
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
          )}
          <h1>Dashboard</h1>
        </div>

        <div className="header-center">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search incidents, providers..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="header-right">
          <button
            className="header-icon-btn"
            onClick={onRefresh}
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

      <div className="dashboard-content">
        <section className="status-hero">
          <div className="status-hero-card">
            <div className="hero-top-row">
              <div className="hero-label">INFRASTRUCTURE STATUS</div>
            </div>

            <div className="hero-content">
              <div className="hero-left">
                <h2 className="hero-title">
                  {loading
                    ? "Collecting infrastructure status..."
                    : "Know when services go down."}
                  {!loading && (
                    <>
                      <br />
                      <span className="hero-muted">
                        Understand what happened in seconds.
                      </span>
                    </>
                  )}
                </h2>

                <p className="hero-description">
                  {loading
                    ? "Aggregating live health reports from GitHub, AWS, Cloudflare, Datadog..."
                    : "Track outages and service disruptions across major platforms in real time. Get concise AI-powered summaries so you can understand incidents without reading lengthy status reports."}
                </p>

                <div className="hero-stats-chip">
                  {loading ? (
                    "FETCHING LIVE INCIDENT FEEDS..."
                  ) : (
                    <>
                      {incidents.length} INCIDENTS ACROSS{" "}
                      {[...new Set(incidents.map((i) => i.company))].length}{" "}
                      PROVIDERS
                    </>
                  )}
                </div>

                <div className="hero-features">
                  <span>Real-Time Monitoring</span>
                  <span>AI Incident Summaries</span>
                  <span>Multi-Provider Tracking</span>
                </div>
              </div>

              <div className="hero-right">
                <div className="hero-kpi">
                  <div className="hero-kpi-number">
                    <AnimatePresence mode="wait" initial={false}>
                      {loading ? (
                        <motion.div
                          key="kpi-loading"
                          className="kpi-loader-container"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <span className="kpi-dot-pulse" style={{ animationDelay: "0s" }} />
                          <span className="kpi-dot-pulse" style={{ animationDelay: "0.2s" }} />
                          <span className="kpi-dot-pulse" style={{ animationDelay: "0.4s" }} />
                        </motion.div>
                      ) : (
                        <motion.span
                          key="kpi-value"
                          initial={{ opacity: 0, scale: 0.92 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                        >
                          {incidents.length}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="hero-kpi-label">
                    {loading ? "COLLECTING STATUS..." : "TOTAL INCIDENTS"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="live-incidents">
          <div className="incidents-toolbar">
            <div className="incidents-header-group">
              <h2 className="recent-incidents-title">Recent Incidents</h2>
              <p className="recent-incidents-subtitle">
                Latest production incidents across all providers.
              </p>
            </div>

            <div className="incidents-controls">
              <div className="filter-dropdown">
                <button
                  className="filter-btn"
                  onClick={() => setShowFilter(!showFilter)}
                >
                  <span>{statusFilter}</span>
                  <ChevronDown
                    size={14}
                    className="filter-chevron"
                    style={{ transform: showFilter ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>

                <AnimatePresence>
                  {showFilter && (
                    <motion.div
                      className="filter-menu"
                      initial={{ opacity: 0, y: -4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.98 }}
                      transition={{ duration: 0.12, ease: "easeOut" }}
                    >
                      <div
                        className="filter-item"
                        onClick={() => {
                          setStatusFilter("All");
                          setShowFilter(false);
                        }}
                      >
                        All Incidents
                      </div>

                      <div
                        className="filter-item"
                        onClick={() => {
                          setStatusFilter("Scheduled Maintenance");
                          setShowFilter(false);
                        }}
                      >
                        Scheduled Maintenance
                      </div>

                      <div
                        className="filter-item"
                        onClick={() => {
                          setStatusFilter("Work in Progress");
                          setShowFilter(false);
                        }}
                      >
                        Work In Progress
                      </div>

                      <div
                        className="filter-item"
                        onClick={() => {
                          setStatusFilter("Resolved");
                          setShowFilter(false);
                        }}
                      >
                        Resolved
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Loading status bar */}
          {loading && (
            <motion.div
              className="fetching-status-bar"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              <div className="status-left">
                <span className="status-pulse-dot" />
                <span>Fetching live incident feeds...</span>
              </div>

              <div className="provider-progress-row">
                {providers.map((p) => (
                  <span
                    key={p.name}
                    className={`provider-chip ${p.done ? "done" : "loading"}`}
                  >
                    {p.done ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <Loader2
                        size={12}
                        style={{ animation: "spin 1.5s linear infinite" }}
                      />
                    )}
                    {p.name}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Feed List (Skeletons vs Real Cards vs Empty State) */}
          <div className="incidents-list">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="skeletons-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  {[1, 2, 3, 4, 5].map((idx) => (
                    <SkeletonCard key={idx} />
                  ))}
                </motion.div>
              ) : filteredIncidents.length === 0 ? (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="empty-state"
                >
                  <p className="empty-emoji">🔍</p>
                  <p>No incidents found.</p>
                </motion.div>
              ) : (
                <motion.div
                  key="real-incidents-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  {filteredIncidents.map((incident, idx) => (
                    <IncidentCard
                      key={incident.id ?? idx}
                      incident={incident}
                      onClick={() => onCompanyClick(incident.company)}
                      onSummaryUpdate={onSummaryUpdate}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;


