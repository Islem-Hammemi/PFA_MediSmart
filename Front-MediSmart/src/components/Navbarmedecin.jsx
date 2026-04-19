import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulseIcon, LogOut, UserCircle } from 'lucide-react';
import { getCurrentUser, logout } from '../services/authService';
import './components.css';
import Statusdropdown from "./Statusdropdown";
import DoctorProfile from "./DoctorProfile";

const IMG_BASE = "http://localhost:5000";

function Navbarmedecin() {
  const navigate = useNavigate();

  //  Read fresh from localStorage every render so photo updates instantly
  const getUser  = () => getCurrentUser();
  const user     = getUser();
  const initials = `${user?.prenom?.[0] ?? ""}${user?.nom?.[0] ?? ""}`.toUpperCase();

  //  photo state — initialized from stored user.photo
  const [photo,        setPhoto]        = useState(
    user?.photo ? `${IMG_BASE}${user.photo}` : null
  );
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const dropdownRef = useRef(null);
  const [activePath, setActivePath] = useState(window.location.pathname);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const onPop = () => setActivePath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  //  Called by DoctorProfile after successful upload
  const handlePhotoUpdated = (photoUrl) => {
    setPhoto(photoUrl); // photoUrl = full URL e.g. http://localhost:5000/uploads/medecins/xxx.jpg
  };

  return (
    <>
      <header className={scrolled ? "scrolled" : ""}>
        <nav>
          <div className="brand">
            <div className="logo"><HeartPulseIcon /></div>
            <span className="brand-name">
              <span className="s1">Medi</span><span className="s2">Smart</span>
            </span>
          </div>

          <ul className={menuOpen ? "nav-links active" : "nav-links"}>
              <li>
                <a href="/dashboard-medecin" className={activePath === '/dashboard-medecin' ? 'active' : ''} onClick={() => setActivePath('/dashboard-medecin')}>Dashboard</a>
              </li>
              <li>
                <a href="/patients" className={activePath === '/patients' ? 'active' : ''} onClick={() => setActivePath('/patients')}>Patients</a>
              </li>
              <li>
                <a href="/schedule" className={activePath === '/schedule' ? 'active' : ''} onClick={() => setActivePath('/schedule')}>Schedule</a>
              </li>
              <li>
                <a href="/tickets" className={activePath === '/tickets' ? 'active' : ''} onClick={() => setActivePath('/tickets')}>Consultation</a>
              </li>
              <li>
                <a href="/reviews" className={activePath === '/reviews' ? 'active' : ''} onClick={() => setActivePath('/reviews')}>Reviews</a>
              </li>
          </ul>

          <div className="nav-right">
            <Statusdropdown />

            {/* ── Avatar dropdown ── */}
            <div className="pdp-wrap" ref={dropdownRef}>
              <div
                className="pdp"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ cursor: "pointer" }}
              >
                {/*  Show photo if available, else initials */}
                {photo ? (
                  <img
                    src={photo}
                    alt="avatar"
                    className="pdp-photo"
                  />
                ) : (
                  <span className="nom">{initials}</span>
                )}
              </div>

              {dropdownOpen && (
                <div className="pdp-dropdown">
                  <div className="pdp-dropdown__user">
                    <span className="pdp-dropdown__name">{user?.prenom} {user?.nom}</span>
                    <span className="pdp-dropdown__email">{user?.email}</span>
                  </div>
                  <hr className="pdp-dropdown__divider" />

                  {/*  My Profile — ABOVE Log out */}
                  <button
                    className="pdp-dropdown__profile"
                    onClick={() => { setDropdownOpen(false); setProfileOpen(true); }}
                  >
                    <UserCircle size={16} /> My Profile
                  </button>

                  <button className="pdp-dropdown__logout" onClick={handleLogout}>
                    <LogOut size={16} /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>☰</div>
        </nav>
      </header>

      {/* ── Profile slide-in panel ── */}
      {profileOpen && (
        <div className="profile-panel-backdrop" onClick={() => setProfileOpen(false)}>
          <div className="profile-panel" onClick={(e) => e.stopPropagation()}>
            <button className="profile-panel__close" onClick={() => setProfileOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6"  y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <DoctorProfile onPhotoUpdated={handlePhotoUpdated} />
          </div>
        </div>
      )}
    </>
  );
}

export default Navbarmedecin;