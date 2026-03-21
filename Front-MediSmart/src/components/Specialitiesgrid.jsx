import React from "react";
import { useNavigate } from "react-router-dom";
import "./specialitiesgrid.css";

const SPECIALITIES = [
  {
    id: 1,
    name: "Cardiology",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    description:
      "Diagnosis and treatment of heart and cardiovascular system disorders. Our cardiologists specialize in heart disease prevention, management, and advanced cardiac care.",
    doctors: 2,
  },
  {
    id: 2,
    name: "General Medicine",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
    description:
      "Comprehensive primary care for adults covering routine check-ups, chronic disease management, and preventive health screenings for overall wellness.",
    doctors: 1,
  },
  {
    id: 3,
    name: "Dermatology",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/>
        <line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
    ),
    description:
      "Expert care for skin, hair, and nail conditions. From acne and eczema to skin cancer screenings, our dermatologists provide comprehensive skin health solutions.",
    doctors: 2,
  },
  {
    id: 4,
    name: "Orthopedics",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
        <line x1="6" y1="1" x2="6" y2="4"/>
        <line x1="10" y1="1" x2="10" y2="4"/>
        <line x1="14" y1="1" x2="14" y2="4"/>
      </svg>
    ),
    description:
      "Treatment of musculoskeletal conditions including bones, joints, ligaments, and muscles. Specializing in sports injuries, fractures, and joint replacement.",
    doctors: 2,
  },
  {
    id: 5,
    name: "Pediatrics",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    description:
      "Dedicated healthcare for infants, children, and adolescents. Our pediatricians provide preventive care, vaccinations, and treatment for childhood illnesses.",
    doctors: 1,
  },
  {
    id: 6,
    name: "Neurology",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
      </svg>
    ),
    description:
      "Specialized treatment for disorders of the nervous system including the brain, spinal cord, and nerves. Expertise in migraines, epilepsy, and neurological conditions.",
    doctors: 2,
  },
];

function SpecialityCard({ speciality, index }) {
  const navigate = useNavigate();

  return (
    <div
      className="sp-card"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="sp-card__icon">{speciality.icon}</div>
      <h3 className="sp-card__name">{speciality.name}</h3>
      <p className="sp-card__desc">{speciality.description}</p>
      <div className="sp-card__footer">
        <span className="sp-card__count">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
          </svg>
          {speciality.doctors} Doctors available
        </span>
        <button
          className="sp-card__view"
          onClick={() => navigate(`/doctors?specialty=${speciality.name}`)}
        >
          View
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

function SpecialitiesGrid() {
  return (
    <div className="sp-grid">
      {SPECIALITIES.map((s, i) => (
        <SpecialityCard key={s.id} speciality={s} index={i} />
      ))}
    </div>
  );
}

export default SpecialitiesGrid;