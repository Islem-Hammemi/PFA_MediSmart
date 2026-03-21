import React from 'react'
import './patient.css'
import { useNavigate } from 'react-router-dom';
import {Calendar,Search} from 'lucide-react'


function Patientbuttons(){
  const navigate = useNavigate();

  return (
    <div className="quick-actions">
      <button className="quick-action-card" onClick={() => navigate('/doctors')}>
        <Search className="quick-action-card__icon" />
        <span className="quick-action-card__label">Find a Doctor</span>
      </button>
 
      <button className="quick-action-card" onClick={() => navigate('/appointments')}>
        <Calendar className="quick-action-card__icon" />
        <span className="quick-action-card__label">Appointments</span>
      </button>
    </div>
  );
}
 
export default Patientbuttons;