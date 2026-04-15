import { useState, useRef } from "react";
import "./doctorspage.css";

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);

export default function DoctorProfile() {
  const [profilePic, setProfilePic] = useState(null);
  const [isHoveringPic, setIsHoveringPic] = useState(false);
  const [fields, setFields] = useState({
    firstName: "Sarah",
    lastName: "Mitchell",
    phone: "+1 (555) 123-4567",
    email: "s.mitchell@medclinic.com",
  });

  const fileInputRef = useRef(null);

  const handlePicClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfilePic(url);
    }
  };

  const handleChange = (field, value) => {
    setFields((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="dp-page">
      <div className="dp-card dp-card--profile">
        <div
          className="dp-avatar-wrapper"
          onMouseEnter={() => setIsHoveringPic(true)}
          onMouseLeave={() => setIsHoveringPic(false)}
          onClick={handlePicClick}
        >
          <img
            src={profilePic || "https://i.pravatar.cc/150?img=12"}
            alt="Doctor"
            className={`dp-avatar${isHoveringPic ? " dp-avatar--dimmed" : ""}`}
          />
          <div className={`dp-avatar-overlay${isHoveringPic ? " dp-avatar-overlay--visible" : ""}`}>
            <CameraIcon />
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="dp-file-input"
            onChange={handleFileChange}
          />
        </div>
        <h2 className="dp-name">Dr. Sarah&nbsp; Mitchell</h2>
        <span className="dp-specialty">Cardiology</span>
      </div>

      <div className="dp-card dp-card--form">
        {[
          { label: "First Name", field: "firstName" },
          { label: "Last Name", field: "lastName" },
          { label: "Phone Number", field: "phone" },
          { label: "Email Address", field: "email" },
        ].map(({ label, field }) => (
          <div className="dp-field" key={field}>
            <label className="dp-label">{label}</label>
            <div className="dp-input-wrapper">
              <input
                className="dp-input"
                type={field === "email" ? "email" : "text"}
                value={fields[field]}
                onChange={(e) => handleChange(field, e.target.value)}
              />
              <span className="dp-pencil">
                <PencilIcon />
              </span>
            </div>
          </div>
        ))}
      </div>

      <button className="dp-save-btn">
        <SaveIcon />
        Save Changes
      </button>
    </div>
  );
}