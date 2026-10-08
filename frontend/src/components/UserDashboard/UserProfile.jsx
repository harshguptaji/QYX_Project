import { useId, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ArrowRight, Pencil, ShieldCheck } from "lucide-react";

import "./UserProfile.css";

export default function UserProfile() {
  const { user, setUser } = useOutletContext();

  const [draft, setDraft] = useState({ ...user });
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

  const nameRef = useRef(null);
  const id = useId();

  const initials = user.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const startEditing = () => {
    setDraft({ ...user });
    setMessage("");
    setEditing(true);
    requestAnimationFrame(() => nameRef.current?.focus());
  };

  const cancelEditing = () => {
    setDraft({ ...user });
    setEditing(false);
    setMessage("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setDraft((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!draft.name.trim() || !draft.city.trim()) {
      setMessage("Please enter your name and city.");
      return;
    }

    const updatedUser = {
      ...draft,
      name: draft.name.trim(),
      email: draft.email.trim(),
      city: draft.city.trim(),
      age: Number(draft.age),
    };

    // Connect your profile update API here.
    setUser(updatedUser);
    setDraft(updatedUser);
    setEditing(false);
    setMessage(
      "Profile updated for this session. Connect your API to save it permanently."
    );
  };

  return (
    <section className="user-profile" aria-labelledby={`${id}-title`}>
      <header className="user-profile__heading">
        <p className="user-profile__eyebrow">YOUR PERSONAL SPACE</p>
        <h1 id={`${id}-title`}>Care starts with you.</h1>
        <p>Keep your details up to date for your next consultation.</p>
      </header>

      <div className="user-profile__summary">
        <div className="user-profile__avatar" aria-hidden="true">
          {initials}
        </div>

        <div className="user-profile__identity">
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <p>{user.city}, India</p>
        </div>

        <span className="user-profile__badge">Patient account</span>
      </div>

      <form className="user-profile__form" onSubmit={handleSubmit}>
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
              value={editing ? draft.name : user.name}
              onChange={handleChange}
              autoComplete="name"
              maxLength={100}
              disabled={!editing}
              required
            />
          </label>

          <label htmlFor={`${id}-email`}>
            Email address
            <input
              id={`${id}-email`}
              name="email"
              type="email"
              value={editing ? draft.email : user.email}
              onChange={handleChange}
              autoComplete="email"
              maxLength={254}
              disabled={!editing}
              required
            />
          </label>

          <label htmlFor={`${id}-mobile`}>
            Mobile number (+91)
            <input
              id={`${id}-mobile`}
              name="mobile"
              type="tel"
              value={editing ? draft.mobile : user.mobile}
              onChange={handleChange}
              autoComplete="tel-national"
              inputMode="numeric"
              pattern="[6-9][0-9]{9}"
              maxLength={10}
              title="Enter a valid 10-digit Indian mobile number."
              disabled={!editing}
              required
            />
          </label>

          <label htmlFor={`${id}-age`}>
            Age
            <input
              id={`${id}-age`}
              name="age"
              type="number"
              value={editing ? draft.age : user.age}
              onChange={handleChange}
              min={1}
              max={120}
              step={1}
              disabled={!editing}
              required
            />
          </label>

          <label htmlFor={`${id}-city`}>
            City
            <input
              id={`${id}-city`}
              name="city"
              value={editing ? draft.city : user.city}
              onChange={handleChange}
              autoComplete="address-level2"
              maxLength={100}
              disabled={!editing}
              required
            />
          </label>

          <label htmlFor={`${id}-gender`}>
            Gender
            <select
              id={`${id}-gender`}
              name="gender"
              value={editing ? draft.gender : user.gender}
              onChange={handleChange}
              disabled={!editing}
              required
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="self-described">Another identity</option>
              <option value="prefer-not-to-say">
                Prefer not to say
              </option>
            </select>
          </label>
        </div>

        {editing && (
          <div className="user-profile__actions">
            <button
              type="submit"
              className="user-profile__primary-button"
            >
              Save changes
              <ArrowRight aria-hidden="true" />
            </button>

            <button
              type="button"
              className="user-profile__outline-button"
              onClick={cancelEditing}
            >
              Cancel
            </button>
          </div>
        )}

        {message && (
          <p className="user-profile__message" role="status">
            {message}
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