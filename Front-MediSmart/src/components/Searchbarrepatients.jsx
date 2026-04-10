import React, { useState } from "react";
import "./doctorspage.css";

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function Searchbarrepatients({ onSearch }) {
  const [value, setValue] = useState("");

  const handleChange = (e) => {
    setValue(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <div className="searchbar-wrapper">
      <span className="searchbar-icon">
        <SearchIcon />
      </span>
      <input
        className="searchbar-input"
        type="text"
        placeholder="Search patients..."
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}