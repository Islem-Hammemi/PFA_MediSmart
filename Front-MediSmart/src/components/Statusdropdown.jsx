import { useState, useRef, useEffect } from "react";
import "./doctorspage.css";

const STATUSES = [
  { id: "online", label: "Online", color: "#4ade80" },
  { id: "absent", label: "Absent", color: "#f87171" },
];

export default function Statusdropdown() {
  const [selected, setSelected] = useState(STATUSES[0]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (status) => {
    setSelected(status);
    setOpen(false);
  };

  return (
    <div className="status-dropdown" ref={ref}>
      <button
        className={`status-trigger ${open ? "open" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="status-dot" style={{ background: selected.color }} />
        <span className="status-label">{selected.label}</span>
        <svg
          className={`chevron ${open ? "rotated" : ""}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M2 4L6 8L10 4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul className="status-menu" role="listbox">
          {STATUSES.map((status) => (
            <li
              key={status.id}
              className={`status-option ${selected.id === status.id ? "active" : ""}`}
              role="option"
              aria-selected={selected.id === status.id}
              onClick={() => handleSelect(status)}
            >
              <span className="status-dot" style={{ background: status.color }} />
              <span className="status-label">{status.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}