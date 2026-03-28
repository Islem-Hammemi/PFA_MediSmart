import React, { useState } from 'react'
import './doctors.css'
import { Search, Stethoscope, Star } from "lucide-react";

import NavBarpatient from '../components/Navbarpatient';
import { isAuthenticated } from '../services/authService';
import NavBar from '../components/NavBar';
import Footerr from '../components/Footerr';
import Searchbarremed from '../components/Searchbarremed';
import DoctorsGrid from '../components/DoctorsGrid';

function Doctors() {
  const [search,    setSearch]    = useState("");
  const [specialty, setSpecialty] = useState("");

  return (
    <div>
      {isAuthenticated() ? <NavBarpatient /> : <NavBar />}

      <section className="hero">
        <div className="hero-content">
          <h1 className='hero-title'>
            Find the Right Doctor <span className='hero-title-two'>Faster</span>
          </h1>

          <p className='hero-subtitle'>
            Browse our network of verified healthcare professionals
          </p>

          <div className="stats">
            <div><Star size={16}/> 4.8 Rating</div>
            <div><Stethoscope size={16}/> 500+ Doctors</div>
          </div>

          <Searchbarremed
            onSearch={setSearch}
            onSpecialty={setSpecialty}
          />
        </div>
      </section>

      <DoctorsGrid
        search={search}
        specialty={specialty}
      />

      <Footerr/>
    </div>
  );
}

export default Doctors;