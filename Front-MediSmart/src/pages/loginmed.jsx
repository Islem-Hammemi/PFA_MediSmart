// src/pages/LoginMedecin.jsx
// POST /api/auth/medecin/login  (authController.loginMedecin / US5)
import { useState } from "react";

export default function LoginMedecin({ onLogin, erreur }) {
  const [email, setEmail]     = useState("");
  const [mdp, setMdp]         = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onLogin(email, mdp);
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        * { box-sizing:border-box; }
        @keyframes fadeUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
        input:focus { outline:none; border-color:#1E6FBF !important; box-shadow:0 0 0 3px rgba(30,111,191,0.12); }
      `}</style>

      <div style={{
        minHeight:"100vh", fontFamily:"'DM Sans',sans-serif",
        background:"linear-gradient(135deg,#EFF6FF 0%,#F0FDFA 100%)",
        display:"flex", alignItems:"center", justifyContent:"center", padding:24,
      }}>
        <div style={{
          background:"#fff", borderRadius:24, padding:"44px 48px",
          width:"100%", maxWidth:420,
          boxShadow:"0 20px 60px rgba(30,111,191,0.12)",
          animation:"fadeUp 0.4s ease",
        }}>
          {/* Logo */}
          <div style={{ textAlign:"center", marginBottom:36 }}>
            <div style={{
              width:56, height:56, borderRadius:16,
              background:"linear-gradient(135deg,#1E6FBF,#0FA3B1)",
              display:"flex", alignItems:"center", justifyContent:"center",
              margin:"0 auto 16px", boxShadow:"0 8px 20px rgba(30,111,191,0.3)",
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <h1 style={{
              margin:"0 0 6px", fontSize:26, fontWeight:700, color:"#1E293B",
              fontFamily:"'Libre Baskerville',Georgia,serif",
            }}>
              Medi<span style={{ color:"#1E6FBF" }}>Smart</span>
            </h1>
            <p style={{ margin:0, fontSize:14, color:"#94A3B8" }}>Espace médecin — connexion sécurisée</p>
          </div>

          {/* Erreur */}
          {erreur && (
            <div style={{
              background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:12,
              padding:"12px 16px", marginBottom:20,
              display:"flex", alignItems:"center", gap:10,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p style={{ margin:0, fontSize:13, color:"#DC2626", fontWeight:500 }}>{erreur}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom:18 }}>
              <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#475569", marginBottom:7 }}>
                Adresse email
              </label>
              <input
                type="email" required value={email}
                onChange={e=>setEmail(e.target.value)}
                placeholder="dr.nom@clinique.tn"
                style={{
                  width:"100%", padding:"12px 14px", borderRadius:12,
                  border:"1.5px solid #E2E8F0", fontSize:14,
                  color:"#1E293B", fontFamily:"inherit", transition:"all 0.2s",
                }}
              />
            </div>

            {/* Mot de passe */}
            <div style={{ marginBottom:28 }}>
              <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#475569", marginBottom:7 }}>
                Mot de passe
              </label>
              <input
                type="password" required value={mdp}
                onChange={e=>setMdp(e.target.value)}
                placeholder="••••••••"
                style={{
                  width:"100%", padding:"12px 14px", borderRadius:12,
                  border:"1.5px solid #E2E8F0", fontSize:14,
                  color:"#1E293B", fontFamily:"inherit", transition:"all 0.2s",
                }}
              />
            </div>

            <button type="submit" disabled={loading}
              style={{
                width:"100%", padding:"14px 0", borderRadius:13, border:"none",
                background: loading ? "#93C5FD" : "linear-gradient(135deg,#1E6FBF,#0FA3B1)",
                color:"#fff", fontWeight:700, fontSize:15,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily:"inherit", letterSpacing:0.2,
                boxShadow:"0 6px 20px rgba(30,111,191,0.3)",
                transition:"opacity 0.2s",
              }}
            >
              {loading ? "Connexion en cours…" : "Se connecter"}
            </button>
          </form>

          <p style={{ textAlign:"center", marginTop:20, fontSize:12, color:"#CBD5E1" }}>
            JWT sécurisé · Session révocable
          </p>
        </div>
      </div>
    </>
  );
}