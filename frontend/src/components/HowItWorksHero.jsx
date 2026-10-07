import howItWorksImage from "../assets/conversation.png";
import "../style/HowItWorksHero.css";

const HowItWorksHero = () => {
  return (
    <section
      className="qyx-how-hero"
      aria-labelledby="qyx-how-hero-title"
    >
      <div className="qyx-how-hero__container">
        <div className="qyx-how-hero__content">
          <span className="qyx-how-hero__eyebrow">
            CARE, ONE STEP AT A TIME
          </span>

          <h1 id="qyx-how-hero-title">
            Your next step.
            <span>Made a little clearer.</span>
          </h1>

          <p className="qyx-how-hero__description">
            From the first question to a follow-up with someone you trust,
            here’s how QYX helps you connect with male fertility care —
            from a place that feels comfortable.
          </p>

          <div className="qyx-how-hero__actions">
            <a
              className="qyx-how-hero__primary"
              href="#qyx-how-journey"
            >
              Explore your journey
              <span aria-hidden="true">↓</span>
            </a>

            <a
              className="qyx-how-hero__secondary"
              href="https://wa.me/917453898747?text=Hello%20QYX%20team%2C%20I%20would%20like%20to%20understand%20the%20consultation%20and%20booking%20process."
              target="_blank"
              rel="noopener noreferrer"
            >
              Talk to our team
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          <ul
            className="qyx-how-hero__values"
            aria-label="Our approach to care"
          >
            <li>From home</li>
            <li>At your pace</li>
            <li>Without judgement</li>
          </ul>
        </div>

        <div className="qyx-how-hero__visual">
          <img
            src={howItWorksImage}
            alt="A man comfortably having a conversation by phone from home"
            className="qyx-how-hero__image"
            fetchPriority="high"
            decoding="async"
          />

          <div className="qyx-how-hero__caption">
            <span>WHERE YOU FEEL AT EASE</span>
            <p>It starts with one conversation.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksHero;