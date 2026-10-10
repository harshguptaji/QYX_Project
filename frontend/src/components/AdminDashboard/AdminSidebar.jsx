import { useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  ArrowLeft,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  X,
} from "lucide-react";

import logoImg from "../../assets/logo.png";
import "./AdminSidebar.css";

// Add future sidebar pages here.
const navigationItems = [
  {
    to: "/admin",
    label: "Overview",
    icon: LayoutDashboard,
    end: true,
  },
];

export default function AdminSidebar({
  isOpen,
  onClose,
  onLogout,
}) {
  const sidebarRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const media = window.matchMedia("(max-width: 1024px)");
    if (!media.matches) return;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const elements = sidebarRef.current?.querySelectorAll(
        'a[href], button:not([disabled])'
      );

      if (!elements?.length) return;

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    const handleResize = () => {
      if (!media.matches) onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    media.addEventListener("change", handleResize);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      media.removeEventListener("change", handleResize);

      if (
        previousFocus instanceof HTMLElement &&
        previousFocus.isConnected
      ) {
        previousFocus.focus();
      }
    };
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        ref={sidebarRef}
        id="admin-sidebar"
        className={`admin-sidebar ${
          isOpen ? "admin-sidebar--open" : ""
        }`}
        aria-label="Admin navigation"
      >
        <div className="admin-sidebar__top">
          <Link
            to="/"
            className="admin-sidebar__logo"
            onClick={onClose}
          >
            <img src={logoImg} alt="QYX MedTech home" />
          </Link>

          <button
            ref={closeRef}
            type="button"
            className="admin-sidebar__close"
            onClick={onClose}
            aria-label="Close admin menu"
          >
            <X aria-hidden="true" />
          </button>
        </div>

        <div className="admin-sidebar__account">
          <div className="admin-sidebar__account-icon">
            <ShieldCheck aria-hidden="true" />
          </div>

          <div>
            <strong>QYX Administration</strong>
            <span>Admin workspace</span>
          </div>
        </div>

        <p className="admin-sidebar__label">WORKSPACE</p>

        <nav className="admin-sidebar__navigation">
          {navigationItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `admin-sidebar__link ${
                  isActive ? "admin-sidebar__link--active" : ""
                }`
              }
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__bottom">
          <Link
            to="/"
            className="admin-sidebar__secondary"
            onClick={onClose}
          >
            <ArrowLeft aria-hidden="true" />
            Back to website
          </Link>

          <button
            type="button"
            className="admin-sidebar__secondary"
            onClick={onLogout}
          >
            <LogOut aria-hidden="true" />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}