import React from 'react'
import './dashboard.css'
import { getCurrentUser } from '../services/authService';

import NavBarpatient from '../components/Navbarpatient'; 
import Stats from '../components/Stats';
import Nextapp from '../components/Nextapp';
import Ticket from '../components/Ticket';
import Patientbuttons from '../components/Patientbuttons';
import Footerr from '../components/Footerr';



function Patientdashboard() {
  const user = getCurrentUser();
    return (
        <div className='dashbackcolor'>
      <NavBarpatient />
      <section className="hero">
        <div className="hero-content">
          <h1 className='hero-title'>
           Welcome back , <span className='hero-title-two'>{user?.prenom} {user?.nom} !</span>
          </h1>
          <p className='hero-subtitle' >
            Manage your health journey with easy access to appointments, tickets, and visit history.
          </p>
        </div>
      </section>



      <Stats />
      <Nextapp />
      <Ticket />
      <Patientbuttons />
      <Footerr />
      
      </div>
    )
}

export default Patientdashboard;