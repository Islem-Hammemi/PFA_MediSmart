import React, { useState, useEffect } from "react";
import { getCurrentUser, getToken } from "../services/authService";
import "./doctorspage.css";

const API_BASE = "http://localhost:5000/api";

const StarRating = ({ rating = 0 }) => (
  <div className="review-stars">
    {Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`review-star-icon ${i < rating ? "star-filled" : "star-empty"}`}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    ))}
  </div>
);

const ReviewCard = ({ review }) => {
  const initials = (review.patient_nom || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="review-card">
      <div className="review-card-header">
        <div className="reviewer-info">
          <div className="avatar">{initials}</div>
          <div className="reviewer-meta">
            <span className="reviewer-name">{review.patient_nom}</span>
            <span className="review-date">{review.date_evaluation}</span>
          </div>
        </div>
        <StarRating rating={review.note} />
      </div>
      {review.commentaire && (
        <p className="review-text">{review.commentaire}</p>
      )}
    </div>
  );
};

export default function PatientReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = getCurrentUser();

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user?.medecin_id) { setLoading(false); return; }
      try {
        const res  = await fetch(
          `${API_BASE}/evaluations/medecin/${user.medecin_id}?limit=20`,
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );
        const json = await res.json();
        if (json.success) setReviews(json.evaluations || []);
      } catch (err) {
        console.error("PatientReviews fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [user?.medecin_id]);

  return (
    <div className="patient-reviews-wrapper">
      <div className="patient-reviews-inner">
        <h2 className="section-title">Patient Reviews</h2>

        {loading && (
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>Loading...</p>
        )}

        {!loading && reviews.length === 0 && (
          <div className="reviews-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
              stroke="#cbd5e1" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p>No reviews available yet.</p>
            <span>Patient reviews will appear here after completed appointments.</span>
          </div>
        )}

        {!loading && reviews.length > 0 && (
          <div className="reviews-list">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}