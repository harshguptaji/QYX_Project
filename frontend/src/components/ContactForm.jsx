import { useState } from "react";
import "../style/ContactForm.css";

const ContactForm = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    purpose: "",
    message: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const whatsappMessage = [
    "Hello QYX team, I would like to make an enquiry.",
    "",
    `Name: ${form.name.trim()}`,
    `Email: ${form.email.trim()}`,
    `Phone: ${form.phone.trim()}`,
    `Purpose: ${form.purpose}`,
    "",
    `Message: ${form.message.trim()}`,
  ].join("\n");

  const handleSubmit = (event) => {
    event.preventDefault();

    window.location.assign(
      `https://wa.me/917453898747?text=${encodeURIComponent(
        whatsappMessage
      )}`
    );
  };

  return (
    <section
      className="qyx-contact-form"
      id="qyx-contact-form"
      aria-labelledby="qyx-contact-form-title"
    >
      <div className="qyx-contact-form__container">
        <div className="qyx-contact-form__content">
          <span className="qyx-contact-form__eyebrow">
            TELL US WHAT YOU NEED
          </span>

          <h2 id="qyx-contact-form-title">
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
        >
          <h3>How can we help?</h3>

          <p className="qyx-contact-form__panel-intro">
            Leave a few details about your enquiry.
          </p>

          <div className="qyx-contact-form__fields">
            <label className="qyx-contact-form__full">
              Full name
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                autoComplete="name"
                maxLength={100}
                required
              />
            </label>

            <label>
              Email address
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                maxLength={254}
                required
              />
            </label>

            <label>
              Phone number
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                autoComplete="tel"
                inputMode="tel"
                minLength={7}
                maxLength={25}
                required
              />
            </label>

            <label className="qyx-contact-form__full">
              Purpose of visiting
              <select
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
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

            <label className="qyx-contact-form__full">
              Your message
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="What would you like help with?"
                rows={4}
                maxLength={1000}
                required
              />
            </label>
          </div>

          <p
            className="qyx-contact-form__notice"
            id="qyx-contact-form-notice"
          >
            Your details will be included in a WhatsApp message to our
            admin team. You can review it before sending.
          </p>

          <button
            className="qyx-contact-form__submit"
            type="submit"
            aria-describedby="qyx-contact-form-notice"
          >
            Continue on WhatsApp
            <span aria-hidden="true">↗</span>
          </button>
        </form>
      </div>
    </section>
  );
};

export default ContactForm;