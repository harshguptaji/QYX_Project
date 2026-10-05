import "../style/ContactOptions.css";

const ADMIN_PHONE = "917453898747";

const getWhatsAppLink = (message) =>
  `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(message)}`;

const ContactOptions = () => {
  return (
    <section
      className="qyx-contact-options"
      aria-labelledby="qyx-contact-options-title"
    >
      <div className="qyx-contact-options__container">
        <div className="qyx-contact-options__heading">
          <span className="qyx-contact-options__eyebrow">
            LET’S CONNECT
          </span>

          <h2 id="qyx-contact-options-title">
            Choose your way to <span>reach us.</span>
          </h2>

          <p>
            Whether you’re exploring your first consultation or looking to
            join our specialist network, we’re here to help.
          </p>
        </div>

        <div className="qyx-contact-options__grid">
          <article className="qyx-contact-options__card">
            <span className="qyx-contact-options__category">
              BOOKING &amp; GENERAL ENQUIRIES
            </span>

            <h3>Let’s chat.</h3>

            <p>
              Have a question about consultations or booking? Start a
              conversation with our team on WhatsApp.
            </p>

            <a
              className="qyx-contact-options__link"
              href={getWhatsAppLink(
                "Hello QYX team, I would like help with booking a consultation. Please guide me on the next steps."
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              Chat on WhatsApp
              <span aria-hidden="true">↗</span>
            </a>
          </article>

          <article className="qyx-contact-options__card">
            <span className="qyx-contact-options__category">
              APPOINTMENT SUPPORT
            </span>

            <h3>Prefer a conversation?</h3>

            <p>
              Speak with our team about appointment questions, booking
              support, and general enquiries.
            </p>

            <a
              className="qyx-contact-options__link"
              href="tel:+917453898747"
            >
              +91 74538 98747
              <span aria-hidden="true">↗</span>
            </a>
          </article>

          <article className="qyx-contact-options__card">
            <span className="qyx-contact-options__category">
              FOR DOCTORS &amp; SPECIALISTS
            </span>

            <h3>Grow your practice.</h3>

            <p>
              Interested in joining QYX? Connect with our admin team to
              learn about applications and credential verification.
            </p>

            <a
              className="qyx-contact-options__link"
              href={getWhatsAppLink(
                "Hello QYX team, I am a doctor interested in joining your Specialist Network. Please share the application process and required credentials."
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join the specialist network
              <span aria-hidden="true">↗</span>
            </a>
          </article>
        </div>

        <div className="qyx-contact-options__note">
          <span
            className="qyx-contact-options__note-mark"
            aria-hidden="true"
          >
            i
          </span>

          <p>
            Keep your initial enquiry brief. Medical reports and sensitive
            health information are best discussed during your consultation.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ContactOptions;