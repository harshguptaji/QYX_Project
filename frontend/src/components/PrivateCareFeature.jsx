import videoConsultation from "../assets/device.png";
import "../style/PrivateCareFeature.css";

const benefits = [
  "Test privately at home - no clinic visit, ever for a routine check-in.",
  "Your specialist sees your result directly - no re-explanation, no lost reposrts, no seperate lab visit.",
  "Track changes over time - a private history that shows whether lifestyle changes or treatment are working.",
];

const PrivateCareFeature = () => {
  return (
    <section
      className="private-care-feature"
      aria-labelledby="private-care-feature-title"
    >
      <div className="private-care-feature-container">
        <div className="private-care-feature-content">
          <span className="private-care-feature-label">
            COMING SOON - THE QYX DEVICE
          </span>

          <h2 id="private-care-feature-title">
            Consultations are just the begining. We're building the rest of the journey.
          </h2>

          <p className="private-care-feature-description">
            Test and track sperm health at home, privately - synced stratight to your specialist so consulattaion run on real data, not memory.
          </p>

          <ul className="private-care-feature-list">
            {benefits.map((benefit) => (
              <li key={benefit}>
                <span className="private-care-feature-check" aria-hidden="true">
                  ✓
                </span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          <a
            href="/consultation"
            className="private-care-feature-button"
          >
            Join The Waitlist
            <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="private-care-feature-visual">
          <img
            src={videoConsultation}
            alt="A man speaking with a specialist on a private video call"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
};

export default PrivateCareFeature;