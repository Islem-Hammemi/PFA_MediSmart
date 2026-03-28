import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, Phone, Calendar, Eye, EyeOff, Plus, Star, Check, Heart, Shield, Clock, Users } from "lucide-react";
import { register } from "../services/authService";
import "../pages/auth.css";

const avatars = [
  "https://i.pravatar.cc/32?img=1",
  "https://i.pravatar.cc/32?img=2",
  "https://i.pravatar.cc/32?img=3",
  "https://i.pravatar.cc/32?img=4",
  "https://i.pravatar.cc/32?img=5",
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    prenom: "", nom: "", email: "",
    password: "", confirmPassword: "",
    telephone: "", dateNaissance: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      await register({
        prenom: form.prenom, nom: form.nom, email: form.email,
        password: form.password, telephone: form.telephone,
        dateNaissance: form.dateNaissance,
      });
      navigate("/dashboard-patient");
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
          <h2 className="auth-form-title">Welcome</h2>
          <p className="auth-form-subtitle">Create your MediSmart account</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-row-fields">
              <div className="auth-field">
                <label>First Name</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon"><User size={15} color="#94a3b8" /></span>
                  <input type="text" name="prenom" placeholder="Islem"
                    value={form.prenom} onChange={handleChange} required />
                </div>
              </div>
              <div className="auth-field">
                <label>Last Name</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon"><User size={15} color="#94a3b8" /></span>
                  <input type="text" name="nom" placeholder="Ouerteni"
                    value={form.nom} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div className="auth-field">
              <label>Email Address</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon"><Mail size={15} color="#94a3b8" /></span>
                <input type="email" name="email" placeholder="you@example.com"
                  value={form.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="auth-row-fields">
              <div className="auth-field">
                <label>Téléphone</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon"><Phone size={15} color="#94a3b8" /></span>
                  <input type="tel" name="telephone" placeholder="+216 XX XXX XXX"
                    value={form.telephone} onChange={handleChange} required />
                </div>
              </div>
              <div className="auth-field">
                <label>Date de naissance</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon"><Calendar size={15} color="#94a3b8" /></span>
                  <input type="date" name="dateNaissance"
                    value={form.dateNaissance} onChange={handleChange} required />
                </div>
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

            <div className="auth-field">
              <label>Confirm password</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon"><Lock size={15} color="#94a3b8" /></span>
                <input type={showConfirm ? "text" : "password"} name="confirmPassword"
                  placeholder="Enter your password" value={form.confirmPassword}
                  onChange={handleChange} required />
                <button type="button" className="auth-eye" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Inscription..." : "Sign up"}
            </button>
          </form>

          <div className="auth-divider" />

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login" className="auth-link auth-link-bold">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
