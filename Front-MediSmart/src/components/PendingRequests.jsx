import { useState } from "react";
import "./doctorspage.css";

const initialRequests = [
  {
    id: 1,
    name: "Amina Ferhat",
    description: "Post-surgery checkup — knee replacement",
    time: "04:15 PM",
  },
  {
    id: 2,
    name: "Rami Saleh",
    description: "Recurring chest discomfort,",
    time: "Tomorrow 10:00 AM",
  },
];

const ConfirmIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="8" stroke="#22c55e" strokeWidth="1.6" fill="none" />
    <path d="M5.5 9l2.5 2.5 4.5-5" stroke="#22c55e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DeclineIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="8" stroke="#f87171" strokeWidth="1.6" fill="none" />
    <path d="M6 6l6 6M12 6l-6 6" stroke="#f87171" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const AlertIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="10" stroke="#f59e0b" strokeWidth="1.8" fill="none" />
    <path d="M11 7v5" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="11" cy="15" r="1" fill="#f59e0b" />
  </svg>
);

export default function PendingRequests() {
  const [requests, setRequests] = useState(initialRequests);

  const handleAction = (id) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="pr-wrapper">
      <div className="pr-card">
        <div className="pr-header">
          <span className="pr-alert-icon"><AlertIcon /></span>
          <h2 className="pr-title">Pending Requests</h2>
          {requests.length > 0 && (
            <span className="pr-badge">({requests.length} awaiting your confirmation)</span>
          )}
        </div>

        <div className="pr-list">
          {requests.length === 0 && (
            <p className="pr-empty">No pending requests.</p>
          )}
          {requests.map((req) => (
            <div className="pr-item" key={req.id}>
              <div className="pr-avatar" />
              <div className="pr-info">
                <p className="pr-name">{req.name}</p>
                <p className="pr-desc">{req.description}</p>
              </div>
              <p className="pr-time">{req.time}</p>
              <div className="pr-actions">
                <button className="pr-btn confirm" onClick={() => handleAction(req.id)}>
                  <ConfirmIcon /> Confirm
                </button>
                <button className="pr-btn decline" onClick={() => handleAction(req.id)}>
                  <DeclineIcon /> Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}