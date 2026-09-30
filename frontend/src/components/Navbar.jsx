import { useState } from "react";
import "../style/Navbar.css";

const Navbar = ({ isLoggedIn = true }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Main navigation">
        <a href="/" className="navbar-logo" onClick={closeMenu}>
          QYX<span>.</span>
        </a>

        <button
          type="button"
          className="navbar-menu-toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="navbar-links"
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>

        <div
          id="navbar-links"
          className={`navbar-menu ${menuOpen ? "navbar-menu-open" : ""}`}
        >
          <div className="navbar-links">
            <a href="/" onClick={closeMenu}>
              Home
            </a>
            <a href="/about" onClick={closeMenu}>
              About Us
            </a>
            <a href="/specialists" onClick={closeMenu}>
              Specialists
            </a>
            <a href="/contact" onClick={closeMenu}>
              Contact
            </a>
          </div>

          <div className="navbar-actions">
            {isLoggedIn ? (
              <a
                href="/profile"
                className="navbar-profile"
                aria-label="My profile"
                title="My profile"
                onClick={closeMenu}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
                </svg>
                <span>My Profile</span>
              </a>
            ) : (
              <>
                <a
                  href="/login"
                  className="navbar-login"
                  onClick={closeMenu}
                >
                  Login
                </a>
                <a
                  href="/signup"
                  className="navbar-signup"
                  onClick={closeMenu}
                >
                  Sign Up
                </a>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;