import React from 'react'
import './queue.css'
import NavBarpatient from '../components/Navbarpatient';
import QueueTracker from "../components/QueueTracker";
import Footerr from '../components/Footerr';




function Queue() {
 

  return (
    <div className='dashbackcolor'>
        <NavBarpatient/>

        <section className="hero">
        <div className="hero-content">
          <h1 className='hero-title'>
            Queue  <span className='hero-title-two'>Tracker</span>
          </h1>

          <p className='hero-subtitle'>
           Monitor your waiting time in real time and enjoy a smoother, more organized healthcare experience.
           </p>

        </div>
      </section>

      <QueueTracker/>
      <Footerr/>

    </div>
  );
}

export default Queue;