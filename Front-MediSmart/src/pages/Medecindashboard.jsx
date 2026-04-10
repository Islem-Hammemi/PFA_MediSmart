import React, { useState, useCallback } from 'react';
import './Medecindashboard.css';
import Navbarmedecin from '../components/Navbarmedecin';
import Docstats from '../components/Docstats';
import PendingRequests from '../components/PendingRequests';
import TodaysAppointments from '../components/TodaysAppointments';
import RecentReviews from '../components/RecentReviews';
import TicketQueuemed from '../components/TicketQueuemed';
import Footerr from '../components/Footerr';
import { getCurrentUser } from '../services/authService';

function Medecindashboard() {
  const user = getCurrentUser();
  // ✅ refreshKey — incrementing it forces WeeklyAgenda/TodaysAppointments to refetch
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUpdated = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className='medecindashboard'>
      <Navbarmedecin />

      <section className="hero">
        <div className="hero-content">
          <h1 className='hero-title'>
            Welcome back,{' '}
            <span className='hero-title-two'>
              Dr. {user?.prenom} {user?.nom} !
            </span>
          </h1>
          <p className='hero-subtitle'>
            Here is what's happening with your schedule today.
          </p>
        </div>
      </section>

      <div className="dashboard-container">
        <Docstats refreshKey={refreshKey} />

        {/* PendingRequests triggers onUpdated → refreshes other components */}
        <PendingRequests onUpdated={handleUpdated} />

        <div className="dashboard-bottom">
          <TodaysAppointments refreshKey={refreshKey} />
          <RecentReviews />
        </div>

        <TicketQueuemed />
      </div>

      <Footerr />
    </div>
  );
}

export default Medecindashboard;