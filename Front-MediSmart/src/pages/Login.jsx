import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Plus, Star, User, Check, Heart, Shield, Clock, Users } from "lucide-react";
import { login } from "../services/authService";
import "../pages/auth.css";

const avatars = [
  "https://i.pravatar.cc/32?img=1",
  "https://i.pravatar.cc/32?img=2",
  "https://i.pravatar.cc/32?img=3",
  "https://i.pravatar.cc/32?img=4",
  "https://i.pravatar.cc/32?img=5",
];

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login({ email: form.email, password: form.password });
      if (data.role === "medecin") navigate("/dashboard-medecin");
      else navigate("/dashboard-patient");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* ── Left Panel ── */}
      <div className="auth-left">
        <div className="auth-logo">
          <div className="auth-logo-icon"><Plus size={18} strokeWidth={3} /></div>
          <span>Medi <strong>Smart</strong></span>
        </div>

        <div className="auth-badge">
          <Star size={13} fill="#facc15" color="#facc15" /> Trusted by 900+ patients
        </div>

        <h1 className="auth-headline">
          Expert care, <span className="auth-headline-accent">without<br />the wait.</span>
        </h1>
        <p className="auth-subtext">
          One platform for patients and doctors. Sign in to access your personalized experience.
        </p>

        {/* Stats avec icônes Lucide */}
        <div className="auth-stats">
          <div className="auth-stat">
            <Shield size={16} color="#60a5fa" />
            <div className="auth-stat-num">42</div>
            <div className="auth-stat-label">Certified Doctors</div>
          </div>
          <div className="auth-stat">
            <Clock size={16} color="#fb923c" />
            <div className="auth-stat-num">18 <small>min</small></div>
            <div className="auth-stat-label">Avg Wait Time</div>
          </div>
          <div className="auth-stat">
            <Users size={16} color="#34d399" />
            <div className="auth-stat-num">230</div>
            <div className="auth-stat-label">Patients Served</div>
          </div>
        </div>

        <div className="auth-features">
          <div className="auth-feature-group">
            <div className="auth-feature-title">
              <User size={14} color="#60a5fa" /> For Patients
            </div>
            <ul>
              <li><Check size={12} color="#34d399" /> Book appointments in seconds</li>
              <li><Check size={12} color="#34d399" /> Access your health records anytime</li>
              <li><Check size={12} color="#34d399" /> Queue tracker for you</li>
            </ul>
          </div>
          <div className="auth-feature-group">
            <div className="auth-feature-title">
              <Heart size={14} color="#34d399" /> For Doctors
            </div>
            <ul>
              <li><Check size={12} color="#34d399" /> Manage your schedule efficiently</li>
              <li><Check size={12} color="#34d399" /> View and update patient records</li>
              <li><Check size={12} color="#34d399" /> Deliver exceptional care seamlessly</li>
            </ul>
          </div>
        </div>

        <div className="auth-social-proof">
          <div className="auth-avatars">
            {avatars.map((src, i) => (
              <img key={i} src={src} alt="" className="auth-avatar" style={{ left: i * 20 }} />
            ))}
          </div>
          <div className="auth-stars-block">
            <div className="auth-stars">★★★★★</div>
            <div className="auth-stars-label">Join thousands of patients</div>
          </div>
        </div>

        <div className="auth-tagline">
          <Heart size={13} color="#f87171" fill="#f87171" /> Expert care, without the wait.
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="auth-right">
        <div className="auth-form-card">
          <h2 className="auth-form-title">Welcome back</h2>
          <p className="auth-form-subtitle">Sign in to your MediSmart account</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label>Email Address</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon"><Mail size={15} color="#94a3b8" /></span>
                <input type="email" name="email" placeholder="you@example.com"
                  value={form.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="auth-field">
              <label>Password</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon"><Lock size={15} color="#94a3b8" /></span>
                <input type={showPassword ? "text" : "password"} name="password"
                  placeholder="Enter your password" value={form.password}
                  onChange={handleChange} required />
                <button type="button" className="auth-eye" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                </button>
              </div>
            </div>

            <div className="auth-row">
              <label className="auth-checkbox">
                <input type="checkbox" name="remember" checked={form.remember} onChange={handleChange} />
                Remember me
              </label>
              <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Connexion..." : "Log in"}
            </button>
          </form>

          <div className="auth-divider" />

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/register" className="auth-link auth-link-bold">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

