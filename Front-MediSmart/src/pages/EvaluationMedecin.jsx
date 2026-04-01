
import { useState } from "react";
import { useEvaluations, calculerStats, formaterDate } from "../hooks/useEvaluations";

const PHOTO_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api","");

function Etoiles({ note, taille = "md" }) {
  const px = { sm:14, md:18, lg:28 }[taille]||18;
  return (
    <span style={{ display:"inline-flex", gap:2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={px} height={px} viewBox="0 0 24 24"
          fill={i<=note?"#F5A623":"none"} stroke={i<=note?"#F5A623":"#CBD5E1"} strokeWidth="1.8">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  );
}

function AvatarMedecin({ nom, photo, taille=48 }) {
  const initiales = (nom||"M").split(" ")
    .filter(w => !["Dr","Dr."].includes(w))
    .map(w=>w[0]).slice(0,2).join("").toUpperCase();
  if (photo) return (
    <img src={`${PHOTO_BASE}${photo}`} alt={nom}
      style={{ width:taille, height:taille, borderRadius:"50%", objectFit:"cover", flexShrink:0 }}
      onError={e => { e.target.style.display="none"; }}
    />
  );
  return (
    <div style={{
      width:taille, height:taille, borderRadius:"50%",
      background:"linear-gradient(135deg,#1E6FBF,#0FA3B1)",
      display:"flex", alignItems:"center", justifyContent:"center",
      color:"#fff", fontWeight:700, fontSize:taille*0.36,
      fontFamily:"'Libre Baskerville',Georgia,serif", flexShrink:0,
    }}>{initiales}</div>
  );
}

/* ── Barre répartition ───────────────────── */
function BarreRepartition({ note, count, total }) {
  const pct = total ? Math.round((count/total)*100) : 0;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
      <span style={{ fontSize:12, color:"#64748B", width:20, textAlign:"right" }}>{note}★</span>
      <div style={{ flex:1, height:8, borderRadius:99, background:"#E2E8F0", overflow:"hidden" }}>
        <div style={{
          height:"100%", width:`${pct}%`, borderRadius:99,
          background:"linear-gradient(90deg,#F5A623,#F7C948)",
          transition:"width 0.7s cubic-bezier(.4,0,.2,1)",
        }}/>
      </div>
      <span style={{ fontSize:12, color:"#94A3B8", width:24 }}>{count}</span>
    </div>
  );
}

/* ── Carte évaluation ────────────────────── */
function CarteEvaluation({ ev }) {
  // Colonnes réelles de la table EVALUATIONS + JOIN USERS pour nom patient
  const nomPatient   = ev.patient_nom || ev.nom || "Patient anonyme";
  const initiales    = nomPatient.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();
  const consultation = ev.type_consultation || ev.specialite || "Consultation";

  return (
    <div
      style={{
        background:"#fff", borderRadius:16, padding:"20px 24px",
        boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"1px solid #F1F5F9",
        transition:"box-shadow 0.2s, transform 0.2s",
      }}
      onMouseEnter={e=>{ e.currentTarget.style.boxShadow="0 8px 28px rgba(30,111,191,0.12)"; e.currentTarget.style.transform="translateY(-2px)"; }}
      onMouseLeave={e=>{ e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.06)"; e.currentTarget.style.transform="translateY(0)"; }}
    >
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{
            width:40, height:40, borderRadius:"50%",
            background:"linear-gradient(135deg,#E0F2FE,#BAE6FD)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontWeight:700, fontSize:13, color:"#0369A1",
            fontFamily:"'Libre Baskerville',Georgia,serif",
          }}>{initiales}</div>
          <div>
            <p style={{ margin:0, fontWeight:600, fontSize:14, color:"#1E293B" }}>{nomPatient}</p>
            <p style={{ margin:0, fontSize:12, color:"#94A3B8" }}>{consultation}</p>
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <Etoiles note={Number(ev.note)} taille="sm"/>
          <p style={{ margin:"4px 0 0", fontSize:11, color:"#CBD5E1" }}>
            {ev.created_at ? formaterDate(ev.created_at) : ""}
          </p>
        </div>
      </div>
      {ev.commentaire && (
        <p style={{
          margin:0, fontSize:14, color:"#475569", lineHeight:1.65,
          fontStyle:"italic", borderLeft:"3px solid #BAE6FD", paddingLeft:12,
        }}>« {ev.commentaire} »</p>
      )}
    </div>
  );
}

/* ── Skeleton chargement (bech ma to93edech page vide wa9t chargement de données) */
function Skeleton() {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))", gap:16 }}>
      {[1,2,3,4].map(i => (
        <div key={i} style={{
          background:"#fff", borderRadius:16, padding:"20px 24px",
          border:"1px solid #F1F5F9", height:130,
          background:"linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%)",
          backgroundSize:"200% 100%",
          animation:"shimmer 1.4s infinite",
        }}/>
      ))}
    </div>
  );
}

/* ── Modal Logout (les boutons mta3 déconnexion et annule de déconnexion)*/
function ModalLogout({ onConfirmer, onAnnuler, enCours }) {
  return (
    <div
      onClick={onAnnuler}
      style={{
        position:"fixed", inset:0, background:"rgba(15,23,42,0.55)",
        backdropFilter:"blur(4px)", display:"flex", alignItems:"center",
        justifyContent:"center", zIndex:1000, animation:"fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={e=>e.stopPropagation()}
        style={{
          background:"#fff", borderRadius:20, padding:"36px 40px",
          maxWidth:380, width:"90%", textAlign:"center",
          boxShadow:"0 24px 64px rgba(0,0,0,0.18)",
          animation:"slideUp 0.25s cubic-bezier(.4,0,.2,1)",
        }}
      >
        <div style={{
          width:64, height:64, borderRadius:"50%", background:"#FEF2F2",
          display:"flex", alignItems:"center", justifyContent:"center",
          margin:"0 auto 20px",
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </div>
        <h3 style={{ margin:"0 0 8px", fontSize:20, fontWeight:700, color:"#1E293B", fontFamily:"'Libre Baskerville',Georgia,serif" }}>
          Déconnexion
        </h3>
        <p style={{ margin:"0 0 28px", fontSize:14, color:"#64748B", lineHeight:1.6 }}>
          Votre session sera révoquée et vous devrez vous reconnecter pour accéder à votre espace.
        </p>
        <div style={{ display:"flex", gap:12 }}>
          <button onClick={onAnnuler} disabled={enCours}
            style={{
              flex:1, padding:"12px 0", borderRadius:12,
              border:"1.5px solid #E2E8F0", background:"#fff",
              color:"#475569", fontWeight:600, fontSize:14,
              cursor:"pointer", fontFamily:"inherit",
            }}
            onMouseEnter={e=>e.currentTarget.style.background="#F8FAFC"}
            onMouseLeave={e=>e.currentTarget.style.background="#fff"}
          >Annuler</button>
          <button onClick={onConfirmer} disabled={enCours}
            style={{
              flex:1, padding:"12px 0", borderRadius:12, border:"none",
              background: enCours ? "#FCA5A5" : "linear-gradient(135deg,#EF4444,#DC2626)",
              color:"#fff", fontWeight:700, fontSize:14,
              cursor: enCours ? "not-allowed" : "pointer",
              boxShadow:"0 4px 14px rgba(239,68,68,0.35)", fontFamily:"inherit",
            }}
          >{enCours ? "Déconnexion…" : "Se déconnecter"}</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PAGE PRINCIPALE
══════════════════════════════════════════ */
export default function EvaluationMedecin({ medecin, onLogout }) {
  // medecin_id depuis authController → { id, medecin_id, nom, prenom, specialite, role }
  const medecinId = medecin?.medecin_id || medecin?.id;

  const { evaluations, loading, erreur } = useEvaluations(medecinId);
  const [filtreNote, setFiltreNote]       = useState(0);
  const [triRecent, setTriRecent]         = useState(true);
  const [showLogout, setShowLogout]       = useState(false);
  const [logoutEnCours, setLogoutEnCours] = useState(false);

  const stats = calculerStats(evaluations);

  const evaluationsFiltrees = evaluations
    .filter(ev => filtreNote === 0 || Number(ev.note) === filtreNote)
    .sort((a,b) => triRecent
      ? new Date(b.created_at) - new Date(a.created_at)
      : new Date(a.created_at) - new Date(b.created_at)
    );

  const handleLogout = async () => {
    setLogoutEnCours(true);
    await onLogout();
    setLogoutEnCours(false);
    setShowLogout(false);
  };

  const nomComplet = [medecin?.prenom, medecin?.nom].filter(Boolean).join(" ") || "Médecin";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        * { box-sizing:border-box; }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{transform:translateY(24px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes slideDown { from{transform:translateY(-12px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      <div style={{ minHeight:"100vh", background:"#F8FAFC", fontFamily:"'DM Sans',sans-serif" }}>

        {/* ── HEADER ── */}
        <header style={{
          background:"#fff", borderBottom:"1px solid #E2E8F0",
          padding:"0 32px", height:68,
          display:"flex", alignItems:"center", justifyContent:"space-between",
          position:"sticky", top:0, zIndex:100,
          boxShadow:"0 1px 12px rgba(0,0,0,0.05)",
        }}>
          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              width:36, height:36, borderRadius:10,
              background:"linear-gradient(135deg,#1E6FBF,#0FA3B1)",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <span style={{ fontFamily:"'Libre Baskerville',Georgia,serif", fontWeight:700, fontSize:20, color:"#1E293B" }}>
              Medi<span style={{ color:"#1E6FBF" }}>Smart</span>
            </span>
          </div>

          {/* Profil + Logout */}
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ textAlign:"right" }}>
              <p style={{ margin:0, fontSize:14, fontWeight:600, color:"#1E293B" }}>
                Dr. {nomComplet}
              </p>
              <p style={{ margin:0, fontSize:12, color:"#94A3B8" }}>{medecin?.specialite || "Médecin"}</p>
            </div>
            <AvatarMedecin nom={nomComplet} photo={medecin?.photo} taille={40}/>
            <button
              onClick={()=>setShowLogout(true)}
              style={{
                display:"flex", alignItems:"center", gap:7,
                padding:"8px 16px", borderRadius:10,
                border:"1.5px solid #FECACA", background:"#FFF5F5",
                color:"#EF4444", fontWeight:600, fontSize:13,
                cursor:"pointer", transition:"all 0.15s", fontFamily:"inherit",
              }}
              onMouseEnter={e=>{ e.currentTarget.style.background="#EF4444"; e.currentTarget.style.color="#fff"; e.currentTarget.style.borderColor="#EF4444"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="#FFF5F5"; e.currentTarget.style.color="#EF4444"; e.currentTarget.style.borderColor="#FECACA"; }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Déconnexion
            </button>
          </div>
        </header>

        {/* ── CONTENU ── */}
        <main style={{ maxWidth:1100, margin:"0 auto", padding:"36px 24px" }}>

          {/* Titre */}
          <div style={{ marginBottom:32, animation:"slideDown 0.4s ease" }}>
            <h1 style={{
              margin:"0 0 6px", fontSize:28, fontWeight:700,
              fontFamily:"'Libre Baskerville',Georgia,serif", color:"#1E293B",
            }}>Mes Évaluations</h1>
            <p style={{ margin:0, fontSize:15, color:"#64748B" }}>
              Avis de vos patients · données en temps réel
            </p>
          </div>

          {/* ── STATS ── */}
          <div style={{ display:"grid", gridTemplateColumns:"240px 1fr", gap:20, marginBottom:28 }}>
            {/* Score global */}
            <div style={{
              background:"linear-gradient(135deg,#1E6FBF,#0FA3B1)",
              borderRadius:20, padding:"28px 24px", color:"#fff",
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              boxShadow:"0 8px 28px rgba(30,111,191,0.25)",
            }}>
              <p style={{ margin:"0 0 4px", fontSize:12, opacity:0.8, letterSpacing:0.8, textTransform:"uppercase" }}>
                Note globale
              </p>
              <p style={{ margin:"0 0 10px", fontSize:58, fontWeight:700, fontFamily:"'Libre Baskerville',Georgia,serif", lineHeight:1 }}>
                {stats.moyenne}
              </p>
              <Etoiles note={Math.round(parseFloat(stats.moyenne))} taille="lg"/>
              <p style={{ margin:"10px 0 0", fontSize:13, opacity:0.7 }}>
                {stats.total} avis patient{stats.total > 1 ? "s" : ""}
              </p>
            </div>

            {/* Répartition */}
            <div style={{
              background:"#fff", borderRadius:20, padding:"24px 28px",
              boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:"1px solid #F1F5F9",
            }}>
              <p style={{ margin:"0 0 18px", fontWeight:600, fontSize:15, color:"#1E293B" }}>
                Répartition des notes
              </p>
              {[5,4,3,2,1].map(n => (
                <BarreRepartition key={n} note={n} count={stats.repartition[n]||0} total={stats.total}/>
              ))}
            </div>
          </div>

          {/* ── FILTRES ── */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:20 }}>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {[0,5,4,3,2,1].map(n => (
                <button key={n} onClick={()=>setFiltreNote(n)}
                  style={{
                    padding:"7px 16px", borderRadius:99, border:"1.5px solid",
                    borderColor: filtreNote===n ? "#1E6FBF" : "#E2E8F0",
                    background:  filtreNote===n ? "#EFF6FF" : "#fff",
                    color:       filtreNote===n ? "#1E6FBF" : "#64748B",
                    fontWeight:  filtreNote===n ? 700 : 500,
                    fontSize:13, cursor:"pointer", transition:"all 0.15s", fontFamily:"inherit",
                  }}
                >{n===0 ? `Tous (${stats.total})` : `${n} ★`}</button>
              ))}
            </div>
            <button onClick={()=>setTriRecent(!triRecent)}
              style={{
                display:"flex", alignItems:"center", gap:6,
                padding:"7px 14px", borderRadius:99,
                border:"1.5px solid #E2E8F0", background:"#fff",
                color:"#475569", fontSize:13, fontWeight:500,
                cursor:"pointer", fontFamily:"inherit",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                <polyline points={triRecent?"3 6 5 8 7 6":"3 18 5 16 7 18"}/>
              </svg>
              {triRecent ? "Plus récents" : "Plus anciens"}
            </button>
          </div>

          {/* ── LISTE ── */}
          {loading ? (
            <Skeleton/>
          ) : erreur ? (
            <div style={{ textAlign:"center", padding:"60px 0", color:"#EF4444" }}>
              <p style={{ margin:0, fontSize:15 }}>⚠ {erreur}</p>
              <p style={{ margin:"8px 0 0", fontSize:13, color:"#94A3B8" }}>Vérifiez votre connexion au serveur.</p>
            </div>
          ) : evaluationsFiltrees.length === 0 ? (
            <div style={{ textAlign:"center", padding:"60px 0", color:"#94A3B8" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" style={{ marginBottom:12 }}>
                <circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
              <p style={{ margin:0, fontSize:15 }}>Aucune évaluation pour ce filtre</p>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))", gap:16 }}>
              {evaluationsFiltrees.map((ev, i) => (
                <div key={ev.id||i} style={{ animation:`slideDown 0.3s ease ${i*0.05}s both` }}>
                  <CarteEvaluation ev={ev}/>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {showLogout && (
        <ModalLogout
          onConfirmer={handleLogout}
          onAnnuler={()=>setShowLogout(false)}
          enCours={logoutEnCours}
        />
      )}
    </>
  );
}