import React, { useState, useEffect } from 'react';
import { getToken } from '../services/authService';
import './patients.css';
import Navbarmedecin from '../components/Navbarmedecin';
import Searchbarrepatients from '../components/Searchbarrepatients';
import PatientList from '../components/Patientlist';
import Addpatientbutton from '../components/Addpatientbutton';
import Footerr from '../components/Footerr';

const API_BASE = "http://localhost:5000/api";

function Patients() {
  const [allPatients,  setAllPatients]  = useState([]);
  const [filtered,     setFiltered]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");

  // ── Fetch patient list + their rdv ───────────────────────
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        // 1. Get patient list
        const res  = await fetch(`${API_BASE}/dossiers/mes-patients`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const json = await res.json();
        if (!json.success) return;

        const patients = json.patients || [];

        // 2. For each patient, fetch their rdv list
        const enriched = await Promise.all(
          patients.map(async (p) => {
            try {
              const dRes  = await fetch(`${API_BASE}/dossiers/patient/${p.patient_id}`, {
                headers: { Authorization: `Bearer ${getToken()}` },
              });
              const dJson = await dRes.json();
              if (dJson.success) {
                return {
                  ...p,
                  rendez_vous:      dJson.rendez_vous      || [],
                  dossiers_medicaux: dJson.dossiers_medicaux || [],
                };
              }
            } catch { /* ignore individual errors */ }
            return { ...p, rendez_vous: [], dossiers_medicaux: [] };
          })
        );

        setAllPatients(enriched);
        setFiltered(enriched);
      } catch (err) {
        console.error("Fetch patients error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  // ── Search filter ─────────────────────────────────────────
  const handleSearch = (value) => {
    setSearch(value);
    if (!value.trim()) {
      setFiltered(allPatients);
      return;
    }
    const kw = value.toLowerCase();
    setFiltered(
      allPatients.filter(
        (p) =>
          p.nom_complet?.toLowerCase().includes(kw) ||
          p.email?.toLowerCase().includes(kw)       ||
          p.telephone?.includes(kw)
      )
    );
  };

  return (
    <div className='patients-page'>
      <Navbarmedecin />

      <section className="hero">
        <div className="hero-content">
          <h1 className='hero-title'>
            Smart Patient <span className='hero-title-two'>Management</span>
          </h1>
          <p className='hero-subtitle'>
            Streamline patient information, track medical records, and deliver better care with ease.
          </p>
        </div>
      </section>

      <Searchbarrepatients onSearch={handleSearch} />
      <Addpatientbutton />

      <PatientList
        patients={filtered}
        loading={loading}
        onOpenFolder={(patient) => {
          // Optional: open a full-screen patient detail view
          console.log("Open folder for:", patient);
        }}
      />

      <br /><br /><br /><br />
      <Footerr />
    </div>
  );
}

export default Patients;