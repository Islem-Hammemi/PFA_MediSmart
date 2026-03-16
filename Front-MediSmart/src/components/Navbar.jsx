import React from 'react'
import './components.css'
import {  HeartPulseIcon } from 'lucide-react'
import {  Phone } from 'lucide-react'
import { useState, useEffect } from "react";

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={scrolled ? "scrolled" : ""}>
      <nav>

        <div className="brand">
          <div className="logo"><HeartPulseIcon/></div>
          <span className="brand-name">
            <span className="s1">Medi</span><span className="s2">Smart</span>
          </span>
        </div>

        <ul className={menuOpen ? "nav-links active" : "nav-links"}>
          <li><a href="/">Home</a></li>
          <li><a href="/doctors">Doctors</a></li>
          <li><a href="/specialities">Specialities</a></li>
        </ul>

        <div className="nav-right">
          <button><Phone size={15} /> Helpline</button>
          <a className="login" href="/login">Login</a>
          
        </div>

        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </div>

      </nav>
    </header>
  );
}

export default NavBar;






  