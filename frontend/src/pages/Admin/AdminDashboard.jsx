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

import {
  getCurrentAdmin,
  logoutAdmin,
} from "../../features/admin/auth/adminAuthSlice";

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
  const [retryCount, setRetryCount] = useState(0);

  const logoutRunningRef = useRef(false);

  const {
    admin,
    isAuthChecked,
    sessionStatus,
    sessionError,
    logoutStatus,
  } = useSelector((state) => state.adminAuth);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  // Restore or validate the separate admin cookie session.
  useEffect(() => {
    const request = dispatch(getCurrentAdmin());

    return () => {
      request.abort();
    };
  }, [dispatch, retryCount]);

  useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  const handleLogout = async () => {
    if (
      logoutRunningRef.current ||
      logoutStatus === "loading"
    ) {
      return;
    }

    logoutRunningRef.current = true;

    try {
      await dispatch(logoutAdmin()).unwrap();

      dispatch(resetAdminUsers());
      dispatch(resetAdminUserDetails());

      closeSidebar();
      navigate("/accios/login", { replace: true });
    } catch {
      // AdminSidebar displays logoutError from adminAuth.
    } finally {
      logoutRunningRef.current = false;
    }
  };

  const retrySession = () => {
    setRetryCount((current) => current + 1);
  };

  if (!admin) {
    const loading =
      !isAuthChecked || sessionStatus === "loading";

    if (loading) {
      return (
        <main className="admin-dashboard__content">
          <p role="status">Checking your admin session…</p>
        </main>
      );
    }

    if (sessionError) {
      return (
        <main className="admin-dashboard__content">
          <p role="alert">{sessionError}</p>

          <button
            type="button"
            onClick={retrySession}
          >
            Try again
          </button>

          <p>
            <Link to="/accios/login">
              Go to admin login
            </Link>
          </p>
        </main>
      );
    }

    return <Navigate to="/accios/login" replace />;
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
            <img
              src={logoImg}
              alt="QYX MedTech"
            />
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
          <Outlet context={{ admin }} />
        </main>
      </div>
    </div>
  );
}