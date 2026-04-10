import React, { useState, useEffect } from "react";
import { getCurrentUser, getToken } from "../services/authService";
import "./doctorspage.css";

const API_BASE = "http://localhost:5000/api";

const StarIcon = ({ filled, size = 20 }) => (
  <svg
    className={`star-icon ${filled ? "star-filled" : "star-empty"}`}
    width={size} height={size}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);

export default function ReviewStats() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  const user = getCurrentUser();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.medecin_id) { setLoading(false); return; }
      try {
        const res  = await fetch(
          `${API_BASE}/evaluations/medecin/${user.medecin_id}?limit=0`,
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );
        const json = await res.json();
        if (json.success) setStats(json.stats);
      } catch (err) {
        console.error("ReviewStats fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user?.medecin_id]);

  const rating       = stats?.note_moyenne     ?? 0;
  const totalReviews = stats?.nb_evaluations   ?? 0;
  const pct          = stats?.repartition_pct  ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const stars        = [5, 4, 3, 2, 1];

  return (
    <div className="review-stats-wrapper">
      <div className="review-stats-card">

        {loading ? (
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>Loading...</p>
        ) : totalReviews === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: "14px", textAlign: "center", width: "100%" }}>
            No reviews available yet.
          </p>
        ) : (
          <>
            {/* ── Left: big rating ── */}
            <div className="stats-left">
              <div className="big-rating">{Number(rating).toFixed(1)}</div>
              <div className="stars-row">
                {Array.from({ length: 5 }, (_, i) => (
                  <StarIcon key={i} filled={i < Math.round(rating)} size={20} />
                ))}
              </div>
              <div className="review-count">
                Based on {totalReviews} review{totalReviews > 1 ? "s" : ""}
              </div>
            </div>

            {/* ── Right: bar breakdown ── */}
            <div className="stats-right">
              {stars.map((star) => (
                <div className="bar-row" key={star}>
                  <span className="bar-label">{star}</span>
                  <svg className="bar-star-icon star-filled" width="13" height="13"
                    viewBox="0 0 24 24">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                  </svg>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${pct[star] ?? 0}%` }}
                    />
                  </div>
                  <span className="bar-percent">{pct[star] ?? 0}%</span>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}