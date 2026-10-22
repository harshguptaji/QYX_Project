import "./App.css";

import { useEffect, useLayoutEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Navigate,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import { getCurrentUser } from "./features/auth/authSlice";

// Public pages
import FAQPage from "./pages/FAQPage";
import HomePage from "./pages/HomePage";
import DoctorSpecialist from "./pages/DoctorSpecialist";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import HowItsWorkPage from "./pages/HowItsWorkPage";
import DoctorPage from "./pages/DoctorPage";
import ForgotPassword from "./components/ForgotPassword";

// User dashboard
import UserDashboard from "./pages/UserDashboard";
import UserProfilePage from "./pages/UserProfilePage";
import UserAppointmentsPage from "./pages/UserAppointmentsPage";
import AppointmentDetailsPage from "./pages/AppointmentDetailsPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";

// Admin dashboard
import AdminLogin from "./components/AdminDashboard/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminOverviewPage from "./pages/Admin/AdminOverviewPage";
import AdminAllUsersPage from "./pages/Admin/AdminAllUsersPage";
import AdminUserDetailsPage from "./pages/Admin/AdminUserDetailsPage";
import AdminContactsPage from "./pages/Admin/AdminContactsPage";
import AdminAllAdminsPage from "./pages/Admin/AdminAllAdminsPage";
import AdminDetailsPage from "./pages/Admin/AdminDetailsPage";
import AdminQuizPage from "./pages/Admin/AdminQuizPage";
import AdminQuizResponsesPage from "./pages/Admin/AdminQuizResponsesPage";

function App() {
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  // Restore the authenticated user from the backend cookie.
  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  // Open each page from the top.
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

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      {/* User dashboard */}
      <Route element={<UserDashboard />}>
        <Route
          path="/profile"
          element={<UserProfilePage />}
        />
        
        <Route
          path="/change-password"
          element={<ChangePasswordPage />}
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

      {/* Admin dashboard */}
        <Route path="/accios/login" element={<AdminLogin />} />

      <Route path="/accios" element={<AdminDashboard />}>
        <Route index element={<AdminOverviewPage />} />

        <Route
          path="overview"
          element={<Navigate to="/accios" replace />}
        />

        <Route path="users" element={<AdminAllUsersPage />} />

        <Route path="users/:userId" element={<AdminUserDetailsPage />}/>

        <Route path="contacts" element={<AdminContactsPage />} />

        <Route path="admins" element={<AdminAllAdminsPage />} />

        <Route path="admins/:adminId" element={<AdminDetailsPage />} />

        <Route path="quiz" element={<AdminQuizPage />} />

        <Route path="quiz/responses" element={<AdminQuizResponsesPage />}/>

      </Route>

      {/* Previous overview URL */}
      <Route
        path="/overview"
        element={<Navigate to="/accios" replace />}
      />

      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  );
}

export default App;