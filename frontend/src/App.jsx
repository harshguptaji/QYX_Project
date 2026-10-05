import './App.css'
import FAQPage from './pages/FAQPage';
import HomePage from './pages/HomePage';
import DoctorSpecialist from './pages/DoctorSpecialist';
import AboutPage from './pages/AboutPage';
import {Routes, Route} from "react-router-dom";

function App() {

  return (
    <>
    <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/specialists" element={<DoctorSpecialist/>} />
        <Route path="/about" element={<AboutPage/>} />
    </Routes>
    </>
  )
}

export default App