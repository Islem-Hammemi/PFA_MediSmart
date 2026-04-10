import react from 'react';
import './patients.css'

import Navbarmedecin from '../components/Navbarmedecin';
import QueueStats from '../components/QueueStats';
import TicketQueue from '../components/TicketQueue';
import ConsultationTimer from '../components/ConsultationTimer';
import Footerr from '../components/Footerr';


function Tickets() {
    return (
        <div className="consultation">
            <Navbarmedecin />

            <section className="hero">
                <div className="hero-content">
                    <h1 className='hero-title'>
                        Smart  <span className='hero-title-two'>Consultation</span>
                    </h1>
                    <p className='hero-subtitle'>
                        Enhance your workflow with structured notes and real-time session monitoring.
                    </p>
                </div>
        </section>

        <QueueStats  />
        <TicketQueue  />
        <ConsultationTimer  />
        <br /><br /><br /><br /><br />
        <Footerr />

        </div>
    );
}

export default Tickets;