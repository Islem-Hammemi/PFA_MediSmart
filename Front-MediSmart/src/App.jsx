import React from 'react';
import { Routes, Route } from "react-router-dom";
import Acceuil from "./pages/Acceuil";
import Patientdashboard from "./pages/patientdashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Doctors from "./pages/Doctors"; 
import Specialities from "./pages/Specialities"
import PrivateRoute from "./components/PrivateRoute";
import Queue from './pages/Queue';
import Appointments from './pages/Appointments';
import Medecindashboard from "./pages/Medecindashboard";
import Patients from "./pages/Patients";
import Schedule from "./pages/schedule";
import Tickets from "./pages/Tickets";    
import Reviews from "./pages/Reviews";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Acceuil />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/doctors" element={<Doctors />} />
      <Route path="/specialities" element={<Specialities />} />
      <Route path="/queue" element={<Queue />} />
      <Route path="/appointments" element={<Appointments />} />
      <Route path="/patients" element={<Patients />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/tickets" element={<Tickets />} />
      <Route path="/reviews" element={<Reviews />} />

      
      <Route
        path="/dashboard-patient"
        element={
          <PrivateRoute allowedRole="patient">
            <Patientdashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/dashboard-medecin"
        element={
          <PrivateRoute allowedRole="medecin">
            <Medecindashboard />
          </PrivateRoute>
        }
      />

    </Routes>
    
  );
}

export default App;





