import React, { useState, useRef, useEffect } from "react";

import "./doccmp.css";

const SPECIALTIES = [
  "Cardiologie",
  "Neurologie",
  "Pédiatrie",
  "Dermatologie",
  "Orthopédie",
  "Gynécologie",
];

const Searchbarremed = ({ onSearch, onSpecialty }) => {
  const [search,   setSearch]   = useState("");
  const [specialty, setSpecialty] = useState("");
  const [open,     setOpen]     = useState(false);

  const handleSearch = (val) => {
    setSearch(val);
    onSearch?.(val);
  };

  const handleSpecialty = (val) => {
    setSpecialty(val);
    setOpen(false);
    onSpecialty?.(val);
  };

  const handleFindCare = () => {
    onSearch?.(search);
    onSpecialty?.(specialty);
  };

  const dropdownRef = useRef(null);

useEffect(() => {
  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setOpen(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);




  return (
    <div className="dsb-wrap">

      {/* Search input */}
      <div className="dsb-search">
        <svg className="dsb-search__icon" width="16" height="16"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          className="dsb-search__input"
          type="text"
          placeholder="Search doctors or specialties..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* Specialty dropdown */}
      <div className="dsb-dropdown" ref={dropdownRef} onClick={() => setOpen(!open)}>
        <span className="dsb-dropdown__label">
          {specialty || "Choose Specialty"}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9"/>
        </svg>

        {open && (
          <ul className="dsb-dropdown__menu">
            <li
              className="dsb-dropdown__item"
              onClick={() => handleSpecialty("")}
            >
              All Specialties
            </li>
            {SPECIALTIES.map((s) => (
              <li
                key={s}
                className={`dsb-dropdown__item ${specialty === s ? "dsb-dropdown__item--active" : ""}`}
                onClick={() => handleSpecialty(s)}
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Find Care button */}
      <button className="dsb-btn" onClick={handleFindCare}>
        Find Care
      </button>

    </div>
  );
};

export default Searchbarremed;