import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff, ShieldCheck, UserPlus, X } from "lucide-react";

import {
  clearAdminRegisterFeedback,
  registerAdminAccount,
} from "../../features/admin/accounts/adminAccountsSlice";

import "./AddAdmin.css";

// Render this component only while the popup is open.
export default function AddAdmin({ onClose }) {
  const dispatch = useDispatch();
  const id = useId();

  const dialogRef = useRef(null);
  const nameRef = useRef(null);
  const submittingRef = useRef(false);
  const mountedRef = useRef(false);
  const onCloseRef = useRef(onClose);

  onCloseRef.current = onClose;

  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const [form, setForm] = useState({
    adminName: "",
    adminEmail: "",
    adminMobile: "",
    adminPassword: "",
    adminRole: "Sub-Admin",
  });

  const { registerStatus, registerError } = useSelector(
    (state) => state.adminAccounts
  );

  const currentAdmin = useSelector(
    (state) => state.adminAuth.admin
  );

  const isRoot = currentAdmin?.adminRole === "Root";
  const loading = registerStatus === "loading";

  useEffect(() => {
    mountedRef.current = true;
    dispatch(clearAdminRegisterFeedback());

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    nameRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (!submittingRef.current) onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const elements = Array.from(
        dialogRef.current?.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), select:not([disabled])'
        ) || []
      ).filter((element) => element.getClientRects().length > 0);

      if (!elements.length) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];
      const inside = dialogRef.current?.contains(
        document.activeElement
      );

      if (
        event.shiftKey &&
        (document.activeElement === first || !inside)
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || !inside)
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      mountedRef.current = false;
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);

      if (
        previousFocus instanceof HTMLElement &&
        previousFocus.isConnected
      ) {
        previousFocus.focus();
      }
    };
  }, [dispatch]);

  const closePopup = () => {
    if (loading || submittingRef.current) return;
    onCloseRef.current();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setLocalError("");

    if (registerError) {
      dispatch(clearAdminRegisterFeedback());
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading || submittingRef.current) return;

    const fields = {
      ...form,
      adminName: form.adminName.trim(),
      adminEmail: form.adminEmail.trim().toLowerCase(),
      adminMobile: form.adminMobile.trim(),
    };

    if (!fields.adminName) {
      setLocalError("Please enter the admin's name.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(fields.adminMobile)) {
      setLocalError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (
      fields.adminPassword.length < 8 ||
      new TextEncoder().encode(fields.adminPassword).length > 72
    ) {
      setLocalError(
        "Password must contain at least 8 characters and must not exceed 72 bytes."
      );
      return;
    }

    submittingRef.current = true;
    setLocalError("");

    try {
      await dispatch(registerAdminAccount(fields)).unwrap();

      if (mountedRef.current) {
        // The slice flags the admin list for refresh.
        onCloseRef.current();
      }
    } catch {
      // Display the backend error from Redux.
    } finally {
      submittingRef.current = false;
    }
  };

  const errorMessage = localError || registerError;

  return createPortal(
    <div
      className="add-admin-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) closePopup();
      }}
    >
      <section
        ref={dialogRef}
        className="add-admin"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        aria-busy={loading}
        tabIndex={-1}
      >
        <header className="add-admin__heading">
          <div className="add-admin__icon">
            <UserPlus aria-hidden="true" />
          </div>

          <button
            type="button"
            className="add-admin__close"
            onClick={closePopup}
            disabled={loading}
            aria-label="Close add admin"
          >
            <X aria-hidden="true" />
          </button>
        </header>

        <p className="add-admin__eyebrow">WORKSPACE ACCESS</p>
        <h2 id={`${id}-title`}>Add a new admin.</h2>

        <p
          className="add-admin__description"
          id={`${id}-description`}
        >
          Create an administrator account and choose its access role.
        </p>

        <form className="add-admin__form" onSubmit={handleSubmit}>
          <div className="add-admin__fields">
            <label
              className="add-admin__full"
              htmlFor={`${id}-name`}
            >
              Full name
              <input
                ref={nameRef}
                id={`${id}-name`}
                name="adminName"
                placeholder="Enter full name"
                value={form.adminName}
                onChange={handleChange}
                maxLength={100}
                disabled={loading}
                required
              />
            </label>

            <label htmlFor={`${id}-email`}>
              Email address
              <input
                id={`${id}-email`}
                name="adminEmail"
                type="email"
                placeholder="admin@example.com"
                value={form.adminEmail}
                onChange={handleChange}
                maxLength={254}
                disabled={loading}
                required
              />
            </label>

            <label htmlFor={`${id}-mobile`}>
              Mobile number (+91)
              <input
                id={`${id}-mobile`}
                name="adminMobile"
                type="tel"
                inputMode="numeric"
                placeholder="9876543210"
                pattern="[6-9][0-9]{9}"
                maxLength={10}
                value={form.adminMobile}
                onChange={handleChange}
                title="Enter a valid 10-digit Indian mobile number."
                disabled={loading}
                required
              />
            </label>

            <label
              className="add-admin__full"
              htmlFor={`${id}-password`}
            >
              Password
              <div className="add-admin__password">
                <input
                  id={`${id}-password`}
                  name="adminPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  minLength={8}
                  value={form.adminPassword}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  aria-pressed={showPassword}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff aria-hidden="true" />
                  ) : (
                    <Eye aria-hidden="true" />
                  )}
                </button>
              </div>
            </label>

            <label
              className="add-admin__full"
              htmlFor={`${id}-role`}
            >
              Account role
              <select
                id={`${id}-role`}
                name="adminRole"
                value={form.adminRole}
                onChange={handleChange}
                disabled={loading}
                required
              >
                <option value="Sub-Admin">Sub-Admin</option>
                <option value="Admin">Admin</option>
                {isRoot && <option value="Root">Root</option>}
              </select>
            </label>
          </div>

          {errorMessage && (
            <p className="add-admin__error" role="alert">
              {errorMessage}
            </p>
          )}

          <div className="add-admin__actions">
            <button
              type="button"
              className="add-admin__cancel"
              onClick={closePopup}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="add-admin__submit"
              disabled={loading}
            >
              <UserPlus size={17} aria-hidden="true" />
              {loading ? "Creating account…" : "Create admin"}
            </button>
          </div>
        </form>

        <div className="add-admin__note">
          <ShieldCheck aria-hidden="true" />
          <p>Your current admin session stays signed in.</p>
        </div>
      </section>
    </div>,
    document.body
  );
}