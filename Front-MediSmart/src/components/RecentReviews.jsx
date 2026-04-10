import React, { useState, useEffect } from "react";
import { getCurrentUser, getToken } from "../services/authService";
import "./doctorspage.css";

const API_BASE = "http://localhost:5000/api";

const Stars = ({ rating, max = 5 }) => (
  <div className="rr-stars">
    {Array.from({ length: max }).map((_, i) => (
      <svg
        key={i}
        width="16" height="16"
        viewBox="0 0 16 16"
        fill={i < rating ? "#f59e0b" : "none"}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 1.5l1.8 3.6 4 .58-2.9 2.82.68 3.98L8 10.35l-3.58 1.88.68-3.98L2.2 5.68l4-.58L8 1.5z"
          stroke="#f59e0b"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
    ))}
  </div>
);

export default function RecentReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = getCurrentUser();

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user?.medecin_id) { setLoading(false); return; }
      try {
        // limit=3 — only the last 3 reviews
        const res  = await fetch(
          `${API_BASE}/evaluations/medecin/${user.medecin_id}?limit=3`,
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );
        const json = await res.json();
        if (json.success) setReviews(json.evaluations || []);
      } catch (err) {
        console.error("RecentReviews fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [user?.medecin_id]);

  return (
    <div className="rr-wrapper">
      <h2 className="rr-title">Recent Reviews</h2>

      {loading && (
        <p style={{ color: "#94a3b8", fontSize: "13px" }}>Loading...</p>
      )}

      {!loading && reviews.length === 0 && (
        <p style={{
          color: "#94a3b8",
          fontSize: "13px",
          textAlign: "center",
          padding: "16px 0"
        }}>
          No reviews available yet.
        </p>
      )}

      {!loading && reviews.length > 0 && (
        <div className="rr-list">
          {reviews.map((review) => (
            <div className="rr-card" key={review.id}>
              <div className="rr-header">
                <span className="rr-name">{review.patient_nom}</span>
                <Stars rating={review.note} />
              </div>
              {review.commentaire ? (
                <p className="rr-comment">{review.commentaire}</p>
              ) : (
                <p className="rr-comment" style={{ fontStyle: "italic", opacity: 0.6 }}>
                  No comment left.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}