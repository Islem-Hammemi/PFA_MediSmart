import React from "react";
import "./doctorspage.css";

export default function QueueStats({ served = 0, waiting = 0, loading = false }) {
  if (loading) {
    return (
      <div className="queue-stats">
        <div className="stat-card">
          <span className="doc-stat-number served">—</span>
          <span className="stat-label">Served</span>
        </div>
        <div className="stat-card">
          <span className="doc-stat-number waiting">—</span>
          <span className="stat-label">Waiting</span>
        </div>
      </div>
    );
  }

  return (
    <div className="queue-stats">
      <div className="stat-card">
        <span className="doc-stat-number served">{served}</span>
        <span className="stat-label">Served</span>
      </div>
      <div className="stat-card">
        <span className="doc-stat-number waiting">{waiting}</span>
        <span className="stat-label">Waiting</span>
      </div>
    </div>
  );
}