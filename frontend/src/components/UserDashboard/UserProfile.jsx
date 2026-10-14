import { useId, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight, Pencil, ShieldCheck } from "lucide-react";

import {
  updateUserProfile,
  clearProfileFeedback,
} from "../../features/auth/authSlice";

import "./UserProfile.css";

export default function UserProfile() {
  const dispatch = useDispatch();

  const {
    user,
    sessionStatus,
    sessionError,
    isAuthChecked,
    profileUpdateStatus,
  } = useSelector((state) => state.auth);

  const [draft, setDraft] = useState({});
  const [editing, setEditing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const nameRef = useRef(null);
  const submittingRef = useRef(false);
  const id = useId();

  const saving = profileUpdateStatus === "loading";

  const today = new Date();
  const maximumDOB = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  if (!user) {
    return (
      <section className="user-profile">
        <div className="user-profile__form">
          <p role="status">
            {sessionStatus === "loading" || !isAuthChecked
              ? "Loading your profile…"
              : sessionError || "Please sign in to view your profile."}
          </p>
        </div>
      </section>
    );
  }

  const initials =
    (user.name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "Q";

  const values = editing ? draft : user;

  const startEditing = () => {
    if (saving) return;

    dispatch(clearProfileFeedback());

    setDraft({
      name: user.name || "",
      email: user.email || "",
      mobile: user.mobile || "",
      dob: user.dob ? user.dob.slice(0, 10) : "",
      city: user.city || "",
      gender: user.gender || "",
    });

    setFeedback(null);
    setEditing(true);

    requestAnimationFrame(() => nameRef.current?.focus());
  };

  const cancelEditing = () => {
    if (saving || submittingRef.current) return;

    dispatch(clearProfileFeedback());
    setEditing(false);
    setDraft({});
    setFeedback(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setDraft((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving || submittingRef.current) return;

    if (!draft.name.trim() || !draft.city.trim()) {
      setFeedback({
        type: "error",
        message: "Please enter your name and city.",
      });
      return;
    }

    setFeedback(null);
    submittingRef.current = true;

    try {
      const result = await dispatch(
        updateUserProfile({
          userName: draft.name.trim(),
          userEmail: draft.email.trim().toLowerCase(),
          userMobile: draft.mobile.trim(),
          userCity: draft.city.trim(),
          userDOB: draft.dob,
          userGender: draft.gender,
        })
      ).unwrap();

      setEditing(false);
      setDraft({});

      setFeedback({
        type: "success",
        message: result.message || "Profile updated successfully.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          typeof error === "string"
            ? error
            : error?.message || "Unable to update your profile.",
      });

      // Keep editing open so the user can correct or retry.
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <section
      className="user-profile"
      aria-labelledby={`${id}-title`}
    >
      <header className="user-profile__heading">
        <p className="user-profile__eyebrow">
          YOUR PERSONAL SPACE
        </p>

        <h1 id={`${id}-title`}>Care starts with you.</h1>

        <p>
          Keep your details up to date for your next consultation.
        </p>
      </header>

      <div className="user-profile__summary">
        <div className="user-profile__avatar" aria-hidden="true">
          {user.photo ? (
            <img src={user.photo} alt="" />
          ) : (
            initials
          )}
        </div>

        <div className="user-profile__identity">
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          {user.city && <p>{user.city}</p>}
        </div>

        <span className="user-profile__badge">
          {user.role === "Admin"
            ? "Admin account"
            : user.role === "Doctor"
            ? "Doctor account"
            : "Patient account"}
        </span>
      </div>

      <form
        className="user-profile__form"
        onSubmit={handleSubmit}
        aria-busy={saving}
      >
        <div className="user-profile__form-heading">
          <div>
            <h2>Personal information</h2>
            <p>The details associated with your account.</p>
          </div>

          {!editing && (
            <button
              type="button"
              className="user-profile__outline-button"
              onClick={startEditing}
              disabled={saving}
            >
              <Pencil aria-hidden="true" />
              Edit
            </button>
          )}
        </div>

        <div className="user-profile__fields">
          <label htmlFor={`${id}-name`}>
            Full name
            <input
              ref={nameRef}
              id={`${id}-name`}
              name="name"
              value={values.name || ""}
              onChange={handleChange}
              autoComplete="name"
              maxLength={100}
              disabled={!editing || saving}
              required
            />
          </label>

          <label htmlFor={`${id}-email`}>
            Email address
            <input
              id={`${id}-email`}
              name="email"
              type="email"
              value={values.email || ""}
              onChange={handleChange}
              autoComplete="email"
              maxLength={254}
              disabled={!editing || saving}
              required
            />
          </label>

          <label htmlFor={`${id}-mobile`}>
            Mobile number (+91)
            <input
              id={`${id}-mobile`}
              name="mobile"
              type="tel"
              value={values.mobile || ""}
              onChange={handleChange}
              autoComplete="tel-national"
              inputMode="numeric"
              pattern="[6-9][0-9]{9}"
              maxLength={10}
              title="Enter a valid 10-digit Indian mobile number."
              disabled={!editing || saving}
              required
            />
          </label>

          <label htmlFor={`${id}-dob`}>
            Date of birth
            <input
              id={`${id}-dob`}
              name="dob"
              type="date"
              value={values.dob ? values.dob.slice(0, 10) : ""}
              onChange={handleChange}
              max={maximumDOB}
              autoComplete="bday"
              disabled={!editing || saving}
              required
            />
          </label>

          <label htmlFor={`${id}-city`}>
            City
            <input
              id={`${id}-city`}
              name="city"
              value={values.city || ""}
              onChange={handleChange}
              autoComplete="address-level2"
              maxLength={100}
              disabled={!editing || saving}
              required
            />
          </label>

          <label htmlFor={`${id}-gender`}>
            Gender
            <select
              id={`${id}-gender`}
              name="gender"
              value={values.gender || ""}
              onChange={handleChange}
              disabled={!editing || saving}
              required
            >
              <option value="" disabled>
                Select your gender
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </label>
        </div>

        {editing && (
          <div className="user-profile__actions">
            <button
              type="submit"
              className="user-profile__primary-button"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save changes"}
              {!saving && <ArrowRight aria-hidden="true" />}
            </button>

            <button
              type="button"
              className="user-profile__outline-button"
              onClick={cancelEditing}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        )}

        {feedback && (
          <p
            className={`user-profile__message ${
              feedback.type === "error"
                ? "user-profile__message--error"
                : ""
            }`}
            role={feedback.type === "error" ? "alert" : "status"}
          >
            {feedback.message}
          </p>
        )}
      </form>

      <div className="user-profile__reassurance">
        <ShieldCheck aria-hidden="true" />

        <div>
          <strong>A little reassurance.</strong>
          <p>
            Your details and appointments, together in your own space.
          </p>
        </div>
      </div>
    </section>
  );
}