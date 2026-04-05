import "./doctorspage.css";

const appointments = [
  { id: 1, name: "Sarah Mansour", time: "10:30 AM", avatar: null },
  { id: 2, name: "Sarah Mansour", time: "10:30 AM", avatar: null },
  { id: 3, name: "Sarah Mansour", time: "10:30 AM", avatar: null },
  { id: 4, name: "Sarah Mansour", time: "10:30 AM", avatar: null },
];

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="#4A90D9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function TodaysAppointments() {
  return (
    <div className="ta-wrapper">
      <div className="ta-card">
        <div className="ta-header">
          <h2 className="ta-title">Today's Appointments</h2>
          <button className="ta-view-all">View All <ArrowIcon /></button>
        </div>

        <div className="ta-list">
          {appointments.map((apt) => (
            <div className="ta-item" key={apt.id}>
              <div className="ta-avatar">
                {apt.avatar
                  ? <img src={apt.avatar} alt={apt.name} />
                  : <span className="ta-avatar-placeholder" />}
              </div>
              <p className="ta-name">{apt.name}</p>
              <p className="ta-time">{apt.time}</p>
              <button className="ta-details-btn">Details</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}