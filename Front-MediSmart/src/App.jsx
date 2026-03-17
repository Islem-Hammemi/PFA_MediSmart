import NavBar from "./components/NavBar"
import Footerr from "./components/Footerr"
import Acceuil from "./pages/Acceuil"
import Navbarpatient from "./components/Navbarpatient"
import Patientdashboard from "./pages/patientdashboard"
import Stats from "./components/Stats"
import Nextapp from "./components/Nextapp"
import Ticket from "./components/Ticket"
import Patientbuttons from "./components/Patientbuttons"
function App() {


  return (
    <div>
      <Navbarpatient/>
      <Patientdashboard/>
      <Stats/>
      <Nextapp/>
      <Ticket/>
      <Patientbuttons/>
      <Footerr/>

     
    </div>
  )
}

export default App

