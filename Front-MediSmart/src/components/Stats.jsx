import React from 'react'
import './patient.css'

function Stats () {
    return (
    <div className="stats-grid">
      <div className="stats-card">
        <span className="stats-card__value">3</span>
        <span className="stats-card__label">Upcoming</span>
      </div>
 
      <div className="stats-card">
        <span className="stats-card__value stats-card__value--accent">1</span>
        <span className="stats-card__label">Active Ticket</span>
      </div>
 
      <div className="stats-card">
        <span className="stats-card__value">12</span>
        <span className="stats-card__label">Past Visits</span>
      </div>
    </div>
  );
}
 
  

export default Stats;
