// TicketQueue.jsx
import { useState } from "react";
import "./doctorspage.css";

const initialTickets = [
  { id: "T-004", name: "Leila Haddad", checkedIn: "09:55 AM", avatar: null },
  { id: "T-005", name: "Karim Bouzid", checkedIn: "10:15 AM", avatar: null },
  { id: "T-006", name: "Amina Ferhat", checkedIn: "10:40 AM", avatar: null },
];

const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
    <polygon points="3,1 13,7 3,13" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="#4A90D9" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function TicketQueuemed() {
  const [tickets, setTickets] = useState(initialTickets);

  const handleServe = (id) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="tq-wrapper">
      <div className="tq-card">
        <div className="tq-header">
          <div className="tq-header-left">
            <h2 className="tq-title">Today's Ticket Queue</h2>
            <span className="tq-badge">{tickets.length} Patients</span>
          </div>
          <button className="tq-manage">Manage <ArrowIcon /></button>
        </div>

        <div className="tq-table-header">
          <span>Ticket</span>
          <span>Patient</span>
          <span>Checked In</span>
          <span>Action</span>
        </div>

        <div className="tq-list">
          {tickets.length === 0 && (
            <p className="tq-empty">No patients in queue.</p>
          )}
          {tickets.map((ticket) => (
            <div className="tq-row" key={ticket.id}>
              <span className="tq-ticket-id">{ticket.id}</span>
              <div className="tq-patient">
                <div className="tq-avatar">
                  {ticket.avatar
                    ? <img src={ticket.avatar} alt={ticket.name} />
                    : <span className="tq-avatar-placeholder" />}
                </div>
                <span className="tq-name">{ticket.name}</span>
              </div>
              <span className="tq-time">{ticket.checkedIn}</span>
              <button className="tq-serve-btn" onClick={() => handleServe(ticket.id)}>
                <PlayIcon /> Serve
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}