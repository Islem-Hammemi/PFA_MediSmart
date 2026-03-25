import React from 'react'
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulseIcon, Phone,LogOut } from 'lucide-react';
import { getCurrentUser, logout } from '../services/authService';
import './components.css';

function NavBarpatient() {
  const user       = getCurrentUser();
  const initials   = `${user?.prenom?.[0] ?? ""}${user?.nom?.[0] ?? ""}`.toUpperCase();
  const navigate   = useNavigate();
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [scrolled,    setScrolled]    = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();           // clears localStorage + calls backend
    navigate("/");            // redirect to home
  };

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
          <li><a href="/dashboard-patient">Dashboard</a></li>
          <li><a href="/appointments">Appointments</a></li>
          <li><a href="/queue">Queue</a></li>
        </ul>

        <div className="nav-right">
          <button><Phone size={15} /> Helpline</button>

          {/* ── Avatar dropdown ── */}
          <div className="pdp-wrap" ref={dropdownRef}>
            <div
              className="pdp"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ cursor: "pointer" }}
            >
              <span className="nom">{initials}</span>
            </div>

            {dropdownOpen && (
              <div className="pdp-dropdown">
                <div className="pdp-dropdown__user">
                  <span className="pdp-dropdown__name">
                    {user?.prenom} {user?.nom}
                  </span>
                  <span className="pdp-dropdown__email">{user?.email}</span>
                </div>
                <hr className="pdp-dropdown__divider" />
                <button
                  className="pdp-dropdown__logout"
                  onClick={handleLogout}
                >
                  <LogOut size={16}/> Log out
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>☰</div>
      </nav>
    </header>
  );
}

export default NavBarpatient;