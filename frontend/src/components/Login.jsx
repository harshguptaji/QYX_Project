import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "../style/Login.css";

export default function Login({ isOpen, onClose }) {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const dialogRef = useRef(null);
  const emailRef = useRef(null);
  const id = useId();

  useEffect(() => {
    if (!isOpen) return;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    emailRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const elements = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), a[href]'
      );

      if (!elements?.length) return;

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setMessage("");
      setShowPassword(false);
    }
  }, [isOpen]);

  const handleSubmit = (event) => {
    event.preventDefault();

    // Connect your login API here.
    // Get values using:
    // const data = new FormData(event.currentTarget);
    // const email = data.get("email");
    // const password = data.get("password");

    setMessage("Please connect your login API to enable sign in.");
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="qyx-login-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className="qyx-login"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
      >
        <button
          className="qyx-login__close"
          type="button"
          aria-label="Close login"
          onClick={onClose}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>

        <div className="qyx-login__brand">
          QYX<span>.</span>
        </div>

        <p className="qyx-login__eyebrow">YOUR PRIVATE SPACE</p>

        <h2 id={`${id}-title`}>
          Welcome <em>back.</em>
        </h2>

        <p
          className="qyx-login__description"
          id={`${id}-description`}
        >
          Sign in to manage your appointments and continue your
          conversation with a specialist.
        </p>

        <form className="qyx-login__form" onSubmit={handleSubmit}>
          <div className="qyx-login__field">
            <label htmlFor={`${id}-email`}>Email address</label>

            <input
              ref={emailRef}
              id={`${id}-email`}
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="username"
              maxLength={254}
              required
            />
          </div>

          <div className="qyx-login__field">
            <label htmlFor={`${id}-password`}>Password</label>

            <div className="qyx-login__password">
              <input
                id={`${id}-password`}
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              <button
                className="qyx-login__visibility"
                type="button"
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                aria-controls={`${id}-password`}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    aria-hidden="true"
                  >
                    <path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                    <path d="M9.9 5.2A11 11 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.1 3.8M6.2 6.2A18 18 0 0 0 2 12s4 7 10 7a11 11 0 0 0 5.8-1.8" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    aria-hidden="true"
                  >
                    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {message && (
            <p className="qyx-login__message" role="status">
              {message}
            </p>
          )}

          <button className="qyx-login__submit" type="submit">
            Sign in
            <span aria-hidden="true">→</span>
          </button>
        </form>

        <div className="qyx-login__note">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
          >
            <rect x="5" y="10" width="14" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            <path d="M12 14v3" />
          </svg>

          <p>Your appointments, in your own private space.</p>
        </div>

        <p className="qyx-login__support">
          Need help signing in?{" "}
          <a
            href="https://wa.me/917453898747?text=Hello%20QYX%2C%20I%20need%20help%20signing%20in%20to%20my%20account."
            target="_blank"
            rel="noopener noreferrer"
          >
            Contact support
          </a>
        </p>
      </section>
    </div>,
    document.body
  );
}