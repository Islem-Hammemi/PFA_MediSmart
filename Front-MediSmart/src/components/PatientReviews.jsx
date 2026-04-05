import React from "react";
import "./doctorspage.css";

const StarRating = ({ rating = 5 }) => {
  return (
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
};

const ReviewCard = ({ name, date, rating, text }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="review-card">
      <div className="review-card-header">
        <div className="reviewer-info">
          <div className="doc-avatar">{initials}</div>
          <div className="reviewer-meta">
            <span className="reviewer-name">{name}</span>
            <span className="review-date">{date}</span>
          </div>
        </div>
        <StarRating rating={rating} />
      </div>
      <p className="review-text">{text}</p>
    </div>
  );
};

const defaultReviews = [
  {
    id: 1,
    name: "Omar K.",
    date: "October 22, 2023",
    rating: 5,
    text: "Dr. Farhat is incredibly professional and attentive. He took the time to listen to all my concerns and explained the treatment plan clearly. Highly recommend!",
  },
  {
    id: 2,
    name: "Omar K.",
    date: "October 22, 2023",
    rating: 5,
    text: "Dr. Farhat is incredibly professional and attentive. He took the time to listen to all my concerns and explained the treatment plan clearly. Highly recommend!",
  },
  {
    id: 3,
    name: "Omar K.",
    date: "October 22, 2023",
    rating: 5,
    text: "Dr. Farhat is incredibly professional and attentive. He took the time to listen to all my concerns and explained the treatment plan clearly. Highly recommend!",
  },
  {
    id: 4,
    name: "Omar K.",
    date: "October 22, 2023",
    rating: 5,
    text: "Dr. Farhat is incredibly professional and attentive. He took the time to listen to all my concerns and explained the treatment plan clearly. Highly recommend!",
  },
];

const PatientReviews = ({ reviews = defaultReviews }) => {
  return (
    <div className="patient-reviews-wrapper">
      <div className="patient-reviews-inner">
        <h2 className="section-title">Patient Reviews</h2>
        <div className="reviews-list">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              name={review.name}
              date={review.date}
              rating={review.rating}
              text={review.text}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientReviews;