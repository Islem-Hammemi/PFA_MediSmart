import React from "react";
import "./doctorspage.css";

const PersonPlusIcon = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#4a7aff"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="22" y1="11" x2="16" y2="11" />
  </svg>
);

export default function Addpatientbutton({ onClick }) {
  return (
    <button className="add-patient-btn" onClick={onClick} title="Add Patient">
      <span className="add-patient-icon">
        <PersonPlusIcon />
      </span>
      <span className="add-patient-label">Add Patient</span>
    </button>
  );
}