import { useId, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  clearContactSubmitFeedback,
  submitContact,
} from "../features/contact/contactSlice";

import "../style/ContactForm.css";

const getEmptyForm = () => ({
  name: "",
  email: "",
  phone: "",
  purpose: "",
  message: "",
});

const ContactForm = () => {
  const dispatch = useDispatch();
  const id = useId();
  const submittingRef = useRef(false);

  const [form, setForm] = useState(getEmptyForm);
  const [localError, setLocalError] = useState("");

  const {
    submitStatus,
    submitError,
    submitMessage,
  } = useSelector((state) => state.contact);

  const loading = submitStatus === "loading";
  const errorMessage = localError || submitError;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setLocalError("");

    if (submitError || submitMessage) {
      dispatch(clearContactSubmitFeedback());
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading || submittingRef.current) return;

    dispatch(clearContactSubmitFeedback());
    setLocalError("");

    const fields = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      mobile: form.phone.trim(),
      purpose: form.purpose,
      message: form.message.trim(),
    };

    if (
      !fields.name ||
      !fields.email ||
      !fields.mobile ||
      !fields.purpose ||
      !fields.message
    ) {
      setLocalError("Please complete all required fields.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(fields.mobile)) {
      setLocalError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    submittingRef.current = true;

    try {
      await dispatch(submitContact(fields)).unwrap();
      setForm(getEmptyForm());
    } catch {
      // The Redux slice displays the backend error.
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <section
      className="qyx-contact-form"
      id="qyx-contact-form"
      aria-labelledby={`${id}-title`}
    >
      <div className="qyx-contact-form__container">
        <div className="qyx-contact-form__content">
          <span className="qyx-contact-form__eyebrow">
            TELL US WHAT YOU NEED
          </span>

          <h2 id={`${id}-title`}>
            We’re here for the
            <span>questions that matter.</span>
          </h2>

          <p className="qyx-contact-form__intro">
            You don’t need to have everything figured out. Tell us what
            you’re looking for, and let’s begin there.
          </p>

          <div className="qyx-contact-form__topic">
            <h3>Appointments &amp; patient support</h3>
            <p>
              First consultations, booking questions, and follow-up
              enquiries.
            </p>
          </div>

          <div className="qyx-contact-form__topic">
            <h3>Specialist &amp; partnership enquiries</h3>
            <p>
              Network applications and opportunities to work with QYX.
            </p>
          </div>

          <div className="qyx-contact-form__privacy">
            <span aria-hidden="true">i</span>
            <p>
              Keep your message brief. Please avoid including medical
              reports or sensitive health information in this enquiry.
            </p>
          </div>
        </div>

        <form
          className="qyx-contact-form__panel"
          onSubmit={handleSubmit}
          aria-busy={loading}
        >
          <h3>How can we help?</h3>

          <p className="qyx-contact-form__panel-intro">
            Leave a few details about your enquiry.
          </p>

          <div className="qyx-contact-form__fields">
            <label
              className="qyx-contact-form__full"
              htmlFor={`${id}-name`}
            >
              Full name
              <input
                id={`${id}-name`}
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                autoComplete="name"
                maxLength={100}
                disabled={loading}
                required
              />
            </label>

            <label htmlFor={`${id}-email`}>
              Email address
              <input
                id={`${id}-email`}
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                maxLength={254}
                disabled={loading}
                required
              />
            </label>

            <label htmlFor={`${id}-phone`}>
              Mobile number (+91)
              <input
                id={`${id}-phone`}
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="9876543210"
                autoComplete="tel-national"
                inputMode="numeric"
                pattern="[6-9][0-9]{9}"
                minLength={10}
                maxLength={10}
                title="Enter a 10-digit Indian mobile number without +91."
                disabled={loading}
                required
              />
            </label>

            <label
              className="qyx-contact-form__full"
              htmlFor={`${id}-purpose`}
            >
              Purpose of visiting
              <select
                id={`${id}-purpose`}
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                disabled={loading}
                required
              >
                <option value="">Choose your reason</option>
                <option value="Book a consultation">
                  Book a consultation
                </option>
                <option value="Appointment support">
                  Appointment support
                </option>
                <option value="Join as a specialist">
                  Join as a specialist
                </option>
                <option value="Partnership enquiry">
                  Partnership enquiry
                </option>
                <option value="General enquiry">
                  General enquiry
                </option>
              </select>
            </label>

            <label
              className="qyx-contact-form__full"
              htmlFor={`${id}-message`}
            >
              Your message
              <textarea
                id={`${id}-message`}
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="What would you like help with?"
                rows={4}
                maxLength={1000}
                disabled={loading}
                required
              />
            </label>
          </div>

          <p
            className="qyx-contact-form__notice"
            id={`${id}-notice`}
          >
            Your enquiry will be sent to the QYX team for review.
          </p>

          {errorMessage && (
            <p
              className="qyx-contact-form__feedback qyx-contact-form__feedback--error"
              role="alert"
            >
              {errorMessage}
            </p>
          )}

          {submitMessage && !errorMessage && (
            <p
              className="qyx-contact-form__feedback qyx-contact-form__feedback--success"
              role="status"
            >
              {submitMessage}
            </p>
          )}

          <button
            className="qyx-contact-form__submit"
            type="submit"
            aria-describedby={`${id}-notice`}
            disabled={loading}
          >
            {loading ? "Sending enquiry…" : "Send enquiry"}
            {!loading && <span aria-hidden="true">→</span>}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ContactForm;