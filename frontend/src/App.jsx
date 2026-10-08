import "./App.css";

import { useLayoutEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// Public pages
import FAQPage from "./pages/FAQPage";
import HomePage from "./pages/HomePage";
import DoctorSpecialist from "./pages/DoctorSpecialist";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import HowItsWorkPage from "./pages/HowItsWorkPage";
import DoctorPage from "./pages/DoctorPage";

// Dashboard layout and pages
import UserDashboard from "./pages/UserDashboard";
import UserProfilePage from "./pages/UserProfilePage";
import UserAppointmentsPage from "./pages/UserAppointmentsPage";
import AppointmentDetailsPage from "./pages/AppointmentDetailsPage";

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
      {/* Public pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route
        path="/specialists"
        element={<DoctorSpecialist />}
      />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route
        path="/how-it-works"
        element={<HowItsWorkPage />}
      />
      <Route path="/doctors" element={<DoctorPage />} />

      {/* Dashboard pages sharing SideNavbar */}
      <Route element={<UserDashboard />}>
        <Route
          path="/profile"
          element={<UserProfilePage />}
        />
        <Route
    path="/appointments"
    element={<UserAppointmentsPage />}
  />

  <Route
    path="/appointments/:appointmentId"
    element={<AppointmentDetailsPage />}
  />
      </Route>

      {/* Page not found */}
      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  );
}

export default App;