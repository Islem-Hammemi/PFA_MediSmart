import { useState, useRef, useEffect } from "react";
import { getCurrentUser, getToken } from "../services/authService";
import "./doctorspage.css";

const API_BASE = "http://localhost:5000/api";
const IMG_BASE = "http://localhost:5000";

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
    fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);

export default function DoctorProfile({ onPhotoUpdated }) {
  const user = getCurrentUser();

  const [previewUrl,    setPreviewUrl]    = useState(null); // local preview blob
  const [isHoveringPic, setIsHoveringPic] = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [success,       setSuccess]       = useState(false);
  const [error,         setError]         = useState(null);

  const [fields, setFields] = useState({
    prenom:    "",
    nom:       "",
    telephone: "",
    email:     "",
  });

  const fileInputRef = useRef(null);

  // ── Populate form from session ─────────────────────────────
  useEffect(() => {
    if (!user) return;
    setFields({
      prenom:    user.prenom    ?? "",
      nom:       user.nom       ?? "",
      telephone: user.telephone ?? "",
      email:     user.email     ?? "",
    });
  }, []);

  //  Compute current photo URL — from preview blob or stored path
  const photoSrc = previewUrl
    ? previewUrl
    : user?.photo
    ? `${IMG_BASE}${user.photo}`
    : null;

  const initials  = `${user?.prenom?.[0] ?? ""}${user?.nom?.[0] ?? ""}`.toUpperCase();
  const specialty = user?.specialite ?? "—";

  // ── Photo upload ───────────────────────────────────────────
  const handlePicClick = () => fileInputRef.current.click();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview immediately
    const blob = URL.createObjectURL(file);
    setPreviewUrl(blob);

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const res  = await fetch(`${API_BASE}/medecins/photo`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body:    formData,
      });
      const json = await res.json();

      if (json.success) {
        //  Save real path to localStorage so it persists
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...stored, photo: json.photo }));

        //  Tell Navbarmedecin to update its avatar
        if (onPhotoUpdated) onPhotoUpdated(json.photoUrl);
      }
    } catch (err) {
      console.error("Photo upload error:", err);
    }
  };

  // ── Save profile ───────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res  = await fetch(`${API_BASE}/medecins/profile`, {
        method:  "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${getToken()}`,
        },
        body: JSON.stringify(fields),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      // Update localStorage
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({
        ...stored,
        prenom:    fields.prenom,
        nom:       fields.nom,
        email:     fields.email,
        telephone: fields.telephone,
      }));

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dp-page">

      {/* ── Avatar card ── */}
      <div className="dp-card dp-card--profile">
        <div
          className="dp-avatar-wrapper"
          onMouseEnter={() => setIsHoveringPic(true)}
          onMouseLeave={() => setIsHoveringPic(false)}
          onClick={handlePicClick}
        >
          {/*  Show photo if available, otherwise initials */}
          {photoSrc ? (
            <img
              src={photoSrc}
              alt="Doctor"
              className={`dp-avatar${isHoveringPic ? " dp-avatar--dimmed" : ""}`}
            />
          ) : (
            <div className={`dp-avatar dp-avatar--initials${isHoveringPic ? " dp-avatar--dimmed" : ""}`}>
              {initials}
            </div>
          )}
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

        {/*  Name + specialty */}
        <h2 className="dp-name">Dr. {fields.prenom} {fields.nom}</h2>
        <span className="dp-specialty">{specialty}</span>
      </div>

      {/* ── Form card ── */}
      <div className="dp-card dp-card--form">
        {[
          { label: "First Name",    field: "prenom",    type: "text"  },
          { label: "Last Name",     field: "nom",       type: "text"  },
          { label: "Phone Number",  field: "telephone", type: "tel"   }, //  BACK
          { label: "Email Address", field: "email",     type: "email" },
        ].map(({ label, field, type }) => (
          <div className="dp-field" key={field}>
            <label className="dp-label">{label}</label>
            <div className="dp-input-wrapper">
              <input
                className="dp-input"
                type={type}
                value={fields[field]}
                onChange={(e) => setFields((p) => ({ ...p, [field]: e.target.value }))}
              />
              <span className="dp-pencil"><PencilIcon /></span>
            </div>
          </div>
        ))}
      </div>

      {error   && <p className="dp-feedback dp-feedback--error">⚠️ {error}</p>}
      {success && <p className="dp-feedback dp-feedback--success">✓ Profile updated.</p>}

      <button className="dp-save-btn" onClick={handleSave} disabled={saving}>
        <SaveIcon />
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}