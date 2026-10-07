import './App.css'
import FAQPage from './pages/FAQPage';
import HomePage from './pages/HomePage';
import DoctorSpecialist from './pages/DoctorSpecialist';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import HowItsWorkPage from './pages/HowItsWorkPage';
import {Routes, Route} from "react-router-dom";

function App() {

  return (
    <>
    <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/specialists" element={<DoctorSpecialist/>} />
        <Route path="/about" element={<AboutPage/>} />
        <Route path="/contact" element={<ContactPage/>} />
        <Route path="/how-it-works" element={<HowItsWorkPage/>} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
    </>
  )
}

export default App