// src/hooks/useEvaluations.js
import { useState, useEffect } from "react";
import { getEvaluationsMedecin } from "../services/api";

export function useEvaluations(medecinId) {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [erreur, setErreur]           = useState(null);

  useEffect(() => {
    if (!medecinId) return;
    (async () => {
      setLoading(true); setErreur(null);
      try {
        const data = await getEvaluationsMedecin(medecinId);
        setEvaluations(Array.isArray(data) ? data : []);
      } catch (e) { setErreur(e.message); }
      finally { setLoading(false); }
    })();
  }, [medecinId]);

  return { evaluations, loading, erreur };
}

export function calculerStats(evaluations) {
  if (!evaluations.length) return { moyenne: 0, total: 0, repartition: {5:0,4:0,3:0,2:0,1:0} };
  const total = evaluations.length;
  const somme = evaluations.reduce((a, e) => a + Number(e.note), 0);
  const repartition = {5:0,4:0,3:0,2:0,1:0};
  evaluations.forEach((e) => { repartition[e.note] = (repartition[e.note]||0)+1; });
  return { moyenne: (somme/total).toFixed(1), total, repartition };
}

export function formaterDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("fr-FR", { day:"numeric", month:"long", year:"numeric" });
}