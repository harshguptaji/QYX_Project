import "./App.css";
import { useLayoutEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import FAQPage from "./pages/FAQPage";
import HomePage from "./pages/HomePage";
import DoctorSpecialist from "./pages/DoctorSpecialist";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import HowItsWorkPage from "./pages/HowItsWorkPage";

function App() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/specialists" element={<DoctorSpecialist />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/how-it-works" element={<HowItsWorkPage />} />
      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  );
}

export default App;