import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "../style/Signup.css";

export default function Signup({ isOpen, onClose }) {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const dialogRef = useRef(null);
  const nameRef = useRef(null);
  const id = useId();

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

    const formData = new FormData(event.currentTarget);

    const signupData = {
      name: formData.get("name").trim(),
      email: formData.get("email").trim(),
      mobile: formData.get("mobile").trim(),
      password: formData.get("password"),
      age: Number(formData.get("age")),
      city: formData.get("city").trim(),
      gender: formData.get("gender"),
    };

    if (!signupData.name || !signupData.city) {
      setMessage("Please enter your name and city.");
      return;
    }

    // Send signupData to your registration API here.
    // Do not log the password or store it in localStorage.

    setMessage(
      "Your form is ready. Connect your registration API to create an account."
    );
  };

  if (!isOpen) return null;

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
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>

        <div className="qyx-signup__brand">
          QYX<span>.</span>
        </div>

        <p className="qyx-signup__eyebrow">YOUR NEXT STEP STARTS HERE</p>

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

        <form className="qyx-signup__form" onSubmit={handleSubmit}>
          <div className="qyx-signup__grid">
            <div className="qyx-signup__field qyx-signup__field--full">
              <label htmlFor={`${id}-name`}>Full name</label>

              <input
                ref={nameRef}
                id={`${id}-name`}
                name="name"
                type="text"
                placeholder="Enter your full name"
                autoComplete="name"
                maxLength={100}
                required
              />
            </div>

            <div className="qyx-signup__field">
              <label htmlFor={`${id}-email`}>Email address</label>

              <input
                id={`${id}-email`}
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                maxLength={254}
                required
              />
            </div>

            <div className="qyx-signup__field">
              <label htmlFor={`${id}-mobile`}>Mobile number</label>

              <div className="qyx-signup__mobile">
                <span aria-hidden="true">+91</span>

                <input
                  id={`${id}-mobile`}
                  name="mobile"
                  type="tel"
                  placeholder="10-digit number"
                  autoComplete="tel-national"
                  inputMode="numeric"
                  pattern="[6-9][0-9]{9}"
                  maxLength={10}
                  title="Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9."
                  aria-describedby={`${id}-mobile-help`}
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
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  minLength={8}
                  aria-describedby={`${id}-password-help`}
                  required
                />

                <button
                  className="qyx-signup__visibility"
                  type="button"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  aria-controls={`${id}-password`}
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {showPassword ? (
                      <>
                        <path d="m3 3 18 18" />
                        <path d="M9.9 5.2A11 11 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.1 3.8" />
                        <path d="M6.2 6.2A18 18 0 0 0 2 12s4 7 10 7a11 11 0 0 0 5.8-1.8" />
                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                      </>
                    ) : (
                      <>
                        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                </button>
              </div>

              <small id={`${id}-password-help`}>
                Use at least 8 characters.
              </small>
            </div>

            <div className="qyx-signup__field">
              <label htmlFor={`${id}-age`}>Age</label>

              <input
                id={`${id}-age`}
                name="age"
                type="number"
                placeholder="Your age"
                min={1}
                max={120}
                step={1}
                required
              />
            </div>

            <div className="qyx-signup__field">
              <label htmlFor={`${id}-city`}>City</label>

              <input
                id={`${id}-city`}
                name="city"
                type="text"
                placeholder="Enter your city"
                autoComplete="address-level2"
                maxLength={100}
                required
              />
            </div>

            <div className="qyx-signup__field qyx-signup__field--full">
              <label htmlFor={`${id}-gender`}>Gender</label>

              <select
                id={`${id}-gender`}
                name="gender"
                defaultValue=""
                required
              >
                <option value="" disabled>
                  Select your gender
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="self-described">Another identity</option>
                <option value="prefer-not-to-say">
                  Prefer not to say
                </option>
              </select>
            </div>
          </div>

          {message && (
            <p className="qyx-signup__message" role="status">
              {message}
            </p>
          )}

          <button className="qyx-signup__submit" type="submit">
            Create account
            <span aria-hidden="true">→</span>
          </button>
        </form>

        <div className="qyx-signup__note">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
          >
            <rect x="5" y="10" width="14" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
          </svg>

          <p>Use your own account to manage your appointments.</p>
        </div>
      </section>
    </div>,
    document.body
  );
}