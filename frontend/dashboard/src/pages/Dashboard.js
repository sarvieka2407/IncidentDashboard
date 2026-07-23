import React, { useState } from "react";
import {
  RefreshCw,
  Bell,
  Search,
} from "lucide-react";

import IncidentCard from "../components/IncidentCard";
import "./Dashboard.css";







function Dashboard({ incidents, loading, error, lastUpdated, onRefresh, onCompanyClick, onSummaryUpdate }) {
  const [sortBy, setSortBy] = useState("date");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilter, setShowFilter] = useState(false);


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

  if (statusFilter === "All") {
    return true;
  }

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

      <div className="search-shortcut">
       
      </div>
    </div>
  </div>

  <div className="header-right">

    <div className="header-status">
      
       
    </div>

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

  </div>

</header>

      <div className="dashboard-content">
         
<section className="status-hero">
  <div className="status-hero-card">

    <div className="hero-top-row">

      <div className="hero-label">
        INFRASTRUCTURE STATUS
      </div>


    </div>

    <div className="hero-content">

      <div className="hero-left">

        <h2 className="hero-title">
          Know when services go down.
          <br />
          <span className="hero-muted">
            Understand what happened in seconds.
          </span>
        </h2>

        <p className="hero-description">
          Track outages and service disruptions across major platforms in real time.
          Get concise AI-powered summaries so you can understand incidents without
          reading lengthy status reports.
        </p>

        <div className="hero-stats-chip">
          {incidents.length} INCIDENTS ACROSS{" "}
          {[...new Set(incidents.map(i => i.company))].length}
          {" "}PROVIDERS
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
            {incidents.length}
          </div>

          <div className="hero-kpi-label">
            TOTAL INCIDENTS
          </div>
        </div>

      </div>

    </div>

  </div>
</section>
<section className="live-incidents">

  <div className="incidents-toolbar">

    <div className="recent-incidents-header">
      RECENT INCIDENTS
    </div>

    <div className="incidents-controls">

<div className="filter-dropdown">

  <button
    className="filter-btn"
    onClick={() => setShowFilter(!showFilter)}
  >
    {statusFilter}
    
  </button>

  {showFilter && (
    <div className="filter-menu">

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

    </div>
  )}

</div>
    </div>

  </div>

          <div className="incidents-list">
            {filteredIncidents.map((incident, idx) => (
              <IncidentCard
                key={incident.id ?? idx}
                incident={incident}
                onClick={() => onCompanyClick(incident.company)}
                onSummaryUpdate={onSummaryUpdate}
              />
            ))}
          </div>
        </section>

   
      </div>
    </div>
  );
}

export default Dashboard;