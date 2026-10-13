import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff, LockKeyhole, X } from "lucide-react";

import {
  loginUser,
  clearAuthFeedback,
} from "../features/auth/authSlice";

import "../style/Login.css";

export default function Login({ isOpen, onClose }) {
  const dispatch = useDispatch();

  const { loginStatus, loginError } = useSelector(
    (state) => state.auth
  );

  const [showPassword, setShowPassword] = useState(false);

  const dialogRef = useRef(null);
  const emailRef = useRef(null);
  const submittingRef = useRef(false);
  const openRef = useRef(isOpen);
  const sessionRef = useRef(0);

  const id = useId();
  const loading = loginStatus === "loading";

  useEffect(() => {
    openRef.current = isOpen;
    sessionRef.current += 1;

    if (isOpen) {
      dispatch(clearAuthFeedback());
      setShowPassword(false);
    }

    return () => {
      openRef.current = false;
    };
  }, [isOpen, dispatch]);

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
      const activeElement = document.activeElement;

      if (
        !Array.from(elements).includes(activeElement)
      ) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);

      if (
        previousFocus instanceof HTMLElement &&
        previousFocus.isConnected
      ) {
        previousFocus.focus();
      }
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading || submittingRef.current) return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    const userData = {
      userEmail: String(formData.get("email") || "")
        .trim()
        .toLowerCase(),
      userPassword: String(formData.get("password") || ""),
    };

    submittingRef.current = true;
    const currentSession = sessionRef.current;

    try {
      await dispatch(loginUser(userData)).unwrap();

      if (
        openRef.current &&
        sessionRef.current === currentSession
      ) {
        form.reset();
        onClose();
      }
    } catch {
      // The Redux slice stores the backend error in loginError.
    } finally {
      submittingRef.current = false;
    }
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
          <X aria-hidden="true" />
        </button>

        <div className="qyx-login__brand">
          QYX<span>.</span>
        </div>

        <p className="qyx-login__eyebrow">
          YOUR PRIVATE SPACE
        </p>

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

        <form
          className="qyx-login__form"
          onSubmit={handleSubmit}
          aria-busy={loading}
        >
          <div className="qyx-login__field">
            <label htmlFor={`${id}-email`}>
              Email address
            </label>

            <input
              ref={emailRef}
              id={`${id}-email`}
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="username"
              maxLength={254}
              disabled={loading}
              required
            />
          </div>

          <div className="qyx-login__field">
            <label htmlFor={`${id}-password`}>
              Password
            </label>

            <div className="qyx-login__password">
              <input
                id={`${id}-password`}
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                required
              />

              <button
                className="qyx-login__visibility"
                type="button"
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                aria-controls={`${id}-password`}
                disabled={loading}
                onClick={() =>
                  setShowPassword((current) => !current)
                }
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" />
                ) : (
                  <Eye aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {loginError && (
            <p
              className="qyx-login__message qyx-login__message--error"
              role="alert"
            >
              {loginError}
            </p>
          )}

          <button
            className="qyx-login__submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}

            {!loading && (
              <span aria-hidden="true">→</span>
            )}
          </button>
        </form>

        <div className="qyx-login__note">
          <LockKeyhole aria-hidden="true" />
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