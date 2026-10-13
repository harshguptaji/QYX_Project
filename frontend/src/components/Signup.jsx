import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff, LockKeyhole, X } from "lucide-react";

import {
  registerUser,
  clearAuthFeedback,
} from "../features/auth/authSlice";

import "../style/Signup.css";

export default function Signup({ isOpen, onClose }) {
  const dispatch = useDispatch();

  const { registerStatus, registerError } = useSelector(
    (state) => state.auth
  );

  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const dialogRef = useRef(null);
  const nameRef = useRef(null);
  const submittingRef = useRef(false);
  const openRef = useRef(isOpen);
  const sessionRef = useRef(0);

  const id = useId();
  const loading = registerStatus === "loading";
  const registered = Boolean(successMessage);

  const today = new Date();
  const maximumDOB = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  useEffect(() => {
    openRef.current = isOpen;
    sessionRef.current += 1;

    if (isOpen) {
      dispatch(clearAuthFeedback());
      setShowPassword(false);
      setValidationError("");
      setSuccessMessage("");
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
    nameRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const elements = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href]'
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

    if (submittingRef.current || loading || registered) return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    const signupData = {
      userName: String(formData.get("userName") || "").trim(),
      userEmail: String(formData.get("userEmail") || "")
        .trim()
        .toLowerCase(),
      userMobile: String(formData.get("userMobile") || "").trim(),
      userPassword: String(formData.get("userPassword") || ""),
      userCity: String(formData.get("userCity") || "").trim(),
      userDOB: String(formData.get("userDOB") || ""),
      userGender: String(formData.get("userGender") || ""),
    };

    setValidationError("");
    setSuccessMessage("");

    if (!signupData.userName || !signupData.userCity) {
      setValidationError("Please enter your name and city.");
      return;
    }

    submittingRef.current = true;
    const currentSession = sessionRef.current;

    try {
      const result = await dispatch(registerUser(signupData)).unwrap();

      if (
        openRef.current &&
        sessionRef.current === currentSession
      ) {
        form.reset();
        setShowPassword(false);
        setSuccessMessage(
          `${result.message || "Account created successfully."} Please sign in to continue.`
        );
      }
    } catch {
      // registerError is supplied by the Redux slice.
    } finally {
      submittingRef.current = false;
    }
  };

  if (!isOpen) return null;

  const error = validationError || registerError;

  return createPortal(
    <div
      className="qyx-signup-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className="qyx-signup"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
      >
        <button
          className="qyx-signup__close"
          type="button"
          aria-label="Close signup"
          onClick={onClose}
        >
          <X aria-hidden="true" />
        </button>

        <div className="qyx-signup__brand">
          QYX<span>.</span>
        </div>

        <p className="qyx-signup__eyebrow">
          YOUR NEXT STEP STARTS HERE
        </p>

        <h2 id={`${id}-title`}>
          A space for <em>your care.</em>
        </h2>

        <p
          id={`${id}-description`}
          className="qyx-signup__description"
        >
          Create your account to book consultations and manage your
          appointments in one place.
        </p>

        <form
          className="qyx-signup__form"
          onSubmit={handleSubmit}
          aria-busy={loading}
        >
          <div className="qyx-signup__grid">
            <div className="qyx-signup__field qyx-signup__field--full">
              <label htmlFor={`${id}-name`}>Full name</label>

              <input
                ref={nameRef}
                id={`${id}-name`}
                name="userName"
                type="text"
                placeholder="Enter your full name"
                autoComplete="name"
                maxLength={100}
                disabled={loading || registered}
                required
              />
            </div>

            <div className="qyx-signup__field">
              <label htmlFor={`${id}-email`}>Email address</label>

              <input
                id={`${id}-email`}
                name="userEmail"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                maxLength={254}
                disabled={loading || registered}
                required
              />
            </div>

            <div className="qyx-signup__field">
              <label htmlFor={`${id}-mobile`}>Mobile number</label>

              <div className="qyx-signup__mobile">
                <span aria-hidden="true">+91</span>

                <input
                  id={`${id}-mobile`}
                  name="userMobile"
                  type="tel"
                  placeholder="10-digit number"
                  autoComplete="tel-national"
                  inputMode="numeric"
                  pattern="[6-9][0-9]{9}"
                  maxLength={10}
                  title="Enter a valid 10-digit Indian mobile number."
                  aria-describedby={`${id}-mobile-help`}
                  disabled={loading || registered}
                  required
                />
              </div>

              <small id={`${id}-mobile-help`}>
                Indian mobile number, without +91.
              </small>
            </div>

            <div className="qyx-signup__field qyx-signup__field--full">
              <label htmlFor={`${id}-password`}>Password</label>

              <div className="qyx-signup__password">
                <input
                  id={`${id}-password`}
                  name="userPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  minLength={6}
                  aria-describedby={`${id}-password-help`}
                  disabled={loading || registered}
                  required
                />

                <button
                  className="qyx-signup__visibility"
                  type="button"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  aria-controls={`${id}-password`}
                  disabled={loading || registered}
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

              <small id={`${id}-password-help`}>
                Use at least 6 characters.
              </small>
            </div>

            <div className="qyx-signup__field">
              <label htmlFor={`${id}-dob`}>Date of birth</label>

              <input
                id={`${id}-dob`}
                name="userDOB"
                type="date"
                max={maximumDOB}
                autoComplete="bday"
                disabled={loading || registered}
                required
              />
            </div>

            <div className="qyx-signup__field">
              <label htmlFor={`${id}-city`}>City</label>

              <input
                id={`${id}-city`}
                name="userCity"
                type="text"
                placeholder="Enter your city"
                autoComplete="address-level2"
                maxLength={100}
                disabled={loading || registered}
                required
              />
            </div>

            <div className="qyx-signup__field qyx-signup__field--full">
              <label htmlFor={`${id}-gender`}>Gender</label>

              <select
                id={`${id}-gender`}
                name="userGender"
                defaultValue=""
                disabled={loading || registered}
                required
              >
                <option value="" disabled>
                  Select your gender
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {!registered && error && (
            <p
              className="qyx-signup__message qyx-signup__message--error"
              role="alert"
            >
              {error}
            </p>
          )}

          {successMessage && (
            <p className="qyx-signup__message" role="status">
              {successMessage}
            </p>
          )}

          {registered ? (
            <button
              className="qyx-signup__submit"
              type="button"
              onClick={onClose}
            >
              Close and sign in
              <span aria-hidden="true">→</span>
            </button>
          ) : (
            <button
              className="qyx-signup__submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating account…" : "Create account"}
              {!loading && <span aria-hidden="true">→</span>}
            </button>
          )}
        </form>

        <div className="qyx-signup__note">
          <LockKeyhole aria-hidden="true" />
          <p>Use your own account to manage your appointments.</p>
        </div>
      </section>
    </div>,
    document.body
  );
}