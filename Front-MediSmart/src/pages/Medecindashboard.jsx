import react from 'react'
import './Medecindashboard.css'
import Navbarmedecin from '../components/Navbarmedecin';
import Docstats from '../components/Docstats';
import PendingRequests from '../components/PendingRequests';
import TodaysAppointments from '../components/TodaysAppointments';
import RecentReviews from '../components/RecentReviews';
import TicketQueuemed from '../components/TicketQueuemed';
import Footerr from '../components/Footerr';

function Medecindashboard() {
    return (
        <div className='medecindashboard'>
            <Navbarmedecin />
            <section className="hero">
                <div className="hero-content">
                    <h1 className='hero-title'>
                        Welcome back, <span className='hero-title-two'>DR Ouerteni !</span>
                    </h1>
                    <p className='hero-subtitle'>
                        Here is what's happening with your schedule today.
                    </p>
                </div>
            </section>

            <div className="dashboard-container">
                <Docstats />
                <PendingRequests />
                <div className="dashboard-bottom">
                    <TodaysAppointments />
                    <RecentReviews />
                </div>
                <TicketQueuemed />
            </div>
            <Footerr />
        </div>
    )
}

export default Medecindashboard;