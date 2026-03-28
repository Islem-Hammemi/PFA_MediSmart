import React from 'react'
import './acceuil.css'
import { CalendarCheck,Stethoscope, Clock, Users,Search, SlidersHorizontal,ArrowRight, Star } from 'lucide-react';

import Searchbarre from '../components/Searchbarre';  
import Doctorofweek from '../components/Docofweek';
import Chatbot from '../components/Chatbot';








function Acceuil() {
  return(
     <div>
      
      <Chatbot />
      <section className="hero">
        <div className="hero-badge">
          <span className="badge-icon">🏥</span>
          Trusted by 100+ patients
        </div>

        <h1 className="hero-title">
          Expert care, <span className="hero-highlight">without the wait.</span>
        </h1>

        <p className="hero-subtitle">
          Your health and comfort are our top priorities.<br /> Book an appointment
          or get a ticket today — we've got you.
        </p>
        <button className="hero-btn">
          <CalendarCheck size={16} />
          Book Appointment
        </button>

        <div className="hero-stats">
          <div className="doctor-avatars">
            <img className="avatar" src="https://randomuser.me/api/portraits/men/34.jpg" alt="doctor 1" />
            <img className="avatar" src="https://randomuser.me/api/portraits/women/44.jpg" alt="doctor 2" />
            <img className="avatar" src="https://randomuser.me/api/portraits/men/52.jpg" alt="doctor 3" />
            <img className="avatar" src="https://randomuser.me/api/portraits/women/68.jpg" alt="doctor 4" />
          </div>
          <span className="stats-text">more than 20 doctors </span>

          <div className="divider-dot" />

          <span className="online-dot" />
          <span className="stats-text">Avg. wait: 18 min</span>
        </div>
      </section>






      <div className="stats-box">
        <div className="stat-item">
          <div className="stat-icon-wrap blue">
            <Stethoscope size={20} color="#3b82f6" />
          </div>
          <div className="stat-number">+20</div>
          <div className="stat-label">Doctors </div>
        </div>

        <div className="stat-divider" />
          <div className="stat-item">
          <div className="stat-icon-wrap blue">
            <Clock size={20} color="#3b82f6" />
          </div>
          <div className="stat-number">18 <span className="stat-unit">min</span></div>
          <div className="stat-label">Average Wait Time</div>
        </div>

        <div className="stat-divider" />

          <div className="stat-item">
            <div className="stat-icon-wrap blue">
              <Users size={20} color="#3b82f6" />
        </div>
        <div className="stat-number">+100</div>
        <div className="stat-label">Patients Served </div>
      </div>
    </div>



     
     
      <Searchbarre />
   


    

<Doctorofweek />



    </div>

    )
}

export default Acceuil;

