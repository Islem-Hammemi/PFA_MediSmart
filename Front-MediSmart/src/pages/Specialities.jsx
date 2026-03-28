import React from 'react'
import './specialities.css'

import { Star, Stethoscope } from "lucide-react";

import { isAuthenticated } from '../services/authService';

import NavBarpatient from '../components/Navbarpatient';
import NavBar from '../components/NavBar';
import Specialitiesgrid from "../components/Specialitiesgrid";
import Footerr from '../components/Footerr';





function Specialities() {
  return (
    <div >
      {isAuthenticated() ? <NavBarpatient /> : <NavBar />}

      <section className="hero">
        <div className="hero-content">
          <h1 className='hero-title'>
            Areas of  <span className='hero-title-two'>Expertise</span>
          </h1>

          <p className='hero-subtitle'>
            Explore our wide range of medical specialties. <br />
          
          Each department is staffed with verified, experienced professionals ready to provide expert care. </p>

          <div className="stats">
            <div><Star size={16}/> 4.8 Rating</div>
            <div><Stethoscope size={16}/> 500+ Doctors</div>
          </div>
          

        </div>
      </section>

      <Specialitiesgrid />
      <Footerr/>
    </div>
  );
}
export default Specialities;