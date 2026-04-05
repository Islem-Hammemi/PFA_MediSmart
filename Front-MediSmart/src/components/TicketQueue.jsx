import React from "react";
import "./doctorspage.css";

const PlayIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5,3 19,12 5,21" />
  </svg>
);

function NowServingBadge() {
  return <span className="now-serving-badge">NOW SERVING</span>;
}

function ServeButton({ onClick }) {
  return (
    <button className="serve-btn" onClick={onClick}>
      <PlayIcon size={12} />
      Serve
    </button>
  );
}

export default function TicketQueue({
  currentPatient = {
    ticket: "T-003",
    name: "Youssef Tariq",
    checkedInAt: "09:30 AM",
    avatar: "https://i.pravatar.cc/80?img=33",
  },
  queue = [
    { ticket: "T-004", name: "Leila Haddad",  checkedIn: "09:55 AM", avatar: "https://i.pravatar.cc/80?img=47", next: true },
    { ticket: "T-005", name: "Karim Bouzid",  checkedIn: "10:15 AM", avatar: "https://i.pravatar.cc/80?img=15" },
    { ticket: "T-006", name: "Amina Ferhat",  checkedIn: "10:40 AM", avatar: "https://i.pravatar.cc/80?img=22" },
  ],
  onServe,
}) {
  return (
    <div className="ticket-queue-wrapper">
      {/* Currently serving */}
      <div className="current-patient">
        <div className="current-left">
          <span className="current-ticket">{currentPatient.ticket}</span>
          <img src={currentPatient.avatar} alt={currentPatient.name} className="current-avatar" />
          <div className="current-info">
            <span className="current-name">{currentPatient.name}</span>
            <span className="current-checkin">
              • Checked in at &nbsp;<strong>{currentPatient.checkedInAt}</strong>
            </span>
          </div>
        </div>
        <NowServingBadge />
      </div>

      {/* Queue table */}
      <div className="queue-table">
        <div className="queue-header">
          <span>Ticket</span>
          <span>Patient</span>
          <span>Checked In</span>
          <span>Action</span>
        </div>
        {queue.map((patient) => (
          <div key={patient.ticket} className={`queue-row ${patient.next ? "next-row" : ""}`}>
            <div className="queue-ticket-cell">
              <span className={`queue-ticket ${patient.next ? "ticket-orange" : "ticket-gray"}`}>
                {patient.ticket}
              </span>
              {patient.next && <span className="next-badge">NEXT</span>}
            </div>
            <div className="queue-patient-cell">
              <img src={patient.avatar} alt={patient.name} className="queue-avatar" />
              <span className="queue-name">{patient.name}</span>
            </div>
            <span className="queue-checkin">{patient.checkedIn}</span>
            <ServeButton onClick={() => onServe && onServe(patient)} />
          </div>
        ))}
      </div>
    </div>
  );
}