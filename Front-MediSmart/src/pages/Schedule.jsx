import react from 'react';
import './patients.css'

import Navbarmedecin from '../components/Navbarmedecin';
import WeeklyAgenda from '../components/WeeklyAgenda';
import Footerr from '../components/Footerr';


function Schedule() {
    return (
        <div className='consultation'>
            <Navbarmedecin />
            
            <section className="hero">
                <div className="hero-content">
                    <h1 className='hero-title'>
                        Smart  <span className='hero-title-two'> Scheduling</span>
                    </h1>
                    <p className='hero-subtitle'>
                        Get a clear view of your upcoming appointments and optimize your time efficiently.
                    </p>
                </div>
        </section>
        <br /><br /><br />

        <WeeklyAgenda />
        <br /><br /><br /><br />
        <Footerr />
        </div>
    );
}

export default Schedule;