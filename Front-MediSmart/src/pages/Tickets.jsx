import { useEffect, useState, useCallback } from 'react';
import './patients.css';
import Navbarmedecin     from '../components/Navbarmedecin';
import QueueStats        from '../components/QueueStats';
import TicketQueue       from '../components/TicketQueue';
import ConsultationTimer from '../components/ConsultationTimer';
import Footerr           from '../components/Footerr';
import { getToken }      from '../services/authService';

const API_BASE = 'http://localhost:5000';

function Tickets() {
  const [queue,          setQueue]          = useState([]);
  const [stats,          setStats]          = useState({ served: 0, waiting: 0 });
  const [currentPatient, setCurrentPatient] = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [lastFetched,    setLastFetched]    = useState(null);

  const fetchQueue = useCallback(async () => {
    try {
      const res  = await fetch(`${API_BASE}/api/consultations/today-queue`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      const data = json.data;

      const serving = data.find(
        p => p.ticket_statut === 'en_cours' || p.rdv_statut === 'en_cours'
      ) || null;

      const waiting = data.filter(
        p => p.ticket_statut !== 'en_cours' && p.rdv_statut !== 'en_cours'
      );

      // If no serving patient from backend, keep current one if exists
      const activePatient = serving || currentPatient;
      const filteredWaiting = activePatient
        ? waiting.filter(
            p => !(p.source_type === activePatient.source_type && p.source_id === activePatient.source_id)
          )
        : waiting;

      setQueue(filteredWaiting);
      setCurrentPatient(activePatient);
      setLastFetched(Date.now());
      setStats(prev => ({ ...prev, waiting: filteredWaiting.length }));

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 30_000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const handleServe = async (patient) => {
    if (currentPatient) {
      const ok = window.confirm(
        `You are currently serving ${currentPatient.patient_nom}. Finish their consultation first, or switch anyway?`
      );
      if (!ok) return;
    }

    try {
      const res  = await fetch(`${API_BASE}/api/consultations/serve/${patient.source_id}`, {
        method:  'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ type: patient.source_type }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      setCurrentPatient({
        ...patient,
        started_at: Math.floor(Date.now() / 1000),
      });
      setQueue(q => q.filter(p => !(p.source_id === patient.source_id && p.source_type === patient.source_type)));
      setStats(s => ({ ...s, waiting: Math.max(0, s.waiting - 1) }));

    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleFinish = async (patient, { notes, diagnostic, traitement, duration }) => {
    try {
      const res  = await fetch(`${API_BASE}/api/consultations/finish/${patient.source_id}`, {
        method:  'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          type:       patient.source_type,
          notes,
          diagnostic,
          traitement,
          patientId:  patient.patient_id,
          duration,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      setCurrentPatient(null);
      setStats(s => ({ served: (s.served || 0) + 1, waiting: s.waiting }));

    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="consultation">
      <Navbarmedecin />

      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Smart <span className="hero-title-two">Consultation</span>
          </h1>
          <p className="hero-subtitle">
            Enhance your workflow with structured notes and real-time session monitoring.
          </p>
        </div>
      </section>

      {error && (
        <p style={{ textAlign: 'center', color: 'red', padding: '1rem' }}>{error}</p>
      )}

      <QueueStats
        served={stats.served}
        waiting={stats.waiting}
        loading={loading}
      />

      <TicketQueue
        currentPatient={currentPatient}
        queue={queue}
        loading={loading}
        onServe={handleServe}
        lastFetched={lastFetched}
      />

      <ConsultationTimer
        currentPatient={currentPatient}
        onFinish={handleFinish}
      />

      <br /><br /><br /><br /><br />
      <Footerr />
    </div>
  );
}

export default Tickets;