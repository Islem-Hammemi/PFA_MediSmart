import React from 'react'
import './patient.css'
 
 function Nextapp() {
  return (
    <div className="appointment-card">
      <div className="appointment-card__header">
        <span className="appointment-card__title">Next Appointment</span>
        <a href="#" className="appointment-card__view-all">View all</a>
      </div>
 
      <div className="appointment-card__row">
        <div className="appointment-card__left">
          <div className="appointment-card__avatar">OA</div>
          <div className="appointment-card__info">
            <span className="appointment-card__name">Dr. Oussema Ayedi</span>
            <span className="appointment-card__specialty">Cardiology</span>
          </div>
        </div>
 
        <div className="appointment-card__right">
          <div className="appointment-card__date">
            <span className="appointment-card__date-day">March 20</span>
            <span className="appointment-card__date-time">10:30 AM</span>
          </div>
          <span className="appointment-card__status">Confirmed</span>
        </div>
      </div>
    </div>
  );
}

export default Nextapp;
 