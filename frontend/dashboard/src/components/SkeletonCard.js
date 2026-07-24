import React from "react";
import "./SkeletonCard.css";

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      {/* Header: Provider logo + name & AI action button */}
      <div className="skeleton-header-main">
        <div className="skeleton-provider-row">
          <div className="skeleton-circle provider-logo-skeleton" />
          <div className="skeleton-bar provider-name-skeleton" style={{ width: 100, height: 16 }} />
        </div>
        <div className="skeleton-bar ai-button-skeleton" style={{ width: 110, height: 32, borderRadius: 8 }} />
      </div>

      {/* Body: Title & status pill */}
      <div className="skeleton-body-row" style={{ marginTop: 14 }}>
        <div className="skeleton-bar title-skeleton" style={{ width: "70%", height: 20 }} />
        <div className="skeleton-bar status-pill-skeleton" style={{ width: 80, height: 22, borderRadius: 6 }} />
      </div>

      {/* Summary paragraph lines */}
      <div className="skeleton-summary-block" style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="skeleton-bar line-skeleton" style={{ width: "100%", height: 13 }} />
        <div className="skeleton-bar line-skeleton" style={{ width: "85%", height: 13 }} />
      </div>

      {/* Metadata chips row */}
      <div className="skeleton-meta-row" style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
        <div className="skeleton-bar chip-skeleton" style={{ width: 75, height: 22, borderRadius: 6 }} />
        <div className="skeleton-bar chip-skeleton" style={{ width: 65, height: 22, borderRadius: 6 }} />
        <div className="skeleton-bar chip-skeleton" style={{ width: 110, height: 14 }} />
      </div>
    </div>
  );
}

export default SkeletonCard;
