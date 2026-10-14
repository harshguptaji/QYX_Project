import { useEffect, useId, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import {
  changePassword,
  clearPasswordFeedback,
} from "../../features/auth/authSlice";

import "./ChangePassword.css";

export default function ChangePassword() {
  const dispatch = useDispatch();
  const id = useId();

  const { passwordChangeStatus } = useSelector(
    (state) => state.auth
  );

  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [visibility, setVisibility] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const [feedback, setFeedback] = useState(null);
  const submittingRef = useRef(false);

  const saving = passwordChangeStatus === "loading";

  useEffect(() => {
    dispatch(clearPasswordFeedback());
  }, [dispatch]);

  const fields = [
    {
      key: "current",
      label: "Current password",
      placeholder: "Enter your current password",
      autoComplete: "current-password",
    },
    {
      key: "next",
      label: "New password",
      placeholder: "Create a new password",
      autoComplete: "new-password",
      minLength: 6,
    },
    {
      key: "confirm",
      label: "Confirm new password",
      placeholder: "Enter your new password again",
      autoComplete: "new-password",
      minLength: 6,
    },
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;

    setPasswords((current) => ({
      ...current,
      [name]: value,
    }));

    setFeedback(null);
  };

  const toggleVisibility = (field) => {
    setVisibility((current) => ({
      ...current,
      [field]: !current[field],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving || submittingRef.current) return;

    setFeedback(null);

    if (passwords.next !== passwords.confirm) {
      setFeedback({
        type: "error",
        message: "New password and confirmation do not match.",
      });
      return;
    }

    if (passwords.current === passwords.next) {
      setFeedback({
        type: "error",
        message: "Choose a password different from your current password.",
      });
      return;
    }

    submittingRef.current = true;

    try {
      const result = await dispatch(
        changePassword({
          userPassword: passwords.current,
          updatePassword: passwords.next,
        })
      ).unwrap();

      setPasswords({
        current: "",
        next: "",
        confirm: "",
      });

      setVisibility({
        current: false,
        next: false,
        confirm: false,
      });

      setFeedback({
        type: "success",
        message: result.message,
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          typeof error === "string"
            ? error
            : error?.message || "Unable to change your password.",
      });
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <section
      className="qyx-password"
      aria-labelledby={`${id}-title`}
    >
      <header className="qyx-password__heading">
        <p className="qyx-password__eyebrow">ACCOUNT SECURITY</p>
        <h1 id={`${id}-title`}>Keep your account protected.</h1>
        <p>Update your password using your current account password.</p>
      </header>

      <div className="qyx-password__panel">
        <div className="qyx-password__panel-heading">
          <div className="qyx-password__icon">
            <LockKeyhole aria-hidden="true" />
          </div>

          <div>
            <h2>Change password</h2>
            <p>Choose a password you haven’t used for this account.</p>
          </div>
        </div>

        <form
          className="qyx-password__form"
          onSubmit={handleSubmit}
          aria-busy={saving}
        >
          {fields.map((field) => (
            <div className="qyx-password__field" key={field.key}>
              <label htmlFor={`${id}-${field.key}`}>
                {field.label}
              </label>

              <div className="qyx-password__input-wrapper">
                <input
                  id={`${id}-${field.key}`}
                  name={field.key}
                  type={visibility[field.key] ? "text" : "password"}
                  value={passwords[field.key]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  minLength={field.minLength}
                  aria-describedby={
                    field.key === "next"
                      ? `${id}-password-help`
                      : undefined
                  }
                  disabled={saving}
                  required
                />

                <button
                  type="button"
                  className="qyx-password__visibility"
                  aria-label={`${
                    visibility[field.key] ? "Hide" : "Show"
                  } ${field.label.toLowerCase()}`}
                  aria-controls={`${id}-${field.key}`}
                  disabled={saving}
                  onClick={() => toggleVisibility(field.key)}
                >
                  {visibility[field.key] ? (
                    <EyeOff aria-hidden="true" />
                  ) : (
                    <Eye aria-hidden="true" />
                  )}
                </button>
              </div>

              {field.key === "next" && (
                <small id={`${id}-password-help`}>
                  Use at least 6 characters. A longer, unique password
                  is preferable.
                </small>
              )}
            </div>
          ))}

          {feedback && (
            <p
              className={`qyx-password__feedback qyx-password__feedback--${feedback.type}`}
              role={feedback.type === "error" ? "alert" : "status"}
            >
              {feedback.message}
            </p>
          )}

          <div className="qyx-password__actions">
            <button
              type="submit"
              className="qyx-password__submit"
              disabled={saving}
            >
              {saving ? "Updating password…" : "Update password"}
              {!saving && <ArrowRight aria-hidden="true" />}
            </button>
          </div>
        </form>
      </div>

      <div className="qyx-password__note">
        <ShieldCheck aria-hidden="true" />
        <p>Never share your password with anyone.</p>
      </div>
    </section>
  );
}