import React from "react";
import "./doctorspage.css";

const FolderIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#9ca3b8"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

function PatientCard({ patient, onOpenFolder }) {
  return (
    <div className="patient-card">
      <button
        className="patient-folder-btn"
        onClick={() => onOpenFolder && onOpenFolder(patient)}
        title="Open folder"
      >
        <FolderIcon />
      </button>
      <div className="patient-info">
        <img
          src={patient.avatar}
          alt={patient.name}
          className="patient-avatar"
        />
        <div className="patient-details">
          <span className="patient-name">{patient.name}</span>
          <span className="patient-age">{patient.age} years old</span>
        </div>
      </div>
      <div className="patient-divider" />
      <div className="patient-visit">
        <span className="visit-label">Last Visit</span>
        <span className="visit-date">{patient.lastVisit}</span>
      </div>
    </div>
  );
}

export default function PatientList({ patients = [], onOpenFolder }) {
  const defaultPatients = [
    {
      id: 1,
      name: "Ahmed Ben Ali",
      age: 45,
      lastVisit: "24 Mars 2026",
      avatar: "https://i.pravatar.cc/80?img=47",
    },
    {
      id: 2,
      name: "Ahmed Ben Ali",
      age: 45,
      lastVisit: "24 Mars 2026",
      avatar: "https://i.pravatar.cc/80?img=47",
    },
    {
      id: 3,
      name: "Ahmed Ben Ali",
      age: 45,
      lastVisit: "24 Mars 2026",
      avatar: "https://i.pravatar.cc/80?img=47",
    },
    {
      id: 4,
      name: "Ahmed Ben Ali",
      age: 45,
      lastVisit: "24 Mars 2026",
      avatar: "https://i.pravatar.cc/80?img=47",
    },
    {
      id: 5,
      name: "Ahmed Ben Ali",
      age: 45,
      lastVisit: "24 Mars 2026",
      avatar: "https://i.pravatar.cc/80?img=47",
    },
    {
      id: 6,
      name: "Ahmed Ben Ali",
      age: 45,
      lastVisit: "24 Mars 2026",
      avatar: "https://i.pravatar.cc/80?img=47",
    },
  ];

  const displayPatients = patients.length > 0 ? patients : defaultPatients;

  return (
    <div className="patient-list-grid">
      {displayPatients.map((patient) => (
        <PatientCard
          key={patient.id}
          patient={patient}
          onOpenFolder={onOpenFolder}
        />
      ))}
    </div>
  );
}