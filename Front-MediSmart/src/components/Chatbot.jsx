import React, { useState, useRef, useEffect } from "react";
import "./chatbot.css";

// ✅ API key is now server-side only — not exposed in frontend
const API_URL = import.meta.env.VITE_API_URL; // http://localhost:5000/api

const SYSTEM_PROMPT = `You are MediSmart AI, a friendly and professional medical assistant for the MediSmart hospital platform in Tunisia.

YOUR ROLE:
- Help patients navigate the MediSmart platform
- Answer health-related questions clearly and reassuringly
- Guide users to book appointments, get tickets, or find doctors

MEDISMART PLATFORM INFO:
- Hospital hours: Monday–Friday 07:00–19:00, Emergency 24/7
- Emergency phone: +216 71 000 000
- Specialties: Cardiology, General Medicine, Dermatology, Orthopedics, Pediatrics, Neurology
- Average wait time: ~18 minutes
- To book: Doctors page → click a doctor → Book Appointment
- Same-day ticket: Doctors page → click a doctor → Same-Day Ticket
- Queue tracker at /queue, appointment history at /appointments

HOW TO RESPOND:
- Be concise (2-4 sentences), warm, and professional
- Respond in the SAME LANGUAGE the user uses (French or English or Arabic)
- For symptoms, give general advice but always recommend seeing a doctor
- Never diagnose — say "consult a doctor for a proper diagnosis"
- Emergency? Immediately say call +216 71 000 000
- You are NOT a replacement for a real doctor`;


const BOT_INTRO = {
  id: 1, role: "bot",
  text: "Hi! I'm MediSmart AI, your personal health assistant. How can I help you today?",
};

const Chatbot = () => {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([BOT_INTRO]);
  const [input,    setInput]    = useState("");
  const [typing,   setTyping]   = useState(false);
  const [error,    setError]    = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, typing]);

  // ✅ Calls our own backend — key never exposed to browser
  const callLLM = async (history) => {
    const res = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...history.map((m) => ({
            role:    m.role === "bot" ? "assistant" : "user",
            content: m.text,
          })),
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || "Sorry, no response.";
  };

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || typing) return;
    setError(null);

    const userMsg = { id: Date.now(), role: "user", text: userText };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setTyping(true);

    try {
      // Skip the intro message to save tokens
      const history = updated.filter((m) => m.id !== 1);
      const reply   = await callLLM(history);
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "bot", text: reply }]);
    } catch (err) {
      console.error("Chat error:", err.message);
      setError("Couldn't reach AI. Please try again.");
      setMessages(messages); // revert
    } finally {
      setTyping(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      <button
        className={`chat-fab ${open ? "chat-fab--active" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label="Open AI Chat"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6"  x2="6"  y2="18"/>
            <line x1="6"  y1="6"  x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h3a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3h3V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2z"/>
            <circle cx="9"  cy="13" r="1" fill="currentColor"/>
            <circle cx="15" cy="13" r="1" fill="currentColor"/>
            <path d="M9 17h6"/>
          </svg>
        )}
        {!open && <span className="chat-fab__dot" />}
      </button>

      <div className={`chat-window ${open ? "chat-window--open" : ""}`}>
        <div className="chat-header">
          <div className="chat-header__avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h3a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3h3V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2z"/>
              <circle cx="9"  cy="13" r="1" fill="currentColor"/>
              <circle cx="15" cy="13" r="1" fill="currentColor"/>
              <path d="M9 17h6"/>
            </svg>
          </div>
          <div className="chat-header__info">
            <span className="chat-header__name">MediSmart AI</span>
            <span className="chat-header__status">
              <span className="chat-header__dot" />
              {typing ? "Thinking..." : "Online · Always here to help"}
            </span>
          </div>
          <button className="chat-header__close" onClick={() => setOpen(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6"  x2="6"  y2="18"/>
              <line x1="6"  y1="6"  x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-msg chat-msg--${msg.role}`}>
              {msg.role === "bot" && (
                <div className="chat-msg__avatar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h3a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3h3V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2z"/>
                    <circle cx="9"  cy="13" r="1" fill="currentColor"/>
                    <circle cx="15" cy="13" r="1" fill="currentColor"/>
                    <path d="M9 17h6"/>
                  </svg>
                </div>
              )}
              <div className="chat-msg__bubble" style={{ whiteSpace: "pre-wrap" }}>
                {msg.text}
              </div>
            </div>
          ))}

          {typing && (
            <div className="chat-msg chat-msg--bot">
              <div className="chat-msg__avatar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h3a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3h3V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2z"/>
                  <circle cx="9"  cy="13" r="1" fill="currentColor"/>
                  <circle cx="15" cy="13" r="1" fill="currentColor"/>
                  <path d="M9 17h6"/>
                </svg>
              </div>
              <div className="chat-msg__bubble chat-msg__bubble--typing">
                <span /><span /><span />
              </div>
            </div>
          )}

          {error && (
            <div style={{
              margin: "8px 14px", padding: "8px 12px",
              background: "#fee2e2", color: "#991b1b",
              borderRadius: "8px", fontSize: "12.5px",
              display: "flex", alignItems: "center", gap: "6px",
            }}>
              {error}
              <button onClick={() => setError(null)} style={{
                marginLeft: "auto", background: "none", border: "none",
                cursor: "pointer", color: "#991b1b", fontSize: "14px", padding: 0,
              }}>✕</button>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

       

        <div className="chat-input-wrap">
          <input
            className="chat-input"
            type="text"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={typing}
          />
          <button
            className="chat-send"
            onClick={() => sendMessage()}
            disabled={!input.trim() || typing}
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2"  x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default Chatbot;