import NavBar from "./components/NavBar"
import Footerr from "./components/Footerr"
import Acceuil from "./pages/Acceuil"

function App() {


  return (
    <div>
      <NavBar/>
      <Acceuil/>
      <Footerr/>
    </div>
  )
}

export default App


// src/App.jsx
import { useAuth } from "src/hooks/useAuth";
import LoginMedecin from "./pages/LoginMedecin";
import EvaluationMedecin from "./pages/EvaluationMedecin";


//gére l'affichage pour l'evaluation et déconnexion
function App2() {
  const { medecin, loading, erreur, login, logout } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
        fontFamily:"'DM Sans',sans-serif", color:"#94A3B8", fontSize:15,
      }}>
        Chargement…
      </div>
    );
  }

  // Médecin connecté → espace évaluations
  if (medecin) {
    return <EvaluationMedecin medecin={medecin} onLogout={logout} />;
  }

  // Non connecté → login
  return <LoginMedecin onLogin={login} erreur={erreur} />;
}

