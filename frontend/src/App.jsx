import './App.css'
import FAQPage from './pages/FAQPage';
import HomePage from './pages/HomePage';
import DoctorSpecialist from './pages/DoctorSpecialist';
import {Routes, Route} from "react-router-dom";

function App() {

  return (
    <>
    <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/specialists" element={<DoctorSpecialist/>} />
    </Routes>
    </>
  )
}

export default App