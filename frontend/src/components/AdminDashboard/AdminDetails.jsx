import { useEffect, useId, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  Pencil,
  Save,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  clearAdminEditFeedback,
  fetchAdminDetails,
  editAdminAccount,
} from "../../features/admin/accounts/adminAccountsSlice";

import "./AdminDetails.css";

const getDraft = (admin) => ({
  adminName: admin.adminName || "",
  adminEmail: admin.adminEmail || "",
  adminMobile: admin.adminMobile || "",
  adminRole: admin.adminRole || "Sub-Admin",
  adminPassword: "",
});

const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

export default function AdminDetails() {
  const dispatch = useDispatch();
  const { adminId } = useParams();
  const [retry, setRetry] = useState(0);

  const {
    admin,
    requestedAdminId,
    detailsStatus,
    detailsError,
  } = useSelector((state) => state.adminAccounts);

  useEffect(() => {
    const request = dispatch(fetchAdminDetails(adminId));

    return () => request.abort();
  }, [dispatch, adminId, retry]);

  const loading =
    requestedAdminId !== adminId ||
    detailsStatus === "idle" ||
    detailsStatus === "loading";

  return (
    <section className="admin-details">
      <Link to="/accios/admins" className="admin-details__back">
        <ArrowLeft size={18} aria-hidden="true" />
        Back to admins
      </Link>

      <header className="admin-details__heading">
        <p>WORKSPACE ACCESS</p>
        <h1>Admin account details.</h1>
        <span>Review account information and manage access.</span>
      </header>

      {loading ? (
        <div className="admin-details__state" role="status">
          Loading admin information…
        </div>
      ) : detailsStatus === "failed" || !admin ? (
        <div className="admin-details__state">
          <p role="alert">
            {detailsError || "Admin information is unavailable."}
          </p>

          <button
            type="button"
            className="admin-details__button"
            onClick={() => setRetry((value) => value + 1)}
          >
            Try again
          </button>
        </div>
      ) : (
        <AdminDetailsEditor key={adminId} admin={admin} />
      )}
    </section>
  );
}

function AdminDetailsEditor({ admin }) {
  const dispatch = useDispatch();
  const id = useId();

  const currentAdmin = useSelector(
    (state) => state.adminAuth.admin
  );

  const {
    editStatus,
    editError,
    editMessage,
  } = useSelector((state) => state.adminAccounts);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => getDraft(admin));
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const nameRef = useRef(null);
  const submittingRef = useRef(false);
  const mountedRef = useRef(false);

  const saving = editStatus === "loading";
  const canEdit = currentAdmin?.adminRole === "Root";
  const values = editing ? draft : getDraft(admin);

  const initials =
    admin.adminName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "A";

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const startEditing = () => {
    if (!canEdit || saving) return;

    dispatch(clearAdminEditFeedback());
    setDraft(getDraft(admin));
    setLocalError("");
    setShowPassword(false);
    setEditing(true);

    requestAnimationFrame(() => nameRef.current?.focus());
  };

  const cancelEditing = () => {
    if (saving || submittingRef.current) return;

    dispatch(clearAdminEditFeedback());
    setDraft(getDraft(admin));
    setLocalError("");
    setShowPassword(false);
    setEditing(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setDraft((current) => ({
      ...current,
      [name]: value,
    }));

    setLocalError("");

    if (editError) dispatch(clearAdminEditFeedback());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !editing ||
      !canEdit ||
      saving ||
      submittingRef.current
    ) {
      return;
    }

    if (!draft.adminName.trim()) {
      setLocalError("Please enter the admin's name.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(draft.adminMobile.trim())) {
      setLocalError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (
      draft.adminPassword &&
      (
        draft.adminPassword.length < 8 ||
        new TextEncoder().encode(draft.adminPassword).length > 72
      )
    ) {
      setLocalError(
        "Password must contain at least 8 characters and must not exceed 72 bytes."
      );
      return;
    }

    const fields = {
      adminName: draft.adminName.trim(),
      adminEmail: draft.adminEmail.trim().toLowerCase(),
      adminMobile: draft.adminMobile.trim(),
      adminRole: draft.adminRole,
      ...(draft.adminPassword
        ? { adminPassword: draft.adminPassword }
        : {}),
    };

    submittingRef.current = true;
    setLocalError("");

    try {
      await dispatch(
        editAdminAccount({
          adminId: admin._id,
          fields,
        })
      ).unwrap();

      if (mountedRef.current) {
        setDraft((current) => ({
          ...current,
          adminPassword: "",
        }));

        setShowPassword(false);
        setEditing(false);
      }
    } catch {
      // Keep editing open and display the backend error.
    } finally {
      submittingRef.current = false;
    }
  };

  const errorMessage = localError || editError;

  return (
    <>
      <div className="admin-details__summary">
        <div className="admin-details__avatar" aria-hidden="true">
          {initials}
        </div>

        <div className="admin-details__identity">
          <h2>{admin.adminName}</h2>
          <p>{admin.adminEmail}</p>
          <span>ID: {admin._id}</span>
        </div>

        <span className="admin-details__badge">
          <ShieldCheck size={16} aria-hidden="true" />
          {admin.adminRole}
        </span>
      </div>

      <form
        className="admin-details__panel"
        onSubmit={handleSubmit}
        aria-busy={saving}
      >
        <div className="admin-details__panel-heading">
          <div>
            <h2>Account information</h2>
            <p>Contact details and workspace role.</p>
          </div>

          {!editing && canEdit && (
            <button
              type="button"
              className="admin-details__button admin-details__button--outline"
              onClick={startEditing}
              disabled={saving}
            >
              <Pencil size={16} aria-hidden="true" />
              Edit details
            </button>
          )}
        </div>

        <div className="admin-details__fields">
          <label htmlFor={`${id}-name`}>
            Full name
            <input
              ref={nameRef}
              id={`${id}-name`}
              name="adminName"
              value={values.adminName}
              onChange={handleChange}
              maxLength={100}
              disabled={!editing || saving}
              required
            />
          </label>

          <label htmlFor={`${id}-email`}>
            Email address
            <input
              id={`${id}-email`}
              name="adminEmail"
              type="email"
              value={values.adminEmail}
              onChange={handleChange}
              maxLength={254}
              disabled={!editing || saving}
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
              pattern="[6-9][0-9]{9}"
              maxLength={10}
              title="Enter a valid 10-digit Indian mobile number."
              value={values.adminMobile}
              onChange={handleChange}
              disabled={!editing || saving}
              required
            />
          </label>

          <label htmlFor={`${id}-role`}>
            Account role
            <select
              id={`${id}-role`}
              name="adminRole"
              value={values.adminRole}
              onChange={handleChange}
              disabled={
                !editing ||
                saving ||
                admin.adminRole === "Root"
              }
              required
            >
              <option value="Sub-Admin">Sub-Admin</option>
              <option value="Admin">Admin</option>
              <option value="Root">Root</option>
            </select>
          </label>

          {editing && (
            <label
              className="admin-details__full"
              htmlFor={`${id}-password`}
            >
              New password — optional

              <div className="admin-details__password">
                <input
                  id={`${id}-password`}
                  name="adminPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Leave blank to keep the current password"
                  minLength={8}
                  value={draft.adminPassword}
                  onChange={handleChange}
                  disabled={saving}
                  aria-describedby={`${id}-password-hint`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  disabled={saving}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff size={19} aria-hidden="true" />
                  ) : (
                    <Eye size={19} aria-hidden="true" />
                  )}
                </button>
              </div>

              <small id={`${id}-password-hint`}>
                Enter a new password only when you want to change it.
                Password changes require this admin to sign in again.
              </small>
            </label>
          )}
        </div>

        {editing && (
          <div className="admin-details__actions">
            <button
              type="submit"
              className="admin-details__button"
              disabled={saving}
            >
              <Save size={16} aria-hidden="true" />
              {saving ? "Saving…" : "Save changes"}
            </button>

            <button
              type="button"
              className="admin-details__button admin-details__button--outline"
              onClick={cancelEditing}
              disabled={saving}
            >
              <X size={16} aria-hidden="true" />
              Cancel
            </button>
          </div>
        )}

        {errorMessage && (
          <p
            className="admin-details__feedback admin-details__feedback--error"
            role="alert"
          >
            {errorMessage}
          </p>
        )}

        {editMessage && !errorMessage && (
          <p className="admin-details__feedback" role="status">
            {editMessage}
          </p>
        )}
      </form>

      <section className="admin-details__panel">
        <div className="admin-details__panel-heading">
          <div>
            <h2>Account timeline</h2>
            <p>Registration and most recent update.</p>
          </div>
        </div>

        <dl className="admin-details__timeline">
          <div>
            <dt>Created on</dt>
            <dd>{formatDate(admin.createdAt)}</dd>
          </div>

          <div>
            <dt>Last updated</dt>
            <dd>{formatDate(admin.updatedAt)}</dd>
          </div>
        </dl>
      </section>
    </>
  );
}