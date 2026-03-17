import React from 'react'
import './patient.css'


function Ticket() {
  return (
    <div className="ticket-card">
      <div className="ticket-card__side-bar" />
 
      <div className="ticket-card__body">
        <div className="ticket-card__header">
          <span className="ticket-card__title">Active Ticket</span>
          <span className="ticket-card__status">Waiting</span>
        </div>
 
        <div className="ticket-card__middle">
          <div className="ticket-card__info">
            <span className="ticket-card__id">#T-2026-0342</span>
            <span className="ticket-card__doctor">Dr. Islam Hammami · Neurology</span>
          </div>
 
          <div className="ticket-card__stats">
            <div className="ticket-card__stat">
              <span className="ticket-card__stat-value">#3</span>
              <span className="ticket-card__stat-label">Position</span>
            </div>
            <div className="ticket-card__stat">
              <span className="ticket-card__stat-value">12m</span>
              <span className="ticket-card__stat-label">Wait</span>
            </div>
          </div>
        </div>
 
        <button className="ticket-card__btn">Track Queue</button>
      </div>
    </div>
  );
}
export default Ticket;