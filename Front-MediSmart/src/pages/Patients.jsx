import react from 'react'
import './patients.css'

import Navbarmedecin from '../components/Navbarmedecin';
import Searchbarrepatients from '../components/Searchbarrepatients';
import PatientList from '../components/Patientlist';
import Addpatientbutton from '../components/Addpatientbutton';
import Footerr from '../components/Footerr';

function Patients() {
  return (
    <div className='patients-page'>
        <Navbarmedecin />

        <section className="hero">
                <div className="hero-content">
                    <h1 className='hero-title'>
                        Smart Patient <span className='hero-title-two'>Management</span>
                    </h1>
                    <p className='hero-subtitle'>
                        Streamline patient information, track medical records, and deliver better care with ease.
                    </p>
                </div>
        </section>

        <Searchbarrepatients/>
        <Addpatientbutton/>
        <PatientList/>
        <br /><br /><br /><br />
        <Footerr/>
    </div>
  )
}

export default Patients;    