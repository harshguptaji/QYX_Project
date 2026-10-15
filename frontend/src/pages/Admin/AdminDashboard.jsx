import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useDispatch, useSelector } from "react-redux";
import { Menu } from "lucide-react";

import {
  Link,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { logoutUser } from "../../features/auth/authSlice";

import { resetAdminUsers } from
  "../../features/admin/users/adminUsersSlice";

import { resetAdminUserDetails } from
  "../../features/admin/userDetails/adminUserDetailsSlice";

import AdminSidebar from
  "../../components/AdminDashboard/AdminSidebar";

import logoImg from "../../assets/logo.png";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const logoutRunningRef = useRef(false);

  const {
    user,
    isAuthChecked,
    sessionStatus,
    sessionError,
  } = useSelector((state) => state.auth);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  const handleLogout = async () => {
    if (logoutRunningRef.current) return;

    logoutRunningRef.current = true;

    try {
      await dispatch(logoutUser()).unwrap();

      dispatch(resetAdminUsers());
      dispatch(resetAdminUserDetails());

      closeSidebar();
      navigate("/", { replace: true });
    } catch {
      // AdminSidebar displays the logout error from Redux.
    } finally {
      logoutRunningRef.current = false;
    }
  };

  if (!user) {
    const loading =
      !isAuthChecked || sessionStatus === "loading";

    return (
      <main className="admin-dashboard__content">
        <p role={loading ? "status" : "alert"}>
          {loading
            ? "Loading your account…"
            : sessionError || "Please sign in to access the admin dashboard."}
        </p>

        {!loading && <Link to="/">Back to home</Link>}
      </main>
    );
  }

  if (user.role !== "Admin") {
    return <Navigate to="/profile" replace />;
  }

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
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
}