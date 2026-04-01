// src/hooks/useAuth.js
import { useState, useEffect } from "react";
import { loginMedecin, logoutMedecin } from "../services/api";

export function useAuth() {
  const [medecin, setMedecin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur]   = useState(null);

  useEffect(() => {
    const token  = localStorage.getItem("medismart_token");
    const stored = localStorage.getItem("medismart_medecin");
    if (token && stored) {
      try { setMedecin(JSON.parse(stored)); }
      catch { localStorage.removeItem("medismart_token"); localStorage.removeItem("medismart_medecin"); }
    }
    setLoading(false);
  }, []);

  const login = async (email, motDePasse) => {
    setErreur(null);
    try {
      const u = await loginMedecin(email, motDePasse);
      setMedecin(u);
      return true;
    } catch (e) {
      setErreur(e.message);
      return false;
    }
  };

  const logout = async () => {
    await logoutMedecin(); // révoque token dans SESSIONS (sessionRepository.supprimer)
    setMedecin(null);
  };

  return { medecin, loading, erreur, login, logout };
}