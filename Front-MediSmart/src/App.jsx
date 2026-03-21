import React from 'react';
import { Routes, Route } from "react-router-dom";
import Acceuil from "./pages/Acceuil";
import Patientdashboard from "./pages/patientdashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Doctors from "./pages/Doctors"; 
import Specialities from "./pages/Specialities"
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Acceuil />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/doctors" element={<Doctors />} />
      <Route path="/specialities" element={<Specialities />} />

      
      <Route
        path="/dashboard-patient"
        element={
          <PrivateRoute allowedRole="patient">
            <Patientdashboard />
          </PrivateRoute>
        }
      />
    </Routes>
    
  );
}

export default App;





