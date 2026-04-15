import React, { useState, useEffect, useRef } from 'react'
import { HeartPulseIcon, Phone, X } from 'lucide-react'
import './components.css'

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [helplineOpen, setHelplineOpen] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setHelplineOpen(false);
      }
    };
    if (helplineOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [helplineOpen]);

  return (
    <header className={scrolled ? "scrolled" : ""}>
      <nav>

        <div className="brand">
          <div className="logo"><HeartPulseIcon /></div>
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

          <button onClick={() => setHelplineOpen(!helplineOpen)}>
            <Phone size={15} /> Helpline
          </button>

          {helplineOpen && (
            <div className="helpline-popup" ref={popupRef}>

              <button className="helpline-close" onClick={() => setHelplineOpen(false)}>
                <X size={16} />
              </button>

              <div className="helpline-icon-wrapper">
                <Phone size={22} color="#ef4444" />
              </div>

              <p className="helpline-message">
                Call this number for any problems or if you need assistance.
              </p>

              <a className="helpline-number" href="tel:71555555">
                71 000 000
              </a>

            </div>
          )}

          <a className="login" href="/login">Login</a>
        </div>

        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>☰</div>

      </nav>
    </header>
  );
}

export default NavBar;