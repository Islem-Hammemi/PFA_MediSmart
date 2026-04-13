import React, { useState, useEffect } from "react";
import "./ratingmodal.css";

const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

function RatingModal({ medecinNom, specialite, onSubmit }) {
  const [selected,    setSelected]    = useState(0);
  const [hovered,     setHovered]     = useState(0);
  const [commentaire, setCommentaire] = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState("");

  // Block ESC — modal cannot be closed without rating
  useEffect(() => {
    const block = (e) => {
      if (e.key === "Escape") e.preventDefault();
    };
    window.addEventListener("keydown", block);
    return () => window.removeEventListener("keydown", block);
  }, []);

  const handleSubmit = async () => {
    if (!selected || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await onSubmit({ note: selected, commentaire });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const display = hovered || selected;

  return (
    <div className="rm-overlay" onClick={(e) => e.stopPropagation()}>
      <div className="rm-modal">

        <div className="rm-icon">★</div>
        <h2 className="rm-title">How was your consultation?</h2>
        <p className="rm-sub">Dr. {medecinNom} · {specialite}</p>

        <div className="rm-divider" />

        {/* Stars */}
        <div className="rm-stars">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              className="rm-star"
              onClick={() => setSelected(n)}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
            >
              <svg viewBox="0 0 24 24" width="40" height="40">
                <polygon
                  points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                  fill={n <= display ? "#EF9F27" : "#F1EFE8"}
                  stroke={n <= display ? "#BA7517" : "#D3D1C7"}
                  strokeWidth="1.5"
                />
              </svg>
            </button>
          ))}
        </div>

        <p className="rm-starlabel">
          {display ? LABELS[display] : "Select a rating"}
        </p>

        <textarea
          className="rm-textarea"
          placeholder="Add a comment (optional)..."
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          rows={3}
        />

        {error && <p className="rm-error">{error}</p>}

        <button
          className={`rm-btn ${selected ? "rm-btn--active" : "rm-btn--disabled"}`}
          onClick={handleSubmit}
          disabled={!selected || submitting}
        >
          {submitting ? "Submitting..." : "Rate doctor"}
        </button>

        {!selected && (
          <p className="rm-notice">You must select a star rating to continue</p>
        )}

      </div>
    </div>
  );
}

export default RatingModal;