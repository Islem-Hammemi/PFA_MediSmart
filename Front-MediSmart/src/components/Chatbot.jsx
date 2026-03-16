import React from "react";
import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import "./chatbot.css";

const QUICK_ACTIONS = [
  "Book an appointment",
  "Find a specialist",
  "Check wait time",
  "Hospital hours",
];

const BOT_INTRO = {
  id: 1,
  role: "bot",
  text: "👋 Hi! I'm MediSmart AI, your personal health assistant. I can guide you to book appointments, find doctors, or answer health-related questions. How can I help you today?",
};

// Simple rule-based responses
const getResponse = (input) => {
  const msg = input.toLowerCase();
  if (msg.includes("appointment") || msg.includes("book"))
    return "To book an appointment, head to the Doctors section, find your specialist and click 'Book Appointment' on their card. Would you like me to help you find the right doctor?";
  if (msg.includes("wait") || msg.includes("time"))
    return "Current average wait time is around 18 minutes. Doctors marked as 'Available' are ready to see you right now!";
  if (msg.includes("specialist") || msg.includes("find") || msg.includes("doctor"))
    return "You can search for specialists using the search bar on the home page. Filter by specialty to narrow down your options. Which specialty are you looking for?";
  if (msg.includes("hour") || msg.includes("open") || msg.includes("schedule"))
    return "🏥 MediSmart Hospital is open Monday–Friday 7:00–19:00. Our emergency services are available 24/7. Call +216 71 000 911 for urgent care.";
  if (msg.includes("ticket"))
    return "Same-day tickets are available for doctors currently marked as 'Available'. Hover over a doctor's card on the home page and click 'Same-Day Ticket'.";
  if (msg.includes("emergency") || msg.includes("urgent"))
    return "🚨 For emergencies, please call +216 71 000 911 immediately or go to our emergency department — open 24/7.";
  return "I'm here to help! You can ask me about booking appointments, finding specialists, wait times, or hospital hours. What would you like to know?";
};

const AiChat = () => {
  const [open,    setOpen]    = useState(false);
  const [messages, setMessages] = useState([BOT_INTRO]);
  const [input,   setInput]   = useState("");
  const [typing,  setTyping]  = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, typing]);

  const sendMessage = (text) => {
    const userText = text || input.trim();
    if (!userText) return;

    const userMsg = { id: Date.now(), role: "user", text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botMsg = {
        id: Date.now() + 1,
        role: "bot",
        text: getResponse(userText),
      };
      setMessages((prev) => [...prev, botMsg]);
      setTyping(false);
    }, 900);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ── Sticky toggle button ── */}
      <button
        className={`chat-fab ${open ? "chat-fab--active" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label="Open AI Chat"
      >
        {open ? (
          // Close X
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6"  y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          // Bot icon
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h3a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3h3V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2z"/>
            <circle cx="9"  cy="13" r="1" fill="currentColor"/>
            <circle cx="15" cy="13" r="1" fill="currentColor"/>
            <path d="M9 17h6"/>
          </svg>
        )}
        {/* Online pulse dot */}
        {!open && <span className="chat-fab__dot" />}
      </button>

      {/* ── Chat window ── */}
      <div className={`chat-window ${open ? "chat-window--open" : ""}`}>

        {/* Header */}
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
              Online · Always here to help
            </span>
          </div>
          <button className="chat-header__close" onClick={() => setOpen(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6"  y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Messages */}
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
              <div className="chat-msg__bubble">{msg.text}</div>
            </div>
          ))}

          {/* Typing indicator */}
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
          <div ref={bottomRef} />
        </div>

        {/* Quick action chips */}
        <div className="chat-chips">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action}
              className="chat-chip"
              onClick={() => sendMessage(action)}
            >
              {action}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="chat-input-wrap">
          <input
            className="chat-input"
            type="text"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
          />
          <button
  className="chat-send"
  onClick={() => sendMessage()}
  disabled={!input.trim()}
>
  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
</button>
        </div>

      </div>
    </>
  );
};

export default AiChat;