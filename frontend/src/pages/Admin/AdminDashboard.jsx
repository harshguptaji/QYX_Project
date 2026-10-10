import { useCallback, useEffect, useState } from "react";
import { Menu } from "lucide-react";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import AdminSidebar from "../../components/AdminDashboard/AdminSidebar";
import logoImg from "../../assets/logo.png";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { pathname } = useLocation();
  const navigate = useNavigate();

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  const handleLogout = () => {
    // Call your logout API here when authentication is connected.
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    closeSidebar();
    navigate("/", { replace: true });
  };

  return (
    <div className="admin-dashboard">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        onLogout={handleLogout}
      />

      <div className="admin-dashboard__page">
        <header className="admin-dashboard__mobile-header">
          <Link
            to="/"
            className="admin-dashboard__logo"
            aria-label="QYX MedTech home"
          >
            <img src={logoImg} alt="QYX MedTech" />
          </Link>

          <button
            type="button"
            className="admin-dashboard__menu-button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open admin menu"
            aria-expanded={sidebarOpen}
            aria-controls="admin-sidebar"
          >
            <Menu aria-hidden="true" />
          </button>
        </header>

        <main className="admin-dashboard__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}