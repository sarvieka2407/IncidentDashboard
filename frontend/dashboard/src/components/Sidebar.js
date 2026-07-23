import React from "react";
import { FaGithub } from "react-icons/fa";
import "./Sidebar.css";
import {
  LayoutDashboard,
  Building2,
  Activity,
} from "lucide-react";

function Sidebar({ currentPage, onNavigate }) {
  return (
    <aside className="sidebar">

      <div className="sidebar-header">

        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Activity size={16} />
        </div>

        <div className="sidebar-title">
          <div className="title-main">
            INCIDENT DASHBOARD
          </div>

          <div className="title-sub">
            Infrastructure Monitoring
          </div>
        </div>

      </div>

      <div className="sidebar-divider" />

      <nav className="sidebar-nav">

        <button
          className={`nav-item ${
            currentPage === "dashboard"
              ? "active"
              : ""
          }`}
          onClick={() => onNavigate("dashboard")}
        >
          <LayoutDashboard
            size={18}
            className="nav-icon"
          />

          <span className="nav-label">
            Dashboard
          </span>
        </button>

        <button
          className={`nav-item ${
            currentPage === "status" ||
            currentPage === "detail"
              ? "active"
              : ""
          }`}
          onClick={() => onNavigate("status")}
        >
          <Building2
            size={18}
            className="nav-icon"
          />

          <span className="nav-label">
            Providers
          </span>
        </button>

      </nav>

      <div className="sidebar-footer">

        <a
          href="https://github.com/YOUR_USERNAME/YOUR_REPO"
          target="_blank"
          rel="noreferrer"
          className="github-link"
        >
          <FaGithub size={18} />

          <span>
            GitHub
          </span>
        </a>

        <div className="sidebar-version">
          v1.0
        </div>

      </div>

    </aside>
  );
}

export default Sidebar;