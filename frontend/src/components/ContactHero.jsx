import contactHeroImage from "../assets/contact-hero.png";
import "../style/ContactHero.css";

const ContactHero = () => {
  return (
    <section
      className="qyx-contact-hero"
      aria-labelledby="qyx-contact-hero-title"
    >
      <div className="qyx-contact-hero__container">
        <div className="qyx-contact-hero__content">
          <span className="qyx-contact-hero__eyebrow">
            WE’RE HERE TO LISTEN
          </span>

          <h1 id="qyx-contact-hero-title">
            Let’s start with
            <span>a conversation.</span>
          </h1>

          <p className="qyx-contact-hero__description">
            Questions about male fertility, your first consultation, or
            joining QYX? Start a conversation with our team, in a way that
            feels comfortable.
          </p>

          <div className="qyx-contact-hero__actions">
            <a
              className="qyx-contact-hero__primary"
              href="#qyx-contact-form"
            >
              Get in touch
              <span aria-hidden="true">↗</span>
            </a>

            <a
              className="qyx-contact-hero__secondary"
              href="https://wa.me/917453898747?text=Hello%20QYX%20team%2C%20I%20would%20like%20help%20with%20a%20consultation."
              target="_blank"
              rel="noopener noreferrer"
            >
              Chat on WhatsApp
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          <ul className="qyx-contact-hero__values">
            <li>Thoughtful support</li>
            <li>Without judgement</li>
            <li>A human connection</li>
          </ul>
        </div>

        <div className="qyx-contact-hero__visual">
          <img
            src={contactHeroImage}
            alt="A man comfortably speaking with a support team by phone from home"
            className="qyx-contact-hero__image"
            fetchPriority="high"
            decoding="async"
          />

          <div className="qyx-contact-hero__caption">
            <span className="qyx-contact-hero__caption-dot" aria-hidden="true" />

            <p>A conversation, on your terms.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactHero;