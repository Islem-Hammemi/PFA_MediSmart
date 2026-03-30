import React, { useState } from 'react';
import './Appointments.css';
import NavBarpatient from '../components/Navbarpatient';
import Footerr from '../components/Footerr';



const upcomingData = [
  { id: 1, initials: 'OA', name: 'Dr. Oussema Ayedi',  specialty: 'Cardiology',      date: 'March 20', time: '10:30 AM', status: 'Confirmed' },
  { id: 2, initials: 'AK', name: 'Dr. Amira Khelifi',  specialty: 'Dermatology',      date: 'March 25', time: '2:00 PM',  status: 'Confirmed' },
  { id: 3, initials: 'IH', name: 'Dr. Islam Hammami',  specialty: 'Neurology',        date: 'April 2',  time: '9:00 AM',  status: 'Pending'   },
];

const pastData = [
  { id: 4, initials: 'FT', name: 'Dr. Fatma Trabelsi', specialty: 'General Medicine', date: 'March 10', status: 'Completed' },
  { id: 5, initials: 'SB', name: 'Dr. Sarah Ben Ali',  specialty: 'Pediatrics',       date: 'Feb 28',   status: 'Completed' },
  { id: 6, initials: 'AM', name: 'Dr. Ahmed Mansour',  specialty: 'Orthopedics',      date: 'Feb 15',   status: 'Completed' },
];


function Appointments() {
      const [tab, setTab] = useState('upcoming');
      const list = tab === 'upcoming' ? upcomingData : pastData;
  return (
    <div className="appt-list">
      <NavBarpatient/>

      <section className="hero">
        <div className="hero-content">
          <h1 className='hero-title'>
            Your Care<span className='hero-title-two'> Schedule</span>
          </h1>

          <p className='hero-subtitle'>
           Stay on top of your medical appointments with a clear, organized view and real-time updates designed for your convenience.
           </p>

        </div>
      </section>
      
            {/* Body */}
            <div className="appt-body">
      
              {/* Tabs */}
              <div className="appt-tabs">
                <button
                  className={`appt-tab${tab === 'upcoming' ? ' appt-tab--active' : ''}`}
                  onClick={() => setTab('upcoming')}
                >
                  upcoming
                </button>
                <button
                  className={`appt-tab${tab === 'past' ? ' appt-tab--active' : ''}`}
                  onClick={() => setTab('past')}
                >
                  past
                </button>
              </div>
      
              {/* Cards */}
              <div className="appt-list">
                {list.map((item) => (
                  <div className="appt-card" key={item.id}>
      
                    <div className="appt-card-left">
                      <div className={`appt-avatar${tab === 'past' ? ' appt-avatar--past' : ''}`}>{item.initials}</div>
                      <div className="appt-info">
                        <span className="appt-doctor">{item.name}</span>
                        <span className="appt-specialty">{item.specialty}</span>
                        {tab === 'upcoming' && (
                          <span className={`appt-badge appt-badge--${item.status.toLowerCase()}`}>
                            {item.status}
                          </span>
                        )}
                      </div>
                    </div>
      
                    <div className="appt-card-right">
                      <div className="appt-date-block">
                        <span className="appt-date">{item.date}</span>
                        {tab === 'upcoming' && item.time && (
                          <span className="appt-time">{item.time}</span>
                        )}
                        {tab === 'past' && (
                          <span className="appt-completed">Completed</span>
                        )}
                      </div>
                      {tab === 'upcoming' && (
                        <div className="appt-actions">
                          <button className="appt-btn appt-btn--cancel">Cancel</button>
                          
                        </div>
                      )}
                    </div>
      
                  </div>
                ))}
              </div>
            </div>
      
            <Footerr />
      
    </div>
  )
}

export default Appointments
