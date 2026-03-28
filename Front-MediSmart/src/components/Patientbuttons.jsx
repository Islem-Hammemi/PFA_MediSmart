import React from 'react'
import './patient.css'
import {Calendar,Search} from 'lucide-react'


function Patientbuttons(){
  return (
    <div className="quick-actions">
      <button className="quick-action-card">
        <Search className="quick-action-card__icon" />
        <span className="quick-action-card__label">Find a Doctor</span>
      </button>
 
      <button className="quick-action-card">
        <Calendar className="quick-action-card__icon" />
        <span className="quick-action-card__label">Appointments</span>
      </button>
    </div>
  );
}
 
export default Patientbuttons;