import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
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

const accountLinks = [
  {
    to: "/profile",
    label: "My profile",
    icon: UserRound,
    end: true,
  },
  {
    to: "/appointments",
    label: "Appointments",
    icon: CalendarDays,
    end: false,
  },
  {
    to: "/change-password",
    label: "Change password",
    icon: LockKeyhole,
    end: true,
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

  const { logoutStatus, logoutError } = useSelector(
    (state) => state.auth
  );

  const loggingOut = logoutStatus === "loading";

  const name = user?.name || "Your account";
  const role = user?.role || "User";

  const initials =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "Q";

  const accountLabel =
    role === "Admin"
      ? "Admin account"
      : role === "Doctor"
      ? "Doctor account"
      : "Patient account";

  const links =
    role === "Admin"
      ? [
          ...accountLinks,
          {
            to: "/admin",
            label: "Admin Dashboard",
            icon: Settings2,
            end: false,
          },
        ]
      : accountLinks;

  useEffect(() => {
    if (!isOpen) return;

    const mobileQuery = window.matchMedia(
      "(max-width: 1024px)"
    );

    if (!mobileQuery.matches) return;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const elements = Array.from(
        sidebarRef.current?.querySelectorAll(
          'a[href], button:not([disabled])'
        ) || []
      ).filter((element) => element.getClientRects().length > 0);

      if (!elements.length) return;

      const first = elements[0];
      const last = elements[elements.length - 1];
      const focusInside = sidebarRef.current?.contains(
        document.activeElement
      );

      if (
        event.shiftKey &&
        (document.activeElement === first || !focusInside)
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || !focusInside)
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
          <div
            className="user-sidebar__avatar"
            aria-hidden="true"
          >
            {initials}
          </div>

          <div className="user-sidebar__identity">
            <strong>{name}</strong>
            <span>{accountLabel}</span>
          </div>
        </div>

        <p className="user-sidebar__eyebrow">MY ACCOUNT</p>

        <nav
          className="user-sidebar__navigation"
          aria-label="Account navigation"
        >
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
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
            disabled={loggingOut}
            aria-busy={loggingOut}
          >
            <LogOut aria-hidden="true" />
            {loggingOut ? "Logging out…" : "Log out"}
          </button>

          {logoutError && (
            <p
              className="user-sidebar__logout-error"
              role="alert"
            >
              {logoutError}
            </p>
          )}
        </div>
      </aside>
    </>
  );
}