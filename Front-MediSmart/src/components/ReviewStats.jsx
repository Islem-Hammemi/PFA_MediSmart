import React from "react";
import "./doctorspage.css";

const ReviewStats = ({ rating = 4.8, totalReviews = 124, breakdown = [80, 15, 5, 0, 0] }) => {
  const stars = [5, 4, 3, 2, 1];

  const renderStars = (count, filled) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`star-icon ${i < filled ? "star-filled" : "star-empty"}`}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    ));
  };

  return (
    <div className="review-stats-wrapper">
      <div className="review-stats-card">
        <div className="stats-left">
          <div className="big-rating">{rating}</div>
          <div className="stars-row">{renderStars(5, Math.round(rating))}</div>
          <div className="review-count">Based on {totalReviews} reviews</div>
        </div>

        <div className="stats-right">
          {stars.map((star, index) => (
            <div className="bar-row" key={star}>
              <span className="bar-label">{star}</span>
              <svg className="bar-star-icon star-filled" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${breakdown[index]}%` }} />
              </div>
              <span className="bar-percent">{breakdown[index]} %</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewStats;