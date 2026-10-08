import { useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  LockKeyhole,
  LogOut,
  Settings2,
  UserRound,
  X,
} from "lucide-react";

import logoImg from "../../assets/logo.png";
import "./SideNavbar.css";

const links = [
  {
    to: "/profile",
    label: "My profile",
    icon: UserRound,
  },
  {
    to: "/appointments",
    label: "Appointments",
    icon: CalendarDays,
  },
  {
    to: "/settings",
    label: "Account settings",
    icon: Settings2,
  },
];

export default function SideNavbar({
  isOpen,
  onClose,
  onLogout,
  user,
}) {
  const sidebarRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const mobileQuery = window.matchMedia("(max-width: 1024px)");

    if (!mobileQuery.matches) return;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

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
      if (!mobileQuery.matches) onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    mobileQuery.addEventListener("change", handleResize);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      mobileQuery.removeEventListener("change", handleResize);

      if (
        previousFocus instanceof HTMLElement &&
        previousFocus.isConnected
      ) {
        previousFocus.focus();
      }
    };
  }, [isOpen, onClose]);

  const initials = user.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <>
      {isOpen && (
        <div
          className="user-sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        ref={sidebarRef}
        id="dashboard-sidebar"
        className={`user-sidebar ${
          isOpen ? "user-sidebar--open" : ""
        }`}
        aria-label="User account"
      >
        <div className="user-sidebar__top">
          <Link
            to="/"
            className="user-sidebar__logo"
            onClick={onClose}
          >
            <img src={logoImg} alt="QYX MedTech home" />
          </Link>

          <button
            ref={closeButtonRef}
            type="button"
            className="user-sidebar__close"
            aria-label="Close account menu"
            onClick={onClose}
          >
            <X aria-hidden="true" />
          </button>
        </div>

        <div className="user-sidebar__user">
          <div className="user-sidebar__avatar" aria-hidden="true">
            {initials}
          </div>

          <div className="user-sidebar__identity">
            <strong>{user.name}</strong>
            <span>Patient account</span>
          </div>
        </div>

        <p className="user-sidebar__eyebrow">MY ACCOUNT</p>

        <nav
          className="user-sidebar__navigation"
          aria-label="Account navigation"
        >
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              onClick={onClose}
              className={({ isActive }) =>
                `user-sidebar__link ${
                  isActive ? "user-sidebar__link--active" : ""
                }`
              }
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="user-sidebar__bottom">
          <div className="user-sidebar__privacy">
            <LockKeyhole aria-hidden="true" />
            <p>
              Your space.
              <br />
              Your care. Your pace.
            </p>
          </div>

          <Link
            to="/"
            className="user-sidebar__secondary"
            onClick={onClose}
          >
            <ArrowLeft aria-hidden="true" />
            Back to website
          </Link>

          <button
            type="button"
            className="user-sidebar__secondary"
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