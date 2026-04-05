import "./doctorspage.css";

const CalendarIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="5" width="26" height="24" rx="3" stroke="#3B82F6" strokeWidth="2" fill="none"/>
    <path d="M3 11h26" stroke="#3B82F6" strokeWidth="2"/>
    <path d="M10 3v4M22 3v4" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 18l3.5 3.5L22 14" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ActivityIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 16h5l4-8 6 16 4-10 3 6 4-4h2" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="13" stroke="#3B82F6" strokeWidth="2" fill="none"/>
    <path d="M16 9v7l4 3" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TicketIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 11a2 2 0 000 4v2a2 2 0 000 4h26a2 2 0 000-4v-2a2 2 0 000-4V9a2 2 0 00-2-2H5a2 2 0 00-2 2v2z" stroke="#3B82F6" strokeWidth="2" fill="none" strokeLinejoin="round"/>
    <path d="M12 9v14M20 9v14" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3"/>
  </svg>
);

const stats = [
  { icon: <CalendarIcon />, label: "Today's Appointments", value: "4" },
  { icon: <ActivityIcon />, label: "Pending Requests", value: "2" },
  { icon: <ClockIcon />, label: "Avg. consult Time", value: "18m" },
  { icon: <TicketIcon />, label: "In Queue", value: "3" },
];

export default function Docstats() {
  return (
    <div className="stats-wrapper">
      <div className="doc-stats-grid">
        {stats.map((stat, i) => (
          <div className="stat-card-doc" key={i}>
            <div className="stat-icon">{stat.icon}</div>
            <p className="stat-label-doc">{stat.label}</p>
            <p className="stat-value">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}