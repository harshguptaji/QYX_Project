import { useEffect, useId, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  Mail,
  Pencil,
  Save,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";

import {
  clearAdminUserUpdateFeedback,
  fetchAdminUserDetails,
  updateAdminUser,
} from "../../features/admin/userDetails/adminUserDetailsSlice";

import "./AdminUserDetails.css";

const getDraft = (user) => ({
  userName: user.userName || "",
  userEmail: user.userEmail || "",
  userMobile: user.userMobile || "",
  userCity: user.userCity || "",
  userDOB: user.userDOB?.slice(0, 10) || "",
  userGender: user.userGender || "",
  // userRole: user.userRole || "User",
  userPhoto: user.userPhoto || "",
  userVerified: Boolean(user.userVerified),
  emailVerified: Boolean(user.emailVerified),
  mobileVerified: Boolean(user.mobileVerified),
});

const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

const verificationFields = [
  {
    name: "emailVerified",
    title: "Email verification",
    icon: Mail,
  },
  {
    name: "mobileVerified",
    title: "Mobile verification",
    icon: Smartphone,
  },
  {
    name: "userVerified",
    title: "User verification",
    icon: ShieldCheck,
  },
];

export default function AdminUserDetails() {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const [retry, setRetry] = useState(0);

  const {
    user,
    requestedUserId,
    status,
    error,
  } = useSelector((state) => state.adminUserDetails);

  useEffect(() => {
    const request = dispatch(fetchAdminUserDetails(userId));

    return () => request.abort();
  }, [dispatch, userId, retry]);

  const loading =
    requestedUserId !== userId ||
    status === "idle" ||
    status === "loading";

  return (
    <section className="admin-user-details">
      <Link
        to="/admin/users"
        className="admin-user-details__back"
      >
        <ArrowLeft aria-hidden="true" />
        Back to users
      </Link>

      <header className="admin-user-details__heading">
        <p>USER MANAGEMENT</p>
        <h1>A closer look at this account.</h1>
        <span>
          Review personal information, account access and verification.
        </span>
      </header>

      {loading ? (
        <div className="admin-user-details__state" role="status">
          Loading user information…
        </div>
      ) : status === "failed" || !user ? (
        <div className="admin-user-details__state" role="alert">
          <h2>Unable to load user</h2>
          <p>{error || "User information is unavailable."}</p>

          <button
            className="admin-user-details__button"
            type="button"
            onClick={() => setRetry((current) => current + 1)}
          >
            Try again
          </button>
        </div>
      ) : (
        <UserDetailsEditor key={userId} user={user} />
      )}
    </section>
  );
}

function UserDetailsEditor({ user }) {
  const dispatch = useDispatch();
  const id = useId();

  const nameRef = useRef(null);
  const submittingRef = useRef(false);
  const mountedRef = useRef(false);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => getDraft(user));
  const [localError, setLocalError] = useState("");

  const {
    updateStatus,
    updateError,
    updateMessage,
  } = useSelector((state) => state.adminUserDetails);

  const saving = updateStatus === "loading";
  const values = editing ? draft : getDraft(user);

  const initials =
    (user.userName || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U";

  const today = new Date();
  const maximumDOB = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const startEditing = () => {
    if (saving) return;

    dispatch(clearAdminUserUpdateFeedback());
    setDraft(getDraft(user));
    setLocalError("");
    setEditing(true);

    requestAnimationFrame(() => nameRef.current?.focus());
  };

  const cancelEditing = () => {
    if (saving || submittingRef.current) return;

    dispatch(clearAdminUserUpdateFeedback());
    setDraft(getDraft(user));
    setEditing(false);
    setLocalError("");
  };

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;

    setDraft((current) => {
      const next = {
        ...current,
        [name]: type === "checkbox" ? checked : value,
      };

      // Admin can explicitly verify the new contact afterward.
      if (name === "userEmail") next.emailVerified = false;
      if (name === "userMobile") next.mobileVerified = false;

      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!editing || saving || submittingRef.current) return;

    if (!draft.userName.trim() || !draft.userCity.trim()) {
      setLocalError("Please enter the user's name and city.");
      return;
    }

    submittingRef.current = true;
    setLocalError("");

    const fields = {
      ...draft,
      userName: draft.userName.trim(),
      userEmail: draft.userEmail.trim().toLowerCase(),
      userMobile: draft.userMobile.trim(),
      userCity: draft.userCity.trim(),
      userPhoto: draft.userPhoto.trim(),
    };

    try {
      await dispatch(
        updateAdminUser({
          userId: user._id,
          fields,
        })
      ).unwrap();

      if (mountedRef.current) {
        setEditing(false);
      }
    } catch {
      // Keep editing open; the backend error is displayed below.
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <>
      <div className="admin-user-details__summary">
        <div
          className="admin-user-details__avatar"
          aria-hidden="true"
        >
          {user.userPhoto ? (
            <img src={user.userPhoto} alt="" />
          ) : (
            initials
          )}
        </div>

        <div className="admin-user-details__identity">
          <h2>{user.userName}</h2>
          <p>{user.userEmail}</p>
          <span>ID: {user._id}</span>
        </div>

        <span className="admin-user-details__role">
          {user.userRole}
        </span>
      </div>

      <form
        className="admin-user-details__form"
        onSubmit={handleSubmit}
        aria-busy={saving}
      >
        <section className="admin-user-details__panel">
          <div className="admin-user-details__panel-heading">
            <div>
              <h2>Personal information</h2>
              <p>The details associated with this account.</p>
            </div>

            {!editing && (
              <button
                type="button"
                className="admin-user-details__button admin-user-details__button--outline"
                onClick={startEditing}
              >
                <Pencil aria-hidden="true" />
                Edit details
              </button>
            )}
          </div>

          <div className="admin-user-details__fields">
            <label htmlFor={`${id}-name`}>
              Full name
              <input
                ref={nameRef}
                id={`${id}-name`}
                name="userName"
                value={values.userName}
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
                name="userEmail"
                type="email"
                value={values.userEmail}
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
                name="userMobile"
                type="tel"
                inputMode="numeric"
                pattern="[6-9][0-9]{9}"
                maxLength={10}
                title="Enter a valid 10-digit Indian mobile number."
                value={values.userMobile}
                onChange={handleChange}
                disabled={!editing || saving}
                required
              />
            </label>

            <label htmlFor={`${id}-dob`}>
              Date of birth
              <input
                id={`${id}-dob`}
                name="userDOB"
                type="date"
                max={maximumDOB}
                value={values.userDOB}
                onChange={handleChange}
                disabled={!editing || saving}
                required
              />
            </label>

            <label htmlFor={`${id}-city`}>
              City
              <input
                id={`${id}-city`}
                name="userCity"
                value={values.userCity}
                onChange={handleChange}
                maxLength={100}
                disabled={!editing || saving}
                required
              />
            </label>

            <label htmlFor={`${id}-gender`}>
              Gender
              <select
                id={`${id}-gender`}
                name="userGender"
                value={values.userGender}
                onChange={handleChange}
                disabled={!editing || saving}
                required
              >
                <option value="" disabled>Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </label>

            {/* <label htmlFor={`${id}-role`}>
              Account role
              <select
                id={`${id}-role`}
                name="userRole"
                value={values.userRole}
                onChange={handleChange}
                disabled={!editing || saving}
                required
              >
                <option value="User">User</option>
                <option value="Doctor">Doctor</option>
                <option value="Admin">Admin</option>
              </select>
            </label> */}

            <label htmlFor={`${id}-photo`}>
              Profile photo URL
              <input
                id={`${id}-photo`}
                name="userPhoto"
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={values.userPhoto}
                onChange={handleChange}
                disabled={!editing || saving}
              />
            </label>
          </div>
        </section>

        <section className="admin-user-details__panel">
          <div className="admin-user-details__panel-heading">
            <div>
              <h2>Account verification</h2>
              <p>Review and manage each verification separately.</p>
            </div>
          </div>

          <div className="admin-user-details__verification">
            {verificationFields.map((field) => {
              const Icon = field.icon;
              const checked = values[field.name];

              return (
                <label
                  className="admin-user-details__verification-card"
                  key={field.name}
                  htmlFor={`${id}-${field.name}`}
                >
                  <Icon
                    className="admin-user-details__verification-icon"
                    aria-hidden="true"
                  />

                  <span className="admin-user-details__verification-copy">
                    <strong>{field.title}</strong>

                    <span
                      className={
                        checked
                          ? "admin-user-details__verified"
                          : "admin-user-details__unverified"
                      }
                    >
                      {checked && <BadgeCheck aria-hidden="true" />}
                      {checked ? "Verified" : "Not verified"}
                    </span>
                  </span>

                  <input
                    id={`${id}-${field.name}`}
                    name={field.name}
                    type="checkbox"
                    checked={checked}
                    onChange={handleChange}
                    disabled={!editing || saving}
                  />
                </label>
              );
            })}
          </div>

          {editing && (
            <p className="admin-user-details__note">
              Changing an email or mobile number clears its verification
              selection. Select it again only after confirming the new
              contact information.
            </p>
          )}
        </section>

        {editing && (
          <div className="admin-user-details__actions">
            <button
              type="submit"
              className="admin-user-details__button"
              disabled={saving}
            >
              <Save aria-hidden="true" />
              {saving ? "Saving…" : "Save changes"}
            </button>

            <button
              type="button"
              className="admin-user-details__button admin-user-details__button--outline"
              onClick={cancelEditing}
              disabled={saving}
            >
              <X aria-hidden="true" />
              Cancel
            </button>
          </div>
        )}

        {(localError || updateError) && (
          <p
            className="admin-user-details__feedback admin-user-details__feedback--error"
            role="alert"
          >
            {localError || updateError}
          </p>
        )}

        {updateMessage && !localError && !updateError && (
          <p
            className="admin-user-details__feedback"
            role="status"
          >
            {updateMessage}
          </p>
        )}
      </form>

      <section className="admin-user-details__panel">
        <div className="admin-user-details__panel-heading">
          <div>
            <h2>Account timeline</h2>
            <p>Registration and latest update information.</p>
          </div>
        </div>

        <dl className="admin-user-details__timeline">
          <div>
            <dt>Registered on</dt>
            <dd>{formatDate(user.createdAt)}</dd>
          </div>

          <div>
            <dt>Last updated</dt>
            <dd>{formatDate(user.updatedAt)}</dd>
          </div>
        </dl>
      </section>
    </>
  );
}