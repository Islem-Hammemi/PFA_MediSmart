import { useEffect, useRef, useState, useCallback } from "react";
import { getToken } from "../services/authService";

const API_BASE = "http://localhost:5000/api";
const POLL_MS  = 10000;

// Helper to decode JWT role without a library
function getRoleFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || null;
  } catch {
    return null;
  }
}

export function useEvaluationPoller() {
  const [showRating,     setShowRating]     = useState(false);
  const [evaluationData, setEvaluationData] = useState(null);
  const [ratingDone,     setRatingDone]     = useState(false);
  const intervalRef = useRef(null);

  const poll = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    // ✅ Only poll for patients — doctors should never see this modal
    const role = getRoleFromToken(token);
    if (role !== "patient") return;

    try {
      const res = await fetch(`${API_BASE}/tickets/my-active-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        clearInterval(intervalRef.current);
        return;
      }

      const json = await res.json();
    
      if (!json.success || !json.needsEvaluation) return;

      clearInterval(intervalRef.current);
      setEvaluationData(json.evaluationData);
      setShowRating(true);

    } catch (err) {
      console.error("Evaluation poll error:", err);
    }
  }, []);

  useEffect(() => {
    poll();
    intervalRef.current = setInterval(poll, POLL_MS);
    return () => clearInterval(intervalRef.current);
  }, [poll]);

  // Restart polling after rating is dismissed (in case of another consultation)
  const handleSubmit = async ({ note, commentaire }) => {
    const res = await fetch(`${API_BASE}/evaluations`, {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:  `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        note,
        commentaire:    commentaire || null,
        medecin_id:     evaluationData.medecin_id,
        rendez_vous_id: evaluationData.rdv_id || null,
        ticket_id:      evaluationData.ticket_id || null,
      }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    setShowRating(false);
    setRatingDone(true);

    // ✅ Resume polling after submission (catches back-to-back consultations)
    intervalRef.current = setInterval(poll, POLL_MS);
  };

  return { showRating, evaluationData, ratingDone, handleSubmit };
}