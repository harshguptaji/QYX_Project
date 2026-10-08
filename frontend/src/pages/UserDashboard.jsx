import { useCallback, useEffect, useState } from "react";
import { Menu } from "lucide-react";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import SideNavbar from "../components/UserDashboard/SideNavabr";
import logoImg from "../assets/logo.png";
import "./UserDashboard.css";

export default function UserDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Replace with authenticated user data later.
  const [user, setUser] = useState({
    name: "Rahul Sharma",
    email: "rahul@example.com",
    mobile: "9876543210",
    age: 29,
    city: "Jaipur",
    gender: "male",
    role: "user",
    id: "USER-001",
  });

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  const handleLogout = () => {
    // For cookie-based authentication, call your logout API here.
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    closeSidebar();
    navigate("/", { replace: true });
  };

  return (
    <div className="user-dashboard">
      <SideNavbar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        onLogout={handleLogout}
        user={user}
      />

      <div className="user-dashboard__page">
        <header className="user-dashboard__mobile-header">
          <Link
            to="/"
            className="user-dashboard__logo"
            aria-label="QYX MedTech home"
          >
            <img src={logoImg} alt="QYX MedTech" />
          </Link>

          <button
            className="user-dashboard__menu-button"
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open dashboard menu"
            aria-expanded={sidebarOpen}
            aria-controls="dashboard-sidebar"
          >
            <Menu aria-hidden="true" />
          </button>
        </header>

        <main className="user-dashboard__content">
          <Outlet context={{ user, setUser }} />
        </main>
      </div>
    </div>
  );
}