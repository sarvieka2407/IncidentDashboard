import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AiLoadingAnimation from "./AiLoadingAnimation";
import { formatRelativeTime } from "../utils/formatRelativeTime";
import { 
  CalendarDays, 
  Clock3, 
  CircleCheck, 
  TriangleAlert, 
  Wrench, 
  Activity, 
  RadioTower, 
  Sparkles,
  Cloud,
  MessageSquare,
  Mail,
  FileText,
  BookOpen
} from "lucide-react";

import githubLogo from "../assets/github.svg";
import cloudflareLogo from "../assets/cloudflare.svg";
import awsLogo from "../assets/aws.svg";
import datadogLogo from "../assets/datadog.svg";
import dropboxLogo from "../assets/dropbox.svg";
import intercomLogo from "../assets/intercom.svg";
import shopifyLogo from "../assets/shopify.svg";
import atlassianLogo from "../assets/atlassian.svg";
import pagerdutyLogo from "../assets/pagerduty.png";

const BRAND_LOGOS = {
  "GitHub": githubLogo,
  "Cloudflare": cloudflareLogo,
  "AWS": awsLogo,
  "Datadog": datadogLogo,
  "Dropbox": dropboxLogo,
  "Intercom": intercomLogo,
  "Shopify": shopifyLogo,
  "Atlassian": atlassianLogo,
  "PagerDuty": pagerdutyLogo
};

const FALLBACK_ICONS = {
  "Google Cloud": Cloud,
  "Twlio": MessageSquare,
  "Sendgrid": Mail
};

const SEVERITY_COLORS = {
  Critical: { border: "#ef4444", text: "#ef4444", bg: "rgba(239, 68, 68, 0.06)", label: "Critical" },
  High: { border: "#f97316", text: "#f97316", bg: "rgba(249, 115, 22, 0.06)", label: "High" },
  Medium: { border: "#eab308", text: "#eab308", bg: "rgba(234, 179, 8, 0.06)", label: "Medium" },
  Low: { border: "#22c55e", text: "#22c55e", bg: "rgba(34, 197, 94, 0.06)", label: "Low" },
  Unknown: { border: "#4b5563", text: "#9ca3af", bg: "rgba(107, 114, 128, 0.06)", label: "" }
};

const STATUS_CONFIG = {
  "Resolved": { color: "#22c55e" },
  "Scheduled Maintenance": { color: "#f59e0b" },
  "Work in Progress": { color: "#3b82f6" }
};

const TIMELINE_COLORS = {
  "resolved": "#22c55e",
  "monitoring": "#3b82f6",
  "investigating": "#a855f7",
  "update": "#f97316",
  "scheduled maintenance": "#eab308",
  "scheduled": "#eab308",
  "maintenance": "#eab308",
  "unknown": "#9ca3af"
};

function formatCalendarDate(dateStr) {
  if (!dateStr) return "Unknown Date";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return dateStr.split(",")[0] || dateStr;
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function getStatusIcon(statusStr) {
  const s = (statusStr || "").toLowerCase();
  if (s.includes("resolved") || s.includes("mitigated")) return CircleCheck;
  if (s.includes("maintenance") || s.includes("scheduled")) return Wrench;
  if (s.includes("monitoring")) return Activity;
  return TriangleAlert;
}

function getTimelineColor(statusStr) {
  if (!statusStr) return TIMELINE_COLORS.unknown;
  const str = statusStr.toLowerCase().trim();
  if (TIMELINE_COLORS[str]) return TIMELINE_COLORS[str];
  
  if (str.includes("resolved") || str.includes("mitigated") || str.includes("fixed")) return TIMELINE_COLORS.resolved;
  if (str.includes("monitoring")) return TIMELINE_COLORS.monitoring;
  if (str.includes("investigating")) return TIMELINE_COLORS.investigating;
  if (str.includes("maintenance") || str.includes("scheduled")) return TIMELINE_COLORS["scheduled maintenance"];
  if (str.includes("update")) return TIMELINE_COLORS.update;
  
  return TIMELINE_COLORS.unknown;
}

function parseTimelineUpdates(html) {
  if (!html) return [];
  const regex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  const updates = [];
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    const rawContent = match[1].trim();
    if (!rawContent) continue;
    
    // 1. Extract timestamp from <small>...</small>
    let timestamp = "";
    const smallMatch = /<small[^>]*>([\s\S]*?)<\/small>/i.exec(rawContent);
    if (smallMatch) {
      timestamp = smallMatch[1].replace(/<[^>]*>/g, "").trim();
    }
    
    // 2. Extract status from <strong>...</strong>
    let status = "";
    const strongMatch = /<strong[^>]*>([\s\S]*?)<\/strong>/i.exec(rawContent);
    if (strongMatch) {
      status = strongMatch[1].replace(/<[^>]*>/g, "").trim();
    }
    
    // 3. Extract description text by removing tags and leading hyphens
    let description = rawContent
      .replace(/<small[^>]*>[\s\S]*?<\/small>/i, "")
      .replace(/<strong[^>]*>[\s\S]*?<\/strong>/i, "")
      .replace(/<br\s*\/?>/gi, "")
      .replace(/^\s*-\s*/, "")
      .trim();
      
    description = description
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#39;/g, "'")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();

    updates.push({
      timestamp: timestamp || "",
      status: status || "Update",
      description: description || "No details provided."
    });
  }
  
  if (updates.length === 0) {
    // Fallback parsing if no <p> tags are present
    const fallbackText = html
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#39;/g, "'")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    updates.push({
      timestamp: "",
      status: "Update",
      description: fallbackText || "No details provided."
    });
  }
  
  return updates;
}

function parseAiSummaryBlocks(text) {
  if (!text) return [];

  const knownSections = [
    { key: "what happened", title: "What happened", icon: FileText },
    { key: "impact", title: "Impact", icon: TriangleAlert },
    { key: "context", title: "Context", icon: BookOpen },
    { key: "action required", title: "Action Required", icon: Wrench },
    { key: "action", title: "Action Required", icon: Wrench },
    { key: "recommended action", title: "Action Required", icon: Wrench }
  ];

  const lines = text.split("\n");
  const rawBlocks = [];
  let currentBlock = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) continue;

    const cleanHeader = trimmed.replace(/^[\#\*\-\s]+/, "").replace(/[\:\*]+$/, "").toLowerCase().trim();
    const matched = knownSections.find(s => s.key === cleanHeader);

    if (matched) {
      if (currentBlock) {
        rawBlocks.push(currentBlock);
      }
      currentBlock = {
        title: matched.title,
        icon: matched.icon,
        lines: []
      };
    } else {
      if (currentBlock) {
        currentBlock.lines.push(line);
      } else {
        currentBlock = {
          title: "What happened",
          icon: FileText,
          lines: [line]
        };
      }
    }
  }

  if (currentBlock) {
    rawBlocks.push(currentBlock);
  }

  return rawBlocks
    .map(b => ({
      title: b.title,
      icon: b.icon,
      text: b.lines.join("\n").trim()
    }))
    .filter(b => b.text.length > 0);
}

const API_URL = "http://localhost:8000";

function IncidentCard({ incident, onClick, onSummaryUpdate }) {
  const status = incident.status || "";
  const statusCfg = STATUS_CONFIG[status] || { color: "#9ca3af" };
  const severityCfg = SEVERITY_COLORS[incident.severity] || SEVERITY_COLORS.Unknown;
  const FallbackIcon = FALLBACK_ICONS[incident.company] || Activity;
  const StatusIcon = getStatusIcon(status);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError]     = useState(null);
  const [activeTab, setActiveTab] = useState("original");

  const aiSummary = incident.ai_summary || null;

  const handleTabClick = (e, tab) => {
    e.stopPropagation();
    setActiveTab(tab);
  };

  const handleSummarize = async (e) => {
    e.stopPropagation();
    setAiLoading(true);
    setAiError(null);
    // Switch to AI tab immediately so the loading animation is visible
    setActiveTab("ai");
    try {
      const res = await fetch(`${API_URL}/incidents/${incident.id}/simplify`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Unable to generate summary.");
      }
      const data = await res.json();
      if (onSummaryUpdate) {
        onSummaryUpdate(incident.id, data.summary);
      }
    } catch (err) {
      setAiError(err.message || "Unable to generate summary.");
    } finally {
      setAiLoading(false);
    }
  };

  const timelineUpdates = parseTimelineUpdates(incident.description);

  return (
    <div 
      className="dashboard-incident-card" 
      onClick={onClick}
      style={{
        borderLeft: `3px solid ${severityCfg.border}`
      }}
    >
      {/* Header Area: Provider Logo + Provider Name & AI Action Button */}
      <div className="card-header-main">
        <div className="provider-header-row">
          {BRAND_LOGOS[incident.company] ? (
            <img 
              src={BRAND_LOGOS[incident.company]} 
              alt={incident.company} 
              className="provider-logo-img" 
            />
          ) : (
            <FallbackIcon size={24} className="provider-logo-fallback" />
          )}
          <span className="provider-name-title">{incident.company}</span>
        </div>

        <button 
          className="ai-action-button-header"
          onClick={handleSummarize}
          disabled={aiLoading}
        >
          <Sparkles size={13} className="sparkle-icon" />
          <span>
            {aiLoading ? "Generating..." : aiSummary ? "Refresh AI" : "Generate AI"}
          </span>
        </button>
      </div>

      {/* Incident Title */}
      <h3 className="incident-title-text">{incident.title}</h3>

      {/* Metadata Row: Calendar Date, Relative Time, Status, Provider Status */}
      <div className="incident-metadata-row">
        <div className="metadata-item">
          <CalendarDays size={16} className="metadata-icon" />
          <span>{formatCalendarDate(incident.published)}</span>
        </div>

        <div className="metadata-item">
          <Clock3 size={16} className="metadata-icon" />
          <span>{formatRelativeTime(incident.published)}</span>
        </div>

        <div className="metadata-item status-metadata-item" style={{ color: statusCfg.color }}>
          <StatusIcon size={16} className="metadata-icon" style={{ stroke: statusCfg.color }} />
          <span className="status-text-bold">{status}</span>
        </div>

        <div className="metadata-item">
          <RadioTower size={16} className="metadata-icon" />
          <span>{incident.company} Status</span>
        </div>
      </div>

      {/* Body Area with Segmented Control */}
      <div className="incident-body-section">
        <div className="segmented-control-wrapper" onClick={e => e.stopPropagation()}>
          <button 
            className={`segment-btn ${activeTab === 'original' ? 'active' : ''}`}
            onClick={(e) => handleTabClick(e, "original")}
          >
            Original
          </button>
          <button 
            className={`segment-btn ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={(e) => handleTabClick(e, "ai")}
          >
            AI Summary
          </button>
        </div>

        <div className="segmented-content-box">
          {activeTab === "original" ? (
            <div className="incident-timeline">
              {timelineUpdates.map((update, index) => {
                const statusColor = getTimelineColor(update.status);
                return (
                  <div className="timeline-event" key={index}>
                    <div className="timeline-left">
                      <div className="timeline-dot" style={{ borderColor: statusColor }} />
                      {index < timelineUpdates.length - 1 && <div className="timeline-line" />}
                    </div>
                    <div className="timeline-right">
                      {update.timestamp && (
                        <span className="timeline-time">{update.timestamp}</span>
                      )}
                      <span className="timeline-status" style={{ color: statusColor }}>
                        {update.status}
                      </span>
                      <p className="timeline-desc">{update.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="ai-summary-container">
              <AnimatePresence mode="wait">
                {aiLoading ? (
                  <AiLoadingAnimation key="loading" company={incident.company} />
                ) : aiSummary ? (
                  <motion.div
                    key="summary"
                    className="ai-summary-blocks"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    {parseAiSummaryBlocks(aiSummary).map((block, idx) => {
                      const SectionIcon = block.icon;
                      return (
                        <div className="ai-summary-block" key={idx}>
                          <div className="ai-block-header">
                            <SectionIcon size={16} className="ai-block-icon" />
                            <h5 className="ai-block-title">{block.title}</h5>
                          </div>
                          <p className="ai-block-text">{block.text}</p>
                        </div>
                      );
                    })}
                  </motion.div>
                ) : aiError ? (
                  <motion.div
                    key="error"
                    className="ai-error-box"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="ai-error-message-text">{aiError}</p>
                    <button className="ai-retry-action-btn" onClick={handleSummarize}>
                      Retry
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    className="ai-empty-box"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="empty-sparkle-icon">✨</div>
                    <h4 className="empty-title-text">No AI Summary Yet</h4>
                    <p className="empty-desc-text">
                      Generate an AI summary to quickly understand this incident, its impact, and the recommended action.
                    </p>
                    <button className="ai-generate-action-btn" onClick={handleSummarize}>
                      Generate AI Summary
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Footer Area with tags */}
      <div className="incident-footer-section">
        {severityCfg.label && (
          <span className="footer-tag severity-tag" style={{ color: severityCfg.text, backgroundColor: severityCfg.bg, borderColor: `${severityCfg.text}22` }}>
            {severityCfg.label}
          </span>
        )}
        <span className="footer-tag source-tag">
          {incident.source.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

export default IncidentCard;