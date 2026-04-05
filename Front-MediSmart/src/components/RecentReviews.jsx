import "./doctorspage.css";

const reviews = [
  {
    id: 1,
    name: "Omar K.",
    rating: 4,
    comment: "Very professional and tool the time to explain",
  },
  {
    id: 2,
    name: "Nour E.",
    rating: 3,
    comment: "Great doctor, slightly long wait time but worth it",
  },
  {
    id: 3,
    name: "Nour E.",
    rating: 3,
    comment: "Great doctor, slightly long wait time but worth it",
  },
];

const Stars = ({ rating, max = 5 }) => (
  <div className="rr-stars">
    {Array.from({ length: max }).map((_, i) => (
      <svg
        key={i}
        width="16"
        height="16"
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
  return (
    <div className="rr-wrapper">
      <h2 className="rr-title">Recent Reviews</h2>
      <div className="rr-list">
        {reviews.map((review) => (
          <div className="rr-card" key={review.id}>
            <div className="rr-header">
              <span className="rr-name">{review.name}</span>
              <Stars rating={review.rating} />
            </div>
            <p className="rr-comment">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}