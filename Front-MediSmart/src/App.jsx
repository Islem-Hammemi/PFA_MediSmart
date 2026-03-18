import { Routes, Route } from "react-router-dom";
import NavBar from "./components/Navbar";
import Footerr from "./components/Footerr";
import Acceuil from "./pages/Acceuil";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <Routes>
      {/* Page d'accueil avec Navbar + Footer */}
      <Route
        path="/"
        element={
          <div>
            <NavBar />
            <Acceuil />
            <Footerr />
          </div>
        }
      />

    
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;