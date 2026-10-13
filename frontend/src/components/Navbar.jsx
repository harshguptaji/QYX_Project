import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import Login from "./Login";
import Signup from "./Signup";
import "../style/Navbar.css";

const Navbar = () => {
  const { isAuthenticated, user } = useSelector(
    (state) => state.auth
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const profilePath =
    user?.role === "Admin" ? "/admin" : "/profile";

  const profileLabel =
    user?.role === "Admin" ? "Admin Dashboard" : "My Profile";

  const closeMenu = () => setMenuOpen(false);

  const openLogin = () => {
    closeMenu();
    setSignupOpen(false);
    setLoginOpen(true);
  };

  const closeLogin = useCallback(() => {
    setLoginOpen(false);
  }, []);

  const openSignup = () => {
    closeMenu();
    setLoginOpen(false);
    setSignupOpen(true);
  };

  const closeSignup = useCallback(() => {
    setSignupOpen(false);
  }, []);

  return (
    <>
      <header className="site-header">
        <nav className="navbar" aria-label="Main navigation">
          <Link
            to="/"
            className="navbar-logo"
            onClick={closeMenu}
          >
            QYX<span>.</span>
          </Link>

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
            className={`navbar-menu ${
              menuOpen ? "navbar-menu-open" : ""
            }`}
          >
            <div className="navbar-links">
              <Link to="/specialists" onClick={closeMenu}>
                Meet Our Specialists
              </Link>

              <Link to="/how-it-works" onClick={closeMenu}>
                How It Works
              </Link>

              <Link to="/doctors" onClick={closeMenu}>
                Doctors
              </Link>

              <Link to="/about" onClick={closeMenu}>
                About Us
              </Link>

              <Link to="/contact" onClick={closeMenu}>
                Contact
              </Link>

              <Link to="/faq" onClick={closeMenu}>
                FAQ
              </Link>
            </div>

            <div className="navbar-actions">
              {isAuthenticated ? (
                <Link
                  to={profilePath}
                  className="navbar-profile"
                  aria-label={profileLabel}
                  title={profileLabel}
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

                  <span>{profileLabel}</span>
                </Link>
              ) : (
                <>
                  <button
                    type="button"
                    className="navbar-login"
                    aria-haspopup="dialog"
                    aria-expanded={loginOpen}
                    onClick={openLogin}
                  >
                    Login
                  </button>

                  <button
                    type="button"
                    className="navbar-signup"
                    aria-haspopup="dialog"
                    aria-expanded={signupOpen}
                    onClick={openSignup}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      <Login isOpen={loginOpen} onClose={closeLogin} />
      <Signup isOpen={signupOpen} onClose={closeSignup} />
    </>
  );
};

export default Navbar;