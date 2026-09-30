import clinicImage from "../assets/private_clinic.png";
import "../style/PrivateConsultation.css";

const PrivateConsultation = () => {
  return (
    <section
      className="private-consultation"
      aria-labelledby="private-consultation-title"
    >
      <div className="private-consultation-container">
        

        <div className="private-consultation-image">
          <img
            src={clinicImage}
            alt="Illustration of a private clinical consultation room"
            loading="lazy"
          />
        </div>
        <div className="private-consultation-content">
          <span className="private-consultation-label">
            CARE THAT FEELS COMFORTABLE
          </span>

          <h2 id="private-consultation-title">
            3 - 5 Years
          </h2>

          <p>
            How much longer men wait then women, on average, before their first fertility consultation.
          </p>

          <a href="/consultation" className="private-consultation-button">
            Book a Consultation
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default PrivateConsultation;