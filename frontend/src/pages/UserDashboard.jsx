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
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { logoutUser } from "../features/auth/authSlice";

import SideNavbar from "../components/UserDashboard/SideNavabr";
import logoImg from "../assets/logo.png";

import "./UserDashboard.css";

export default function UserDashboard() {
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

      closeSidebar();
      navigate("/", { replace: true });
    } catch {
      // SideNavbar displays logoutError from Redux.
    } finally {
      logoutRunningRef.current = false;
    }
  };

  if (!user) {
    const loading =
      !isAuthChecked || sessionStatus === "loading";

    return (
      <main className="user-dashboard__content">
        <section className="user-profile__form">
          <p role={loading ? "status" : "alert"}>
            {loading
              ? "Loading your account…"
              : sessionError || "Please sign in to access your account."}
          </p>

          {!loading && (
            <Link to="/">
              Back to home
            </Link>
          )}
        </section>
      </main>
    );
  }

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
            <img
              src={logoImg}
              alt="QYX MedTech"
            />
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
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
}